import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

import { describe, expect, it } from '@jest/globals';

const REPO_ROOT = join(__dirname, '..', '..', '..');
const GLOBALS_PATH = join(REPO_ROOT, 'tests', 'globals.js');
const APP_PATH = join(REPO_ROOT, 'tests', 'app.js');

/**
 * Full platformSupportedModules sets committed in tests/app.js before
 * harness.overrides.js filtering. Update deliberately when adding e2e coverage.
 */
const COMMITTED_OTHER_PLATFORM_MODULES = [
  'app',
  'functions',
  'firestore',
  'database',
  'auth',
  'storage',
  'remoteConfig',
  'analytics',
  'appCheck',
  'ai',
] as const;

const COMMITTED_NATIVE_PLATFORM_MODULES = [
  'app',
  'functions',
  'auth',
  'database',
  'firestore',
  'storage',
  'messaging',
  'perf',
  'analytics',
  'remoteConfig',
  'crashlytics',
  'inAppMessaging',
  'installations',
  'appCheck',
  'appDistribution',
  'ml',
  'phoneNumberVerification',
  'ai',
] as const;

const EXCLUSIVE_TEST_PATTERN = /\b(describe|it|context|specify)\.only\s*\(/;

function readHarnessSource(path: string): string {
  return readFileSync(path, 'utf8');
}

function extractPlatformBlock(source: string, condition: string): string {
  const start = source.indexOf(condition);
  expect(start).toBeGreaterThanOrEqual(0);

  const braceStart = source.indexOf('{', start);
  expect(braceStart).toBeGreaterThanOrEqual(0);

  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(braceStart + 1, index);
      }
    }
  }

  throw new Error(`Unbalanced braces while parsing platform block for ${condition}`);
}

function extractPushedModules(blockSource: string): string[] {
  const modules: string[] = [];
  const pushPattern = /platformSupportedModules\.push\(\s*['"]([^'"]+)['"]\s*\)/g;

  for (const match of blockSource.matchAll(pushPattern)) {
    modules.push(match[1]);
  }

  return modules;
}

const TRACKED_TEST_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

function collectSourceFiles(rootDir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') {
      continue;
    }

    const absolutePath = join(rootDir, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(absolutePath, results);
      continue;
    }

    const extension = absolutePath.slice(absolutePath.lastIndexOf('.'));
    if (TRACKED_TEST_EXTENSIONS.has(extension)) {
      results.push(absolutePath);
    }
  }

  return results;
}

function listTrackedHarnessTestSources(): string[] {
  const testsDir = join(REPO_ROOT, 'tests');
  const packageDirs = readdirSync(join(REPO_ROOT, 'packages'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => join(REPO_ROOT, 'packages', entry.name, 'e2e'))
    .filter(e2eDir => {
      try {
        return statSync(e2eDir).isDirectory();
      } catch {
        return false;
      }
    });

  return [
    ...collectSourceFiles(testsDir).filter(path => !path.endsWith('harness.overrides.js')),
    ...packageDirs.flatMap(e2eDir => collectSourceFiles(e2eDir)),
  ];
}

describe('committed e2e harness defaults (NewArch-AD-13)', function () {
  it('keeps RNFBDebug committed default false in tests/globals.js', function () {
    const source = readHarnessSource(GLOBALS_PATH);

    expect(source).toMatch(
      /globalThis\.RNFBDebug\s*=\s*harnessOverrides\.RNFBDebug\s*\?\?\s*false/,
    );
    expect(source).not.toMatch(/globalThis\.RNFBDebug\s*=\s*true/);
  });

  it('keeps full platformSupportedModules for Platform.other before overrides filtering', function () {
    const source = readHarnessSource(APP_PATH);

    expect(source).toMatch(/if\s*\(\s*Platform\.other\s*\)/);
    expect(source).not.toMatch(/if\s*\(\s*false\s*&&\s*Platform\.other\s*\)/);

    const otherBlock = extractPlatformBlock(source, 'if (Platform.other)');
    expect(extractPushedModules(otherBlock)).toEqual([...COMMITTED_OTHER_PLATFORM_MODULES]);
  });

  it('keeps full platformSupportedModules for native platforms before overrides filtering', function () {
    const source = readHarnessSource(APP_PATH);

    expect(source).toMatch(/if\s*\(\s*!Platform\.other\s*\)/);
    expect(source).not.toMatch(/if\s*\(\s*false\s*&&\s*!Platform\.other\s*\)/);

    const nativeBlock = extractPlatformBlock(source, 'if (!Platform.other)');
    expect(extractPushedModules(nativeBlock)).toEqual([...COMMITTED_NATIVE_PLATFORM_MODULES]);
  });

  it('does not commit exclusive mocha tests (.only) in tracked harness or e2e sources', function () {
    const offenders = listTrackedHarnessTestSources().filter(sourcePath => {
      const source = readFileSync(sourcePath, 'utf8');
      return EXCLUSIVE_TEST_PATTERN.test(source);
    });

    expect(offenders).toEqual([]);
  });
});

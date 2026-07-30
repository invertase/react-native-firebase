/**
 * Validate published package types with @arethetypeswrong/cli (attw).
 *
 * Usage (from repo root):
 *   yarn attw:check
 *
 * Scope is defined in okf-bundle/testing/architecture-decisions.md (Types-AD-1..4)
 * and repo-root .attw.json (profile esm-only + ignored rules).
 *
 * Also smoke-tests Expo config plugins the way Expo prebuild loads them:
 *   app.plugin.js -> require('./plugin/build/app.plugin') under Node CJS with peers installed.
 *
 * All child processes use spawnSync with argument arrays (no shell) to avoid
 * cross-platform command-parsing issues.
 *
 * Exit codes:
 *   0 — all checks pass
 *   1 — attw failures and/or Expo plugin smoke failures
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../../..');
const packagesDir = path.join(repoRoot, 'packages');
const attwBin = path.join(__dirname, '../node_modules/.bin/attw');
const attwConfigPath = path.join(repoRoot, '.attw.json');

const EXPO_PLUGIN_PACKAGES = [
  'app',
  'analytics',
  'auth',
  'messaging',
  'crashlytics',
  'perf',
  'app-check',
  'app-distribution',
] as const;

type AttwConfig = {
  profile?: 'strict' | 'node16' | 'esm-only';
  ignoreRules?: string[];
};

type AttwProblem = {
  kind: string;
  entrypoint?: string;
  resolutionKind?: string;
  resolutionOption?: string;
  moduleSpecifier?: string;
  fileName?: string;
  message?: string;
};

type AttwAnalysis = {
  packageName?: string;
  problems?: AttwProblem[];
  entrypoints?: Record<
    string,
    {
      resolutions?: Record<
        string,
        {
          visibleProblems?: number[];
        }
      >;
    }
  >;
};

type AttwResult = {
  analysis?: AttwAnalysis;
  problems?: Record<string, AttwProblem[]>;
};

type IssueRow = {
  package: string;
  entrypoint: string;
  resolution: string;
  problem: string;
  detail: string;
};

type ExpoPluginFailure = {
  package: string;
  detail: string;
};

type AttwRunResult = {
  passed: boolean;
  issues: IssueRow[];
};

const PROBLEM_KIND_TO_IGNORE_RULE: Record<string, string> = {
  NoResolution: 'no-resolution',
  UntypedResolution: 'untyped-resolution',
  FalseCJS: 'false-cjs',
  FalseESM: 'false-esm',
  CJSResolvesToESM: 'cjs-resolves-to-esm',
  FallbackCondition: 'fallback-condition',
  CJSOnlyExportsDefault: 'cjs-only-exports-default',
  NamedExports: 'named-exports',
  FalseExportDefault: 'false-export-default',
  MissingExportEquals: 'missing-export-equals',
  UnexpectedModuleSyntax: 'unexpected-module-syntax',
  InternalResolutionError: 'internal-resolution-error',
};

const PROFILE_SKIPPED_RESOLUTIONS: Record<NonNullable<AttwConfig['profile']>, string[]> = {
  strict: [],
  node16: ['node10'],
  'esm-only': ['node10', 'node16-cjs'],
};

function readAttwConfig(): AttwConfig {
  return JSON.parse(fs.readFileSync(attwConfigPath, 'utf8')) as AttwConfig;
}

function listPublishedPackages(): string[] {
  return fs
    .readdirSync(packagesDir)
    .filter(dir => {
      const pkgJsonPath = path.join(packagesDir, dir, 'package.json');
      if (!fs.existsSync(pkgJsonPath)) {
        return false;
      }
      try {
        // Skip packages that are not published to npm (private: true).
        return JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')).private !== true;
      } catch {
        return false;
      }
    })
    .sort();
}

function runAttw(packageDir: string, dirName: string, config: AttwConfig): AttwRunResult {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'attw-'));
  const tgz = path.join(tmpDir, `${dirName}.tgz`);
  const jsonFile = path.join(tmpDir, `${dirName}.json`);

  const pack = spawnSync('yarn', ['pack', '--out', tgz], {
    cwd: packageDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (pack.status !== 0) {
    throw new Error(`yarn pack failed for ${dirName}: ${pack.stderr || pack.stdout}`);
  }

  // Redirect attw's stdout straight to a file descriptor. This guarantees the
  // full JSON report is captured regardless of size (no stdout maxBuffer
  // truncation) while still avoiding a shell.
  const outFd = fs.openSync(jsonFile, 'w');
  let exitCode = 0;
  try {
    const result = spawnSync(
      attwBin,
      ['--config-path', attwConfigPath, '--format', 'json', '--no-color', '--no-emoji', tgz],
      { cwd: tmpDir, stdio: ['ignore', outFd, 'pipe'] },
    );
    // attw exits non-zero when it finds problems; the JSON report is still written.
    exitCode = result.status ?? 1;
  } finally {
    fs.closeSync(outFd);
  }

  if (!fs.existsSync(jsonFile) || !fs.readFileSync(jsonFile, 'utf8').trim()) {
    throw new Error(`attw produced no output for ${dirName}`);
  }

  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8')) as AttwResult;

  try {
    fs.unlinkSync(tgz);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }

  return {
    passed: exitCode === 0,
    issues: exitCode === 0 ? [] : extractEnforcedIssues(data, config),
  };
}

function extractEnforcedIssues(data: AttwResult, config: AttwConfig): IssueRow[] {
  const analysis = data.analysis;
  if (!analysis?.problems || !analysis.entrypoints) {
    return extractLegacyIssues(data);
  }

  const profile = config.profile || 'strict';
  const skippedResolutions = new Set(PROFILE_SKIPPED_RESOLUTIONS[profile]);
  const ignoredRules = new Set(config.ignoreRules || []);
  const packageName = analysis.packageName || 'unknown';
  const seen = new Set<number>();
  const rows: IssueRow[] = [];

  for (const [entrypoint, entrypointInfo] of Object.entries(analysis.entrypoints)) {
    for (const [resolutionKind, resolution] of Object.entries(entrypointInfo.resolutions || {})) {
      if (skippedResolutions.has(resolutionKind)) {
        continue;
      }

      for (const problemIndex of resolution.visibleProblems || []) {
        if (seen.has(problemIndex)) {
          continue;
        }

        const problem = analysis.problems[problemIndex];
        if (!problem) {
          continue;
        }

        const ignoreRule = PROBLEM_KIND_TO_IGNORE_RULE[problem.kind];
        if (ignoreRule && ignoredRules.has(ignoreRule)) {
          continue;
        }

        seen.add(problemIndex);
        rows.push({
          package: packageName,
          entrypoint: problem.entrypoint || entrypoint,
          resolution: problem.resolutionKind || resolutionKind,
          problem: problem.kind,
          detail: problem.moduleSpecifier || problem.message || problem.fileName || '',
        });
      }
    }
  }

  return rows;
}

function extractLegacyIssues(data: AttwResult): IssueRow[] {
  const rows: IssueRow[] = [];
  if (!data.problems) {
    return rows;
  }

  const packageName = data.analysis?.packageName || 'unknown';
  for (const [kind, items] of Object.entries(data.problems)) {
    for (const item of items) {
      rows.push({
        package: packageName,
        entrypoint: item.entrypoint || item.fileName || '.',
        resolution: item.resolutionKind || item.resolutionOption || '',
        problem: kind,
        detail: item.moduleSpecifier || item.message || '',
      });
    }
  }
  return rows;
}

function packPackage(packageDir: string, outputPath: string): void {
  const pack = spawnSync('yarn', ['pack', '--out', outputPath], {
    cwd: packageDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (pack.status !== 0) {
    throw new Error(`yarn pack failed: ${pack.stderr || pack.stdout}`);
  }
}

function checkExpoPlugins(): ExpoPluginFailure[] {
  const failures: ExpoPluginFailure[] = [];
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-expo-plugin-'));
  const appTgz = path.join(tmpRoot, 'app.tgz');

  try {
    packPackage(path.join(packagesDir, 'app'), appTgz);

    for (const dir of EXPO_PLUGIN_PACKAGES) {
      const packageDir = path.join(packagesDir, dir);
      const pkgJsonPath = path.join(packageDir, 'package.json');
      const pluginEntry = path.join(packageDir, 'app.plugin.js');
      const pluginBuild = path.join(packageDir, 'plugin/build/app.plugin.js');

      if (!fs.existsSync(pluginEntry)) {
        continue;
      }

      if (!fs.existsSync(pluginBuild)) {
        failures.push({
          package: JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')).name,
          detail: 'plugin/build/app.plugin.js missing — run build:plugin',
        });
        continue;
      }

      // When dir is 'app', pkgTgz would collide with appTgz — reuse the already-packed tarball.
      const pkgTgz = dir === 'app' ? appTgz : path.join(tmpRoot, `${dir}.tgz`);
      const installDir = path.join(tmpRoot, `install-${dir}`);
      if (dir !== 'app') {
        packPackage(packageDir, pkgTgz);
      }

      fs.mkdirSync(installDir, { recursive: true });
      const init = spawnSync('npm', ['init', '-y'], { cwd: installDir, stdio: 'ignore' });
      if (init.status !== 0) {
        failures.push({
          package: JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')).name,
          detail: 'npm init failed',
        });
        continue;
      }

      // @expo/config-plugins is intentionally unpinned so the smoke test tracks
      // the latest release — Expo consumers upgrade quickly, and this surfaces
      // breaking changes in new versions early rather than hiding them behind a pin.
      const installTarballs = dir === 'app' ? [appTgz] : [appTgz, pkgTgz];
      const install = spawnSync(
        'npm',
        [
          'install',
          '--silent',
          '--no-fund',
          '--no-audit',
          ...installTarballs,
          '@expo/config-plugins',
        ],
        { cwd: installDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      );
      if (install.status !== 0) {
        failures.push({
          package: JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')).name,
          detail: `npm install failed: ${install.stderr || install.stdout || 'unknown error'}`,
        });
        continue;
      }

      const pkgName = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')).name as string;
      const requireCheck = spawnSync(
        'node',
        [
          '-e',
          `const plugin = require('${pkgName}/app.plugin.js'); if (typeof plugin !== 'function' && typeof plugin.default !== 'function') { process.exit(2); }`,
        ],
        { cwd: installDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      );
      if (requireCheck.status !== 0) {
        failures.push({
          package: pkgName,
          detail: `require('${pkgName}/app.plugin.js') failed: ${
            requireCheck.stderr || `exit ${requireCheck.status}`
          }`,
        });
      }
    }
  } finally {
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }

  return failures;
}

function printAttwReport(rows: IssueRow[]): void {
  if (rows.length === 0) {
    console.log('\n✅ attw: all published packages pass scoped analysis (.attw.json).\n');
    return;
  }

  console.log(`\n❌ attw: ${rows.length} enforced problem(s) under .attw.json scope:\n`);
  console.log('| # | Package | Entrypoint | Resolution | Problem | Detail |');
  console.log('|---:|---|---|---|---|---|');
  rows.forEach((row, index) => {
    const cells = [
      String(index + 1),
      row.package,
      row.entrypoint,
      row.resolution,
      row.problem,
      row.detail,
    ].map(value => value.replace(/\|/g, '\\|'));
    console.log(`| ${cells.join(' | ')} |`);
  });
  console.log('');
}

function printExpoPluginReport(failures: ExpoPluginFailure[]): void {
  if (failures.length === 0) {
    console.log('✅ Expo config plugins: consumer smoke test passed.\n');
    return;
  }

  console.log(`❌ Expo config plugins: ${failures.length} failure(s):\n`);
  failures.forEach((failure, index) => {
    console.log(`${index + 1}. ${failure.package}: ${failure.detail}`);
  });
  console.log('');
}

function main(): void {
  if (!fs.existsSync(attwBin)) {
    console.error('attw binary not found — run `yarn install` in .github/scripts/attw first');
    process.exit(1);
  }

  if (!fs.existsSync(attwConfigPath)) {
    console.error(`Missing ${attwConfigPath}`);
    process.exit(1);
  }

  const config = readAttwConfig();
  const allRows: IssueRow[] = [];
  for (const dir of listPublishedPackages()) {
    const result = runAttw(path.join(packagesDir, dir), dir, config);
    if (!result.passed) {
      allRows.push(...result.issues);
    }
  }

  const expoFailures = checkExpoPlugins();

  printAttwReport(allRows);
  printExpoPluginReport(expoFailures);

  const hasFailures = allRows.length > 0 || expoFailures.length > 0;
  process.exit(hasFailures ? 1 : 0);
}

main();

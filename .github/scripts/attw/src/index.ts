/**
 * Validate published package types with @arethetypeswrong/cli (attw).
 *
 * Usage (from repo root):
 *   yarn attw:check
 *
 * Scope is defined in okf-bundle/testing/architecture-decisions.md (Types-AD-1..5),
 * repo-root .attw.json (profile esm-only + ignored rules) and ALLOWED_ISSUES below.
 *
 * Also smoke-tests Expo config plugins the way Expo prebuild loads them:
 *   app.plugin.js -> require('./plugin/build/app.plugin') under Node CJS with peers installed.
 *
 * All child processes use spawnSync with argument arrays (no shell) to avoid
 * cross-platform command-parsing issues.
 *
 * Exit codes:
 *   0 — all checks pass
 *   1 — attw failures, allowed findings that no longer occur, relative module augmentations
 *       that do not end in `.js` or do not resolve, and/or Expo plugin smoke failures
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../../..');
const packagesDir = path.join(repoRoot, 'packages');
const attwBin = path.join(__dirname, '../node_modules/.bin/attw');
const attwConfigPath = path.join(repoRoot, '.attw.json');

/**
 * Resolve the monorepo Yarn Berry binary from `.yarnrc.yml`.
 *
 * Allowlisted pack staging uses a temp dir outside the workspace. Plain `yarn`
 * then falls back to a global Yarn Classic (no `yarnPath`), which ignores
 * `--out` and leaves attw with a missing tarball.
 */
function resolveRepoYarnBerry(): string {
  const yarnrcPath = path.join(repoRoot, '.yarnrc.yml');
  const yarnrc = fs.readFileSync(yarnrcPath, 'utf8');
  const match = /^yarnPath:\s*(.+)\s*$/m.exec(yarnrc);
  if (!match) {
    throw new Error(`Missing yarnPath in ${yarnrcPath}`);
  }
  const yarnPath = match[1].trim().replace(/^['"]|['"]$/g, '');
  const resolved = path.resolve(repoRoot, yarnPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Yarn Berry binary not found at ${resolved}`);
  }
  return resolved;
}

const yarnBerryBin = resolveRepoYarnBerry();

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

/** Roots copied into a temp stage before `yarn pack` (include-not-exclude; Types-AD-5). */
const PACK_ALLOWLIST_ROOTS = [
  'package.json',
  'dist',
  'lib',
  'app.plugin.js',
  'plugin/build',
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
  file: string;
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

/**
 * Exact findings accepted under Types-AD-2, which records why each is accepted. Each
 * entry must still occur, so a fixed finding fails the check until its entry is removed.
 */
const ALLOWED_ISSUES: IssueRow[] = [
  {
    package: '@react-native-firebase/ai',
    entrypoint: '.',
    resolution: 'node16-esm',
    problem: 'InternalResolutionError',
    file: 'dist/typescript/lib/index.d.ts',
    detail: './polyfills',
  },
  {
    package: '@react-native-firebase/app',
    entrypoint: './dist/module/internal',
    resolution: 'node16-esm',
    problem: 'InternalResolutionError',
    file: 'dist/typescript/lib/internal/index.d.ts',
    detail: './nativeModule',
  },
];

function isSameIssue(row: IssueRow, allowed: IssueRow): boolean {
  return (
    row.package === allowed.package &&
    row.entrypoint === allowed.entrypoint &&
    row.resolution === allowed.resolution &&
    row.problem === allowed.problem &&
    row.file === allowed.file &&
    row.detail === allowed.detail
  );
}

/** attw reports files as `/node_modules/<package>/<path>`; keep only `<path>`. */
function toPackagePath(fileName: string | undefined, packageName: string): string {
  if (!fileName) {
    return '';
  }
  const prefix = `/node_modules/${packageName}/`;
  return fileName.startsWith(prefix) ? fileName.slice(prefix.length) : fileName;
}

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

/**
 * Stage only allowlisted publish roots into a temp dir, then `yarn pack` from
 * that stage. Avoids walking live package trees (e.g. nested XCTest build/).
 */
function stageAllowlistedPackDir(packageDir: string): string {
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-pack-stage-'));
  for (const root of PACK_ALLOWLIST_ROOTS) {
    const src = path.join(packageDir, root);
    if (!fs.existsSync(src)) {
      continue;
    }
    const dest = path.join(staging, root);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(src, dest, { recursive: true });
  }
  return staging;
}

function packPackage(packageDir: string, outputPath: string): void {
  const staging = stageAllowlistedPackDir(packageDir);
  try {
    const pack = spawnSync(process.execPath, [yarnBerryBin, 'pack', '--out', outputPath], {
      cwd: staging,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (pack.status !== 0) {
      throw new Error(`yarn pack failed: ${pack.stderr || pack.stdout}`);
    }
    if (!fs.existsSync(outputPath)) {
      throw new Error(
        `yarn pack reported success but did not write ${outputPath}: ${pack.stderr || pack.stdout}`,
      );
    }
  } finally {
    try {
      fs.rmSync(staging, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}

function runAttw(packageDir: string, dirName: string, config: AttwConfig): AttwRunResult {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'attw-'));
  const tgz = path.join(tmpDir, `${dirName}.tgz`);
  const jsonFile = path.join(tmpDir, `${dirName}.json`);

  packPackage(packageDir, tgz);

  // Redirect attw's stdout straight to a file descriptor. This guarantees the
  // full JSON report is captured regardless of size (no stdout maxBuffer
  // truncation) while still avoiding a shell.
  const outFd = fs.openSync(jsonFile, 'w');
  let exitCode = 0;
  let stderr = '';
  try {
    const result = spawnSync(
      attwBin,
      ['--config-path', attwConfigPath, '--format', 'json', '--no-color', '--no-emoji', tgz],
      { cwd: tmpDir, encoding: 'utf8', stdio: ['ignore', outFd, 'pipe'] },
    );
    // attw exits non-zero when it finds problems; the JSON report is still written.
    exitCode = result.status ?? 1;
    stderr = result.stderr || '';
  } finally {
    fs.closeSync(outFd);
  }

  if (!fs.existsSync(jsonFile) || !fs.readFileSync(jsonFile, 'utf8').trim()) {
    throw new Error(
      `attw produced no output for ${dirName} (exit ${exitCode})${stderr ? `: ${stderr.trim()}` : ''}`,
    );
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
          file: toPackagePath(problem.fileName, packageName),
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
        file: toPackagePath(item.fileName, packageName),
        detail: item.moduleSpecifier || item.message || '',
      });
    }
  }
  return rows;
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
    console.log('\n✅ attw: no enforced problems under .attw.json scope.\n');
    return;
  }

  console.log(`\n❌ attw: ${rows.length} enforced problem(s) under .attw.json scope:\n`);
  console.log('| # | Package | Entrypoint | Resolution | Problem | File | Detail |');
  console.log('|---:|---|---|---|---|---|---|');
  rows.forEach((row, index) => {
    const cells = [
      String(index + 1),
      row.package,
      row.entrypoint,
      row.resolution,
      row.problem,
      row.file,
      row.detail,
    ].map(value => value.replace(/\|/g, '\\|'));
    console.log(`| ${cells.join(' | ')} |`);
  });
  console.log('');
}

function printAllowedReport(matchedCount: number, stale: IssueRow[]): void {
  if (matchedCount > 0) {
    console.log(`ℹ️  attw: ${matchedCount} allowed finding(s) matched (Types-AD-2).\n`);
  }
  if (stale.length === 0) {
    return;
  }
  console.log(
    `❌ attw: ${stale.length} allowed finding(s) no longer occur — remove or update them (Types-AD-2):\n`,
  );
  stale.forEach((allowed, index) => {
    console.log(
      `${index + 1}. ${allowed.package} ${allowed.entrypoint} ${allowed.resolution} ${allowed.problem} ${allowed.file} ${allowed.detail}`,
    );
  });
  console.log('');
}

const RELATIVE_AUGMENTATION = /declare\s+module\s+(['"])(\.{1,2}(?:\/[^'"]*)?)\1/g;

/**
 * Relative `declare module` names must end in `.js` and name an emitted `.d.ts`
 * (Types-AD-2 known gaps): bob does not rewrite them, attw does not check them, and
 * node16-esm drops an augmentation that does not resolve without reporting it.
 */
function checkRelativeAugmentations(packageDirs: string[]): string[] {
  const failures: string[] = [];
  for (const dir of packageDirs) {
    const distDir = path.join(packagesDir, dir, 'dist');
    if (!fs.existsSync(distDir)) {
      continue;
    }
    const files = fs.readdirSync(distDir, { recursive: true, encoding: 'utf8' });
    for (const file of files.filter(name => name.endsWith('.d.ts')).sort()) {
      const source = fs.readFileSync(path.join(distDir, file), 'utf8');
      for (const match of source.matchAll(RELATIVE_AUGMENTATION)) {
        const name = match[2];
        const target = path.resolve(path.dirname(path.join(distDir, file)), name);
        const declaration = target.replace(/\.js$/, '.d.ts');
        if (!name.endsWith('.js') || !fs.existsSync(declaration)) {
          failures.push(`${dir}/dist/${file}: declare module '${name}'`);
        }
      }
    }
  }
  return failures;
}

function printAugmentationReport(failures: string[]): void {
  if (failures.length === 0) {
    console.log('✅ Relative module augmentations: all names end in .js and resolve.\n');
    return;
  }
  console.log('❌ Relative module augmentations without .js or with no .d.ts (Types-AD-2):\n');
  failures.forEach((failure, index) => {
    console.log(`${index + 1}. ${failure}`);
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
  const packageDirs = listPublishedPackages();
  const allRows: IssueRow[] = [];
  for (const dir of packageDirs) {
    const result = runAttw(path.join(packagesDir, dir), dir, config);
    if (!result.passed) {
      allRows.push(...result.issues);
    }
  }

  // Each allowed entry absorbs at most one finding, so a second identical import is enforced.
  const usedAllowed = new Set<IssueRow>();
  const enforcedRows = allRows.filter(row => {
    const allowed = ALLOWED_ISSUES.find(
      entry => !usedAllowed.has(entry) && isSameIssue(row, entry),
    );
    if (allowed) {
      usedAllowed.add(allowed);
      return false;
    }
    return true;
  });
  const staleAllowed = ALLOWED_ISSUES.filter(entry => !usedAllowed.has(entry));

  const augmentationFailures = checkRelativeAugmentations(packageDirs);
  const expoFailures = checkExpoPlugins();

  printAttwReport(enforcedRows);
  printAllowedReport(ALLOWED_ISSUES.length - staleAllowed.length, staleAllowed);
  printAugmentationReport(augmentationFailures);
  printExpoPluginReport(expoFailures);

  const hasFailures =
    enforcedRows.length > 0 ||
    staleAllowed.length > 0 ||
    augmentationFailures.length > 0 ||
    expoFailures.length > 0;
  process.exit(hasFailures ? 1 : 0);
}

main();

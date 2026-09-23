import { spawnSync } from 'child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

// Stub `upload-symbols` binary. Mirrors the real SPM `upload-symbols` tool closely enough
// for this test: it records the `-gsp` path it was invoked with, and fails (like the real
// binary does) when that path does not point at an existing file.
const UPLOAD_SYMBOLS_STUB = `#!/usr/bin/env bash
set -e
GSP=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    -gsp)
      GSP="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done
echo "\${GSP}" >> "\${UPLOAD_SYMBOLS_LOG}"
if [[ ! -f "\${GSP}" ]]; then
  echo "error: stub upload-symbols could not find gsp file: \${GSP}" >&2
  exit 1
fi
exit 0
`;

// Always fails, regardless of args — simulates a genuinely rejected upload
// (bad credentials, network, project mismatch), as opposed to the "gsp file
// missing" failure mode of UPLOAD_SYMBOLS_STUB above.
const ALWAYS_FAILS_STUB = `#!/usr/bin/env bash
echo "error: stub forced failure" >&2
exit 1
`;

const ALWAYS_SUCCEEDS_STUB = `#!/usr/bin/env bash
exit 0
`;

const SCRIPT_PATH = join(__dirname, '..', 'ios_config.sh');

describe('Crashlytics ios_config.sh SPM dSYM upload', function () {
  let projectDir: string;
  let targetName: string;
  let buildDir: string;
  let dsymFolder: string;
  let uploadSymbolsLog: string;
  let uploadSymbolsPath: string;

  beforeEach(function () {
    projectDir = mkdtempSync(join(tmpdir(), 'rnfb-ios-config-'));
    targetName = 'TestApp';

    const derivedDataRoot = join(projectDir, 'DerivedData', 'TestApp-hash');
    buildDir = join(derivedDataRoot, 'Build', 'Products');
    const spmCrashlyticsDir = join(
      derivedDataRoot,
      'SourcePackages',
      'checkouts',
      'firebase-ios-sdk',
      'Crashlytics',
    );
    mkdirSync(buildDir, { recursive: true });
    mkdirSync(spmCrashlyticsDir, { recursive: true });

    uploadSymbolsPath = join(spmCrashlyticsDir, 'upload-symbols');
    writeFileSync(uploadSymbolsPath, UPLOAD_SYMBOLS_STUB);
    chmodSync(uploadSymbolsPath, 0o755);

    uploadSymbolsLog = join(projectDir, 'upload-symbols.log');

    dsymFolder = join(projectDir, 'dsyms');
    mkdirSync(dsymFolder, { recursive: true });
  });

  afterEach(function () {
    rmSync(projectDir, { recursive: true, force: true });
  });

  function runIosConfig() {
    return spawnSync('bash', [SCRIPT_PATH], {
      cwd: projectDir,
      encoding: 'utf8',
      env: {
        PATH: process.env.PATH,
        PROJECT_DIR: projectDir,
        TARGET_NAME: targetName,
        BUILD_DIR: buildDir,
        DWARF_DSYM_FOLDER_PATH: dsymFolder,
        DWARF_DSYM_FILE_NAME: 'TestApp.app.dSYM',
        UPLOAD_SYMBOLS_LOG: uploadSymbolsLog,
      },
    });
  }

  it('uploads dSYMs using the target-folder plist when it only exists there', function () {
    // This is the reported failure: both Expo's config plugin and RNFB's documented
    // manual/CLI setup place the plist at ios/<TargetName>/GoogleService-Info.plist,
    // not at the PROJECT_DIR root.
    const targetFolderPlist = join(projectDir, targetName, 'GoogleService-Info.plist');
    mkdirSync(join(projectDir, targetName), { recursive: true });
    writeFileSync(targetFolderPlist, 'plist-contents');

    const result = runIosConfig();

    expect(result.status).toBe(0);
    expect(existsSync(uploadSymbolsLog)).toBe(true);
    expect(readFileSync(uploadSymbolsLog, 'utf8').trim()).toBe(targetFolderPlist);
  });

  it('falls back to the PROJECT_DIR root plist when the target-folder location has none', function () {
    const rootPlist = join(projectDir, 'GoogleService-Info.plist');
    writeFileSync(rootPlist, 'plist-contents');

    const result = runIosConfig();

    expect(result.status).toBe(0);
    expect(existsSync(uploadSymbolsLog)).toBe(true);
    expect(readFileSync(uploadSymbolsLog, 'utf8').trim()).toBe(rootPlist);
  });

  it('warns and skips the upload when the plist is at neither location', function () {
    const result = runIosConfig();

    expect(result.status).toBe(0);
    expect(existsSync(uploadSymbolsLog)).toBe(false);
    expect(result.stdout).toContain('warning:');
    expect(result.stdout).toContain('GoogleService-Info.plist');
  });

  it('warns and continues without failing the build when SPM upload-symbols rejects the upload', function () {
    const targetFolderPlist = join(projectDir, targetName, 'GoogleService-Info.plist');
    mkdirSync(join(projectDir, targetName), { recursive: true });
    writeFileSync(targetFolderPlist, 'plist-contents');

    // Overwrite the stub installed in beforeEach with one that always rejects,
    // simulating a real upload failure rather than a missing gsp file.
    writeFileSync(uploadSymbolsPath, ALWAYS_FAILS_STUB);
    chmodSync(uploadSymbolsPath, 0o755);

    const result = runIosConfig();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('warning:');
    expect(result.stdout).toContain('upload-symbols (SPM) failed');
  });
});

describe('Crashlytics ios_config.sh CocoaPods / framework run', function () {
  let projectDir: string;
  let podsRoot: string;

  beforeEach(function () {
    projectDir = mkdtempSync(join(tmpdir(), 'rnfb-ios-config-pods-'));
    podsRoot = join(projectDir, 'Pods');
  });

  afterEach(function () {
    rmSync(projectDir, { recursive: true, force: true });
  });

  function runIosConfig(env: Record<string, string> = { PODS_ROOT: podsRoot }) {
    return spawnSync('bash', [SCRIPT_PATH], {
      cwd: projectDir,
      encoding: 'utf8',
      env: {
        PATH: process.env.PATH,
        PROJECT_DIR: projectDir,
        ...env,
      },
    });
  }

  it('runs the CocoaPods run script when present, without warning on success', function () {
    const runScriptPath = join(podsRoot, 'FirebaseCrashlytics', 'run');
    mkdirSync(join(podsRoot, 'FirebaseCrashlytics'), { recursive: true });
    writeFileSync(runScriptPath, ALWAYS_SUCCEEDS_STUB);
    chmodSync(runScriptPath, 0o755);

    const result = runIosConfig();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Exec FirebaseCrashlytics Run from Pods');
    expect(result.stdout).not.toContain('warning:');
  });

  it('warns and continues without failing the build when the CocoaPods run script fails', function () {
    const runScriptPath = join(podsRoot, 'FirebaseCrashlytics', 'run');
    mkdirSync(join(podsRoot, 'FirebaseCrashlytics'), { recursive: true });
    writeFileSync(runScriptPath, ALWAYS_FAILS_STUB);
    chmodSync(runScriptPath, 0o755);

    const result = runIosConfig();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('warning:');
    expect(result.stdout).toContain('run (CocoaPods) failed');
  });

  it('warns and continues without failing the build when the vendored framework run script fails', function () {
    const runScriptPath = join(projectDir, 'FirebaseCrashlytics.framework', 'run');
    mkdirSync(join(projectDir, 'FirebaseCrashlytics.framework'), { recursive: true });
    writeFileSync(runScriptPath, ALWAYS_FAILS_STUB);
    chmodSync(runScriptPath, 0o755);

    // No PODS_ROOT/FirebaseCrashlytics/run here, so this falls through to the
    // vendored-framework branch instead.
    const result = runIosConfig({});

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('warning:');
    expect(result.stdout).toContain('run (framework) failed');
  });
});

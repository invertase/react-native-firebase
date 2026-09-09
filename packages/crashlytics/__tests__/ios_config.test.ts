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

const SCRIPT_PATH = join(__dirname, '..', 'ios_config.sh');

describe('Crashlytics ios_config.sh SPM dSYM upload', function () {
  let projectDir: string;
  let targetName: string;
  let buildDir: string;
  let dsymFolder: string;
  let uploadSymbolsLog: string;

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

    const uploadSymbolsPath = join(spmCrashlyticsDir, 'upload-symbols');
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
});

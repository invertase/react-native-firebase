const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const scriptRel = '.github/workflows/scripts/test-rn-swiftpm-ios-build.sh';
const workflowRel = '.github/workflows/test_rn_swiftpm_ios_build.yml';
const scriptPath = path.join(repoRoot, scriptRel);
const workflowPath = path.join(repoRoot, workflowRel);

const PACKAGE_SWIFT_REL = 'ios/build/generated/autolinking/ReactNativeFirebase/Package.swift';
const CORE_PHASE = '[RNFB] Core Configuration';
const CRASHLYTICS_PHASE = '[RNFB] Crashlytics Configuration';

const NPX_STUB = `#!/bin/bash
echo "npx $*" >> "$STUB_LOG"
if [[ "$1 $2 $3" == "--yes @react-native-community/cli@20.2.0 init" ]]; then
  while [[ $# -gt 0 ]]; do
    if [[ "$1" == "--directory" ]]; then dir="$2"; fi
    shift
  done
  mkdir -p "$dir/ios/RnfbSpm.xcodeproj"
  : > "$dir/ios/RnfbSpm.xcodeproj/project.pbxproj"
  exit 0
fi
if [[ "$1 $2" == "react-native spm" ]]; then
  echo "cwd=$PWD" >> "$STUB_LOG"
  if [[ ",$STUB_SPM_WRITES," == *",package,"* ]]; then
    mkdir -p ios/build/generated/autolinking/ReactNativeFirebase
    : > ios/build/generated/autolinking/ReactNativeFirebase/Package.swift
  fi
  pbxproj=ios/RnfbSpm.xcodeproj/project.pbxproj
  if [[ ",$STUB_SPM_WRITES," == *",core,"* ]] && ! grep -Fq '${CORE_PHASE}' "$pbxproj"; then
    echo 'name = "${CORE_PHASE}";' >> "$pbxproj"
  fi
  if [[ ",$STUB_SPM_WRITES," == *",crashlytics,"* ]] && ! grep -Fq '${CRASHLYTICS_PHASE}' "$pbxproj"; then
    echo 'name = "${CRASHLYTICS_PHASE}";' >> "$pbxproj"
  fi
  exit 0
fi
echo "unexpected npx call: $*" >&2
exit 97
`;

const NPM_STUB = `#!/bin/bash
echo "npm $*" >> "$STUB_LOG"
echo "cwd=$PWD" >> "$STUB_LOG"
`;

const XCODEBUILD_STUB = `#!/bin/bash
echo "xcodebuild" >> "$STUB_LOG"
printf '%s\\n' "$@" > "$XCODEBUILD_ARGS_FILE"
if [[ "\${STUB_XCODEBUILD_EXIT:-0}" != "0" ]]; then
  echo "/x/RNFBApp.swift:1:1: error: no such module 'FirebaseCore'"
  exit "$STUB_XCODEBUILD_EXIT"
fi
echo "** BUILD SUCCEEDED **"
`;

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value));
}

describe('test-rn-swiftpm-ios-build.sh', function () {
  let tmpDir;
  let fakeRepo;
  let workDir;
  let stubLog;
  let xcodebuildArgsFile;
  let baseEnv;

  beforeEach(function () {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-swiftpm-build-'));
    fakeRepo = path.join(tmpDir, 'repo');
    workDir = path.join(tmpDir, 'work');
    stubLog = path.join(tmpDir, 'stub.log');
    xcodebuildArgsFile = path.join(tmpDir, 'xcodebuild-args.txt');

    const plugin = { swiftpmConfig: { autolinkingPlugin: './spm-autolinking-plugin.js' } };
    writeJson(path.join(fakeRepo, 'packages/app/package.json'), {
      swiftpmConfig: { autolinkingPlugin: './spm/build/index.js' },
    });
    fs.mkdirSync(path.join(fakeRepo, 'packages/app/spm/build'), { recursive: true });
    fs.writeFileSync(path.join(fakeRepo, 'packages/app/spm/build/index.js'), '');
    writeJson(path.join(fakeRepo, 'packages/auth/package.json'), plugin);
    writeJson(path.join(fakeRepo, 'packages/crashlytics/package.json'), plugin);
    writeJson(path.join(fakeRepo, 'packages/ai/package.json'), { name: 'ai' });
    fs.mkdirSync(path.join(fakeRepo, 'packages/template'), { recursive: true });

    const binDir = path.join(tmpDir, 'bin');
    fs.mkdirSync(binDir);
    for (const [name, content] of [
      ['npx', NPX_STUB],
      ['npm', NPM_STUB],
      ['xcodebuild', XCODEBUILD_STUB],
      ['xcbeautify', '#!/bin/bash\ncat\n'],
    ]) {
      fs.writeFileSync(path.join(binDir, name), content, { mode: 0o755 });
    }

    baseEnv = {
      ...process.env,
      PATH: `${binDir}:${process.env.PATH}`,
      STUB_LOG: stubLog,
      XCODEBUILD_ARGS_FILE: xcodebuildArgsFile,
      STUB_SPM_WRITES: 'package,core,crashlytics',
      RNFB_TEST_RN_SWIFTPM_REPO_ROOT: fakeRepo,
      RNFB_TEST_RN_SWIFTPM_WORK_DIR: workDir,
    };
  });

  afterEach(function () {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function run(env = {}) {
    const result = spawnSync('bash', [scriptPath], {
      env: { ...baseEnv, ...env },
      encoding: 'utf8',
    });
    return { ...result, output: `${result.stdout}${result.stderr}` };
  }

  function stubCalls() {
    return fs.existsSync(stubLog) ? fs.readFileSync(stubLog, 'utf8').trim().split('\n') : [];
  }

  function xcodebuildArgs() {
    return fs.readFileSync(xcodebuildArgsFile, 'utf8').trim().split('\n');
  }

  it('creates an RN 0.88.1 app, installs every SwiftPM package, syncs, then builds', function () {
    const result = run();
    expect(result.output).toContain('PASS');
    expect(result.status).toBe(0);

    const appDir = path.join(workDir, 'RnfbSpm');
    const calls = stubCalls().filter(line => !line.startsWith('cwd='));
    expect(calls).toEqual([
      expect.stringMatching(/^npx --yes @react-native-community\/cli@20\.2\.0 init RnfbSpm /),
      `npm install --install-links --ignore-scripts ${['app', 'auth', 'crashlytics']
        .map(name => `file:${path.join(fakeRepo, 'packages', name)}`)
        .join(' ')}`,
      'npx react-native spm add --yes --deintegrate',
      'npx react-native spm sync',
      'xcodebuild',
    ]);
    expect(calls[0]).toContain('--version 0.88.1');
    expect(calls[0]).toContain(`--directory ${appDir}`);
    expect(calls[0]).toContain('--skip-git-init');
    expect(calls[0]).toContain('--install-pods false');
    for (const cwd of stubCalls().filter(line => line.startsWith('cwd='))) {
      expect(cwd).toBe(`cwd=${appDir}`);
    }
  });

  it('builds Debug for the generic iOS Simulator from the .xcodeproj, without a workspace', function () {
    const derivedData = path.join(tmpDir, 'dd');
    const result = run({ RNFB_TEST_RN_SWIFTPM_DERIVED_DATA: derivedData });
    expect(result.status).toBe(0);

    const args = xcodebuildArgs();
    const valueOf = flag => args[args.indexOf(flag) + 1];
    expect(valueOf('-project')).toBe(path.join(workDir, 'RnfbSpm/ios/RnfbSpm.xcodeproj'));
    expect(valueOf('-scheme')).toBe('RnfbSpm');
    expect(valueOf('-configuration')).toBe('Debug');
    expect(valueOf('-destination')).toBe('generic/platform=iOS Simulator');
    expect(valueOf('-derivedDataPath')).toBe(derivedData);
    expect(args).not.toContain('-workspace');
    expect(args[args.length - 1]).toBe('build');
  });

  it('defaults DerivedData into the work dir', function () {
    expect(run().status).toBe(0);
    const args = xcodebuildArgs();
    expect(args[args.indexOf('-derivedDataPath') + 1]).toBe(path.join(workDir, 'DerivedData'));
  });

  it('replaces an app left over from an earlier run', function () {
    const stale = path.join(workDir, 'RnfbSpm/stale-marker');
    fs.mkdirSync(path.dirname(stale), { recursive: true });
    fs.writeFileSync(stale, '');
    expect(run().status).toBe(0);
    expect(fs.existsSync(stale)).toBe(false);
  });

  it('fails before creating an app when the SwiftPM plugin is not built', function () {
    fs.rmSync(path.join(fakeRepo, 'packages/app/spm/build'), { recursive: true });
    const result = run();
    expect(result.status).not.toBe(0);
    expect(result.output).toContain('packages/app/spm/build/index.js');
    expect(result.output).toContain('yarn lerna:prepare');
    expect(stubCalls()).toEqual([]);
  });

  it('fails when the sync writes no ReactNativeFirebase Package.swift', function () {
    const result = run({ STUB_SPM_WRITES: 'core,crashlytics' });
    expect(result.status).not.toBe(0);
    expect(result.output).toContain(PACKAGE_SWIFT_REL);
    expect(stubCalls()).not.toContain('xcodebuild');
  });

  it.each([
    ['package,crashlytics', CORE_PHASE],
    ['package,core', CRASHLYTICS_PHASE],
  ])('fails when the sync writes %s but not the %s phase', function (writes, missingPhase) {
    const result = run({ STUB_SPM_WRITES: writes });
    expect(result.status).not.toBe(0);
    expect(result.output).toContain(missingPhase);
    expect(result.output).toContain('project.pbxproj');
    expect(stubCalls()).not.toContain('xcodebuild');
  });

  it('fails with the first compile error and the log path when xcodebuild fails', function () {
    const result = run({ STUB_XCODEBUILD_EXIT: '65' });
    expect(result.status).not.toBe(0);
    expect(result.output).toContain("no such module 'FirebaseCore'");
    expect(result.output).toContain(path.join(workDir, 'xcodebuild.log'));
    expect(result.output).not.toContain('PASS');
  });
});

describe('test_rn_swiftpm_ios_build.yml', function () {
  const workflow = fs.existsSync(workflowPath) ? fs.readFileSync(workflowPath, 'utf8') : '';

  function pathsFor(event) {
    const eventBlock = workflow.split(`\n  ${event}:\n`)[1] || '';
    const list = eventBlock.match(/^ {4}paths:\n((?: {6}- .+\n)+)/m)?.[1] || '';
    return [...list.matchAll(/^ {6}- '(.+)'$/gm)].map(match => match[1]);
  }

  it('filters pull_request and push on the same SwiftPM inputs', function () {
    const pullRequest = pathsFor('pull_request');
    expect(pullRequest).toEqual(
      expect.arrayContaining([
        'packages/app/spm/**',
        'packages/*/spm-autolinking-plugin.js',
        'packages/*/react-native.config.js',
        'packages/*/package.json',
        'packages/*/ios/**',
        'packages/*/*.podspec',
        'packages/app/firebase-schema.json',
        workflowRel,
        scriptRel,
        '.github/workflows/scripts/configure-apple-ci.sh',
        'scripts/e2e/lib/ios-simulator-helpers.sh',
        'packages/app/__tests__/rnSwiftPmIosBuild.test.js',
      ]),
    );
    expect(pathsFor('push')).toEqual(pullRequest);
  });

  it('runs on pushes to main and release branches', function () {
    const push = workflow.split('\n  push:\n')[1] || '';
    expect(push).toMatch(/^ {4}branches:\n {6}- main\n {6}- release-v\*\n/);
  });

  it('runs the build script after the Apple toolchain check and yarn install', function () {
    const runs = [...workflow.matchAll(/^ {8}run: (.+)$/gm)].map(match => match[1]);
    const configure = runs.indexOf('bash .github/workflows/scripts/configure-apple-ci.sh');
    const install = runs.indexOf('yarn');
    const build = runs.indexOf('yarn test-rn-swiftpm:ios:build');
    expect(configure).toBeGreaterThan(-1);
    expect(install).toBeGreaterThan(configure);
    expect(build).toBeGreaterThan(install);
  });

  it('reaches the script through the root yarn script', function () {
    const rootPackage = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    expect(rootPackage.scripts['test-rn-swiftpm:ios:build']).toBe(`bash ${scriptRel}`);
  });
});

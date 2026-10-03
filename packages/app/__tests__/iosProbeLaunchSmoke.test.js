const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// RNFB_PROBE_TEST_ROOT points the suite at a copy of the repo's workflow files
// (mutation checks run it against deliberately broken copies in /tmp). Unset
// in normal runs.
const repoRoot = process.env.RNFB_PROBE_TEST_ROOT || path.resolve(__dirname, '../../..');
const scriptsDir = path.join(repoRoot, '.github/workflows/scripts');
const helperPath = path.join(scriptsDir, 'lib/rn-bare-probe-launch-assertions.sh');
const smokeScriptPath = path.join(scriptsDir, 'test-rn-bare-ios-launch-smoke.sh');
const workflowPath = path.join(repoRoot, '.github/workflows/test_rn_bare_ios_build.yml');

const FRAMEWORK_REL = 'RNFBFirebase.framework/RNFBFirebase';
const SIM_DEVICE_PREFIX = '/Users/x/Library/Developer/CoreSimulator/Devices/ABCD/data/Containers';
const APP_BUNDLE = `${SIM_DEVICE_PREFIX}/Bundle/Application/1234/testrnbare.app`;

const CONFIGURE_LINE =
  '2026-10-02 12:00:00.000 Db testrnbare[1:2] [com.google.firebase:] [FirebaseCore][I-COR000001] Configuring the default app.';

function lsofFields(paths) {
  return ['p4242', ...paths.map(p => `n${p}`)].join('\n') + '\n';
}

describe('rn-bare probe launch smoke assertions', function () {
  let tmpDir;
  let binDir;

  function writeStub(name, content) {
    fs.writeFileSync(path.join(binDir, name), content, { mode: 0o755 });
  }

  function runHelper(body, env = {}) {
    const script = `
set -euo pipefail
log() { echo "[log] $*"; }
fail() { echo "[fail] $*"; exit 1; }
source "${helperPath}"
${body}
`;
    return spawnSync('bash', ['-c', script], {
      encoding: 'utf8',
      env: { ...process.env, ...env, PATH: `${binDir}:${process.env.PATH}` },
    });
  }

  beforeEach(function () {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-probe-launch-'));
    binDir = path.join(tmpDir, 'bin');
    fs.mkdirSync(binDir, { recursive: true });
  });

  afterEach(function () {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('probe Pods state', function () {
    function writePods(content) {
      const file = path.join(tmpDir, 'project.pbxproj');
      fs.writeFileSync(file, content);
      return file;
    }

    it('passes when the Pods project has RNFBFirebaseProbeOrder', function () {
      const pods = writePods('/* RNFBFirebaseProbeOrder */\n');
      const result = runHelper(`rnfb_probe_launch_assert_probe_pods "${pods}"`);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('probe pods: RNFBFirebaseProbeOrder present');
    });

    it('fails when the Pods project came from a non-probe pod install', function () {
      const pods = writePods('/* RNFBApp only */\n');
      const result = runHelper(`rnfb_probe_launch_assert_probe_pods "${pods}"`);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('last pod install was not a probe install');
    });

    it('fails when the Pods project is missing', function () {
      const result = runHelper(
        `rnfb_probe_launch_assert_probe_pods "${path.join(tmpDir, 'nope.pbxproj')}"`,
      );
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('Pods project was not found');
    });
  });

  describe('framework embedded in the app bundle', function () {
    it('passes when Frameworks/RNFBFirebase.framework/RNFBFirebase exists', function () {
      const app = path.join(tmpDir, 'testrnbare.app');
      fs.mkdirSync(path.join(app, 'Frameworks/RNFBFirebase.framework'), { recursive: true });
      fs.writeFileSync(path.join(app, 'Frameworks', FRAMEWORK_REL), 'binary');
      const result = runHelper(`rnfb_probe_launch_assert_framework_embedded "${app}"`);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('embedded:');
    });

    it('fails when the framework is not embedded (other frameworks present)', function () {
      const app = path.join(tmpDir, 'testrnbare.app');
      fs.mkdirSync(path.join(app, 'Frameworks/RNFBApp.framework'), { recursive: true });
      fs.writeFileSync(path.join(app, 'Frameworks/RNFBApp.framework/RNFBApp'), 'binary');
      const result = runHelper(`rnfb_probe_launch_assert_framework_embedded "${app}"`);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('RNFBFirebase.framework is not embedded');
    });

    it('fails when the app bundle is missing', function () {
      const result = runHelper(
        `rnfb_probe_launch_assert_framework_embedded "${path.join(tmpDir, 'missing.app')}"`,
      );
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('app bundle was not found');
    });
  });

  describe('app binary references the RNFBFirebase facade', function () {
    const FACADE_SYMBOL = '$s12RNFBFirebase0A9AppClientO9configureyyFZ';
    const NM_STUB = [
      '#!/bin/bash',
      'for last in "$@"; do :; done',
      'fixture="${NM_FIXTURE_DIR}/$(basename "$last").nm"',
      'if [[ -f "$fixture" ]]; then cat "$fixture"; exit 0; fi',
      'echo "nm: $last: No such file" >&2',
      'exit 1',
      '',
    ].join('\n');

    function makeApp(files) {
      const app = path.join(tmpDir, 'testrnbare.app');
      fs.mkdirSync(app, { recursive: true });
      for (const name of files) {
        fs.writeFileSync(path.join(app, name), 'binary');
      }
      return app;
    }

    function writeNm(name, symbols) {
      const dir = path.join(tmpDir, 'nm');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${name}.nm`), `${symbols.join('\n')}\n`);
      return dir;
    }

    const OTHER_SYMBOLS = [
      '                 U _OBJC_CLASS_$_FIRApp',
      '                 U $s11RNFBAppCore0A9AppClientO9configureyyFZ',
      '                 U $s12RNFBFirebase5OtherO3fooyyFZ',
    ];

    beforeEach(function () {
      writeStub('nm', NM_STUB);
    });

    it('passes when testrnbare.debug.dylib has an undefined RNFBFirebase AppClient symbol', function () {
      const app = makeApp(['testrnbare', 'testrnbare.debug.dylib']);
      const dir = writeNm('testrnbare.debug.dylib', [
        ...OTHER_SYMBOLS,
        `                 U ${FACADE_SYMBOL}`,
      ]);
      writeNm('testrnbare', ['                 U _UIApplicationMain']);
      const result = runHelper(`rnfb_probe_launch_assert_facade_referenced "${app}"`, {
        NM_FIXTURE_DIR: dir,
      });
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('facade referenced:');
      expect(result.stdout).toContain('testrnbare.debug.dylib');
    });

    it('passes when only the executable (no debug dylib) references the facade', function () {
      const app = makeApp(['testrnbare']);
      const dir = writeNm('testrnbare', [`                 U ${FACADE_SYMBOL}`]);
      const result = runHelper(`rnfb_probe_launch_assert_facade_referenced "${app}"`, {
        NM_FIXTURE_DIR: dir,
      });
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('facade referenced:');
    });

    it('fails when no binary has an RNFBFirebase AppClient symbol', function () {
      const app = makeApp(['testrnbare', 'testrnbare.debug.dylib']);
      const dir = writeNm('testrnbare.debug.dylib', OTHER_SYMBOLS);
      writeNm('testrnbare', ['                 U _UIApplicationMain']);
      const result = runHelper(`rnfb_probe_launch_assert_facade_referenced "${app}"`, {
        NM_FIXTURE_DIR: dir,
      });
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('references an RNFBFirebase AppClient symbol');
      expect(result.stdout).toContain('does not call the probe facade');
    });

    it('fails when nm cannot read the binaries (no symbols)', function () {
      const app = makeApp(['testrnbare']);
      const result = runHelper(`rnfb_probe_launch_assert_facade_referenced "${app}"`, {
        NM_FIXTURE_DIR: path.join(tmpDir, 'no-fixtures'),
      });
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('does not call the probe facade');
    });

    it('fails with a clear message when the app has neither binary', function () {
      const app = makeApp([]);
      const result = runHelper(`rnfb_probe_launch_assert_facade_referenced "${app}"`, {
        NM_FIXTURE_DIR: path.join(tmpDir, 'no-fixtures'),
      });
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('no app binary to inspect');
    });
  });

  describe('framework mapped into the running process', function () {
    // Stub lsof prints the fixture named by LSOF_FIXTURE, or fails when it is unset.
    const LSOF_STUB = [
      '#!/bin/bash',
      'if [[ -z "${LSOF_FIXTURE:-}" ]]; then echo "lsof: simulated failure" >&2; exit 1; fi',
      'printf "%s" "$(cat "$LSOF_FIXTURE")"',
      '',
    ].join('\n');

    function writeFixture(paths) {
      const file = path.join(tmpDir, 'lsof.txt');
      fs.writeFileSync(file, paths === null ? '' : lsofFields(paths));
      return file;
    }

    beforeEach(function () {
      writeStub('lsof', LSOF_STUB);
    });

    it('passes when RNFBFirebase.framework is among the mapped images', function () {
      const fixture = writeFixture([
        `${APP_BUNDLE}/testrnbare`,
        `${APP_BUNDLE}/Frameworks/${FRAMEWORK_REL}`,
      ]);
      const result = runHelper(
        'rnfb_probe_launch_capture_loaded_images 4242; rnfb_probe_launch_assert_framework_loaded',
        { LSOF_FIXTURE: fixture },
      );
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('RNFBFirebase.framework is mapped into the running app');
    });

    it('fails when the process maps other frameworks but not RNFBFirebase', function () {
      const fixture = writeFixture([
        `${APP_BUNDLE}/testrnbare`,
        `${APP_BUNDLE}/Frameworks/RNFBApp.framework/RNFBApp`,
        `${APP_BUNDLE}/Frameworks/RNFBFirebaseOther.framework/RNFBFirebaseOther`,
      ]);
      const result = runHelper(
        'rnfb_probe_launch_capture_loaded_images 4242; rnfb_probe_launch_assert_framework_loaded',
        { LSOF_FIXTURE: fixture },
      );
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('not mapped into the running app process');
    });

    it('does not accept RNFBFirebase.debug.dylib or longer paths ending the same way', function () {
      const fixture = writeFixture([
        `${APP_BUNDLE}/testrnbare`,
        `${APP_BUNDLE}/Frameworks/RNFBFirebase.framework/RNFBFirebase.debug.dylib`,
        `${APP_BUNDLE}/Frameworks/RNFBFirebase.framework/RNFBFirebase.bak`,
        `${APP_BUNDLE}/Frameworks/XRNFBFirebase.framework/RNFBFirebase`,
        `${APP_BUNDLE}/Frameworks/${FRAMEWORK_REL}/extra`,
      ]);
      const result = runHelper(
        'rnfb_probe_launch_capture_loaded_images 4242; rnfb_probe_launch_assert_framework_loaded',
        { LSOF_FIXTURE: fixture },
      );
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('not mapped into the running app process');
    });

    it('fails with the recorded error when lsof fails', function () {
      const result = runHelper(
        'rnfb_probe_launch_capture_loaded_images 4242; rnfb_probe_launch_assert_framework_loaded',
      );
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('load is unproven');
      expect(result.stdout).toContain('lsof: simulated failure');
    });

    it('fails when lsof lists nothing (app already exited)', function () {
      const fixture = writeFixture(null);
      const result = runHelper(
        'rnfb_probe_launch_capture_loaded_images 4242; rnfb_probe_launch_assert_framework_loaded',
        { LSOF_FIXTURE: fixture },
      );
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('the app exited before the load check');
    });

    it('fails when launch did not report a numeric pid', function () {
      const fixture = writeFixture([`${APP_BUNDLE}/Frameworks/${FRAMEWORK_REL}`]);
      const result = runHelper(
        'rnfb_probe_launch_capture_loaded_images "not-a-pid"; rnfb_probe_launch_assert_framework_loaded',
        { LSOF_FIXTURE: fixture },
      );
      expect(result.status).toBe(1);
      expect(result.stdout).toContain("numeric pid for the app (got 'not-a-pid')");
    });

    it('capture alone never fails, so earlier launch diagnostics still run', function () {
      const result = runHelper(
        'rnfb_probe_launch_capture_loaded_images 4242; echo "captured-without-exit"',
      );
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('captured-without-exit');
    });
  });

  describe('configure marker in the app log', function () {
    function writeLog(lines) {
      const file = path.join(tmpDir, 'app.log');
      fs.writeFileSync(file, `${lines.join('\n')}\n`);
      return file;
    }

    it('passes when FirebaseCore logged the default-app configure line', function () {
      const file = writeLog(['unrelated line', CONFIGURE_LINE]);
      const result = runHelper(`rnfb_probe_launch_assert_configure_logged "${file}"`);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('I-COR000001');
    });

    it('fails when the log has no configure line', function () {
      const file = writeLog(['Window did become application key', 'sceneOfRecord: something']);
      const result = runHelper(`rnfb_probe_launch_assert_configure_logged "${file}"`);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('RNFBFirebaseAppClient.configure() did not run');
    });

    it('fails when only the code or only the message text appears', function () {
      const file = writeLog([
        '[FirebaseCore][I-COR000001] something else',
        '[FirebaseCore][I-COR000002] Configuring the default app.',
      ]);
      const result = runHelper(`rnfb_probe_launch_assert_configure_logged "${file}"`);
      expect(result.status).toBe(1);
    });

    it('fails when the log file is missing', function () {
      const result = runHelper(
        `rnfb_probe_launch_assert_configure_logged "${path.join(tmpDir, 'missing.log')}"`,
      );
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('app log was not found');
    });
  });

  describe('smoke script wiring', function () {
    const smokeSource = fs.readFileSync(smokeScriptPath, 'utf8');

    it('sources the probe launch helper and gates every probe step on the flag', function () {
      expect(smokeSource).toContain('lib/rn-bare-probe-launch-assertions.sh');
      for (const call of [
        'rnfb_probe_launch_assert_probe_pods',
        'rnfb_probe_launch_assert_framework_embedded',
        'rnfb_probe_launch_assert_facade_referenced',
        'rnfb_probe_launch_capture_loaded_images',
        'rnfb_probe_launch_assert_framework_loaded',
        'rnfb_probe_launch_assert_configure_logged',
      ]) {
        const lines = smokeSource.split('\n');
        const callIdx = lines.findIndex(line => line.trim().startsWith(call));
        expect(callIdx).toBeGreaterThan(-1);
        const indent = line => line.length - line.trimStart().length;
        // The call is indented inside a block whose opener is the probe guard
        // (or the probe-only launch DerivedData branch).
        expect(indent(lines[callIdx])).toBeGreaterThan(0);
        let openerIdx = callIdx - 1;
        while (
          openerIdx >= 0 &&
          (lines[openerIdx].trim() === '' || indent(lines[openerIdx]) >= indent(lines[callIdx]))
        ) {
          openerIdx -= 1;
        }
        expect(lines[openerIdx]).toMatch(
          /if \[\[ ("\$PROBE_DYNAMIC_FIREBASE" == "1"|-n "\$LAUNCH_DERIVED_DATA") \]\]; then/,
        );
      }
    });

    it('keeps the flag-off launch, log level, and app lookup unchanged', function () {
      expect(smokeSource).toContain('xcrun simctl launch "$UDID" "$BUNDLE_ID" >/dev/null');
      expect(smokeSource).toContain('LOG_LEVEL="default"');
      expect(smokeSource).toContain(
        '"${HOME}/Library/Developer/Xcode/DerivedData"/testrnbare-*/Build/Products/Debug-iphonesimulator',
      );
      // -FIRDebugEnabled is probe-only.
      const launchLines = smokeSource
        .split('\n')
        .filter(line => line.includes('simctl launch') && line.includes('-FIRDebugEnabled'));
      expect(launchLines).toHaveLength(1);
    });

    it('builds into the launch DerivedData and finds the probe app only there', function () {
      expect(smokeSource).toContain('derived_data_args=(-derivedDataPath "$LAUNCH_DERIVED_DATA")');
      const xcodebuildIdx = smokeSource.indexOf('xcodebuild \\\n');
      const argsIdx = smokeSource.indexOf('${derived_data_args[@]+"${derived_data_args[@]}"}');
      const configIdx = smokeSource.indexOf('-configuration Debug');
      expect(xcodebuildIdx).toBeGreaterThan(-1);
      expect(argsIdx).toBeGreaterThan(xcodebuildIdx);
      expect(configIdx).toBeGreaterThan(argsIdx);
      // Probe branch lookup starts at the launch DerivedData, never the default one.
      const probeLookup = smokeSource.match(
        /if \[\[ -n "\$LAUNCH_DERIVED_DATA" \]\]; then\n\s+APP="\$\(\n\s+find "([^"]+)"/,
      );
      expect(probeLookup).not.toBeNull();
      expect(probeLookup[1]).toBe('${LAUNCH_DERIVED_DATA}/Build/Products/Debug-iphonesimulator');
    });

    it('waits for the log stream header (probe only) instead of a fixed sleep', function () {
      expect(smokeSource).toContain('grep -Fq \'Filtering the log data using\' "$APP_LOG"');
      expect(smokeSource).toContain('log stream never reported ready');
      // Flag off keeps the original one second sleep.
      expect(smokeSource).toMatch(/else\n\s+sleep 1\nfi/);
    });

    it('reaps the log stream in cleanup()', function () {
      const cleanup = smokeSource.slice(
        smokeSource.indexOf('cleanup() {'),
        smokeSource.indexOf('\n}\n', smokeSource.indexOf('cleanup() {')),
      );
      expect(cleanup).toContain('kill "$LOG_PID"');
      expect(cleanup).toContain('wait "$LOG_PID"');
    });

    it('launches the probe app with FirebaseCore debug logging and streams debug logs', function () {
      expect(smokeSource).toContain('"$UDID" "$BUNDLE_ID" -FIRDebugEnabled');
      expect(smokeSource).toContain('LOG_LEVEL="debug"');
      expect(smokeSource).toContain('log stream --level "$LOG_LEVEL"');
      // Load check must happen while the app is alive: after launch, before terminate.
      const launchIdx = smokeSource.indexOf('-FIRDebugEnabled)');
      const captureIdx = smokeSource.indexOf('rnfb_probe_launch_capture_loaded_images "$APP_PID"');
      const terminateIdx = smokeSource.lastIndexOf('xcrun simctl terminate "$UDID" "$BUNDLE_ID"');
      expect(launchIdx).toBeGreaterThan(-1);
      expect(captureIdx).toBeGreaterThan(launchIdx);
      expect(terminateIdx).toBeGreaterThan(captureIdx);
    });

    describe('running the script against a skeleton checkout', function () {
      function buildSkeleton({ pods }) {
        const skeleton = path.join(tmpDir, 'skeleton');
        const scripts = path.join(skeleton, '.github/workflows/scripts');
        fs.mkdirSync(path.join(scripts, 'lib'), { recursive: true });
        fs.mkdirSync(path.join(skeleton, 'scripts/e2e/lib'), { recursive: true });
        fs.mkdirSync(path.join(skeleton, 'test-rn-bare/ios/testrnbare.xcworkspace'), {
          recursive: true,
        });
        fs.copyFileSync(smokeScriptPath, path.join(scripts, 'test-rn-bare-ios-launch-smoke.sh'));
        fs.copyFileSync(helperPath, path.join(scripts, 'lib/rn-bare-probe-launch-assertions.sh'));
        fs.writeFileSync(
          path.join(skeleton, 'scripts/e2e/lib/ios-simulator-helpers.sh'),
          'rnfb_ensure_ios_simulator_udid() { echo FAKE-UDID; }\nrnfb_ios_sim_runtime_label() { echo fake-runtime; }\n',
        );
        if (pods !== null) {
          fs.mkdirSync(path.join(skeleton, 'test-rn-bare/ios/Pods/Pods.xcodeproj'), {
            recursive: true,
          });
          fs.writeFileSync(
            path.join(skeleton, 'test-rn-bare/ios/Pods/Pods.xcodeproj/project.pbxproj'),
            pods,
          );
        }
        return skeleton;
      }

      // xcrun is stubbed to fail loudly: any run that gets past the probe
      // pre-checks and touches a simulator fails the test with a recognizable message.
      function runSmoke(skeleton, env) {
        writeStub('xcrun', '#!/bin/bash\necho "STUB-XCRUN-REACHED $*" >&2\nexit 1\n');
        writeStub('lsof', '#!/bin/bash\nexit 0\n');
        return spawnSync(
          'bash',
          [path.join(skeleton, '.github/workflows/scripts/test-rn-bare-ios-launch-smoke.sh')],
          {
            encoding: 'utf8',
            env: {
              ...process.env,
              PATH: `${binDir}:${process.env.PATH}`,
              RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE: '1',
              ...env,
            },
          },
        );
      }

      it('probe mode fails before any simulator work when the Pods project is missing', function () {
        const skeleton = buildSkeleton({ pods: null });
        const result = runSmoke(skeleton, {});
        expect(result.status).toBe(1);
        expect(result.stdout).toContain('Pods project was not found');
        expect(result.stderr).not.toContain('STUB-XCRUN-REACHED');
      });

      it('probe mode fails before any simulator work when Pods is not a probe install', function () {
        const skeleton = buildSkeleton({ pods: '/* shipped graph */\n' });
        const result = runSmoke(skeleton, {});
        expect(result.status).toBe(1);
        expect(result.stdout).toContain('no RNFBFirebaseProbeOrder');
        expect(result.stderr).not.toContain('STUB-XCRUN-REACHED');
      });

      it('probe mode wipes its launch DerivedData before building', function () {
        const skeleton = buildSkeleton({ pods: '/* RNFBFirebaseProbeOrder */\n' });
        const launchDd = path.join(tmpDir, 'launch-dd');
        fs.mkdirSync(launchDd, { recursive: true });
        fs.writeFileSync(path.join(launchDd, 'stale-sentinel'), 'x');
        runSmoke(skeleton, { RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA: launchDd });
        expect(fs.existsSync(path.join(launchDd, 'stale-sentinel'))).toBe(false);
      });

      it('probe mode refuses to wipe / as launch DerivedData', function () {
        const skeleton = buildSkeleton({ pods: '/* RNFBFirebaseProbeOrder */\n' });
        const result = runSmoke(skeleton, { RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA: '/' });
        expect(result.status).toBe(1);
        expect(result.stdout).toContain("refusing to delete launch DerivedData path '/'");
      });

      it('flag off ignores the Pods state and leaves launch DerivedData alone', function () {
        const skeleton = buildSkeleton({ pods: null });
        const launchDd = path.join(tmpDir, 'launch-dd');
        fs.mkdirSync(launchDd, { recursive: true });
        fs.writeFileSync(path.join(launchDd, 'sentinel'), 'x');
        const result = runSmoke(skeleton, {
          RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE: '0',
          RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA: launchDd,
        });
        expect(result.stdout).not.toContain('probe mode ON');
        expect(result.stdout).not.toContain('Pods project');
        expect(fs.existsSync(path.join(launchDd, 'sentinel'))).toBe(true);
      });

      describe('through xcodebuild, app lookup, and log stream with stubbed tools', function () {
        const PROBE_PODS = '/* RNFBFirebaseProbeOrder */\n';
        const FACADE_NM = '                 U $s12RNFBFirebase0A9AppClientO9configureyyFZ\n';

        // Records every xcrun call. `simctl launch` fails so the script stops
        // right after the app is installed and the log stream is started,
        // unless LAUNCH_OUTPUT is set: then it prints that line and succeeds.
        // `simctl spawn` plays `log stream`: prints the header (after
        // STREAM_HEADER_DELAY seconds, never when STREAM_NO_HEADER=1), records
        // its pid, and stays alive until killed (or exits at once when
        // STREAM_EXITS=1).
        const XCRUN_STUB = [
          '#!/bin/bash',
          'echo "$*" >> "$XCRUN_LOG"',
          'case "$1 $2" in',
          '  "simctl launch")',
          '    [[ -n "${LAUNCH_OUTPUT:-}" ]] && { echo "$LAUNCH_OUTPUT"; exit 0; }',
          '    exit 1 ;;',
          '  "simctl spawn")',
          '    echo "$$" > "$SPAWN_PID_FILE"',
          '    [[ "${STREAM_EXITS:-0}" == "1" ]] && exit 0',
          '    sleep "${STREAM_HEADER_DELAY:-0}"',
          '    [[ "${STREAM_NO_HEADER:-0}" == "1" ]] || echo \'Filtering the log data using "process == testrnbare"\'',
          '    exec sleep 300 ;;',
          'esac',
          'exit 0',
          '',
        ].join('\n');

        // Records xcodebuild's args and writes testrnbare.app under the
        // -derivedDataPath value, or under HOME's default DerivedData without it.
        const XCODEBUILD_STUB = [
          '#!/bin/bash',
          'printf "%s\\n" "$@" > "$XCODEBUILD_ARGS_FILE"',
          'derived=""; prev=""',
          'for arg in "$@"; do',
          '  [[ "$prev" == "-derivedDataPath" ]] && derived="$arg"',
          '  prev="$arg"',
          'done',
          '[[ -n "$derived" ]] || derived="$HOME/Library/Developer/Xcode/DerivedData/testrnbare-abc"',
          'app="$derived/Build/Products/Debug-iphonesimulator/testrnbare.app"',
          'mkdir -p "$app/Frameworks/RNFBFirebase.framework"',
          'echo x > "$app/Frameworks/RNFBFirebase.framework/RNFBFirebase"',
          'echo x > "$app/testrnbare"',
          'exit 0',
          '',
        ].join('\n');

        let spawnedPid;

        afterEach(function () {
          if (spawnedPid) {
            try {
              process.kill(spawnedPid, 'SIGKILL');
            } catch (_e) {
              // already gone
            }
            spawnedPid = undefined;
          }
        });

        function pidAlive(pid) {
          try {
            process.kill(pid, 0);
            return true;
          } catch (_e) {
            return false;
          }
        }

        function runFlow(skeleton, env = {}, nmSymbols = FACADE_NM) {
          const home = path.join(tmpDir, 'home');
          fs.mkdirSync(home, { recursive: true });
          const nmDir = path.join(tmpDir, 'nm');
          fs.mkdirSync(nmDir, { recursive: true });
          fs.writeFileSync(path.join(nmDir, 'testrnbare.nm'), nmSymbols);
          writeStub('xcrun', XCRUN_STUB);
          writeStub('xcodebuild', XCODEBUILD_STUB);
          writeStub('nm', '#!/bin/bash\ncat "$NM_FIXTURE_DIR/testrnbare.nm"\n');
          writeStub('curl', '#!/bin/bash\necho packager-status:running\n');
          writeStub('yarn', '#!/bin/bash\nexit 0\n');
          writeStub('lsof', '#!/bin/bash\necho "$*" >> "$LSOF_LOG"\nexit 0\n');
          const paths = {
            lsofLog: path.join(tmpDir, 'lsof.log'),
            xcrunLog: path.join(tmpDir, 'xcrun.log'),
            xcodebuildArgs: path.join(tmpDir, 'xcodebuild.args'),
            spawnPid: path.join(tmpDir, 'spawn.pid'),
            appLog: path.join(tmpDir, 'app.log'),
          };
          const result = spawnSync(
            'bash',
            [path.join(skeleton, '.github/workflows/scripts/test-rn-bare-ios-launch-smoke.sh')],
            {
              encoding: 'utf8',
              env: {
                ...process.env,
                PATH: `${binDir}:${process.env.PATH}`,
                HOME: home,
                NM_FIXTURE_DIR: nmDir,
                XCRUN_LOG: paths.xcrunLog,
                LSOF_LOG: paths.lsofLog,
                XCODEBUILD_ARGS_FILE: paths.xcodebuildArgs,
                SPAWN_PID_FILE: paths.spawnPid,
                RNFB_TEST_RN_BARE_LAUNCH_LOG: paths.appLog,
                RNFB_TEST_RN_BARE_LAUNCH_XCODEBUILD_LOG: path.join(tmpDir, 'xcodebuild.log'),
                RNFB_TEST_RN_BARE_METRO_LOG: path.join(tmpDir, 'metro.log'),
                RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE: '1',
                ...env,
              },
            },
          );
          if (fs.existsSync(paths.spawnPid)) {
            spawnedPid = Number(fs.readFileSync(paths.spawnPid, 'utf8').trim());
          }
          return { result, paths, home };
        }

        function readLines(file) {
          return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
        }

        it('probe mode passes -derivedDataPath <launch dir> before -configuration and installs from it', function () {
          const skeleton = buildSkeleton({ pods: PROBE_PODS });
          const launchDd = path.join(tmpDir, 'launch-dd');
          // A stale app in the default DerivedData must never be the one installed.
          const staleApp = path.join(
            tmpDir,
            'home/Library/Developer/Xcode/DerivedData/testrnbare-stale/Build/Products/Debug-iphonesimulator/testrnbare.app',
          );
          fs.mkdirSync(staleApp, { recursive: true });
          const { result, paths } = runFlow(skeleton, {
            RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA: launchDd,
          });
          expect(result.stderr).not.toContain('could not find');
          const args = readLines(paths.xcodebuildArgs);
          const flagIdx = args.indexOf('-derivedDataPath');
          expect(flagIdx).toBeGreaterThan(-1);
          expect(args[flagIdx + 1]).toBe(launchDd);
          expect(flagIdx).toBeLessThan(args.indexOf('-configuration'));
          const installs = readLines(paths.xcrunLog).filter(line =>
            line.startsWith('simctl install'),
          );
          expect(installs).toHaveLength(1);
          expect(installs[0]).toContain(
            `${launchDd}/Build/Products/Debug-iphonesimulator/testrnbare.app`,
          );
          expect(installs[0]).not.toContain('testrnbare-stale');
        });

        it('flag off passes no -derivedDataPath and looks in the default DerivedData', function () {
          const skeleton = buildSkeleton({ pods: null });
          const { result, paths, home } = runFlow(skeleton, {
            RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE: '0',
            RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA: path.join(tmpDir, 'launch-dd'),
          });
          expect(result.stdout).not.toContain('probe mode ON');
          const args = readLines(paths.xcodebuildArgs);
          expect(args).not.toContain('-derivedDataPath');
          expect(args).toContain('-configuration');
          const installs = readLines(paths.xcrunLog).filter(line =>
            line.startsWith('simctl install'),
          );
          expect(installs).toHaveLength(1);
          expect(installs[0]).toContain(
            `${home}/Library/Developer/Xcode/DerivedData/testrnbare-abc/`,
          );
          expect(fs.existsSync(path.join(tmpDir, 'launch-dd'))).toBe(false);
        });

        it('probe mode fails before install when the built app does not reference the facade', function () {
          const skeleton = buildSkeleton({ pods: PROBE_PODS });
          const { result, paths } = runFlow(
            skeleton,
            { RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA: path.join(tmpDir, 'launch-dd') },
            '                 U _OBJC_CLASS_$_FIRApp\n',
          );
          expect(result.status).toBe(1);
          expect(result.stdout).toContain('does not call the probe facade');
          expect(readLines(paths.xcrunLog).some(line => line.startsWith('simctl install'))).toBe(
            false,
          );
        });

        it('probe mode runs the facade check and reaches install when the symbol is present', function () {
          const skeleton = buildSkeleton({ pods: PROBE_PODS });
          const { result, paths } = runFlow(skeleton, {
            RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA: path.join(tmpDir, 'launch-dd'),
          });
          expect(result.stdout).toContain('facade referenced:');
          expect(readLines(paths.xcrunLog).some(line => line.startsWith('simctl install'))).toBe(
            true,
          );
        });

        it('probe mode waits for the log stream header before launching', function () {
          const skeleton = buildSkeleton({ pods: PROBE_PODS });
          const started = Date.now();
          const { result, paths } = runFlow(skeleton, {
            RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA: path.join(tmpDir, 'launch-dd'),
            STREAM_HEADER_DELAY: '2',
          });
          expect(Date.now() - started).toBeGreaterThanOrEqual(1900);
          expect(result.stdout).not.toContain('log stream never reported ready');
          const calls = readLines(paths.xcrunLog);
          expect(calls.some(line => line.startsWith('simctl launch'))).toBe(true);
        });

        it('probe mode fails clearly, without launching, when the log stream never reports ready', function () {
          const skeleton = buildSkeleton({ pods: PROBE_PODS });
          const started = Date.now();
          const { result, paths } = runFlow(skeleton, {
            RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA: path.join(tmpDir, 'launch-dd'),
            STREAM_EXITS: '1',
          });
          const elapsed = Date.now() - started;
          expect(result.status).toBe(1);
          expect(result.stdout).toContain('log stream never reported ready');
          expect(readLines(paths.xcrunLog).some(line => line.startsWith('simctl launch'))).toBe(
            false,
          );
          // A dead stream must end the readiness poll early. Without the
          // liveness check the poll runs its full 20 x 0.5 s = 10 s.
          expect(elapsed).toBeLessThan(5000);
        });

        it('probe mode passes the pid parsed from simctl launch output to lsof', function () {
          const skeleton = buildSkeleton({ pods: PROBE_PODS });
          // Skip only the script's fixed post-launch wait; every other sleep
          // (including the stubbed log stream's) goes to the real one.
          writeStub('sleep', '#!/bin/bash\n[[ "$1" == "10" ]] && exit 0\nexec /bin/sleep "$@"\n');
          const { paths } = runFlow(skeleton, {
            RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA: path.join(tmpDir, 'launch-dd'),
            LAUNCH_OUTPUT: 'com.invertase.testrnbare: 4242',
          });
          // The stubbed app log has no window markers, so the script fails after
          // the load check; only the lsof call is under test here.
          expect(readLines(paths.lsofLog).some(line => /^-p 4242( |$)/.test(line))).toBe(true);
        });

        it('kills the log stream when simctl launch fails (probe and flag off)', function () {
          for (const probe of ['1', '0']) {
            fs.rmSync(path.join(tmpDir, 'spawn.pid'), { force: true });
            const skeleton = buildSkeleton({ pods: probe === '1' ? PROBE_PODS : null });
            const { result } = runFlow(skeleton, {
              RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE: probe,
              RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA: path.join(tmpDir, 'launch-dd'),
            });
            // simctl launch is the stub's deliberate failure: the script exits non-zero.
            expect(result.status).not.toBe(0);
            expect(spawnedPid).toBeGreaterThan(0);
            expect(pidAlive(spawnedPid)).toBe(false);
            spawnedPid = undefined;
            fs.rmSync(path.join(tmpDir, 'skeleton'), { recursive: true, force: true });
          }
        });
      });
    });
  });

  describe('workflow wiring', function () {
    const workflow = fs.readFileSync(workflowPath, 'utf8');
    const probeHeader = '  test-rn-bare-ios-build-dynamic-firebase:\n';
    const probeJob = workflow.slice(workflow.indexOf(probeHeader));

    function stepRuns(job) {
      return [...job.matchAll(/^ {6}- name: (.+)\n(?: {8}.*\n)*? {8}run: (.+)$/gm)].map(match => ({
        name: match[1],
        run: match[2],
      }));
    }

    it('runs the launch smoke after the flagged build in the probe job', function () {
      expect(workflow).toContain(probeHeader);
      const steps = stepRuns(probeJob);
      const buildIdx = steps.findIndex(step => step.run === 'yarn test-rn-bare:ios:build');
      const smokeIdx = steps.findIndex(step => step.run === 'yarn test-rn-bare:ios:launch-smoke');
      expect(buildIdx).toBeGreaterThan(-1);
      expect(smokeIdx).toBeGreaterThan(buildIdx);
      expect(steps[smokeIdx].name).toContain('dynamic Firebase probe');
    });

    it('keeps the probe flag and its own launch DerivedData and logs at job level', function () {
      const envBlock = probeJob.slice(probeJob.indexOf('    env:'), probeJob.indexOf('    steps:'));
      expect(envBlock).toContain("RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE: '1'");
      expect(envBlock).toContain(
        'RNFB_TEST_RN_BARE_DERIVED_DATA: /tmp/test-rn-bare-derived-data-probe',
      );
      expect(envBlock).toMatch(
        /RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA: \/tmp\/test-rn-bare-launch-derived-data-probe\n/,
      );
      expect(envBlock).toContain('RNFB_TEST_RN_BARE_LAUNCH_XCODEBUILD_LOG:');
      expect(envBlock).toContain('RNFB_TEST_RN_BARE_LAUNCH_LOG:');
      expect(envBlock).toContain('RNFB_TEST_RN_BARE_METRO_LOG:');
    });

    it('keeps the probe job timeout at 60 minutes', function () {
      expect(probeJob).toContain('    timeout-minutes: 60\n');
    });

    it('leaves the flag-off job running its own launch smoke without probe env', function () {
      const normalJob = workflow.slice(
        workflow.indexOf('  test-rn-bare-ios-build:\n'),
        workflow.indexOf(probeHeader),
      );
      const steps = stepRuns(normalJob);
      expect(steps.map(step => step.run)).toEqual(
        expect.arrayContaining([
          'yarn test-rn-bare:ios:build',
          'yarn test-rn-bare:ios:launch-smoke',
        ]),
      );
      expect(normalJob).not.toContain('RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE');
      expect(normalJob).not.toContain('RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA');
    });

    it('lists the helper and this test in both path filters', function () {
      for (const entry of [
        "'.github/workflows/scripts/test-rn-bare-ios-launch-smoke.sh'",
        "'.github/workflows/scripts/lib/rn-bare-probe-launch-assertions.sh'",
        "'packages/app/__tests__/iosProbeLaunchSmoke.test.js'",
      ]) {
        expect(workflow.split(`      - ${entry}\n`).length - 1).toBe(2);
      }
    });
  });
});

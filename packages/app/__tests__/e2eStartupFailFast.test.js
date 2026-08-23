const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const failfastLib = path.join(repoRoot, 'scripts/e2e/lib/e2e-startup-failfast.sh');
const startPackager = path.join(repoRoot, 'scripts/e2e/start-packager.sh');
const runningE2e = fs.readFileSync(
  path.join(repoRoot, 'okf-bundle/testing/running-e2e.md'),
  'utf8',
);
const failfastSrc = fs.readFileSync(failfastLib, 'utf8');
const rootPkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));

function bashSnippet(body, env = process.env) {
  return execFileSync(
    'bash',
    [
      '-c',
      `set -euo pipefail
source ${JSON.stringify(failfastLib)}
${body}`,
    ],
    { encoding: 'utf8', cwd: repoRoot, env },
  );
}

function writeTemp(contents) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-failfast-'));
  const file = path.join(dir, 'log.txt');
  fs.writeFileSync(file, contents);
  return file;
}

describe('startup fail-fast markers (UNI-9way-latency)', function () {
  const idleLine =
    '22:21:29.663 detox[34833] i ws-client:APP_STATUS The app seems to be idle\n[jet-control] launch-ready received\n';
  const hangStatusLine =
    'ws-client:APP_STATUS Failed to execute the current status query. The pending request #1 ("currentStatus") has been rejected due to the following error:\n';
  const hangTimeoutLine =
    'The tester has not received a response within 5000ms timeout to the message:\n';

  it('OKF startup-fail-fast-poll is hard infra only; idle APP_STATUS is healthy', function () {
    expect(runningE2e).toMatch(/startup-fail-fast-poll/);
    expect(runningE2e).toMatch(/must not match.*idle|seems to be idle/i);
    expect(runningE2e).toMatch(/E2E_STARTUP_FAILFAST_NOTIFY_PATTERN/);
    expect(runningE2e).toMatch(/TELNET_ERROR/);
    expect(runningE2e).toMatch(/emulator-16/);
    expect(runningE2e).toMatch(/ReactContext is null/);
  });

  it('negative: healthy idle APP_STATUS does not abort', function () {
    const f = writeTemp(idleLine);
    const out = bashSnippet(
      `if e2e_log_has_startup_failfast ${JSON.stringify(f)}; then echo MATCH; else echo NOMATCH; fi`,
    );
    expect(out.trim()).toBe('NOMATCH');
  });

  it('negative: slow/5000ms currentStatus under load is not wave-kill', function () {
    const f = writeTemp(hangStatusLine + hangTimeoutLine);
    const out = bashSnippet(
      `if e2e_log_has_startup_failfast ${JSON.stringify(f)}; then echo MATCH; else echo NOMATCH; fi`,
    );
    expect(out.trim()).toBe('NOMATCH');
  });

  it('negative: 5000ms status timeout line alone is not wave-kill', function () {
    const f = writeTemp(hangTimeoutLine);
    const out = bashSnippet(
      `if e2e_log_has_startup_failfast ${JSON.stringify(f)}; then echo MATCH; else echo NOMATCH; fi`,
    );
    expect(out.trim()).toBe('NOMATCH');
  });

  it('negative: fail-fast pattern excludes APP_STATUS, currentStatus, and 5000ms', function () {
    const out = bashSnippet('printf "%s" "$E2E_STARTUP_FAILFAST_NOTIFY_PATTERN"');
    expect(out).not.toMatch(/APP_STATUS/);
    expect(out).not.toMatch(/currentStatus/);
    expect(out).not.toMatch(/5000ms/);
    expect(out).not.toMatch(/waiting for Metro on port 12007/);
    expect(out).toMatch(/TELNET_ERROR/);
    expect(out).toMatch(/emulator-16/);
  });

  it('negative: slotted android slot-0 Metro wait :12007 does not abort', function () {
    const f = writeTemp(
      'waiting for Metro on port 12007\nMetro OK on 127.0.0.1:12007\nadb -s emulator-5556 wait-for-device\n',
    );
    const out = bashSnippet(
      `if e2e_log_has_startup_failfast ${JSON.stringify(f)}; then echo MATCH; else echo NOMATCH; fi`,
    );
    expect(out.trim()).toBe('NOMATCH');
  });

  it('positive: serial leftover wait :12007 with emulator-5554 aborts', function () {
    const f = writeTemp('waiting for Metro on port 12007\nadb -s emulator-5554 wait-for-device\n');
    const out = bashSnippet(
      `if e2e_log_has_startup_failfast ${JSON.stringify(f)}; then echo MATCH; else echo NOMATCH; fi`,
    );
    expect(out.trim()).toBe('MATCH');
  });

  it('positive: TELNET / Cannot connect still abort', function () {
    const f = writeTemp('TELNET_ERROR: Cannot connect to 127.0.0.1:5556\n');
    const out = bashSnippet(
      `if e2e_log_has_startup_failfast ${JSON.stringify(f)}; then echo MATCH; else echo NOMATCH; fi`,
    );
    expect(out.trim()).toBe('MATCH');
  });

  it('positive: leftover emulator-16 still abort', function () {
    const f = writeTemp('List of devices attached\nemulator-16222\tdevice\n');
    const out = bashSnippet(
      `if e2e_log_has_startup_failfast ${JSON.stringify(f)}; then echo MATCH; else echo NOMATCH; fi`,
    );
    expect(out.trim()).toBe('MATCH');
  });

  it('positive: dead ReactContext is null still abort', function () {
    const f = writeTemp('FabricDetoxIdlingResourceFactoryStrategy ReactContext is null!\n');
    const out = bashSnippet(
      `if e2e_log_has_startup_failfast ${JSON.stringify(f)}; then echo MATCH; else echo NOMATCH; fi`,
    );
    expect(out.trim()).toBe('MATCH');
  });

  it('positive: failfast helpers work without ripgrep on PATH (CI Jest)', function () {
    const ciPath = '/usr/bin:/bin';
    const f = writeTemp('TELNET_ERROR: Cannot connect to 127.0.0.1:5556\n');
    const life = writeTemp('[cell] INFRA pod:install failed\n');
    const logOut = bashSnippet(
      `if e2e_log_has_startup_failfast ${JSON.stringify(f)}; then echo MATCH; else echo NOMATCH; fi`,
      { ...process.env, PATH: ciPath },
    );
    const waveOut = bashSnippet(
      `if e2e_wave_is_infra_abort 99 ${JSON.stringify(life)}; then echo ABORT; else echo CONTINUE; fi`,
      { ...process.env, PATH: ciPath },
    );
    expect(logOut.trim()).toBe('MATCH');
    expect(waveOut.trim()).toBe('ABORT');
    expect(failfastSrc).not.toMatch(/\brg\b/);
  });
});

describe('wave abort on Apple pod:install / :build (UNI-fail-fast-idle)', function () {
  it('product Jest asserts OKF + committed failfast lib + yarn Law only', function () {
    const src = fs.readFileSync(__filename, 'utf8');
    expect(src).not.toMatch(/\.agents\/tmp/);
    expect(src).not.toMatch(/run-cell\.sh|run-uni-3x3\.sh/);
    expect(src).not.toMatch(/tests\/macos\/Pods/);
    expect(fs.existsSync(failfastLib)).toBe(true);
  });

  it('Law Apple pod:install is yarn tests:*; failfast maps INFRA / spec miss', function () {
    expect(rootPkg.scripts['tests:ios:pod:install']).toMatch(/pod install/);
    expect(rootPkg.scripts['tests:macos:pod:install']).toMatch(/pod install/);
    expect(failfastSrc).toMatch(/e2e_wave_is_infra_abort/);
    expect(failfastSrc).toMatch(/\[cell\] INFRA|Unable to find a specification/);
    expect(runningE2e).toMatch(/yarn tests:ios:pod:install/);
    expect(runningE2e).toMatch(/abort the wave/);
  });

  it('negative: pod exit 1 without test-cover start is infra abort', function () {
    const life = writeTemp(
      '[cell] emulator suite ready\n[!] Unable to find a specification for `SocketRocket (~> 0.7.1)`\n',
    );
    const out = bashSnippet(
      `if e2e_wave_is_infra_abort 1 ${JSON.stringify(life)}; then echo ABORT; else echo CONTINUE; fi`,
    );
    expect(out.trim()).toBe('ABORT');
  });

  it('positive: pod INFRA exit 99 aborts the wave', function () {
    const life = writeTemp('[cell] INFRA pod:install failed\n');
    const out = bashSnippet(
      `if e2e_wave_is_infra_abort 99 ${JSON.stringify(life)}; then echo ABORT; else echo CONTINUE; fi`,
    );
    expect(out.trim()).toBe('ABORT');
  });

  it('product mocha fail after test-cover start does not infra-abort the wave', function () {
    const life = writeTemp('[cell] 2026-08-21T00:00:00Z test-cover start\n');
    const out = bashSnippet(
      `if e2e_wave_is_infra_abort 1 ${JSON.stringify(life)}; then echo ABORT; else echo CONTINUE; fi`,
    );
    expect(out.trim()).toBe('CONTINUE');
  });

  it('OKF serializes Apple pod:install before overlapping :build/:test-cover', function () {
    expect(runningE2e).toMatch(/\*\*Serialize\*\* all Apple `yarn tests:<platform>:pod:install`/);
    expect(runningE2e).toMatch(/overlapping `:build` \/ `:test-cover`/);
    expect(failfastSrc).toMatch(/e2e_wave_is_infra_abort/);
    expect(failfastSrc).toMatch(/e2e_log_has_startup_failfast/);
    expect(runningE2e).not.toMatch(/RNFB_E2E_SERIALIZE_ANDROID_LAUNCH=1/);
    expect(runningE2e).not.toMatch(/GRADLE_USER_HOME=\$HOME\/\.gradle\/rnfb-slot/);
  });

  it('Apple :build still does not invoke pod install', function () {
    expect(rootPkg.scripts['tests:ios:build']).not.toMatch(/pod:install|pod install/);
    expect(rootPkg.scripts['tests:macos:build']).not.toMatch(/pod:install|pod install/);
  });

  it('SocketRocket miss is CDN/spec (iOS trunk) not a committed macos local podspec', function () {
    const iosPodfile = fs.readFileSync(path.join(repoRoot, 'tests/ios/Podfile'), 'utf8');
    const macosLock = fs.readFileSync(
      path.join(repoRoot, 'tests-macos/macos/Podfile.lock'),
      'utf8',
    );
    expect(iosPodfile).toMatch(/cdn\.cocoapods\.org/);
    expect(rootPkg.scripts['tests:ios:pod:install']).toMatch(/bundle exec pod install/);
    expect(macosLock).toMatch(
      /SocketRocket \(from `\.\.\/node_modules\/react-native-macos\/third-party-podspecs\/SocketRocket\.podspec`\)/,
    );
  });
});

describe('9-way overlap and latency tolerance (UNI-9way-latency)', function () {
  it('negative: OKF and failfast must not require serialize-Android', function () {
    expect(runningE2e).not.toMatch(/RNFB_E2E_SERIALIZE_ANDROID_LAUNCH/);
    expect(runningE2e).not.toMatch(/e2e_wait_prev_android_launch_ready/);
    expect(runningE2e).not.toMatch(/e2e_wait_wave_apple_cells_done/);
    expect(failfastSrc).not.toMatch(/e2e_wait_prev_android_launch_ready/);
    expect(failfastSrc).not.toMatch(/e2e_wait_wave_apple_cells_done/);
    expect(failfastSrc).not.toMatch(/RNFB_E2E_SERIALIZE_ANDROID_LAUNCH/);
    expect(runningE2e).toMatch(/9 overlapping cells|9 cells at once/);
    expect(runningE2e).toMatch(/Do \*\*not\*\* serialize Android/);
  });

  it('Jet launch-retry lsof SIGTERM/SIGKILL leftover listen PIDs (not spawn-tree only)', function () {
    const src = fs.readFileSync(path.join(repoRoot, 'tests/e2e/firebase.test.js'), 'utf8');
    const killJetAt = src.indexOf('async function killJetForLaunchRetry');
    const drainAt = src.indexOf("await ensureTcpPortClosed(jetRemotePort(), 'drain')");
    const retryAt = src.indexOf(
      "await ensureTcpPortClosed(\n      jetRemotePort(),\n      'launch-retry'",
    );
    expect(src).toMatch(/kill -9 \$\{pids/);
    expect(killJetAt).toBeGreaterThan(-1);
    expect(retryAt).toBeGreaterThan(killJetAt);
    expect(drainAt).toBeGreaterThan(-1);
  });

  it('macos jetrc fail-fasts /status 120s instead of 600s bundle wait', function () {
    const src = fs.readFileSync(path.join(repoRoot, 'tests-macos/.jetrc.js'), 'utf8');
    expect(src).toMatch(/statusTimeoutMs = 120000/);
    expect(src).toMatch(
      /packager-status:running on 127\.0\.0\.1:\$\{metroPort\} after \$\{statusTimeoutMs\}ms/,
    );
  });

  it('Law packager kill-then-start /status; :test-cover does not restart Metro', function () {
    const packager = fs.readFileSync(startPackager, 'utf8');
    expect(runningE2e).toMatch(
      /yarn tests:packager:\*[\s\S]*kill-then-start again immediately before `:test-cover`/,
    );
    expect(packager).toMatch(/kill_port_listeners/);
    expect(packager).toMatch(/packager-status:running/);
    expect(rootPkg.scripts['tests:packager:jet']).toMatch(/start-packager\.sh tests/);
    expect(rootPkg.scripts['tests:macos:packager:jet']).toMatch(/start-packager\.sh tests-macos/);
    expect(rootPkg.scripts['tests:android:test-cover']).not.toMatch(/start-packager/);
    expect(rootPkg.scripts['tests:ios:test-cover']).not.toMatch(/start-packager/);
    expect(rootPkg.scripts['tests:macos:test-cover']).not.toMatch(/start-packager/);
  });
});

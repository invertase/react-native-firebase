const fs = require('fs');
const path = require('path');
const {
  statusQueryTimeoutMs,
  loginTimeoutMs,
  debugSynchronizationMs,
  launchAppTimeoutMs,
  launchAppMaxAttempts,
  androidAdbSerialAppearTimeoutMs,
  androidAdbInstallTimeoutMs,
  jetAwaitExitStallTimeoutMs,
} = require('../../../tests/e2e/detoxLatencyPolicy');

const repoRoot = path.resolve(__dirname, '../../..');

describe('detoxLatencyPolicy (UNI-9way-latency)', function () {
  const origEnv = { ...process.env };

  afterEach(function () {
    for (const key of Object.keys(process.env)) {
      if (!(key in origEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, origEnv);
  });

  it('negative: Detox defaults of 5000ms status / 2 launch attempts are not our floor', function () {
    delete process.env.RNFB_DETOX_STATUS_QUERY_TIMEOUT_MS;
    delete process.env.RNFB_LAUNCH_APP_MAX_ATTEMPTS;
    delete process.env.RNFB_LAUNCH_APP_TIMEOUT_MS;
    expect(statusQueryTimeoutMs()).toBeGreaterThan(5000);
    expect(launchAppMaxAttempts()).toBeGreaterThan(2);
    expect(launchAppTimeoutMs()).toBeGreaterThan(180000);
  });

  it('positive: status 30s, login 15s, debugSynchronization 30s, 4 launch attempts, 5m launchApp/install', function () {
    delete process.env.RNFB_DETOX_STATUS_QUERY_TIMEOUT_MS;
    delete process.env.RNFB_DETOX_LOGIN_TIMEOUT_MS;
    delete process.env.RNFB_DETOX_DEBUG_SYNCHRONIZATION_MS;
    delete process.env.RNFB_LAUNCH_APP_TIMEOUT_MS;
    delete process.env.RNFB_LAUNCH_APP_MAX_ATTEMPTS;
    delete process.env.RNFB_ANDROID_ADB_SERIAL_APPEAR_TIMEOUT_MS;
    delete process.env.RNFB_ANDROID_ADB_INSTALL_TIMEOUT_MS;
    delete process.env.RNFB_JET_AWAIT_EXIT_STALL_MS;
    expect(statusQueryTimeoutMs()).toBe(30000);
    expect(loginTimeoutMs()).toBe(15000);
    expect(debugSynchronizationMs()).toBe(30000);
    expect(launchAppTimeoutMs()).toBe(300000);
    expect(launchAppMaxAttempts()).toBe(4);
    expect(androidAdbSerialAppearTimeoutMs()).toBe(90000);
    expect(androidAdbInstallTimeoutMs()).toBe(300000);
    expect(jetAwaitExitStallTimeoutMs()).toBe(1200000);
  });

  it('negative: jest testTimeout 3600000 is not our Jet-await stall floor', function () {
    delete process.env.RNFB_JET_AWAIT_EXIT_STALL_MS;
    expect(jetAwaitExitStallTimeoutMs()).toBeLessThan(3600000);
  });

  it('negative: Detox default adb pm-install 60s is below our latency floor', function () {
    delete process.env.RNFB_ANDROID_ADB_INSTALL_TIMEOUT_MS;
    expect(androidAdbInstallTimeoutMs()).toBeGreaterThan(60000);
  });

  it('positive: firebase.test.js and detoxrc consume the policy timeouts', function () {
    const firebase = fs.readFileSync(path.join(repoRoot, 'tests/e2e/firebase.test.js'), 'utf8');
    const detoxrc = fs.readFileSync(path.join(repoRoot, 'tests/.detoxrc.js'), 'utf8');
    expect(firebase).toMatch(/require\('\.\/detoxLatencyPolicy'\)/);
    expect(firebase).toMatch(/launchAppMaxAttempts\(\)/);
    expect(firebase).toMatch(/launchAppTimeoutMs\(\)/);
    expect(firebase).toMatch(/awaitJetExitWithStallGuard/);
    expect(detoxrc).toMatch(/debugSynchronization:\s*30000/);
  });

  it('positive: Detox CurrentStatus / Login timeouts are patched above 5000 / 1000', function () {
    const actions = fs.readFileSync(
      path.join(repoRoot, 'tests/node_modules/detox/src/client/actions/actions.js'),
      'utf8',
    );
    const currentStatus = actions.match(
      /class CurrentStatus[\s\S]*?get timeout\(\) \{\s*return (\d+);/,
    );
    const login = actions.match(/class Login[\s\S]*?get timeout\(\) \{\s*return (\d+);/);
    expect(currentStatus).not.toBeNull();
    expect(login).not.toBeNull();
    expect(Number(currentStatus[1])).toBe(statusQueryTimeoutMs());
    expect(Number(login[1])).toBe(loginTimeoutMs());
  });

  it('positive: Detox ADB DEFAULT_INSTALL_OPTIONS timeout matches androidAdbInstallTimeoutMs', function () {
    const adb = fs.readFileSync(
      path.join(
        repoRoot,
        'tests/node_modules/detox/src/devices/common/drivers/android/exec/ADB.js',
      ),
      'utf8',
    );
    const install = adb.match(/DEFAULT_INSTALL_OPTIONS\s*=\s*\{[\s\S]*?timeout:\s*(\d+)/);
    expect(install).not.toBeNull();
    expect(Number(install[1])).toBe(androidAdbInstallTimeoutMs());
    expect(Number(install[1])).toBeGreaterThan(60000);
  });
});

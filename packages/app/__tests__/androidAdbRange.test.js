const fs = require('fs');
const path = require('path');
const {
  ADB_EMULATOR_CONSOLE_PORT_MIN,
  ADB_EMULATOR_CONSOLE_PORT_MAX,
  parseEmulatorConsolePort,
  isAdbEmulatorConsolePortInRange,
  shouldFailFastQemuWithoutAdb,
  qemuCmdlineMatchesAvd,
  qemuAvdPgrepPattern,
  adbRangeDiagnosis,
  isMetroWaitFailure,
  shouldColdBootAndroidOnLaunchRetry,
  errorProbeText,
} = require('../../../tests/e2e/androidAdbRange');

const repoRoot = path.resolve(__dirname, '../../..');

describe('androidAdbRange', function () {
  it('treats slotted 5556/5558/5560 and range edges as in-range', function () {
    for (const port of [5554, 5556, 5558, 5560, 5584]) {
      expect(isAdbEmulatorConsolePortInRange(port)).toBe(true);
      expect(shouldFailFastQemuWithoutAdb(`emulator-${port}`, 'unknown')).toBe(false);
    }
  });

  it('does not fail-fast on the first unknown+qemu for in-range emulator-5560', function () {
    expect(parseEmulatorConsolePort('emulator-5560')).toBe(5560);
    expect(shouldFailFastQemuWithoutAdb('emulator-5560', 'unknown')).toBe(false);
    expect(shouldFailFastQemuWithoutAdb('emulator-5560', 'offline')).toBe(false);
  });

  it('fail-fasts immediately for FreePortFinder ports outside adb range', function () {
    expect(isAdbEmulatorConsolePortInRange(12345)).toBe(false);
    expect(shouldFailFastQemuWithoutAdb('emulator-12345', 'unknown')).toBe(true);
    expect(shouldFailFastQemuWithoutAdb('emulator-10000', 'unknown')).toBe(true);
    expect(shouldFailFastQemuWithoutAdb('emulator-20000', 'unknown')).toBe(true);
    expect(shouldFailFastQemuWithoutAdb('emulator-12345', 'offline')).toBe(false);
  });

  it('does not blame FreePortFinder 10000–20000 when -port is 5560', function () {
    const msg = adbRangeDiagnosis('emulator-5560', 'TestingAVD-2');
    expect(msg).toMatch(/qemu-without-adb/);
    expect(msg).toMatch(/console -port 5560 is inside adb's emulator range \[5554, 5584\]/);
    expect(msg).toMatch(/not a Detox FreePortFinder 10000–20000 miss/);
    expect(msg).not.toMatch(/is outside adb's emulator range/);
    expect(msg).not.toMatch(/pin RNFB_ANDROID_CONSOLE_PORT/);
  });

  it('blames FreePortFinder when -port is outside adb range', function () {
    const msg = adbRangeDiagnosis('emulator-12345', 'TestingAVD-2');
    expect(msg).toMatch(/console -port 12345 is outside adb's emulator range \[5554, 5584\]/);
    expect(msg).toMatch(/Detox FreePortFinder defaults \(10000–20000\)/);
    expect(msg).toMatch(/pin RNFB_ANDROID_CONSOLE_PORT/);
  });

  it('exports the documented adb console range', function () {
    expect(ADB_EMULATOR_CONSOLE_PORT_MIN).toBe(5554);
    expect(ADB_EMULATOR_CONSOLE_PORT_MAX).toBe(5584);
  });
});

describe('qemuCmdlineMatchesAvd', function () {
  const spawn = avd => `/sdk/emulator/qemu-system-aarch64 -avd ${avd} -port 5556 @${avd}`;

  it('does not treat TestingAVD as a prefix of @TestingAVD-0', function () {
    expect(qemuCmdlineMatchesAvd(spawn('TestingAVD-0'), 'TestingAVD')).toBe(false);
    expect(new RegExp('@TestingAVD\\b').test('@TestingAVD-0')).toBe(true);
  });

  it('matches @TestingAVD-0 exactly and not @TestingAVD or @TestingAVD-1', function () {
    expect(qemuCmdlineMatchesAvd(spawn('TestingAVD-0'), 'TestingAVD-0')).toBe(true);
    expect(qemuCmdlineMatchesAvd(`${spawn('TestingAVD-0')} extra`, 'TestingAVD-0')).toBe(true);
    expect(qemuCmdlineMatchesAvd(spawn('TestingAVD'), 'TestingAVD-0')).toBe(false);
    expect(qemuCmdlineMatchesAvd(spawn('TestingAVD-1'), 'TestingAVD-0')).toBe(false);
  });

  it('does not match @TestingAVD-10 when looking for TestingAVD-1', function () {
    expect(qemuCmdlineMatchesAvd(spawn('TestingAVD-10'), 'TestingAVD-1')).toBe(false);
    expect(qemuCmdlineMatchesAvd(spawn('TestingAVD-1'), 'TestingAVD-1')).toBe(true);
  });
});

describe('qemuAvdPgrepPattern', function () {
  it('is a complete-identity POSIX ERE (TestingAVD is not a prefix of TestingAVD-0)', function () {
    expect(qemuAvdPgrepPattern('TestingAVD')).toBe('qemu-system.*@TestingAVD([[:space:]]|$)');
    expect(qemuAvdPgrepPattern('TestingAVD-0')).toBe('qemu-system.*@TestingAVD-0([[:space:]]|$)');
  });
});

describe('shouldColdBootAndroidOnLaunchRetry', function () {
  it('does not cold-boot for Metro /status or bundle wait timeouts', function () {
    expect(
      shouldColdBootAndroidOnLaunchRetry(
        new Error(
          'Metro not responding with packager-status:running on 127.0.0.1:12007 after 120000ms',
        ),
      ),
    ).toBe(false);
    expect(
      shouldColdBootAndroidOnLaunchRetry(
        new Error(
          'Metro bundle not available at http://127.0.0.1:12007/index.bundle after 600000ms',
        ),
      ),
    ).toBe(false);
    expect(shouldColdBootAndroidOnLaunchRetry('packager-probe failed')).toBe(false);
    expect(isMetroWaitFailure('Metro not responding on port 12007')).toBe(true);
  });

  it('cold-boots for device-side ANR/offline/qemu-adb faults', function () {
    expect(shouldColdBootAndroidOnLaunchRetry(new Error('ANR in com.example'))).toBe(true);
    expect(shouldColdBootAndroidOnLaunchRetry(new Error('device offline'))).toBe(true);
    expect(
      shouldColdBootAndroidOnLaunchRetry(
        new Error(
          "[rnfb-e2e] qemu-without-adb: qemu is running for AVD TestingAVD-0 but adb serial emulator-5556 is not 'device'",
        ),
      ),
    ).toBe(true);
    expect(
      shouldColdBootAndroidOnLaunchRetry(
        new Error(
          '[rnfb-e2e] cold-boot spawn did not register: AVD=TestingAVD-0 serial=emulator-5556',
        ),
      ),
    ).toBe(true);
    expect(
      shouldColdBootAndroidOnLaunchRetry(
        new Error("[rnfb-e2e] adb serial emulator-5556 did not become 'device' within 20000ms"),
      ),
    ).toBe(true);
  });

  it('cold-boots for pm-install SIGTERM, missing package/activity services, APP_UNREACHABLE', function () {
    expect(
      shouldColdBootAndroidOnLaunchRetry(
        new Error('adb -s emulator-5556 shell pm install ... terminated with SIGTERM'),
      ),
    ).toBe(true);
    expect(shouldColdBootAndroidOnLaunchRetry(new Error('Process was killed with SIGTERM'))).toBe(
      true,
    );
    expect(shouldColdBootAndroidOnLaunchRetry(new Error("cmd: Can't find service: package"))).toBe(
      true,
    );
    expect(shouldColdBootAndroidOnLaunchRetry(new Error("cmd: Can't find service: activity"))).toBe(
      true,
    );
    expect(shouldColdBootAndroidOnLaunchRetry(new Error("cmd: Can't find service: settings"))).toBe(
      true,
    );
    expect(
      shouldColdBootAndroidOnLaunchRetry(
        new Error("APP_UNREACHABLE Detox can't seem to connect to the test app(s)!"),
      ),
    ).toBe(true);
    expect(
      shouldColdBootAndroidOnLaunchRetry(new Error('Failed to run application on the device')),
    ).toBe(true);
  });

  it('cold-boots when ANR is only on jetOutput (Jet session desync path)', function () {
    const err = new Error('Jet tests failed!');
    err.jetOutput =
      'com.github.anrwatchdog.ANRError: Application Not Responding for at least 5000 ms.';
    expect(shouldColdBootAndroidOnLaunchRetry(err)).toBe(true);
    // Full device-side probe must not see jetOutput (product titles can say "offline").
    expect(errorProbeText(err)).toBe('Jet tests failed!');
  });

  it("cold-boots when Can't find service is only on Detox stderr (exit code 20)", function () {
    const err = new Error('Process exited with code 20');
    err.stderr = "cmd: Can't find service: package";
    expect(shouldColdBootAndroidOnLaunchRetry(err)).toBe(true);
    expect(errorProbeText(err)).toMatch(/Can't find service: package/);
  });

  it('does not cold-boot when jetOutput only contains a Mocha title with offline', function () {
    const err = new Error('Jet tests failed!');
    err.jetOutput =
      '  1) database()\n       Reference\n         removes a node whilst offline:\n     Error: expected true to equal false';
    expect(shouldColdBootAndroidOnLaunchRetry(err)).toBe(false);
    expect(errorProbeText(err)).toBe('Jet tests failed!');
  });

  it('cold-boots when launch timeout is enriched with logcat ANR signal', function () {
    expect(
      shouldColdBootAndroidOnLaunchRetry(
        new Error('[rnfb-e2e] launchApp timed out after 300000ms\nANR detected in recent logcat'),
      ),
    ).toBe(true);
  });

  it('does not cold-boot for Jet session noise that is not device-side', function () {
    expect(shouldColdBootAndroidOnLaunchRetry(new Error('Jet WS closed 1006'))).toBe(false);
    expect(shouldColdBootAndroidOnLaunchRetry(new Error('launchApp timed out'))).toBe(false);
  });

  it('suppresses the Android emulator crash-report modal', function () {
    const detoxPatch = fs.readFileSync(
      path.join(repoRoot, '.yarn/patches/detox-npm-20.51.0-3e13b6e309.patch'),
      'utf8',
    );
    expect(detoxPatch).toMatch(/'-crash-report-mode',\s*\n\+\s*'never'/);
  });
});

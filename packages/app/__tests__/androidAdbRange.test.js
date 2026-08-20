const {
  ADB_EMULATOR_CONSOLE_PORT_MIN,
  ADB_EMULATOR_CONSOLE_PORT_MAX,
  parseEmulatorConsolePort,
  isAdbEmulatorConsolePortInRange,
  shouldFailFastQemuWithoutAdb,
  qemuCmdlineMatchesAvd,
  qemuAvdPgrepPattern,
  adbRangeDiagnosis,
} = require('../../../tests/e2e/androidAdbRange');

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

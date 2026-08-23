const { execFileSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const exportSlotEnv = path.join(repoRoot, 'scripts/e2e/export-slot-env.sh');

function exportAndroidSlot(slot) {
  return execFileSync('bash', [exportSlotEnv, 'android', String(slot)], {
    encoding: 'utf8',
    cwd: repoRoot,
  });
}

describe('export-slot-env android console pin', function () {
  it('exports emulator-5556 for slot 0 and does not unset ANDROID_SERIAL', function () {
    const out = exportAndroidSlot(0);
    expect(out).toMatch(/export RNFB_ANDROID_CONSOLE_PORT=5556\b/);
    expect(out).toMatch(/export ANDROID_SERIAL=emulator-5556\b/);
    expect(out).not.toMatch(/^unset ANDROID_SERIAL$/m);
    expect(out).not.toMatch(/^unset RNFB_ANDROID_CONSOLE_PORT$/m);
    expect(out).toMatch(/export RNFB_ANDROID_AVD=TestingAVD-0\b/);
  });

  it('pins slot 1 and 2 to 5558 and 5560', function () {
    expect(exportAndroidSlot(1)).toMatch(/export ANDROID_SERIAL=emulator-5558\b/);
    expect(exportAndroidSlot(2)).toMatch(/export ANDROID_SERIAL=emulator-5560\b/);
  });
});

describe('export-slot-env iOS simulator pin', function () {
  it('exports RNFB_IOS_SIMULATOR for slotted iOS including slot 0', function () {
    const out0 = execFileSync('bash', [exportSlotEnv, 'ios', '0'], {
      encoding: 'utf8',
      cwd: repoRoot,
    });
    expect(out0).toMatch(/export RNFB_IOS_SIMULATOR=.*slot-0/);
    expect(out0).not.toMatch(/iPhone 17/);
    const out1 = execFileSync('bash', [exportSlotEnv, 'ios', '1'], {
      encoding: 'utf8',
      cwd: repoRoot,
    });
    expect(out1).toMatch(/export RNFB_IOS_SIMULATOR=.*slot-1/);
  });
});

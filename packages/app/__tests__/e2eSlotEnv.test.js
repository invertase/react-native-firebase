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
  it('exports the exact neutral base for slotted iOS including slots 0 and 7', function () {
    const out0 = execFileSync('bash', [exportSlotEnv, 'ios', '0'], {
      encoding: 'utf8',
      cwd: repoRoot,
    });
    expect(out0).toMatch(/^export RNFB_IOS_SIMULATOR=RN\\ E2E\\ iOS\\ slot-0$/m);
    expect(out0).not.toMatch(/slot-0-Detox/);
    expect(out0).not.toMatch(/iPhone 17/);
    const out7 = execFileSync('bash', [exportSlotEnv, 'ios', '7'], {
      encoding: 'utf8',
      cwd: repoRoot,
    });
    expect(out7).toMatch(/^export RNFB_IOS_SIMULATOR=RN\\ E2E\\ iOS\\ slot-7$/m);
  });
});

function exportSlotFail(platform, slot, extraEnv = {}) {
  const env = { ...process.env, ...extraEnv };
  delete env.E2E_SLOTTED_MAX;
  delete env.E2E_MACOS_SLOTTED_MAX;
  Object.assign(env, extraEnv);
  try {
    const stdout = execFileSync('bash', [exportSlotEnv, platform, String(slot)], {
      encoding: 'utf8',
      cwd: repoRoot,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { status: 0, stdout, stderr: '' };
  } catch (error) {
    return {
      status: error.status,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
    };
  }
}

describe('export-slot-env slot bounds', function () {
  it('accepts slot 7 with exact Detox configs, ports, and device names', function () {
    const env = { ...process.env };
    delete env.E2E_SLOTTED_MAX;
    delete env.E2E_MACOS_SLOTTED_MAX;
    const out = execFileSync('bash', [exportSlotEnv, 'android', '7'], {
      encoding: 'utf8',
      cwd: repoRoot,
      env,
    });
    expect(out).toMatch(/^export RNFB_E2E_SLOT=7$/m);
    expect(out).toMatch(/^export RNFB_ANDROID_AVD=TestingAVD-7$/m);
    expect(out).toMatch(/^export RNFB_DETOX_ANDROID_CONFIG=android.emu.debug.slot7$/m);
    expect(out).toMatch(/^export RNFB_DETOX_IOS_CONFIG=ios.sim.debug.slot7$/m);
    expect(out).toMatch(/^export RNFB_IOS_SIMULATOR=RN\\ E2E\\ iOS\\ slot-7$/m);
    expect(out).toMatch(/^export RNFB_ANDROID_CONSOLE_PORT=5570$/m);
    expect(out).toMatch(/^export ANDROID_SERIAL=emulator-5570$/m);
    expect(out).toMatch(/^export RNFB_ANDROID_METRO_PORT=19007$/m);
    expect(out).toMatch(/^export RNFB_IOS_METRO_PORT=19107$/m);
    expect(out).toMatch(/^export RNFB_MACOS_METRO_PORT=19207$/m);
    expect(out).not.toMatch(/slot8/);
    expect(out).not.toMatch(/-Detox/);
  });

  it('rejects slot 8, negatives, and non-integers with empty stdout', function () {
    for (const slot of ['8', '-1', '1.5', 'foo', '07']) {
      const result = exportSlotFail('ios', slot);
      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stdout).not.toMatch(/^export /m);
      expect(result.stderr).toMatch(/slot must be an integer 0\.\.7 \(got /);
    }
  });

  it('honors a lowered E2E_SLOTTED_MAX but still rejects a raised ceiling past 7', function () {
    const loweredOk = execFileSync('bash', [exportSlotEnv, 'android', '2'], {
      encoding: 'utf8',
      cwd: repoRoot,
      env: { ...process.env, E2E_SLOTTED_MAX: '2' },
    });
    expect(loweredOk).toMatch(/^export RNFB_E2E_SLOT=2$/m);

    const loweredReject = exportSlotFail('android', '3', { E2E_SLOTTED_MAX: '2' });
    expect(loweredReject.status).toBe(1);
    expect(loweredReject.stdout).toBe('');
    expect(loweredReject.stderr).toMatch(/slot must be an integer 0\.\.2 \(got 3\)/);

    const raisedReject = exportSlotFail('android', '8', { E2E_SLOTTED_MAX: '99' });
    expect(raisedReject.status).toBe(1);
    expect(raisedReject.stdout).toBe('');
    expect(raisedReject.stderr).toMatch(/slot must be an integer 0\.\.7 \(got 8\)/);
  });
});

describe('setup slot count bounds', function () {
  it('accepts counts 1 and 8 at the hard provisioning boundary', function () {
    const slotLib = path.join(repoRoot, 'scripts/e2e/lib/e2e-slot-env.sh');
    const out = execFileSync(
      'bash',
      [
        '-c',
        `set -euo pipefail
source ${JSON.stringify(slotLib)}
e2e_validate_slot_count 1
e2e_validate_slot_count 8
echo VALID
`,
      ],
      { encoding: 'utf8', cwd: repoRoot },
    );
    expect(out.trim()).toBe('VALID');
  });
});

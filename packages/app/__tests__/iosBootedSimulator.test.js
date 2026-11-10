const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const { bootStepPreparedSimulator, bootedSimulatorMismatch } = require(
  path.join(repoRoot, 'tests/e2e/simulatorBootEnv'),
);

describe('booted iOS simulator hand-off', function () {
  it('boot-simulator.sh writes the booted UDID to GITHUB_ENV for the Detox step', function () {
    const src = fs.readFileSync(
      path.join(repoRoot, '.github/workflows/scripts/boot-simulator.sh'),
      'utf8',
    );
    expect(src).toMatch(
      /if \[\[ -n "\$\{GITHUB_ENV:-\}" \]\]; then\n\s+echo "RNFB_IOS_SIMULATOR_UDID=\$\{SIM_UDID\}" >>"\$GITHUB_ENV"/,
    );
  });

  it('reports a Detox device that differs from the booted UDID', function () {
    const message = bootedSimulatorMismatch('4AD2086B-OTHER', {
      RNFB_IOS_SIMULATOR_UDID: '24E299B4-BOOTED',
    });
    expect(message).toContain('Detox allocated iOS simulator 4AD2086B-OTHER');
    expect(message).toContain('the boot step prepared 24E299B4-BOOTED');
  });

  it('accepts the booted device, and skips the check without a booted UDID or device id', function () {
    expect(
      bootedSimulatorMismatch('24E299B4-BOOTED', { RNFB_IOS_SIMULATOR_UDID: '24E299B4-BOOTED' }),
    ).toBeNull();
    expect(bootedSimulatorMismatch('ANY', {})).toBeNull();
    expect(bootedSimulatorMismatch(undefined, { RNFB_IOS_SIMULATOR_UDID: 'X' })).toBeNull();
  });

  it('skips slotted runs, which pin their own simulator by name', function () {
    expect(
      bootedSimulatorMismatch('SLOT-UDID', {
        RNFB_IOS_SIMULATOR_UDID: 'STALE',
        RNFB_E2E_SLOT: '2',
      }),
    ).toBeNull();
    expect(
      bootedSimulatorMismatch('SLOT-UDID', {
        RNFB_IOS_SIMULATOR_UDID: 'STALE',
        RNFB_E2E_HOST_SLOT: '1',
      }),
    ).toBeNull();
  });

  it('treats only the serial boot-prepared simulator as prepared', function () {
    const env = { RNFB_IOS_SIMULATOR_UDID: 'BOOTED' };
    expect(bootStepPreparedSimulator('BOOTED', env)).toBe(true);
    expect(bootStepPreparedSimulator('OTHER', env)).toBe(false);
    expect(bootStepPreparedSimulator('BOOTED', {})).toBe(false);
    expect(bootStepPreparedSimulator(undefined, {})).toBe(false);
    expect(bootStepPreparedSimulator('BOOTED', { ...env, RNFB_E2E_SLOT: '0' })).toBe(false);
  });

  it('skips only the first launch reinstall, and only on the boot-prepared simulator', function () {
    const firebase = fs.readFileSync(path.join(repoRoot, 'tests/e2e/firebase.test.js'), 'utf8');
    expect(firebase).toMatch(
      /launchAttempt === 1 && !deleteAppAfterColdBoot && takeFirstLaunchOnBootPreparedSimulator\(\)/,
    );
    expect(firebase).toMatch(
      /const deleteApp = \(launchAttempt === 1 \|\| deleteAppAfterColdBoot\) && !reuseBootInstall;/,
    );
    expect(firebase).toMatch(/firstLaunchOnBootPreparedSimulatorTaken = true;/);
    expect(firebase).toMatch(/bootStepPreparedSimulator\(deviceId\)/);
  });
});

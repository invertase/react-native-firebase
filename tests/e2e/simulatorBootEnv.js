/*
 * Env for the harness's boot-simulator.sh reboot. Log streams / resource monitor are
 * CI-runner diagnostics; locally they would leak unrecorded processes on a host shared
 * with other owners, so they are off unless CI=true.
 */
function simulatorRebootEnv(env = process.env) {
  return {
    ...env,
    RNFB_START_SIM_LOGS: env.CI === 'true' ? env.RNFB_START_SIM_LOGS || '1' : '0',
  };
}

function isSlotted(env) {
  return Boolean(env.RNFB_E2E_SLOT || env.RNFB_E2E_HOST_SLOT);
}

/*
 * CI's boot step boots one simulator, installs the app and exports its UDID. If Detox
 * allocated any other simulator, every launch would cold-boot an unprepared device and
 * time out, so report the mismatch before the first launch. Slotted runs pin their own
 * simulator by name and are not checked.
 */
function bootedSimulatorMismatch(deviceId, env = process.env) {
  const expected = env.RNFB_IOS_SIMULATOR_UDID;
  if (isSlotted(env) || !expected || !deviceId || deviceId === expected) {
    return null;
  }
  return (
    `[rnfb-e2e] Detox allocated iOS simulator ${deviceId}, but the boot step prepared ` +
    `${expected} (RNFB_IOS_SIMULATOR_UDID). Check the serial simulator device in tests/.detoxrc.js.`
  );
}

/** True when Detox's device is the serial simulator CI's boot step prepared. */
function bootStepPreparedSimulator(deviceId, env = process.env) {
  const expected = env.RNFB_IOS_SIMULATOR_UDID;
  return !isSlotted(env) && Boolean(expected) && deviceId === expected;
}

module.exports = { bootStepPreparedSimulator, bootedSimulatorMismatch, simulatorRebootEnv };

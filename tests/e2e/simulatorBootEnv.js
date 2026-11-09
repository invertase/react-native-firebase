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

module.exports = { simulatorRebootEnv };

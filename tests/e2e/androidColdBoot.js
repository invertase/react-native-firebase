/**
 * Stop this run's own emulator before a harness cold boot. A test only ever perturbs its
 * own emulator: `-read-only` lets another owner run the same AVD at the same time, so
 * never kill by AVD name. The targets are qemu processes on the AVD that are this run's
 * recorded instance, or use this run's console port (`-port <port>`) and trace to this
 * checkout — another owner's qemu on our console port is never selected.
 */
const {
  consoleSerialFromQemuArgs,
  listProcesses,
  pidOwner,
  recordedLiveAndroidQemuPids,
} = require('./runRecord');
const { qemuCmdlineMatchesAvd } = require('./androidAdbRange');

function ownQemuPids(port, avd, { env = process.env, processes = listProcesses() } = {}) {
  const serial = `emulator-${port}`;
  const recorded = new Set(recordedLiveAndroidQemuPids(avd, env));
  return processes
    .filter(p => /qemu-system/.test(p.args) && qemuCmdlineMatchesAvd(p.args, avd))
    .filter(
      p =>
        recorded.has(p.pid) ||
        (consoleSerialFromQemuArgs(p.args) === serial && pidOwner(p.pid, env) !== 'unrecorded'),
    )
    .map(p => p.pid);
}

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (_) {
    return false;
  }
}

async function waitPidsGone(pids, timeoutMs, pollMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!pids.some(pidAlive)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, pollMs));
  }
  return !pids.some(pidAlive);
}

function signalPids(pids, signal) {
  for (const pid of pids) {
    try {
      process.kill(pid, signal);
    } catch (_) {
      // already gone
    }
  }
}

/**
 * SIGTERM the given pids and wait until they exit; SIGKILL the survivors once, then
 * throw (naming them) if any is still present.
 */
async function stopQemuPids(pids, { timeoutMs = 60000, killTimeoutMs = 5000, pollMs = 500 } = {}) {
  signalPids(pids, 'SIGTERM');
  if (await waitPidsGone(pids, timeoutMs, pollMs)) {
    return;
  }
  const survivors = pids.filter(pidAlive);
  // eslint-disable-next-line no-console
  console.warn(
    `[rnfb-e2e] cold-boot: own qemu pid(s) ${survivors.join(',')} ignored SIGTERM — SIGKILL`,
  );
  signalPids(survivors, 'SIGKILL');
  if (await waitPidsGone(survivors, killTimeoutMs, pollMs)) {
    return;
  }
  throw new Error(
    `[rnfb-e2e] cold-boot: own qemu pid(s) ${survivors.filter(pidAlive).join(',')} still present after SIGTERM (${timeoutMs}ms) and SIGKILL (${killTimeoutMs}ms)`,
  );
}

/**
 * This run's qemu on the console port and AVD is up: another owner's same-AVD qemu,
 * on another port or on ours, does not count.
 */
function ownQemuRunning(port, avd, { env = process.env, processes = listProcesses() } = {}) {
  const serial = `emulator-${port}`;
  return processes.some(
    p =>
      /qemu-system/.test(p.args) &&
      qemuCmdlineMatchesAvd(p.args, avd) &&
      consoleSerialFromQemuArgs(p.args) === serial &&
      pidOwner(p.pid, env) !== 'unrecorded',
  );
}

module.exports = { ownQemuPids, ownQemuRunning, stopQemuPids };

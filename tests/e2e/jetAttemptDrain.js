/*
 * Stopping the Jet a failed attempt is still running before the outer retry.
 *
 * A launch retry respawns Jet, so the process an attempt started with is stale; the
 * session's `process` is the one holding the Jet port now. It is this run's own child,
 * so it is stopped directly rather than found by port (lsof) and ownership.
 */

/** ChildProcess.killed only means a signal was sent; alive means it has not exited. */
function jetProcessAlive(proc) {
  return Boolean(proc?.pid) && proc.exitCode === null && proc.signalCode === null;
}

class JetAttemptAbandonedError extends Error {
  constructor() {
    super('[rnfb-e2e] Jet attempt abandoned for the outer retry; not respawning Jet');
    this.jetAttemptAbandoned = true;
  }
}

/**
 * Abandon the attempt (its orchestrate may still be running a launch retry and must not
 * respawn Jet after the drain) and stop the Jet it is running now. Returns the stopped
 * pid, or null when no Jet of the attempt is alive.
 *
 * The tree is killed while its root is alive: a SIGTERM first lets the root exit and
 * orphan the listener, which the tree walk then no longer finds.
 */
function stopAttemptJet(session, { killTree }) {
  if (!session) {
    return null;
  }
  session.abandon();
  const proc = session.process;
  if (!jetProcessAlive(proc)) {
    return null;
  }
  killTree(proc);
  return proc.pid;
}

/**
 * Stop a Jet this run spawned (launch retry, stall) and wait for the Jet port to close.
 * A Jet that has already exited is left alone: its pid may be reused, and the Jet port
 * may already belong to the next attempt's Jet. Tree first, as in stopAttemptJet.
 * Returns whether a Jet was stopped.
 */
async function killJetForRetry(proc, { killTree, closePort, onKill }) {
  if (!jetProcessAlive(proc)) {
    return false;
  }
  onKill?.();
  killTree(proc);
  await closePort();
  return true;
}

/**
 * Cleanup when an attempt's orchestrate fails. Once the drain has abandoned the attempt,
 * its Jet is already stopped and the Jet port may be the next attempt's, so a late
 * failure of the old orchestrate kills nothing. A Jet the session already killed (the
 * stall) is not killed again, even while its exit has not been observed.
 */
async function killJetAfterOrchestrateFailure(session, err, killJet) {
  if (err?.jetAttemptAbandoned || session.abandoned || session.currentJetKilled) {
    return false;
  }
  await killJet(session.process);
  return true;
}

/**
 * Wait at most `timeoutMs` for a promise (orchestrate, terminateApp) to settle; true when
 * the wait timed out. A rejection counts as settled.
 */
async function waitAtMost(promise, timeoutMs) {
  let timer;
  const timedOut = new Promise(resolve => {
    timer = setTimeout(() => resolve(true), timeoutMs);
  });
  try {
    return await Promise.race([
      promise.then(
        () => false,
        () => false,
      ),
      timedOut,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Start one terminate call. `capped()` waits for it at most `capMs`; `join()` waits for the
 * same call until `joinMs` after it started, so a late terminate cannot land on the next
 * attempt's app. Both resolve true on timeout.
 */
function boundedTerminate(terminate, { capMs, joinMs }) {
  const startedAt = Date.now();
  const promise = Promise.resolve().then(terminate);
  return {
    capped: () => waitAtMost(promise, capMs),
    join: () => waitAtMost(promise, Math.max(0, joinMs - (Date.now() - startedAt))),
  };
}

module.exports = {
  JetAttemptAbandonedError,
  boundedTerminate,
  jetProcessAlive,
  killJetAfterOrchestrateFailure,
  killJetForRetry,
  stopAttemptJet,
  waitAtMost,
};

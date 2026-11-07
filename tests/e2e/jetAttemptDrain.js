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

module.exports = {
  JetAttemptAbandonedError,
  jetProcessAlive,
  stopAttemptJet,
};

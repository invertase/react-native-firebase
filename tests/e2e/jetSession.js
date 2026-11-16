/* eslint-disable no-console */
/*
 * One Jet attempt's Jet process: output capture, exit promise, launch-retry respawn.
 *
 * The harness injects how Jet is spawned, killed and waited for after a respawn. Once the
 * drain abandons the attempt, its orchestrate may still be running (the drain waits for
 * it only so long); nothing it does may kill or respawn Jet from then on, because the Jet
 * port belongs to the next attempt.
 */
const { JetAttemptAbandonedError } = require('./jetAttemptDrain');
const { killJetIgnoringExit } = require('./jetExitIgnoreKill');

/**
 * @param {{
 *   spawnProcess: () => import('child_process').ChildProcess,
 *   killJet: (proc: import('child_process').ChildProcess, reason: string) => Promise<void>,
 *   afterRespawn: () => Promise<void>,
 * }} deps
 */
function createJetAttemptSession({ spawnProcess, killJet, afterRespawn }) {
  let output = '';
  let jetProcess;
  let killedJet;
  let ignoreExit = false;
  let abandoned = false;
  let resolveExit;
  let rejectExit;

  const exitPromise = new Promise((resolve, reject) => {
    resolveExit = resolve;
    rejectExit = reject;
  });

  const bindProcess = proc => {
    jetProcess = proc;
    proc.stdout?.on('data', chunk => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });
    proc.stderr?.on('data', chunk => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });
    proc.on('error', err => {
      if (ignoreExit) {
        console.warn(`[rnfb-e2e] ignoring Jet error during launch-retry: ${err?.message || err}`);
        return;
      }
      err.jetOutput = output;
      rejectExit(err);
    });
    proc.on('close', code => {
      if (ignoreExit) {
        console.warn(`[rnfb-e2e] ignoring Jet exit code=${code} during launch-retry`);
        return;
      }
      if (code !== 0) {
        const err = new Error('Jet tests failed!');
        err.jetOutput = output;
        err.jetExitCode = code;
        rejectExit(err);
        return;
      }
      resolveExit({ output });
    });
  };

  const throwIfAbandoned = () => {
    if (abandoned) {
      throw new JetAttemptAbandonedError();
    }
  };

  const spawnJet = () => {
    throwIfAbandoned();
    const proc = spawnProcess();
    bindProcess(proc);
    return proc;
  };

  const setIgnoreExit = value => {
    ignoreExit = value;
  };

  const killCurrentJet = reason => {
    killedJet = jetProcess;
    return killJet(jetProcess, reason);
  };

  spawnJet();

  return {
    get process() {
      return jetProcess;
    },
    get output() {
      return output;
    },
    get abandoned() {
      return abandoned;
    },
    /**
     * The session has already killed its current Jet (stall), whose exit may not be
     * observed yet. A respawned Jet is a new process and reads false again.
     */
    get currentJetKilled() {
      return killedJet !== undefined && killedJet === jetProcess;
    },
    exitPromise,
    abandon() {
      abandoned = true;
    },
    throwIfAbandoned,
    /**
     * Kill Jet with ignoreExit held so exitPromise does not reject and steal an
     * outer Promise.race from a retryable caller error (await-exit stall).
     * Leaves ignoreExit true — session is abandoned or respawned next.
     */
    async killIgnoringExit(reason = 'launch-retry') {
      await killJetIgnoringExit({ setIgnoreExit, kill: () => killCurrentJet(reason) });
    },
    async respawnAfterLaunchRetry() {
      throwIfAbandoned();
      try {
        await killJetIgnoringExit({
          setIgnoreExit,
          kill: () => killCurrentJet('launch-retry'),
        });
        output += '\n[rnfb-e2e] --- jet respawn after launch retry ---\n';
        spawnJet();
        await afterRespawn();
      } finally {
        ignoreExit = false;
      }
    },
  };
}

module.exports = { createJetAttemptSession };

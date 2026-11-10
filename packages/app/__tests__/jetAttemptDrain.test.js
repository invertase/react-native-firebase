const { execSync, spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');

jest.setTimeout(30000);

const {
  JetAttemptAbandonedError,
  boundedTerminate,
  jetProcessAlive,
  killJetAfterOrchestrateFailure,
  killJetForRetry,
  stopAttemptJet,
  waitAtMost,
} = require('../../../tests/e2e/jetAttemptDrain');
const { createJetAttemptSession } = require('../../../tests/e2e/jetSession');

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function portOpen(port) {
  return new Promise(resolve => {
    const socket = net.connect(port, '127.0.0.1');
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitFor(fn, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await fn()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return false;
}

// Same shape as the harness spawnJet: a shell-spawned process tree holding the port.
function spawnStandInJet(port) {
  return spawn(
    `${JSON.stringify(process.execPath)} -e "require('net').createServer().listen(${port}, '127.0.0.1'); setInterval(() => {}, 1000)"`,
    { shell: true, stdio: 'ignore' },
  );
}

// Same as the harness killSpawnedProcessTree.
function killTree(proc) {
  const killDescendants = pid => {
    let kids = [];
    try {
      kids = execSync(`pgrep -P ${pid}`, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    } catch (_) {
      return;
    }
    for (const child of kids) {
      killDescendants(child);
      try {
        process.kill(Number(child), 'SIGKILL');
      } catch (_) {
        // already gone
      }
    }
  };
  killDescendants(String(proc.pid));
  try {
    proc.kill('SIGKILL');
  } catch (_) {
    // already gone
  }
}

// Orphaned listeners have no ChildProcess handle; a failed assertion must not leak them.
function killPids(pids) {
  for (const pid of pids.splice(0)) {
    try {
      process.kill(pid, 'SIGKILL');
    } catch (err) {
      if (err.code !== 'ESRCH') {
        throw err;
      }
    }
  }
}

function exited(proc) {
  return new Promise(resolve => {
    if (!jetProcessAlive(proc)) {
      resolve();
      return;
    }
    proc.once('exit', () => resolve());
  });
}

// The harness session's shape: `process` is the current Jet, respawn replaces it.
function standInSession(port) {
  let current = spawnStandInJet(port);
  let abandoned = false;
  return {
    get process() {
      return current;
    },
    abandon() {
      abandoned = true;
    },
    get abandoned() {
      return abandoned;
    },
    async respawn() {
      const old = current;
      killTree(old);
      await exited(old);
      current = spawnStandInJet(port);
    },
  };
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('Jet attempt drain', function () {
  const procs = [];
  const pids = [];

  afterEach(function () {
    for (const proc of procs.splice(0)) {
      killTree(proc);
    }
    killPids(pids);
  });

  it('stops the Jet a launch retry respawned, not only the one the attempt started with', async function () {
    const port = await freePort();
    const session = standInSession(port);
    const first = session.process;
    procs.push(first);
    expect(await waitFor(() => portOpen(port))).toBe(true);

    await session.respawn();
    const respawned = session.process;
    procs.push(respawned);
    expect(respawned.pid).not.toBe(first.pid);
    expect(await waitFor(() => portOpen(port))).toBe(true);
    expect(jetProcessAlive(first)).toBe(false);

    const stopped = stopAttemptJet(session, { killTree });

    expect(stopped).toBe(respawned.pid);
    expect(session.abandoned).toBe(true);
    expect(await waitFor(async () => !(await portOpen(port)))).toBe(true);
  });

  it('kills the listener under a parent that would exit on SIGTERM and orphan it', async function () {
    const port = await freePort();
    const root = spawn(
      '/bin/sh',
      [
        '-c',
        `${JSON.stringify(process.execPath)} -e "require('net').createServer().listen(${port}, '127.0.0.1'); setInterval(() => {}, 1000)" & wait`,
      ],
      { stdio: 'ignore' },
    );
    procs.push(root);
    expect(await waitFor(() => portOpen(port))).toBe(true);
    const listener = execSync(`pgrep -P ${root.pid}`, { encoding: 'utf8' }).trim();
    expect(listener).toMatch(/^\d+$/);
    pids.push(Number(listener));

    expect(stopAttemptJet({ process: root, abandon() {} }, { killTree })).toBe(root.pid);

    expect(await waitFor(async () => !(await portOpen(port)))).toBe(true);
    const listenerAlive = () => {
      try {
        process.kill(Number(listener), 0);
        return true;
      } catch (_) {
        return false;
      }
    };
    expect(await waitFor(() => !listenerAlive())).toBe(true);
  });

  it('treats a Jet that was signalled but has not exited as alive', async function () {
    const proc = spawn(
      process.execPath,
      ['-e', "process.on('SIGTERM', () => {}); console.log('ready'); setInterval(() => {}, 1000)"],
      { stdio: ['ignore', 'pipe', 'ignore'] },
    );
    procs.push(proc);
    await new Promise(resolve => proc.stdout.once('data', resolve));
    proc.kill('SIGTERM');
    await sleep(200);
    expect(proc.killed).toBe(true);
    expect(jetProcessAlive(proc)).toBe(true);

    const session = { process: proc, abandon() {} };
    expect(stopAttemptJet(session, { killTree })).toBe(proc.pid);
    await exited(proc);
    expect(jetProcessAlive(proc)).toBe(false);
  });

  it('abandons the session even when its Jet has already exited', async function () {
    let abandoned = false;
    const proc = spawn(process.execPath, ['-e', ''], { stdio: 'ignore' });
    await exited(proc);
    const session = {
      process: proc,
      abandon() {
        abandoned = true;
      },
    };
    expect(stopAttemptJet(session, { killTree })).toBeNull();
    expect(abandoned).toBe(true);
    expect(stopAttemptJet(undefined, { killTree })).toBeNull();
  });

  it('marks the abandoned-respawn error so the launch retry loop rethrows it', function () {
    const err = new JetAttemptAbandonedError();
    expect(err.jetAttemptAbandoned).toBe(true);
    expect(err.message).toMatch(/abandoned/);
  });
});

// Like the harness ensureTcpPortClosed for this run's own listeners: kills whatever
// listens on the port, which after the drain is the next attempt's Jet.
function killPortHolders(port) {
  const pids = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t 2>/dev/null || true`, {
    encoding: 'utf8',
  })
    .split(/\s+/)
    .filter(Boolean);
  for (const pid of pids) {
    try {
      process.kill(Number(pid), 'SIGKILL');
    } catch (_) {
      // already gone
    }
  }
}

// The harness always races exitPromise; a killed stand-in Jet rejects it.
function jetAttemptSession(deps) {
  const session = createJetAttemptSession(deps);
  session.exitPromise.catch(() => {});
  return session;
}

function orphaningRoot(port) {
  return spawn(
    '/bin/sh',
    [
      '-c',
      `${JSON.stringify(process.execPath)} -e "require('net').createServer().listen(${port}, '127.0.0.1'); setInterval(() => {}, 1000)" & wait`,
    ],
    { stdio: 'ignore' },
  );
}

describe('a late attempt-1 orchestrate after the drain', function () {
  const procs = [];

  afterEach(function () {
    for (const proc of procs.splice(0)) {
      killTree(proc);
    }
  });

  // Attempt 1's session, drained, with attempt 2's Jet now holding the same port.
  async function drainedAttemptWithNextJet() {
    const port = await freePort();
    const killJet = jest.fn(proc =>
      killJetForRetry(proc, { killTree, closePort: async () => killPortHolders(port) }),
    );
    const spawned = [];
    const session = jetAttemptSession({
      spawnProcess: () => {
        const proc = spawnStandInJet(port);
        spawned.push(proc);
        procs.push(proc);
        return proc;
      },
      killJet,
      afterRespawn: async () => {},
    });
    expect(await waitFor(() => portOpen(port))).toBe(true);
    const attempt1Jet = session.process;
    expect(stopAttemptJet(session, { killTree })).toBe(attempt1Jet.pid);
    await exited(attempt1Jet);
    expect(await waitFor(async () => !(await portOpen(port)))).toBe(true);

    const attempt2Jet = spawnStandInJet(port);
    procs.push(attempt2Jet);
    expect(await waitFor(() => portOpen(port))).toBe(true);
    return { port, session, killJet, spawned, attempt2Jet };
  }

  it('does not respawn: a launch retry throws before killing anything', async function () {
    const { port, session, killJet, spawned, attempt2Jet } = await drainedAttemptWithNextJet();

    await expect(session.respawnAfterLaunchRetry()).rejects.toBeInstanceOf(
      JetAttemptAbandonedError,
    );

    expect(killJet).not.toHaveBeenCalled();
    expect(spawned).toHaveLength(1);
    await sleep(300);
    expect(jetProcessAlive(attempt2Jet)).toBe(true);
    expect(await portOpen(port)).toBe(true);
  });

  it('kills nothing when its orchestrate then fails', async function () {
    const { port, session, killJet, attempt2Jet } = await drainedAttemptWithNextJet();

    expect(
      await killJetAfterOrchestrateFailure(session, new Error('launch timeout'), killJet),
    ).toBe(false);
    expect(
      await killJetAfterOrchestrateFailure(session, new JetAttemptAbandonedError(), killJet),
    ).toBe(false);

    expect(killJet).not.toHaveBeenCalled();
    await sleep(300);
    expect(jetProcessAlive(attempt2Jet)).toBe(true);
    expect(await portOpen(port)).toBe(true);
  });

  it('does not start the next attempt’s Jet run when its launch finishes late', async function () {
    const { session } = await drainedAttemptWithNextJet();
    expect(() => session.throwIfAbandoned()).toThrow(JetAttemptAbandonedError);
  });

  it('does not spawn when the drain abandons it during the respawn kill', async function () {
    const port = await freePort();
    const spawned = [];
    let session;
    session = jetAttemptSession({
      spawnProcess: () => {
        const proc = spawnStandInJet(port);
        spawned.push(proc);
        procs.push(proc);
        return proc;
      },
      killJet: async proc => {
        session.abandon();
        killTree(proc);
      },
      afterRespawn: async () => {},
    });

    await expect(session.respawnAfterLaunchRetry()).rejects.toBeInstanceOf(
      JetAttemptAbandonedError,
    );
    expect(spawned).toHaveLength(1);
  });

  it('still cleans up its own Jet when its orchestrate fails before any drain', async function () {
    const port = await freePort();
    const killJet = jest.fn(async () => {});
    const session = jetAttemptSession({
      spawnProcess: () => {
        const proc = spawnStandInJet(port);
        procs.push(proc);
        return proc;
      },
      killJet,
      afterRespawn: async () => {},
    });
    expect(
      await killJetAfterOrchestrateFailure(session, new Error('launch timeout'), killJet),
    ).toBe(true);
    expect(killJet).toHaveBeenCalledWith(session.process);
  });

  it('does not kill a stalled Jet again while its exit is not yet observed', async function () {
    const port = await freePort();
    // Leaves the stand-in alive, as a SIGKILLed root looks before its exit event.
    const killJet = jest.fn(async () => {});
    const session = jetAttemptSession({
      spawnProcess: () => {
        const proc = spawnStandInJet(port);
        procs.push(proc);
        return proc;
      },
      killJet,
      afterRespawn: async () => {},
    });
    const stalledJet = session.process;

    await session.killIgnoringExit('stall');
    expect(jetProcessAlive(stalledJet)).toBe(true);
    expect(session.currentJetKilled).toBe(true);
    expect(
      await killJetAfterOrchestrateFailure(
        session,
        new Error('awaiting-jet-exit stalled'),
        killJet,
      ),
    ).toBe(false);

    expect(killJet).toHaveBeenCalledTimes(1);
    expect(killJet).toHaveBeenCalledWith(stalledJet, 'stall');
  });

  it('still kills the Jet a launch retry respawned after killing the first', async function () {
    const port = await freePort();
    const killJet = jest.fn(async proc => killTree(proc));
    const session = jetAttemptSession({
      spawnProcess: () => {
        const proc = spawnStandInJet(port);
        procs.push(proc);
        return proc;
      },
      killJet,
      afterRespawn: async () => {},
    });
    const first = session.process;

    await session.respawnAfterLaunchRetry();
    const respawned = session.process;
    expect(respawned).not.toBe(first);
    expect(session.currentJetKilled).toBe(false);
    expect(
      await killJetAfterOrchestrateFailure(session, new Error('launch timeout'), killJet),
    ).toBe(true);

    expect(killJet).toHaveBeenCalledTimes(2);
    expect(killJet).toHaveBeenLastCalledWith(respawned);
  });
});

describe('killJetForRetry', function () {
  const procs = [];
  const pids = [];

  afterEach(function () {
    for (const proc of procs.splice(0)) {
      killTree(proc);
    }
    killPids(pids);
  });

  it('leaves the port alone when the Jet exited by itself (never signalled)', async function () {
    const port = await freePort();
    const attempt1Jet = spawn(process.execPath, ['-e', ''], { stdio: 'ignore' });
    await exited(attempt1Jet);
    expect(attempt1Jet.killed).toBe(false);
    const attempt2Jet = spawnStandInJet(port);
    procs.push(attempt2Jet);
    expect(await waitFor(() => portOpen(port))).toBe(true);
    const onKill = jest.fn();

    expect(
      await killJetForRetry(attempt1Jet, {
        killTree,
        onKill,
        closePort: async () => killPortHolders(port),
      }),
    ).toBe(false);

    expect(onKill).not.toHaveBeenCalled();
    await sleep(300);
    expect(jetProcessAlive(attempt2Jet)).toBe(true);
    expect(await portOpen(port)).toBe(true);
  });

  it('kills the tree before the root can exit and orphan the listener', async function () {
    const port = await freePort();
    const root = orphaningRoot(port);
    procs.push(root);
    expect(await waitFor(() => portOpen(port))).toBe(true);
    const listener = Number(execSync(`pgrep -P ${root.pid}`, { encoding: 'utf8' }).trim());
    expect(listener).toBeGreaterThan(0);
    pids.push(listener);
    const closePort = jest.fn(async () => {});

    expect(await killJetForRetry(root, { killTree, closePort })).toBe(true);

    expect(closePort).toHaveBeenCalledTimes(1);
    const listenerGone = () => {
      try {
        process.kill(listener, 0);
        return false;
      } catch (_) {
        return true;
      }
    };
    expect(await waitFor(() => listenerGone(), 3000)).toBe(true);
    expect(await waitFor(async () => !(await portOpen(port)), 3000)).toBe(true);
  });
});

describe('waitAtMost', function () {
  afterEach(function () {
    jest.useRealTimers();
  });

  it('clears its timer when the promise settles first', async function () {
    jest.useFakeTimers();
    expect(await waitAtMost(Promise.resolve(), 30000)).toBe(false);
    expect(await waitAtMost(Promise.reject(new Error('launch')), 30000)).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('reports a timeout when the promise is still running', async function () {
    jest.useFakeTimers();
    const pending = waitAtMost(new Promise(() => {}), 30000);
    jest.advanceTimersByTime(30000);
    expect(await pending).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('stops waiting for a hung terminateApp and handles its later rejection', async function () {
    jest.useFakeTimers();
    let rejectTerminate;
    const terminate = new Promise((_, reject) => {
      rejectTerminate = reject;
    });
    const pending = waitAtMost(terminate, 15000);
    jest.advanceTimersByTime(15000);
    expect(await pending).toBe(true);
    const unhandled = jest.fn();
    process.on('unhandledRejection', unhandled);
    try {
      rejectTerminate(new Error('detox disconnected'));
      jest.useRealTimers();
      await sleep(50);
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });
});

describe('boundedTerminate', function () {
  afterEach(function () {
    jest.useRealTimers();
  });

  it('joins a terminate that outlived its cap, so the next launch starts after it', async function () {
    jest.useFakeTimers();
    let finish;
    const terminate = jest.fn(
      () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    );
    const t = boundedTerminate(terminate, { capMs: 15000, joinMs: 90000 });
    const capped = t.capped();
    await jest.advanceTimersByTimeAsync(15000);
    expect(await capped).toBe(true);

    let joined;
    t.join().then(result => {
      joined = result;
    });
    await jest.advanceTimersByTimeAsync(25000);
    expect(joined).toBeUndefined();
    finish();
    await jest.advanceTimersByTimeAsync(0);
    expect(joined).toBe(false);
    expect(terminate).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('gives up joining at joinMs after the terminate started, not after the join began', async function () {
    jest.useFakeTimers();
    const t = boundedTerminate(() => new Promise(() => {}), { capMs: 15000, joinMs: 90000 });
    const capped = t.capped();
    await jest.advanceTimersByTimeAsync(15000);
    expect(await capped).toBe(true);
    await jest.advanceTimersByTimeAsync(45000);

    let joined;
    t.join().then(result => {
      joined = result;
    });
    await jest.advanceTimersByTimeAsync(29999);
    expect(joined).toBeUndefined();
    await jest.advanceTimersByTimeAsync(1);
    expect(joined).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('adds no wait when the terminate finished before the join', async function () {
    jest.useFakeTimers();
    const t = boundedTerminate(() => Promise.reject(new Error('detox disconnected')), {
      capMs: 15000,
      joinMs: 90000,
    });
    expect(await t.capped()).toBe(false);
    expect(await t.join()).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
  });
});

describe('harness wiring for the Jet attempt drain', function () {
  const src = fs.readFileSync(path.join(repoRoot, 'tests/e2e/firebase.test.js'), 'utf8');
  const fnBody = name => {
    const start = src.search(new RegExp(`\\n(async )?function ${name}\\(`));
    expect(start).toBeGreaterThan(-1);
    const next = src.slice(start + 1).search(/\n(async )?function /);
    return src.slice(start, next === -1 ? undefined : start + 1 + next);
  };

  it('keeps the session (whose process follows respawns) as the attempt context', function () {
    expect(src).toMatch(/lastJetAttemptContext = \{ jetSession, orchestratePromise \}/);
    expect(src).not.toMatch(/jetProcess: jetSession\.process/);
  });

  it('abandons the attempt before waiting for its orchestrate, then stops its current Jet', function () {
    const drain = fnBody('drainJetAttempt');
    const abandonAt = drain.indexOf('ctx?.jetSession?.abandon()');
    const waitAt = drain.indexOf('ctx?.orchestratePromise');
    const stopAt = drain.indexOf('stopAttemptJet(ctx?.jetSession');
    const portAt = drain.indexOf('ensureTcpPortClosed(jetRemotePort()');
    expect(abandonAt).toBeGreaterThan(-1);
    expect(abandonAt).toBeLessThan(waitAt);
    expect(waitAt).toBeLessThan(stopAt);
    expect(stopAt).toBeLessThan(portAt);
    expect(drain).not.toMatch(/ctx\??\.jetProcess/);
  });

  it('never respawns Jet for an abandoned attempt and stops the launch retry loop', function () {
    const session = fnBody('createJetSession');
    expect(session).toMatch(/return createJetAttemptSession\(\{/);
    expect(session).toMatch(/killJet: killJetForLaunchRetry/);
    const launch = fnBody('launchAppWithRetry');
    expect(launch).toMatch(/catch \(err\) \{\s*if \(err\?\.jetAttemptAbandoned\) \{\s*throw err;/);
  });

  it('checks for abandonment before a launch retry cold boots the emulator', function () {
    const launch = fnBody('launchAppWithRetry');
    const retryAt = launch.indexOf('if (launchAttempt > 1) {');
    const guardAt = launch.indexOf('throwIfAbandoned?.();');
    const coldBootAt = launch.indexOf('await coldBootAndroidEmulator()');
    const relaunchAt = launch.indexOf('await onBeforeRelaunch()');
    expect(retryAt).toBeGreaterThan(-1);
    expect(guardAt).toBeGreaterThan(retryAt);
    expect(coldBootAt).toBeGreaterThan(guardAt);
    expect(relaunchAt).toBeGreaterThan(guardAt);
    expect(fnBody('runJetE2eAttempt')).toMatch(
      /throwIfAbandoned: \(\) => jetSession\.throwIfAbandoned\(\)/,
    );
  });

  it('a late orchestrate neither kills, posts to, nor starts the next Jet', function () {
    const attempt = fnBody('runJetE2eAttempt');
    expect(attempt).toMatch(
      /jetSession\.throwIfAbandoned\(\);\s*logOrchestrateState\('launch-ok'\);\s*await signalJetLaunchReady\(\);/,
    );
    expect(attempt).toMatch(
      /\.catch\(async err => \{\s*if \(!jetSession\.abandoned\) \{\s*logOrchestrateState\('orchestrate-failed'\);\s*\}/,
    );
    expect(attempt).toMatch(
      /killJetAfterOrchestrateFailure\(jetSession, err, killJetForLaunchRetry\)/,
    );
    expect(attempt).not.toMatch(/await killJetForLaunchRetry\(/);
  });

  it('caps the drain terminateApp before the orchestrate wait and joins it after the port close', function () {
    const drain = fnBody('drainJetAttempt');
    expect(drain).toMatch(
      /const terminating = boundedTerminate\(\(\) => device\.terminateApp\(\), \{\s*capMs: DRAIN_TERMINATE_TIMEOUT_MS,\s*joinMs: DRAIN_TERMINATE_JOIN_TIMEOUT_MS,\s*\}\);/,
    );
    expect(drain.match(/device\.terminateApp\(\)/g)).toHaveLength(1);
    const cappedAt = drain.indexOf('await terminating.capped()');
    const orchestrateAt = drain.indexOf('ctx?.orchestratePromise');
    const portAt = drain.indexOf("ensureTcpPortClosed(jetRemotePort(), 'drain')");
    const hostClearAt = drain.indexOf("ensureAndroidJetHostClear('drain')");
    const joinAt = drain.indexOf('await terminating.join()');
    const completeAt = drain.indexOf('Jet attempt drain complete');
    expect(cappedAt).toBeGreaterThan(-1);
    expect(cappedAt).toBeLessThan(orchestrateAt);
    expect(joinAt).toBeGreaterThan(portAt);
    expect(joinAt).toBeGreaterThan(hostClearAt);
    expect(joinAt).toBeLessThan(completeAt);
  });

  it('kills a launch-retry or stalled Jet by tree, only while it is alive', function () {
    const kill = fnBody('killJetForLaunchRetry');
    expect(kill).toMatch(/killJetForRetry\(jetProcess, \{\s*killTree: killSpawnedProcessTree/);
    expect(kill).not.toMatch(/SIGTERM|\.killed|sleep\(/);
  });

  it('waits for the orchestrate with a cleared timer and warns only on a real timeout', function () {
    const drain = fnBody('drainJetAttempt');
    expect(drain).toMatch(
      /await waitAtMost\(ctx\.orchestratePromise, DRAIN_ORCHESTRATE_TIMEOUT_MS\)\)\s*\)\s*\{\s*console\.warn\(`\[rnfb-e2e\] drain orchestrate timed out/,
    );
    expect(drain).not.toMatch(/sleep\(DRAIN_ORCHESTRATE_TIMEOUT_MS\)/);
  });

  it('names what holds the port when the close wait times out', function () {
    const ensure = fnBody('ensureTcpPortClosed');
    expect(ensure).toMatch(/describeTcpListeners\(port\)/);
  });
});

describe('describeTcpListeners', function () {
  let dir;

  beforeEach(function () {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-drain-'));
  });

  afterEach(function () {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('reports no listener, or each holder with its owner', async function () {
    const { describeTcpListeners } = require('../../../tests/e2e/portOwnership');
    const env = process.env.RNFB_E2E_RUN_RECORD_DIR;
    process.env.RNFB_E2E_RUN_RECORD_DIR = dir;
    const port = await freePort();
    expect(describeTcpListeners(port)).toBe(`lsof lists no listener on :${port}`);
    const proc = spawnStandInJet(port);
    try {
      expect(await waitFor(() => portOpen(port))).toBe(true);
      // A child of this process is owned.
      expect(await waitFor(() => /owner=this-checkout/.test(describeTcpListeners(port)))).toBe(
        true,
      );
    } finally {
      killTree(proc);
      if (env === undefined) {
        delete process.env.RNFB_E2E_RUN_RECORD_DIR;
      } else {
        process.env.RNFB_E2E_RUN_RECORD_DIR = env;
      }
    }
    expect(await waitFor(async () => !(await portOpen(port)))).toBe(true);
    expect(describeTcpListeners(port)).toBe(`lsof lists no listener on :${port}`);
  });
});

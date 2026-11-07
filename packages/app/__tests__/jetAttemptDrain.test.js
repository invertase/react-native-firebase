const { execSync, spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');

jest.setTimeout(30000);

const {
  JetAttemptAbandonedError,
  jetProcessAlive,
  stopAttemptJet,
} = require('../../../tests/e2e/jetAttemptDrain');

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

  afterEach(function () {
    for (const proc of procs.splice(0)) {
      killTree(proc);
    }
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
      ['-e', "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000)"],
      { stdio: 'ignore' },
    );
    procs.push(proc);
    await sleep(300);
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
    expect(session).toMatch(
      /const spawnJet = \(\) => \{\s*if \(abandoned\) \{\s*throw new JetAttemptAbandonedError\(\);/,
    );
    expect(session).toMatch(/abandon\(\) \{\s*abandoned = true;/);
    const launch = fnBody('launchAppWithRetry');
    expect(launch).toMatch(/catch \(err\) \{\s*if \(err\?\.jetAttemptAbandoned\) \{\s*throw err;/);
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

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { lsofListenPidsOrNull } = require('../../../tests/e2e/foreignListener');
const {
  MACOS_RUN_PATTERN,
  SLOT_ENV_PATTERN,
  macosRunPidsOnPorts,
  macosSerialRunPidsInRepo,
  psProcessInfo,
} = require('../../../tests/e2e/macosJetPortOwner');

// pid -> { ppid, args }
function tree(table) {
  return pid => table[pid] || null;
}

const SHELL = { ppid: 1, args: '-zsh' };
const MAC_YARN = { ppid: 100, args: 'node /usr/local/bin/yarn tests:macos:test-cover' };
const MAC_BASH = {
  ppid: 101,
  args: 'bash -c source ./scripts/e2e/lib/e2e-slot-env.sh && cd tests-macos && npx jet --target=macos --coverage',
};
const MAC_JET = {
  ppid: 102,
  args: 'node /w/tests-macos/node_modules/.bin/jet --target=macos --coverage',
};

describe('macosJetPortOwner', function () {
  it('pattern matches the old pkill targets', function () {
    expect(MACOS_RUN_PATTERN.test(MAC_YARN.args)).toBe(true);
    expect(MACOS_RUN_PATTERN.test(MAC_BASH.args)).toBe(true);
    expect(MACOS_RUN_PATTERN.test(MAC_JET.args)).toBe(true);
    expect(MACOS_RUN_PATTERN.test('node jet --target=android')).toBe(false);
  });

  it('returns the macOS Jet listening on our port and its wrappers, not the user shell', function () {
    const processInfo = tree({ 100: SHELL, 101: MAC_YARN, 102: MAC_BASH, 103: MAC_JET });
    const pids = macosRunPidsOnPorts([8090, 8091], {
      listPids: port => (port === 8090 || port === 8091 ? [103] : []),
      processInfo,
      selfPid: 999,
    });
    expect(pids.sort()).toEqual([101, 102, 103]);
  });

  it("never returns another slot's macOS run that is not on our ports", function () {
    const processInfo = tree({
      100: SHELL,
      101: MAC_YARN,
      102: MAC_BASH,
      103: MAC_JET,
      200: SHELL,
      201: { ...MAC_YARN, ppid: 200 },
      202: { ...MAC_BASH, ppid: 201 },
      203: { ...MAC_JET, ppid: 202 },
    });
    // Slot macOS Jet 203 listens on 12210; this run's port is 8090.
    const listeners = { 8090: [103], 8091: [103], 12210: [203] };
    const pids = macosRunPidsOnPorts([8090, 8091], {
      listPids: port => listeners[port] || [],
      processInfo,
      selfPid: 999,
    });
    expect(pids).not.toContain(203);
    expect(pids).not.toContain(202);
    expect(pids).not.toContain(201);
  });

  it('ignores a listener that is not a macOS run (left to the port kill)', function () {
    const processInfo = tree({
      100: SHELL,
      300: { ppid: 100, args: 'node /w/tests/node_modules/.bin/jet --target=android' },
    });
    expect(
      macosRunPidsOnPorts([8090], { listPids: () => [300], processInfo, selfPid: 999 }),
    ).toEqual([]);
  });

  it('never returns this process or its ancestors, even when they match', function () {
    // One shell ran both platforms: `yarn tests:macos:test-cover & yarn tests:android:test-cover`.
    const processInfo = tree({
      100: { ppid: 1, args: 'bash -c yarn tests:macos:test-cover & yarn tests:android:test-cover' },
      101: { ...MAC_YARN, ppid: 100 },
      102: MAC_BASH,
      103: MAC_JET,
      400: { ppid: 100, args: 'node jest firebase.test.js' },
    });
    const pids = macosRunPidsOnPorts([8090], { listPids: () => [103], processInfo, selfPid: 400 });
    expect(pids.sort()).toEqual([101, 102, 103]);
  });

  it('returns nothing when no one listens', function () {
    expect(macosRunPidsOnPorts([8090, 8091], { listPids: () => [], selfPid: 999 })).toEqual([]);
  });

  describe('serial run in this checkout', function () {
    const UID = 501;
    const SERIAL_ENV = ' PATH=/usr/bin HOME=/Users/me RNFB_E2E_DEBUG=1';
    const SLOT_ENV = ' PATH=/usr/bin RNFB_E2E_SLOT=2 RNFB_MACOS_JET_PORT=14210';

    function select(procs, extra = {}) {
      const byPid = Object.fromEntries(procs.map(p => [p.pid, p]));
      return macosSerialRunPidsInRepo('/w/repo', {
        listProcesses: () => procs.map(({ pid, uid, args }) => ({ pid, uid, args })),
        processCwd: pid => byPid[pid]?.cwd ?? null,
        processEnv: pid => byPid[pid]?.env ?? null,
        processInfo: tree({ 400: { ppid: 1, args: 'node jest firebase.test.js' } }),
        selfPid: 400,
        uid: UID,
        ...extra,
      }).sort();
    }

    it('slot env pattern flags slot variables only', function () {
      expect(SLOT_ENV_PATTERN.test(SLOT_ENV)).toBe(true);
      expect(SLOT_ENV_PATTERN.test(' RNFB_IOS_JET_CONTROL_PORT=13111')).toBe(true);
      expect(SLOT_ENV_PATTERN.test(' RNFB_JET_PORT=12210')).toBe(true);
      expect(SLOT_ENV_PATTERN.test(' RNFB_JET_CONTROL_PORT=12211')).toBe(true);
      expect(SLOT_ENV_PATTERN.test(' JET_REMOTE_PORT=8090')).toBe(true);
      expect(SLOT_ENV_PATTERN.test(SERIAL_ENV)).toBe(false);
      expect(SLOT_ENV_PATTERN.test(' XRNFB_E2E_SLOT=1')).toBe(false);
    });

    it('selects a serial run that has not bound the port yet, wrappers included', function () {
      const procs = [
        { pid: 101, uid: UID, args: MAC_YARN.args, cwd: '/w/repo', env: SERIAL_ENV },
        { pid: 102, uid: UID, args: MAC_BASH.args, cwd: '/w/repo', env: SERIAL_ENV },
        { pid: 103, uid: UID, args: MAC_JET.args, cwd: '/w/repo/tests-macos', env: SERIAL_ENV },
      ];
      expect(select(procs)).toEqual([101, 102, 103]);
    });

    it("skips this checkout's slotted runs, other worktrees, other users and non-runs", function () {
      const procs = [
        { pid: 201, uid: UID, args: MAC_YARN.args, cwd: '/w/repo', env: SLOT_ENV },
        { pid: 202, uid: UID, args: MAC_JET.args, cwd: '/w/repo/tests-macos', env: SLOT_ENV },
        { pid: 301, uid: UID, args: MAC_YARN.args, cwd: '/w/repo2', env: SERIAL_ENV },
        { pid: 302, uid: UID, args: MAC_JET.args, cwd: '/w/other/tests-macos', env: SERIAL_ENV },
        { pid: 401, uid: 0, args: MAC_YARN.args, cwd: '/w/repo', env: SERIAL_ENV },
        { pid: 501, uid: UID, args: 'node jet --target=android', cwd: '/w/repo', env: SERIAL_ENV },
      ];
      expect(select(procs)).toEqual([]);
    });

    it('fails closed when cwd or environment cannot be read', function () {
      const procs = [
        { pid: 101, uid: UID, args: MAC_YARN.args, cwd: null, env: SERIAL_ENV },
        { pid: 102, uid: UID, args: MAC_YARN.args, cwd: '/w/repo', env: null },
      ];
      expect(select(procs)).toEqual([]);
      expect(select(procs, { uid: undefined })).toEqual([]);
    });

    it('never returns this process or its ancestors', function () {
      const procs = [
        { pid: 100, uid: UID, args: MAC_YARN.args, cwd: '/w/repo', env: SERIAL_ENV },
        { pid: 400, uid: UID, args: MAC_JET.args, cwd: '/w/repo', env: SERIAL_ENV },
      ];
      const processInfo = tree({ 400: { ppid: 100, args: MAC_JET.args }, 100: SHELL });
      expect(select(procs, { processInfo })).toEqual([]);
    });
  });

  describe('with real processes', function () {
    const TIMEOUT_MS = 5000;
    const pidsToReap = [];
    const tmpDirs = [];
    const realProcesses = process.platform !== 'win32' && psProcessInfo(process.pid) !== null;
    const itReal = realProcesses ? it : it.skip;
    const itDarwin = realProcesses && process.platform === 'darwin' ? it : it.skip;

    const LISTEN =
      "const s=require('net').createServer().listen(0,'127.0.0.1'," +
      "()=>process.stdout.write(process.pid+' '+s.address().port+'\\n'));";
    // A yarn-like wrapper whose child is the Jet-like listener (a real wrapper + Jet pair).
    const WRAPPER =
      `require('child_process').spawn(process.execPath,['-e',${JSON.stringify(LISTEN)},` +
      "'jet --target=macos --coverage'],{stdio:'inherit'});setInterval(()=>{},1000);";
    const IDLE = 'setInterval(()=>{},1000);';

    function spawnNode(script, label, opts = {}) {
      const child = spawn(process.execPath, ['-e', script, label], {
        stdio: ['ignore', 'pipe', 'ignore'],
        ...opts,
      });
      pidsToReap.push(child.pid);
      return child;
    }

    function firstLine(child) {
      return new Promise((resolve, reject) => {
        let buf = '';
        const timer = setTimeout(() => reject(new Error('no output in time')), TIMEOUT_MS);
        child.stdout.on('data', d => {
          buf += d;
          if (buf.includes('\n')) {
            clearTimeout(timer);
            resolve(buf.split('\n')[0].trim());
          }
        });
        child.once('exit', () => {
          clearTimeout(timer);
          reject(new Error('exited before output'));
        });
      });
    }

    async function startPair(label) {
      const wrapper = spawnNode(WRAPPER, label);
      const [jetPid, port] = (await firstLine(wrapper)).split(' ').map(Number);
      pidsToReap.push(jetPid);
      return { wrapperPid: wrapper.pid, jetPid, port };
    }

    function alive(pid) {
      try {
        process.kill(pid, 0);
        return true;
      } catch (_) {
        return false;
      }
    }

    async function pollUntil(check) {
      const deadline = Date.now() + TIMEOUT_MS;
      for (;;) {
        const value = check();
        if (value || Date.now() >= deadline) {
          return value;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // null when lsof cannot answer on this host; otherwise true once it reports pid on port.
    function lsofSees(port, pid) {
      return pollUntil(() => {
        const pids = lsofListenPidsOrNull(port);
        return pids === null ? null : pids.includes(String(pid));
      });
    }

    function visible(pid, label) {
      return pollUntil(() => (psProcessInfo(pid)?.args || '').includes(label));
    }

    afterEach(function () {
      for (const pid of pidsToReap.splice(0)) {
        try {
          process.kill(pid, 'SIGKILL');
        } catch (_) {
          // gone
        }
      }
      for (const dir of tmpDirs.splice(0)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });

    itReal(
      "stops the wrapper and Jet listening on this run's port; another slot's pair survives",
      async function () {
        const own = await startPair('yarn tests:macos:test-cover');
        const decoy = await startPair('yarn tests:macos:test-cover');
        const seen = await lsofSees(own.port, own.jetPid);

        const pids = macosRunPidsOnPorts([own.port]);
        expect(pids).not.toContain(decoy.jetPid);
        expect(pids).not.toContain(decoy.wrapperPid);
        expect(pids).not.toContain(process.pid);
        if (seen === null) {
          // Without lsof the selection is empty, never wider.
          expect(pids).toEqual([]);
          return;
        }
        expect(seen).toBe(true);
        expect(pids.sort()).toEqual([own.wrapperPid, own.jetPid].sort());

        for (const pid of pids) {
          process.kill(pid, 'SIGTERM');
        }
        expect(await pollUntil(() => !alive(own.jetPid) && !alive(own.wrapperPid))).toBe(true);
        expect(alive(decoy.jetPid)).toBe(true);
        expect(alive(decoy.wrapperPid)).toBe(true);
        expect(await lsofSees(decoy.port, decoy.jetPid)).toBe(true);
      },
      30000,
    );

    itDarwin(
      'selects only the unslotted run in this checkout before it binds a port',
      async function () {
        const mk = () => {
          const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-macos-owner-')));
          tmpDirs.push(dir);
          fs.mkdirSync(path.join(dir, 'tests-macos'));
          return dir;
        };
        const repo = mk();
        const otherWorktree = mk();
        const serialEnv = Object.fromEntries(
          Object.entries(process.env).filter(([k]) => !SLOT_ENV_PATTERN.test(` ${k}=`)),
        );
        const label = 'yarn tests:macos:test-cover';

        const serial = spawnNode(IDLE, label, {
          cwd: path.join(repo, 'tests-macos'),
          env: serialEnv,
        });
        const slotted = spawnNode(IDLE, label, {
          cwd: repo,
          env: { ...serialEnv, RNFB_E2E_SLOT: '2', RNFB_MACOS_JET_PORT: '14210' },
        });
        const elsewhere = spawnNode(IDLE, label, { cwd: otherWorktree, env: serialEnv });
        for (const child of [serial, slotted, elsewhere]) {
          expect(await visible(child.pid, label)).toBe(true);
        }

        expect(macosSerialRunPidsInRepo(repo)).toEqual([serial.pid]);
        expect(macosSerialRunPidsInRepo(otherWorktree)).toEqual([elsewhere.pid]);
      },
      30000,
    );
  });
});

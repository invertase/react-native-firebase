const { execFileSync, spawn, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const runRecord = require(path.join(repoRoot, 'tests/e2e/runRecord'));
jest.setTimeout(30000);
const recordLib = path.join(repoRoot, 'scripts/e2e/lib/e2e-run-record.sh');
const releaseScript = path.join(repoRoot, 'scripts/e2e/release-e2e-resources.sh');

function cleanEnv(extra) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (
      key.startsWith('RNFB_') ||
      key.startsWith('E2E_') ||
      key.startsWith('JET_') ||
      key === 'RCT_METRO_PORT'
    ) {
      delete env[key];
    }
  }
  return { ...env, ...extra };
}

function writeExecutable(file, body) {
  fs.writeFileSync(file, body);
  fs.chmodSync(file, 0o755);
}

/** Fake bin dir: check passes, sleep is instant, lsof reports $RNFB_FAKE_LSOF. */
function fakeReleaseBin(dir) {
  writeExecutable(
    path.join(dir, 'bash'),
    `#!/bin/bash
if [[ "$1" == *"/check-e2e-resources.sh" ]]; then
  exit 0
fi
exec /bin/bash "$@"
`,
  );
  writeExecutable(path.join(dir, 'sleep'), '#!/bin/bash\nexit 0\n');
  writeExecutable(
    path.join(dir, 'lsof'),
    `#!/bin/bash
if [[ "$*" == "-nP -iTCP -sTCP:LISTEN" && -f "$RNFB_FAKE_LSOF" ]]; then
  cat "$RNFB_FAKE_LSOF"
  exit 0
fi
[[ "$1" == "-a" ]] && exec ${realBin('lsof')} "$@"
exit 1
`,
  );
}

function startSleeper() {
  const child = spawn('/bin/sleep', ['60'], { stdio: 'ignore' });
  const exited = new Promise(resolve => child.once('exit', (_code, signal) => resolve(signal)));
  return { child, exited };
}

function settle(promise, ms) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve('running'), ms).unref()),
  ]);
}

/** Long-lived process whose args carry a device token needle (qemu @AVD / launchd_sim UDID). */
function startTokenProcess(...tokenArgs) {
  const child = spawn(
    process.execPath,
    ['-e', 'setTimeout(() => {}, 60000)', ...tokenArgs, HOST_MARK],
    { stdio: 'ignore' },
  );
  const exited = new Promise(resolve => child.once('exit', (_code, signal) => resolve(signal)));
  return { child, exited };
}

function startTokenProcessIn(cwd, ...tokenArgs) {
  const child = spawn(
    process.execPath,
    ['-e', 'setTimeout(() => {}, 60000)', ...tokenArgs, HOST_MARK],
    { stdio: 'ignore', cwd },
  );
  const exited = new Promise(resolve => child.once('exit', (_code, signal) => resolve(signal)));
  return { child, exited };
}

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitGone(pid, ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (!pidAlive(pid)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  return !pidAlive(pid);
}

/**
 * Start argv in the background of a throwaway shell so it is reparented away from this
 * Jest worker: ownership must then come from the run record alone.
 */
function startDetached(argv, cwd = os.tmpdir()) {
  const marked = argv[0] === process.execPath ? [...argv, HOST_MARK] : argv;
  const out = execFileSync(
    '/bin/sh',
    ['-c', '"$@" >/dev/null 2>&1 </dev/null & echo $!', 'sh', ...marked],
    {
      encoding: 'utf8',
      cwd,
    },
  );
  return Number(out.trim());
}

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (_) {
    return false;
  }
}

function killQuietly(pid) {
  try {
    process.kill(pid, 'SIGKILL');
  } catch (_) {
    // already gone
  }
}

async function waitFor(predicate, ms = 5000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (predicate()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return predicate();
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = require('net').createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function realBin(name) {
  return execFileSync('/bin/sh', ['-c', `command -v ${name}`], { encoding: 'utf8' }).trim();
}

/*
 * Host device discovery sees only the fake devices this run started (they carry
 * HOST_MARK): a real emulator or simulator, or another run of this suite (same fake
 * names, same cwd), must not change results. ps (every form), pgrep and pkill hide
 * unmarked qemu-system and launchd_sim processes; adb and simctl list no devices. pkill
 * accepts only -f, -<signal number> and -<SIGNAME>, and exits 2 on anything else. Tests
 * that need other answers put their own adb / xcrun earlier on PATH.
 */
const HOST_MARK = `rnfb-run-record-test=${process.pid}-${Date.now()}`;
const hostStubDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-run-record-host-'));
const hostPath = process.env.PATH;
const hostPs = realBin('ps');
const deviceFilter = `re='qemu-system|launchd_sim'
foreign_device() { [[ "$1" =~ $re && "$1" != *${JSON.stringify(HOST_MARK)}* ]]; }`;
writeExecutable(
  path.join(hostStubDir, 'ps'),
  `#!/bin/bash
# awk is much faster than a bash [[ =~ ]] per line; under yarn test:full the slow
# filter previously made listProcesses hit execFileSync's timeout and return [].
mark=${JSON.stringify(HOST_MARK)}
${realBin('ps')} "$@" | awk -v mark="$mark" '
  /qemu-system|launchd_sim/ && index(\$0, mark) == 0 { next }
  { print }
'
exit "\${PIPESTATUS[0]}"
`,
);
writeExecutable(
  path.join(hostStubDir, 'pgrep'),
  `#!/bin/bash
${deviceFilter}
out="$(${realBin('pgrep')} "$@")" || exit
kept=1
while IFS= read -r line; do
  [[ -n "$line" ]] || continue
  foreign_device "$(${realBin('ps')} -p "\${line%% *}" -o args= 2>/dev/null)" && continue
  printf '%s\\n' "$line"
  kept=0
done <<<"$out"
exit "$kept"
`,
);
writeExecutable(
  path.join(hostStubDir, 'pkill'),
  `#!/bin/bash
unsupported() {
  echo "pkill test stub: unsupported argument '$1' (only -f, -<signal number>, -<SIGNAME>)" >&2
  exit 2
}
sig=TERM
full=
patterns=()
for a in "$@"; do
  case "$a" in
    -f) full=-f ;;
    -*)
      name="\${a#-}"
      name="\${name#SIG}"
      [[ "$name" =~ ^([0-9]+|[A-Z][A-Z0-9]*)$ ]] && kill -l "$name" >/dev/null 2>&1 || unsupported "$a"
      sig="$name"
      ;;
    *) patterns+=("$a") ;;
  esac
done
[[ \${#patterns[@]} -eq 1 ]] || unsupported "\${patterns[*]:-<no pattern>}"
pids="$(${JSON.stringify(path.join(hostStubDir, 'pgrep'))} $full "\${patterns[0]}")" || exit 1
kill -s "$sig" $pids
`,
);
writeExecutable(
  path.join(hostStubDir, 'adb'),
  `#!/bin/bash\n[[ "$1" == devices ]] && printf 'List of devices attached\\n\\n' && exit 0\nexit 1\n`,
);
writeExecutable(
  path.join(hostStubDir, 'xcrun'),
  `#!/bin/bash\n[[ "$*" == *-j* ]] && printf '{"devices":{}}\\n'\nexit 0\n`,
);
process.env.PATH = `${hostStubDir}:${hostPath}`;

afterAll(function () {
  process.env.PATH = hostPath;
  fs.rmSync(hostStubDir, { recursive: true, force: true });
});

describe('e2e run record (shell)', function () {
  let dir;

  beforeEach(function () {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-run-record-'));
  });

  afterEach(function () {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  function runLib(script, extraEnv = {}) {
    return execFileSync('/bin/bash', ['-c', `source "${recordLib}"\n${script}`], {
      encoding: 'utf8',
      env: cleanEnv({ RNFB_E2E_RUN_RECORD_DIR: dir, ...extraEnv }),
    });
  }

  it('keys the record by slot identity or serial', function () {
    expect(runLib('e2e_run_record_dir', { RNFB_E2E_SLOT: '3' }).trim()).toBe(
      path.join(dir, 'slot-3'),
    );
    expect(runLib('e2e_run_record_dir', { E2E_SLOT_OVERRIDE: '2' }).trim()).toBe(
      path.join(dir, 'slot-2'),
    );
    expect(runLib('e2e_run_record_dir').trim()).toBe(path.join(dir, 'serial'));
  });

  it('owns descendants of a recorded pid and nothing else', function () {
    const out = runLib(`
/bin/sleep 30 & child=$!
e2e_run_record_pid $$ root
e2e_run_record_load
e2e_pid_owned "$child" && echo CHILD_OWNED
e2e_pid_owned 1 || echo INIT_NOT_OWNED
kill "$child"
`);
    expect(out).toMatch(/CHILD_OWNED/);
    expect(out).toMatch(/INIT_NOT_OWNED/);
  });

  it('drops pid entries whose start time no longer matches (pid reuse)', function () {
    const out = runLib(`
e2e_run_record_put "pid-$$" pid "$$" "Thu Jan  1 00:00:00 1970" stale
e2e_run_record_load
e2e_pid_owned $$ || echo STALE_NOT_OWNED
[[ -e "$(e2e_run_record_dir)/pid-$$" ]] || echo STALE_DROPPED
`);
    expect(out).toMatch(/STALE_NOT_OWNED/);
    expect(out).toMatch(/STALE_DROPPED/);
  });

  it('names pid entries per process instance so a reused pid never overwrites or drops another', function () {
    const out = runLib(`
e2e_run_record_pid $$ root
ls "$(e2e_run_record_dir)"
`);
    expect(out.trim()).toMatch(new RegExp(`^pid-${'\\d+'}-[A-Za-z0-9_]+$`));
  });

  it('keeps a device entry only while its recorded instance is alive', async function () {
    const token = startTokenProcess('qemu-system-fake', '@TestingAVD-2', '-port', '5560');
    try {
      const start = runRecord.processStartTime(token.child.pid);
      const out = runLib(`
e2e_run_record_put android-emulator-5560 android emulator-5560 TestingAVD-2 ${token.child.pid} "${start}"
e2e_run_record_put android-emulator-5562 android emulator-5562 TestingAVD-3 ${token.child.pid} "${start}"
e2e_run_record_put android-emulator-5554 android emulator-5554 TestingAVD ${token.child.pid} "${start}"
e2e_run_record_load
e2e_run_record_device_owned android emulator-5560 && echo LIVE_OWNED
e2e_run_record_device_owned android emulator-5562 || echo WRONG_AVD_NOT_OWNED
e2e_run_record_device_owned android emulator-5554 || echo PREFIX_AVD_NOT_OWNED
ls "$(e2e_run_record_dir)"
`);
      expect(out).toMatch(/LIVE_OWNED/);
      // Same qemu pid but another AVD in its args: not that instance.
      expect(out).toMatch(/WRONG_AVD_NOT_OWNED/);
      // Serial TestingAVD must not match a qemu for @TestingAVD-2 (complete-name match).
      expect(out).toMatch(/PREFIX_AVD_NOT_OWNED/);
      expect(out).toMatch(/android-emulator-5560/);
      expect(out).not.toMatch(/android-emulator-5562/);
      expect(out).not.toMatch(/android-emulator-5554/);
    } finally {
      token.child.kill('SIGKILL');
      await token.exited;
    }
    const after = runLib(`e2e_run_record_load; ls "$(e2e_run_record_dir)"`);
    expect(after).not.toMatch(/android-emulator-5560/);
  });
});

describe('release-e2e-resources.sh scope', function () {
  let dir;
  const sleepers = [];

  beforeEach(function () {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-release-scope-'));
    fakeReleaseBin(dir);
  });

  afterEach(function () {
    for (const { child } of sleepers.splice(0)) {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill('SIGKILL');
      }
    }
    fs.rmSync(dir, { recursive: true, force: true });
  });

  function release(args, extraEnv = {}) {
    return execFileSync('/bin/bash', [releaseScript, ...args], {
      encoding: 'utf8',
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: cleanEnv({
        PATH: `${dir}:${process.env.PATH}`,
        RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec'),
        RNFB_FAKE_LSOF: path.join(dir, 'lsof.out'),
        ...extraEnv,
      }),
    });
  }

  it('kills only the recorded listener on a slot port and leaves an unrecorded one', async function () {
    const ours = startSleeper();
    const theirs = startSleeper();
    sleepers.push(ours, theirs);
    // slot-1 android: jet :13010, jet-control :13011
    fs.writeFileSync(
      path.join(dir, 'lsof.out'),
      [
        'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME',
        `node ${ours.child.pid} me 20u IPv4 0x1 0t0 TCP 127.0.0.1:13010 (LISTEN)`,
        `node ${theirs.child.pid} me 21u IPv4 0x2 0t0 TCP 127.0.0.1:13011 (LISTEN)`,
        '',
      ].join('\n'),
    );
    runRecord.recordPid(ours.child.pid, 'jet:13010', {
      RNFB_E2E_SLOT: '1',
      RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec'),
    });

    const out = release(['--platform=android', '--slot=1', '--only=jet']);

    expect(out).toMatch(/identity: slot-1 .*scope=recorded only/);
    expect(out).toMatch(new RegExp(`SIGTERM :13010 pids=${ours.child.pid}\\b`));
    expect(out).not.toMatch(new RegExp(`pids=.*\\b${theirs.child.pid}\\b`));
    expect(await settle(ours.exited, 2000)).toBe('SIGTERM');
    expect(await settle(theirs.exited, 200)).toBe('running');
  });

  it('macOS Jet records itself, so the default release frees its ports after an interrupted run', async function () {
    // Stands in for `npx jet --target=macos` (cwd tests-macos): Jet loads .jetrc.js in the
    // process that listens on the Jet and control ports.
    const jetrcPath = path.join(repoRoot, 'tests-macos/.jetrc.js');
    const child = spawn(
      process.execPath,
      [
        '-e',
        `require(${JSON.stringify(jetrcPath)}).recordJetProcess(13210); console.log('ready'); setTimeout(() => {}, 60000)`,
      ],
      {
        cwd: path.join(repoRoot, 'tests-macos'),
        stdio: ['ignore', 'pipe', 'ignore'],
        env: cleanEnv({ RNFB_E2E_SLOT: '1', RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec') }),
      },
    );
    const exited = new Promise(resolve => child.once('exit', (_code, signal) => resolve(signal)));
    sleepers.push({ child, exited });
    await new Promise(resolve => child.stdout.once('data', resolve));
    // slot-1 macos: jet :13210, jet-control :13211
    fs.writeFileSync(
      path.join(dir, 'lsof.out'),
      [
        'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME',
        `node ${child.pid} me 20u IPv4 0x1 0t0 TCP 127.0.0.1:13210 (LISTEN)`,
        `node ${child.pid} me 21u IPv4 0x2 0t0 TCP 127.0.0.1:13211 (LISTEN)`,
        '',
      ].join('\n'),
    );
    expect(
      fs.readdirSync(path.join(dir, 'rec', 'slot-1')).filter(n => n.startsWith('pid-')),
    ).toHaveLength(1);

    const out = release(['--platform=macos', '--slot=1', '--only=jet']);

    expect(out).toMatch(/scope=recorded only/);
    expect(out).toMatch(new RegExp(`SIGTERM :13210 pids=${child.pid}\\b`));
    expect(await settle(exited, 2000)).toBe('SIGTERM');
  });

  it('macOS .jetrc before() records the Jet process before it waits for Metro or spawns the app', function () {
    const src = fs.readFileSync(path.join(repoRoot, 'tests-macos/.jetrc.js'), 'utf8');
    const before = src.slice(src.indexOf('async before(config)'), src.indexOf('async after('));
    const at = needle => {
      const i = before.indexOf(needle);
      expect(i).toBeGreaterThanOrEqual(0);
      return i;
    };
    expect(src).toMatch(/recordPid\(process\.pid, `jet:\$\{jetPort\}`\)/);
    expect(at('recordJetProcess(jetPort);')).toBeGreaterThan(at('throw foreignHolderError('));
    expect(at('recordJetProcess(jetPort);')).toBeLessThan(at('await waitForMetroMacosBundle('));
    expect(at('recordJetProcess(jetPort);')).toBeLessThan(at('spawn(macBinary'));
  });

  it('release names an unrecorded holder from this checkout without asserting why it is unrecorded', function () {
    const pid = startDetached(['/bin/sleep', '60'], repoRoot);
    try {
      fs.writeFileSync(
        path.join(dir, 'lsof.out'),
        `sleep ${pid} me 21u IPv4 0x2 0t0 TCP 127.0.0.1:13210 (LISTEN)\n`,
      );
      const { stderr } = runRelease(['--platform=macos', '--slot=1', '--only=jet']);
      expect(stderr).toMatch(
        new RegExp(
          `:13210 pid=${pid} .*owner=this-checkout-unrecorded — not recorded by this checkout's runs, left running: it runs from this checkout but no run recorded it \\(for example started outside yarn tests:\\*, before the run record existed, or by a step that does not record what it starts\\)`,
        ),
      );
      expect(alive(pid)).toBe(true);
    } finally {
      killQuietly(pid);
    }
  });

  it('kills unrecorded listeners only with the manual --include-unrecorded flag', async function () {
    const theirs = startSleeper();
    sleepers.push(theirs);
    fs.writeFileSync(
      path.join(dir, 'lsof.out'),
      `node ${theirs.child.pid} me 21u IPv4 0x2 0t0 TCP 127.0.0.1:13011 (LISTEN)\n`,
    );

    release(['--platform=android', '--slot=1', '--only=jet']);
    expect(await settle(theirs.exited, 200)).toBe('running');

    const out = release(['--platform=android', '--slot=1', '--only=jet', '--include-unrecorded']);
    expect(out).toMatch(/scope=include-unrecorded \(manual\)/);
    expect(await settle(theirs.exited, 2000)).toBe('SIGTERM');
  });

  it('never stops the adb server or stray emulators unless --all-slots is passed', async function () {
    const log = path.join(dir, 'actions.log');
    writeExecutable(
      path.join(dir, 'adb'),
      `#!/bin/bash
printf 'adb %s\\n' "$*" >> "${log}"
if [[ "$1" == "devices" ]]; then
  printf 'List of devices attached\\nemulator-16222\\tdevice\\n'
fi
if [[ "$*" == "-s emulator-5558 emu avd name" ]]; then
  printf '%s\\r\\nOK\\r\\n' "\${RNFB_FAKE_AVD_NAME:-TestingAVD-1}"
fi
exit 0
`,
    );
    writeExecutable(
      path.join(dir, 'pkill'),
      `#!/bin/bash\nprintf 'pkill %s\\n' "$*" >> "${log}"\nexit 0\n`,
    );

    release(['--platform=android', '--slot=1', '--devices', '--only=android-emulator']);
    const scoped = fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '';
    expect(scoped).not.toMatch(/emu kill/);
    expect(scoped).not.toMatch(/kill-server/);
    expect(scoped).not.toMatch(/^pkill /m);

    const slotRecord = path.join(dir, 'rec', 'slot-1');
    const entry = path.join(slotRecord, 'android-emulator-5558');
    fs.mkdirSync(slotRecord, { recursive: true });

    // Recorded instance gone (another owner rebooted TestingAVD-1): nothing is stopped.
    fs.writeFileSync(
      entry,
      'android\temulator-5558\tTestingAVD-1\t999999\tThu Jan  1 00:00:00 1970\n',
    );
    release(['--platform=android', '--slot=1', '--devices', '--only=android-emulator']);
    const stale = fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '';
    expect(stale).not.toMatch(/emu kill/);
    expect(stale).not.toMatch(/^pkill /m);
    expect(fs.existsSync(entry)).toBe(false);

    const qemu = startTokenProcess('qemu-system-fake', '@TestingAVD-1', '-port', '5558');
    sleepers.push(qemu);
    fs.writeFileSync(
      entry,
      `android\temulator-5558\tTestingAVD-1\t${qemu.child.pid}\t${runRecord.processStartTime(qemu.child.pid)}\n`,
    );
    release(['--platform=android', '--slot=1', '--devices', '--only=android-emulator']);
    const recorded = fs.readFileSync(log, 'utf8');
    expect(recorded).toMatch(/adb -s emulator-5558 emu kill/);
    // Only that qemu pid is signalled — never a pkill by AVD name.
    expect(recorded).not.toMatch(/^pkill /m);
    expect(recorded).not.toMatch(/emulator-16222 emu kill/);
    expect(await settle(qemu.exited, 2000)).toBe('SIGTERM');

    // The recorded serial's console answers with another AVD (fallback serial): no emu
    // kill on it, only the recorded qemu pid is signalled.
    fs.rmSync(log);
    const qemu2 = startTokenProcess('qemu-system-fake', '@TestingAVD-1', '-port', '5558');
    sleepers.push(qemu2);
    fs.writeFileSync(
      entry,
      `android\temulator-5558\tTestingAVD-1\t${qemu2.child.pid}\t${runRecord.processStartTime(qemu2.child.pid)}\n`,
    );
    release(['--platform=android', '--slot=1', '--devices', '--only=android-emulator'], {
      RNFB_FAKE_AVD_NAME: 'SomeoneElsesAVD',
    });
    const mismatched = fs.readFileSync(log, 'utf8');
    expect(mismatched).toMatch(/adb -s emulator-5558 emu avd name/);
    expect(mismatched).not.toMatch(/emu kill/);
    expect(await settle(qemu2.exited, 2000)).toBe('SIGTERM');

    fs.rmSync(log);
    release(['--platform=android', '--all-slots', '--devices', '--only=android-emulator']);
    const wiped = fs.readFileSync(log, 'utf8');
    expect(wiped).toMatch(/adb -s emulator-16222 emu kill/);
    expect(wiped).not.toMatch(/kill-server/);
  });

  it('default --devices also stops an emulator a recorded process spawned', async function () {
    const log = path.join(dir, 'actions.log');
    writeExecutable(
      path.join(dir, 'adb'),
      `#!/bin/bash
printf 'adb %s\\n' "$*" >> "${log}"
[[ "$*" == "-s emulator-16224 emu avd name" ]] && printf 'TestingAVD-1\\r\\nOK\\r\\n'
exit 0
`,
    );
    const childPidFile = path.join(dir, 'child.pid');
    const qemuArgs = JSON.stringify([
      '-e',
      'setTimeout(() => {}, 60000)',
      'qemu-system-fake',
      '@TestingAVD-1',
      '-port',
      '16224',
      HOST_MARK,
    ]);
    const parent = spawn(
      process.execPath,
      [
        '-e',
        `const c = require('child_process').spawn(process.execPath, ${qemuArgs}, { stdio: 'ignore' });
require('fs').writeFileSync(${JSON.stringify(childPidFile)}, String(c.pid));
setTimeout(() => {}, 60000);`,
      ],
      { stdio: 'ignore', cwd: os.tmpdir() },
    );
    const parentExited = new Promise(resolve => parent.once('exit', resolve));
    let qemuPid;
    try {
      const end = Date.now() + 5000;
      while (!fs.existsSync(childPidFile) && Date.now() < end) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      qemuPid = Number(fs.readFileSync(childPidFile, 'utf8'));

      release(['--platform=android', '--slot=1', '--devices', '--only=android-emulator']);
      expect(pidAlive(qemuPid)).toBe(true);

      runRecord.recordPid(parent.pid, 'jet:13010', {
        RNFB_E2E_SLOT: '1',
        RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec'),
      });
      const out = release([
        '--platform=android',
        '--slot=1',
        '--devices',
        '--only=android-emulator',
      ]);
      expect(out).toMatch(
        new RegExp(
          `stop serial=emulator-16224 avd=TestingAVD-1 qemu=${qemuPid} \\(child of a recorded process\\)`,
        ),
      );
      expect(fs.readFileSync(log, 'utf8')).toMatch(/adb -s emulator-16224 emu kill/);
      expect(await waitGone(qemuPid, 3000)).toBe(true);
    } finally {
      if (qemuPid && pidAlive(qemuPid)) {
        process.kill(qemuPid, 'SIGKILL');
      }
      parent.kill('SIGKILL');
      await parentExited;
    }
  });

  it('--include-unrecorded --devices stops only this checkout’s unrecorded emulator on the identity’s AVD', async function () {
    writeExecutable(path.join(dir, 'adb'), '#!/bin/bash\nexit 0\n');
    const own = startTokenProcessIn(
      repoRoot,
      'qemu-system-fake',
      '@TestingAVD-1',
      '-port',
      '16226',
    );
    const foreign = startTokenProcessIn(
      os.tmpdir(),
      'qemu-system-fake',
      '@TestingAVD-1',
      '-port',
      '16228',
    );
    const otherIdentity = startTokenProcessIn(
      repoRoot,
      'qemu-system-fake',
      '@TestingAVD-2',
      '-port',
      '16230',
    );
    sleepers.push(own, foreign, otherIdentity);
    const run = args =>
      spawnSync('/bin/bash', [releaseScript, ...args], {
        encoding: 'utf8',
        cwd: repoRoot,
        env: cleanEnv({
          PATH: `${dir}:${process.env.PATH}`,
          RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec'),
          RNFB_FAKE_LSOF: path.join(dir, 'lsof.out'),
        }),
      });
    const scoped = ['--platform=android', '--slot=1', '--devices', '--only=android-emulator'];

    run(scoped);
    expect(await settle(own.exited, 300)).toBe('running');

    const manual = run([...scoped, '--include-unrecorded']);
    expect(manual.stdout).toMatch(
      new RegExp(`qemu=${own.child.pid} \\(owner=this-checkout-unrecorded\\)`),
    );
    expect(await settle(own.exited, 2000)).toBe('SIGTERM');
    expect(manual.stderr).toMatch(
      new RegExp(
        `serial=emulator-16228 avd=TestingAVD-1 .*owner=unrecorded — not this checkout's, left running`,
      ),
    );
    expect(await settle(foreign.exited, 300)).toBe('running');
    expect(manual.stdout).not.toMatch(/16230/);
    expect(await settle(otherIdentity.exited, 300)).toBe('running');
  });

  function runRelease(args, extraEnv = {}) {
    return spawnSync('/bin/bash', [releaseScript, ...args], {
      encoding: 'utf8',
      cwd: repoRoot,
      env: cleanEnv({
        PATH: `${dir}:${process.env.PATH}`,
        RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec'),
        RNFB_FAKE_LSOF: path.join(dir, 'lsof.out'),
        ...extraEnv,
      }),
    });
  }

  describe('harness device reboot (launchApp-retry cold boot)', function () {
    const { bootAndRecord } = require(path.join(repoRoot, 'tests/e2e/deviceBoot'));
    const slotEnv = () => ({
      RNFB_E2E_SLOT: '1',
      RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec'),
    });
    const scoped = ['--platform=android', '--slot=1', '--devices', '--only=android-emulator'];
    const testsDir = path.join(repoRoot, 'tests');
    const started = [];

    afterEach(function () {
      for (const pid of started.splice(0)) {
        if (pidAlive(pid)) {
          process.kill(pid, 'SIGKILL');
        }
      }
    });

    // Stands in for coldBootAndroidEmulator: the old qemu is gone and a new one is spawned
    // by the (unrecorded) Detox worker from tests/, then reparented once that worker exits.
    function coldBoot(port, cwd = testsDir) {
      const pid = startDetached(
        [
          process.execPath,
          '-e',
          'setTimeout(() => {}, 60000)',
          'qemu-system-fake',
          '@TestingAVD-1',
          '-port',
          port,
        ],
        cwd,
      );
      started.push(pid);
      return pid;
    }

    // As the harness wrapper does: the cold boot spawned `-port <port>` itself.
    function recordColdBoot(port) {
      return runRecord.recordAndroidDevice(`emulator-${port}`, 'TestingAVD-1', slotEnv(), {
        requireSerial: true,
      });
    }

    function check() {
      return spawnSync(
        '/bin/bash',
        [
          path.join(repoRoot, 'scripts/e2e/check-e2e-resources.sh'),
          '--platform=android',
          '--slot=1',
        ],
        {
          encoding: 'utf8',
          cwd: repoRoot,
          env: cleanEnv({
            PATH: `${dir}:${process.env.PATH}`,
            RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec'),
            RNFB_FAKE_LSOF: path.join(dir, 'lsof.out'),
            // As export-slot-env android 1 pins them.
            ANDROID_SERIAL: 'emulator-5558',
            RNFB_ANDROID_CONSOLE_PORT: '5558',
            RNFB_ANDROID_AVD: 'TestingAVD-1',
          }),
        },
      );
    }

    beforeEach(function () {
      writeExecutable(path.join(dir, 'adb'), '#!/bin/bash\nexit 0\n');
    });

    it('without a re-record, release --devices leaves the new emulator running but names it', async function () {
      const qemuPid = coldBoot('16250');
      const out = runRelease(scoped);
      expect(out.stderr).toMatch(
        new RegExp(
          `serial=emulator-16250 avd=TestingAVD-1 .*owner=this-checkout-unrecorded — runs from this checkout but no run recorded it, left running.*--include-unrecorded --devices --only android-emulator --slot=1`,
        ),
      );
      expect(await waitGone(qemuPid, 300)).toBe(false);
    });

    it('bootAndRecord re-records the cold-booted instance, so release --devices stops it', async function () {
      let qemuPid;
      await bootAndRecord(
        async () => {
          qemuPid = coldBoot('16252');
        },
        () => expect(recordColdBoot('16252')).toBe('emulator-16252'),
      );
      expect(fs.readdirSync(path.join(dir, 'rec', 'slot-1'))).toContain('android-emulator-16252');
      const out = runRelease(scoped);
      expect(out.stdout).toMatch(
        new RegExp(
          `stop serial=emulator-16252 avd=TestingAVD-1 qemu=${qemuPid} \\(recorded instance\\)`,
        ),
      );
      expect(await waitGone(qemuPid, 3000)).toBe(true);
    });

    it('bootAndRecord records even when the boot throws after the new instance is up', async function () {
      let qemuPid;
      await expect(
        bootAndRecord(
          async () => {
            qemuPid = coldBoot('16254');
            throw new Error('cold-boot spawn did not register');
          },
          () => recordColdBoot('16254'),
        ),
      ).rejects.toThrow('did not register');
      expect(fs.readdirSync(path.join(dir, 'rec', 'slot-1'))).toContain('android-emulator-16254');
      runRelease(scoped);
      expect(await waitGone(qemuPid, 3000)).toBe(true);
    });

    it('check names an unrecorded emulator on the identity AVD at its allocated serial', function () {
      const qemuPid = coldBoot('5558');
      const result = check();
      expect(result.stdout).toMatch(
        new RegExp(
          `INFO\\s+android emulator emulator-5558 avd=TestingAVD-1 qemu pid=${qemuPid} cwd=${testsDir} owner=this-checkout-unrecorded — no run recorded it, so release --devices leaves it running`,
        ),
      );
      expect(result.stdout).not.toMatch(/BUSY\s+android emulator/);
      recordColdBoot('5558');
      expect(check().stdout).not.toMatch(/android emulator emulator-5558/);
    });

    it("check is BUSY for another owner's emulator on this identity's serial, INFO with a remedy elsewhere", function () {
      const foreignCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-other-owner-'));
      try {
        const onOurs = coldBoot('5558', foreignCwd);
        const onSlot2 = coldBoot('5560', foreignCwd);
        const result = check();
        expect(result.status).toBe(1);
        expect(result.stdout).toMatch(
          new RegExp(
            `BUSY\\s+android emulator emulator-5558 avd=TestingAVD-1 qemu pid=${onOurs} cwd=${fs.realpathSync(foreignCwd)} owner=unrecorded — another owner's emulator on this identity's serial emulator-5558; release leaves it running \\(free it from its owner, or move this run to a free slot\\)`,
          ),
        );
        expect(result.stdout).toMatch(
          new RegExp(
            `INFO\\s+android emulator emulator-5560 avd=TestingAVD-1 qemu pid=${onSlot2} .*owner=unrecorded — not this checkout's; release leaves it running \\(free it from its owner, or move this run to a free slot\\)`,
          ),
        );
        expect(result.stderr).toMatch(
          /owner=unrecorded: held by another owner .*first free slot: \d+/,
        );
      } finally {
        fs.rmSync(foreignCwd, { recursive: true, force: true });
      }
    });

    it('requireSerial never adopts a lone same-AVD emulator on another serial', function () {
      coldBoot('16240');
      expect(
        runRecord.recordAndroidDevice('emulator-5558', 'TestingAVD-1', slotEnv(), {
          requireSerial: true,
        }),
      ).toBeNull();
      expect(fs.existsSync(path.join(dir, 'rec', 'slot-1'))).toBe(false);
      expect(runRecord.recordAndroidDevice('emulator-5558', 'TestingAVD-1', slotEnv())).toBe(
        'emulator-16240',
      );
    });

    it("the cold-boot stop ends only this run's emulator; another owner's same-AVD one survives", async function () {
      const { ownQemuPids, ownQemuRunning, stopQemuPids } = require(
        path.join(repoRoot, 'tests/e2e/androidColdBoot'),
      );
      const foreignCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-other-owner-'));
      try {
        const ownOnPort = coldBoot('5558');
        const ownRecorded = coldBoot('16264');
        expect(recordColdBoot('16264')).toBe('emulator-16264');
        const foreign = coldBoot('16262', foreignCwd);
        const foreignOtherAvd = startDetached(
          [
            process.execPath,
            '-e',
            'setTimeout(() => {}, 60000)',
            'qemu-system-fake',
            '@Other',
            '-port',
            '5558',
          ],
          foreignCwd,
        );
        started.push(foreignOtherAvd);

        // Another owner's same-AVD qemu on our console port (the tokens bind no socket).
        const foreignOnOurPort = coldBoot('5558', foreignCwd);

        // One process snapshot for both helpers: separate listProcesses/lsof rounds under
        // host load previously let ownQemuRunning pass while ownQemuPids saw [].
        expect(
          await waitFor(() => {
            const processes = runRecord.listProcesses();
            return (
              ownQemuRunning('5558', 'TestingAVD-1', { env: slotEnv(), processes }) &&
              ownQemuPids('5558', 'TestingAVD-1', { env: slotEnv(), processes })
                .slice()
                .sort()
                .join(',') === [ownOnPort, ownRecorded].slice().sort().join(',')
            );
          }),
        ).toBe(true);
        const processes = runRecord.listProcesses();
        const pids = ownQemuPids('5558', 'TestingAVD-1', { env: slotEnv(), processes });
        expect(pids.slice().sort()).toEqual([ownOnPort, ownRecorded].slice().sort());
        await stopQemuPids(pids, { timeoutMs: 5000, pollMs: 50 });
        expect(pidAlive(ownOnPort)).toBe(false);
        expect(pidAlive(ownRecorded)).toBe(false);
        expect(await waitGone(foreign, 300)).toBe(false);
        expect(pidAlive(foreignOtherAvd)).toBe(true);
        expect(pidAlive(foreignOnOurPort)).toBe(true);
        // Neither waited on nor re-recorded as this run's relaunch.
        expect(ownQemuRunning('5558', 'TestingAVD-1', { env: slotEnv() })).toBe(false);
        expect(ownQemuRunning('16262', 'TestingAVD-1', { env: slotEnv() })).toBe(false);
        expect(recordColdBoot('5558')).toBeNull();
        expect(fs.readdirSync(path.join(dir, 'rec', 'slot-1'))).not.toContain(
          'android-emulator-5558',
        );
      } finally {
        fs.rmSync(foreignCwd, { recursive: true, force: true });
      }
    });

    it('the cold-boot stop SIGKILLs an own qemu that ignores SIGTERM', async function () {
      const { stopQemuPids } = require(path.join(repoRoot, 'tests/e2e/androidColdBoot'));
      const stubborn = startDetached(
        [
          process.execPath,
          '-e',
          "process.on('SIGTERM', () => {}); setTimeout(() => {}, 60000)",
          'qemu-system-fake',
          '@TestingAVD-1',
          '-port',
          '5558',
        ],
        testsDir,
      );
      started.push(stubborn);
      await new Promise(resolve => setTimeout(resolve, 300));
      await stopQemuPids([stubborn], { timeoutMs: 300, killTimeoutMs: 3000, pollMs: 50 });
      expect(pidAlive(stubborn)).toBe(false);
    });

    it('every harness reboot path goes through bootAndRecord', function () {
      const src = fs.readFileSync(path.join(repoRoot, 'tests/e2e/firebase.test.js'), 'utf8');
      const body = name => {
        const start = src.search(new RegExp(`^(async )?function ${name}\\(`, 'm'));
        expect(start).toBeGreaterThanOrEqual(0);
        const end = src.indexOf('\n}\n', start);
        return src.slice(start, end);
      };
      expect(body('coldBootAndroidEmulator')).toMatch(
        /bootAndRecord\(\s*\(\) => coldBootAndroidEmulatorUnrecorded\(\),\s*\(\) => recordThisRunDevice\('android', undefined, \{ requireSerial: true \}\),?\s*\)/,
      );
      expect(body('rebootIosSimulator')).toMatch(
        /bootAndRecord\(\s*\(\) => rebootIosSimulatorUnrecorded\(testsDir\),\s*\(\) => recordThisRunDevice\('ios'\),?\s*\)/,
      );
      // The unrecorded bodies are reachable only through those wrappers.
      expect(src.match(/coldBootAndroidEmulatorUnrecorded\(/g)).toHaveLength(2);
      expect(src.match(/rebootIosSimulatorUnrecorded\(/g)).toHaveLength(2);
      expect(src.match(/coldBootAndroidEmulatorUnrecorded\b/g)).toHaveLength(2);
      expect(src.match(/rebootIosSimulatorUnrecorded\b/g)).toHaveLength(2);
      // The cold boot stops only this run's emulator: never by AVD-name pattern.
      const coldBootBody = body('coldBootAndroidEmulatorUnrecorded');
      expect(src).not.toMatch(/pkill|qemuAvdPgrepPattern/);
      expect(coldBootBody).toMatch(/ownQemuPids\(port, ANDROID_AVD_NAME\)/);
      expect(coldBootBody).toMatch(/await stopQemuPids\(ownPids\)/);
      expect(src.match(/emu kill`, \{/g)).toHaveLength(1);
      expect(coldBootBody).toMatch(
        /if \(ownOnSerial && consoleAvd === ANDROID_AVD_NAME\) \{\s*try \{\s*execSync\(`\$\{adb\} -s \$\{serial\} emu kill`/,
      );
      // Nothing else spawns an emulator or the simulator boot script.
      expect(src.match(/spawn\(emulatorPath/g)).toHaveLength(1);
      expect(body('coldBootAndroidEmulatorUnrecorded')).toMatch(/spawn\(emulatorPath/);
      expect(src.match(/boot-simulator\.sh'\)/g)).toHaveLength(1);
      expect(body('rebootIosSimulatorUnrecorded')).toMatch(/boot-simulator\.sh'\)/);
    });
  });

  it('--include-unrecorded force-stops apps on the configured serial only when its emulator traces to this checkout', async function () {
    const log = path.join(dir, 'actions.log');
    writeExecutable(
      path.join(dir, 'adb'),
      `#!/bin/bash\nprintf 'adb %s\\n' "$*" >> "${log}"\nexit 0\n`,
    );
    const args = ['--platform=android', '--only=android-apps', '--include-unrecorded'];
    const serialEnv = { ANDROID_SERIAL: 'emulator-16240' };

    const foreign = startTokenProcessIn(
      os.tmpdir(),
      'qemu-system-fake',
      '@TestingAVD',
      '-port',
      '16240',
    );
    sleepers.push(foreign);
    const skipped = runRelease(args, serialEnv);
    expect(skipped.stderr).toMatch(
      /adb force-stop skipped on emulator-16240: its emulator was not traced to this checkout \(owner=unrecorded;/,
    );
    expect(fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '').not.toMatch(/force-stop/);
    foreign.child.kill('SIGKILL');
    await foreign.exited;

    const own = startTokenProcessIn(
      repoRoot,
      'qemu-system-fake',
      '-avd',
      'TestingAVD',
      '-port',
      '16240',
    );
    sleepers.push(own);
    const stopped = runRelease(args, serialEnv);
    expect(stopped.stdout).toMatch(/adb force-stop on emulator-16240/);
    expect(fs.readFileSync(log, 'utf8')).toMatch(
      /adb -s emulator-16240 shell am force-stop com\.invertase\.testing$/m,
    );
  });

  it('--include-unrecorded --devices reads -avd like @avd and reports a qemu with no AVD', async function () {
    writeExecutable(path.join(dir, 'adb'), '#!/bin/bash\nexit 0\n');
    const avdFlag = startTokenProcessIn(
      repoRoot,
      'qemu-system-fake',
      '-avd',
      'TestingAVD-1',
      '-port',
      '16242',
    );
    const noAvd = startTokenProcessIn(repoRoot, 'qemu-system-fake', '-port', '16244');
    sleepers.push(avdFlag, noAvd);
    const out = runRelease([
      '--platform=android',
      '--slot=1',
      '--devices',
      '--only=android-emulator',
      '--include-unrecorded',
    ]);
    expect(out.stdout).toMatch(
      new RegExp(
        `serial=emulator-16242 avd=TestingAVD-1 qemu=${avdFlag.child.pid} \\(owner=this-checkout-unrecorded\\)`,
      ),
    );
    expect(await settle(avdFlag.exited, 2000)).toBe('SIGTERM');
    expect(out.stderr).toMatch(
      new RegExp(
        `qemu pid=${noAvd.child.pid} serial=emulator-16244: no @<avd> / -avd argument, cannot match it to this identity — left running`,
      ),
    );
    expect(await settle(noAvd.exited, 300)).toBe('running');
  });
});

describe('host device discovery in this suite', function () {
  let dir;
  const unmarked = [];

  beforeEach(function () {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-run-record-host-test-'));
  });

  afterEach(async function () {
    for (const p of unmarked.splice(0)) {
      p.child.kill('SIGKILL');
      await p.exited;
    }
    fs.rmSync(dir, { recursive: true, force: true });
  });

  // What another run of this suite, or a real emulator / simulator, looks like.
  // Until the child has exec'd, ps shows it with the Jest worker's args.
  function execed(pid, needle) {
    return waitFor(() => {
      try {
        return execFileSync(hostPs, ['-p', String(pid), '-o', 'args='], {
          encoding: 'utf8',
        }).includes(needle);
      } catch (_) {
        return false;
      }
    });
  }

  async function startUnmarked(...args) {
    const child = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 60000)', ...args], {
      stdio: 'ignore',
      cwd: path.join(repoRoot, 'tests'),
    });
    const p = { child, exited: new Promise(resolve => child.once('exit', resolve)) };
    unmarked.push(p);
    expect(await execed(child.pid, args[args.length - 1])).toBe(true);
    return p;
  }

  async function startMarked(...args) {
    const t = startTokenProcess(...args);
    expect(await execed(t.child.pid, HOST_MARK)).toBe(true);
    return t;
  }

  it('hides device processes this run did not start from ps, pgrep, pkill, adb and simctl', async function () {
    const foreignQemu = await startUnmarked('qemu-system-fake', '@TestingAVD-1', '-port', '5558');
    const foreignSim = await startUnmarked(
      'launchd_sim',
      '/sims/CoreSimulator/Devices/UDID-HOST/data/var/run/launchd_bootstrap.plist',
    );
    const own = await startMarked('qemu-system-fake', '@TestingAVD-1', '-port', '16240');
    try {
      const listed = runRecord.listProcesses().map(p => p.pid);
      expect(listed).toContain(own.child.pid);
      expect(listed).not.toContain(foreignQemu.child.pid);
      expect(listed).not.toContain(foreignSim.child.pid);
      expect(listed).toContain(process.pid);

      const env = { RNFB_E2E_SLOT: '1', RNFB_E2E_RUN_RECORD_DIR: dir };
      expect(runRecord.recordAndroidDevice('emulator-5558', 'TestingAVD-1', env)).toBe(
        'emulator-16240',
      );
      expect(runRecord.recordIosSimulator('UDID-HOST', 'RN E2E iOS slot-1', env)).toBeNull();

      const shell = execFileSync(
        '/bin/bash',
        [
          '-c',
          `source "${recordLib}"
e2e_qemu_instances | cut -f1
echo "sim=$(e2e_device_instance_pid ios UDID-HOST)"
pgrep -f 'qemu-system.*@TestingAVD-1([[:space:]]|$)'
adb devices
xcrun simctl list devices booted -j`,
        ],
        { encoding: 'utf8', env: cleanEnv({}) },
      );
      expect(shell.split('\n')).toContain(String(own.child.pid));
      expect(shell).not.toMatch(new RegExp(`\\b${foreignQemu.child.pid}\\b`));
      expect(shell).toMatch(/^sim=$/m);
      expect(shell).toMatch(/List of devices attached\n\n\{"devices":\{\}\}/);

      execFileSync('/bin/bash', ['-c', `pkill -f 'qemu-system.*@TestingAVD-1([[:space:]]|$)'`], {
        env: cleanEnv({}),
      });
      expect(await settle(own.exited, 3000)).toBe('SIGTERM');
      expect(await settle(foreignQemu.exited, 300)).toBe('running');
    } finally {
      own.child.kill('SIGKILL');
    }
  });

  it('hides them from every ps listing form and from per-pid queries', async function () {
    const foreign = await startUnmarked('qemu-system-fake', '@TestingAVD-1', '-port', '5558');
    const own = await startMarked('qemu-system-fake', '@TestingAVD-1', '-port', '16242');
    // Jest's process.env is not the one child_process defaults to.
    const ps = args => execFileSync('ps', args, { encoding: 'utf8', env: process.env });
    try {
      for (const args of [
        ['-ax', '-o', 'pid=,args='],
        ['-axo', 'pid=,args='],
        ['-A', '-o', 'pid=,args='],
        ['-Ao', 'pid=,args='],
        ['-e', '-o', 'pid=,args='],
        ['-eo', 'pid=,args='],
      ]) {
        const out = ps(args);
        expect([args.join(' '), new RegExp(`^\\s*${own.child.pid}\\s`, 'm').test(out)]).toEqual([
          args.join(' '),
          true,
        ]);
        expect([args.join(' '), new RegExp(`^\\s*${foreign.child.pid}\\s`, 'm').test(out)]).toEqual(
          [args.join(' '), false],
        );
      }
      expect(ps(['-p', String(foreign.child.pid), '-o', 'args=']).trim()).toBe('');
      expect(ps(['-p', String(own.child.pid), '-o', 'args='])).toMatch(
        /qemu-system-fake @TestingAVD-1 -port 16242/,
      );
    } finally {
      own.child.kill('SIGKILL');
    }
  });

  it('pkill takes only -f and a signal, and rejects any other flag without killing', async function () {
    const foreign = await startUnmarked('qemu-system-fake', '@TestingAVD-1', '-port', '5558');
    const pattern = 'qemu-system.*@TestingAVD-1([[:space:]]|$)';
    const pkill = (...args) =>
      spawnSync('pkill', args, { encoding: 'utf8', env: cleanEnv({ PATH: process.env.PATH }) });
    const own = [];
    try {
      for (const args of [
        ['-P', String(process.pid), pattern],
        ['-U', String(process.getuid()), pattern],
        ['-s', 'KILL', '-f', pattern],
        ['-x', pattern],
        ['-SIGNOPE', '-f', pattern],
        ['-f'],
        ['-f', pattern, 'extra'],
      ]) {
        const result = pkill(...args);
        expect([args.join(' '), result.status]).toEqual([args.join(' '), 2]);
        expect(result.stderr).toMatch(/pkill test stub: unsupported argument/);
      }

      for (const [signalArg, signal] of [
        ['-9', 'SIGKILL'],
        ['-KILL', 'SIGKILL'],
        ['-SIGINT', 'SIGINT'],
      ]) {
        const t = await startMarked('qemu-system-fake', '@TestingAVD-1', '-port', '16246');
        own.push(t);
        expect(pkill(signalArg, '-f', pattern).status).toBe(0);
        expect([signalArg, await settle(t.exited, 3000)]).toEqual([signalArg, signal]);
      }
      expect(await settle(foreign.exited, 300)).toBe('running');
      expect(pkill('-f', pattern).status).toBe(1);
    } finally {
      for (const t of own) {
        t.child.kill('SIGKILL');
      }
    }
  });
});

describe('tests/e2e/runRecord.js', function () {
  let dir;

  beforeEach(function () {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-run-record-js-'));
  });

  afterEach(function () {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('writes entries in the shell lib format and owns recorded pids and descendants', async function () {
    const env = { RNFB_E2E_HOST_SLOT: '4', RNFB_E2E_RUN_RECORD_DIR: dir };
    expect(runRecord.runRecordDir(env)).toBe(path.join(dir, 'slot-4'));

    const { child, exited } = startSleeper();
    const qemu = startTokenProcess('qemu-system-fake', '@TestingAVD-4', '-port', '5564');
    const sim = startTokenProcess(
      'launchd_sim',
      '/sims/CoreSimulator/Devices/UDID-4/data/var/run/launchd_bootstrap.plist',
    );
    try {
      runRecord.recordPid(child.pid, 'macos-app:io.invertase.testing.s4', env);
      // Serial comes from the qemu -port, not the caller's guess.
      expect(runRecord.recordAndroidDevice(null, 'TestingAVD-4', env)).toBe('emulator-5564');
      expect(runRecord.recordIosSimulator('UDID-4', 'RN E2E iOS slot-4', env)).toBe('UDID-4');

      const pidFiles = fs.readdirSync(path.join(dir, 'slot-4')).filter(f => f.startsWith('pid-'));
      expect(pidFiles).toHaveLength(1);
      expect(pidFiles[0]).toMatch(new RegExp(`^pid-${child.pid}-[A-Za-z0-9_]+$`));
      const line = fs.readFileSync(path.join(dir, 'slot-4', pidFiles[0]), 'utf8');
      expect(line).toMatch(
        new RegExp(`^pid\\t${child.pid}\\t.+\\tmacos-app:io.invertase.testing.s4\\n$`),
      );
      expect(runRecord.listEntries('android', env)[0].fields).toEqual([
        'android',
        'emulator-5564',
        'TestingAVD-4',
        String(qemu.child.pid),
        runRecord.processStartTime(qemu.child.pid),
      ]);
      expect(runRecord.listEntries('ios-sim', env)[0].fields).toEqual([
        'ios-sim',
        'UDID-4',
        'RN E2E iOS slot-4',
        String(sim.child.pid),
        runRecord.processStartTime(sim.child.pid),
      ]);
      const shellDevices = execFileSync(
        '/bin/bash',
        [
          '-c',
          `source "${recordLib}"; e2e_run_record_device_owned android emulator-5564 && echo ANDROID_OWNED; e2e_run_record_device_owned ios-sim UDID-4 && echo IOS_OWNED`,
        ],
        { encoding: 'utf8', env: cleanEnv(env) },
      );
      expect(shellDevices).toMatch(/ANDROID_OWNED/);
      expect(shellDevices).toMatch(/IOS_OWNED/);
      expect(runRecord.recordedLivePids('macos-app:io.invertase.testing.s4', env)).toEqual([
        child.pid,
      ]);
      expect(runRecord.recordedLivePids('macos-app:other', env)).toEqual([]);
      expect(runRecord.isOwnedPid(child.pid, env)).toBe(true);
      expect(runRecord.isOwnedPid(1, env)).toBe(false);

      const shellView = execFileSync(
        '/bin/bash',
        [
          '-c',
          `source "${recordLib}"; e2e_run_record_load; e2e_pid_owned ${child.pid} && echo OWNED`,
        ],
        { encoding: 'utf8', env: cleanEnv(env) },
      );
      expect(shellView).toMatch(/OWNED/);
    } finally {
      child.kill('SIGKILL');
      qemu.child.kill('SIGKILL');
      sim.child.kill('SIGKILL');
      await Promise.all([exited, qemu.exited, sim.exited]);
    }
  });

  it('owns a process outside this worker only once it is recorded', function () {
    const env = { RNFB_E2E_RUN_RECORD_DIR: dir };
    const pid = startDetached(['/bin/sleep', '60']);
    try {
      expect(runRecord.isOwnedPid(pid, env)).toBe(false);
      expect(runRecord.pidOwner(pid, env)).toBe('unrecorded');
      runRecord.recordPid(pid, 'metro:8081', env);
      expect(runRecord.isOwnedPid(pid, env)).toBe(true);
      expect(runRecord.pidOwner(pid, env)).toBe('this-checkout');
    } finally {
      killQuietly(pid);
    }
  });

  it('labels an unrecorded holder running from this checkout and names the exact manual release', function () {
    const env = { RNFB_E2E_RUN_RECORD_DIR: dir };
    const pid = startDetached(['/bin/sleep', '60'], repoRoot);
    try {
      expect(runRecord.pidOwner(pid, env)).toBe('this-checkout-unrecorded');
      const message = runRecord.foreignHolderError('Metro :8081', [pid], 'metro', env).message;
      expect(message).toContain(`pid=${pid}`);
      expect(message).toContain(`cwd=${repoRoot}`);
      expect(message).toContain('owner=this-checkout-unrecorded');
      expect(message).toContain('yarn tests:e2e:release --include-unrecorded --only metro');
      expect(message).toContain('or by a step that does not record what it starts');
    } finally {
      killQuietly(pid);
    }
  });
});

describe('harness fail-fast on holders another owner started', function () {
  let dir;
  let savedEnv;

  beforeEach(function () {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-failfast-'));
    savedEnv = { ...process.env };
    for (const key of ['RNFB_E2E_SLOT', 'RNFB_E2E_HOST_SLOT', 'E2E_SLOT_OVERRIDE']) {
      delete process.env[key];
    }
    process.env.RNFB_E2E_RUN_RECORD_DIR = dir;
  });

  afterEach(function () {
    process.env = savedEnv;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('killTcpPortListener leaves a foreign listener alive and throws, then frees it once recorded', async function () {
    const { killTcpPortListener, listTcpListenPids } = require(
      path.join(repoRoot, 'tests/e2e/portOwnership'),
    );
    const port = await freePort();
    const pid = startDetached([
      process.execPath,
      '-e',
      `require('net').createServer().listen(${port}, '127.0.0.1'); setTimeout(() => {}, 60000)`,
    ]);
    const quiet = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const quietLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    try {
      expect(await waitFor(() => listTcpListenPids(port).includes(String(pid)))).toBe(true);

      await expect(killTcpPortListener(port, 'jet', 'jet')).rejects.toThrow(
        new RegExp(`:${port} is held by pid=${pid} .*cwd=.*owner=unrecorded`),
      );
      expect(alive(pid)).toBe(true);

      runRecord.recordPid(pid, `jet:${port}`);
      await killTcpPortListener(port, 'jet', 'jet');
      expect(await waitFor(() => !alive(pid))).toBe(true);
    } finally {
      quiet.mockRestore();
      quietLog.mockRestore();
      killQuietly(pid);
    }
  });

  it('macOS .jetrc before() fails fast on a same-name app it did not start and leaves it running', async function () {
    const name = `rnfbmac${process.pid % 100000}`;
    // macOS names a symlinked node after the link (a copied system binary is killed on
    // exec). Linux node renames its main thread MainThread, so it sets the name itself
    // (process.title → PR_SET_NAME). A symlinked sleep is no good: uutils coreutils
    // refuses to run under another name.
    const bin = path.join(dir, name);
    fs.symlinkSync(process.execPath, bin);
    process.env.RNFB_MACOS_PRODUCT_NAME = name;
    const pid = startDetached([
      bin,
      '-e',
      `if (process.platform === 'linux') process.title = ${JSON.stringify(name)}; setTimeout(() => {}, 60000)`,
    ]);
    try {
      expect(
        await waitFor(() => {
          try {
            return execFileSync('pgrep', ['-x', name], { encoding: 'utf8' }).includes(String(pid));
          } catch (_) {
            return false;
          }
        }),
      ).toBe(true);
      let jetrc;
      jest.isolateModules(() => {
        jetrc = require(path.join(repoRoot, 'tests-macos/.jetrc.js'));
      });
      await expect(jetrc.targets.macos.before({})).rejects.toThrow(
        new RegExp(`macOS app ${name} is held by pid=${pid} .*owner=unrecorded`),
      );
      expect(alive(pid)).toBe(true);
    } finally {
      killQuietly(pid);
    }
  });
});

describe('check-e2e-resources.sh owner labels', function () {
  let dir;
  let pid;

  beforeEach(function () {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-check-owner-'));
    const lsof = realBin('lsof');
    writeExecutable(
      path.join(dir, 'lsof'),
      `#!/bin/bash
if [[ "$*" == "-nP -iTCP -sTCP:LISTEN" ]]; then
  cat "$RNFB_FAKE_LSOF"
  exit 0
fi
if [[ "$1" == "-a" ]]; then
  exec ${lsof} "$@"
fi
exit 1
`,
    );
    writeExecutable(
      path.join(dir, 'adb'),
      `#!/bin/bash\n[[ "$1" == devices ]] && printf 'List of devices attached\\n' && exit 0\nexit 1\n`,
    );
    writeExecutable(
      path.join(dir, 'xcrun'),
      `#!/bin/bash\nif [[ -n "$RNFB_FAKE_SIMCTL_JSON" ]]; then printf '%s\\n' "$RNFB_FAKE_SIMCTL_JSON"; else printf '{}\\n'; fi\n`,
    );
    writeExecutable(path.join(dir, 'pgrep'), '#!/bin/bash\nexit 1\n');
  });

  afterEach(function () {
    if (pid) {
      killQuietly(pid);
      pid = undefined;
    }
    fs.rmSync(dir, { recursive: true, force: true });
  });

  function check(holderPid) {
    // slot-1 android Jet port
    fs.writeFileSync(
      path.join(dir, 'lsof.out'),
      `node ${holderPid} me 20u IPv4 0x1 0t0 TCP 127.0.0.1:13010 (LISTEN)\n`,
    );
    try {
      execFileSync(
        '/bin/bash',
        [
          path.join(repoRoot, 'scripts/e2e/check-e2e-resources.sh'),
          '--platform=android',
          '--slot=1',
        ],
        {
          encoding: 'utf8',
          cwd: repoRoot,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv({
            PATH: `${dir}:${process.env.PATH}`,
            RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec'),
            RNFB_FAKE_LSOF: path.join(dir, 'lsof.out'),
          }),
        },
      );
      return { status: 0, output: '' };
    } catch (error) {
      return { status: error.status, output: `${error.stdout || ''}${error.stderr || ''}` };
    }
  }

  it('labels another owner unrecorded and suggests a free slot', function () {
    pid = startDetached(['/bin/sleep', '60']);
    const { status, output } = check(pid);
    expect(status).toBe(1);
    expect(output).toMatch(
      new RegExp(`BUSY\\s+port :13010 \\(jet:android\\) pids=${pid} owner=unrecorded`),
    );
    expect(output).toMatch(
      /owner=unrecorded: held by another owner .*first free slot: \d+ — eval "\$\(yarn tests:e2e:export-slot-env <platform> \d+\)"/,
    );
  });

  it('labels a recorded holder this-checkout with no foreign hint', function () {
    pid = startDetached(['/bin/sleep', '60']);
    runRecord.recordPid(pid, 'jet:13010', {
      RNFB_E2E_SLOT: '1',
      RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec'),
    });
    const { status, output } = check(pid);
    expect(status).toBe(1);
    expect(output).toMatch(new RegExp(`pids=${pid} owner=this-checkout$`, 'm'));
    expect(output).not.toMatch(/owner=unrecorded/);
    expect(output).not.toMatch(/include-unrecorded/);
  });

  it('names the exact --include-unrecorded command for an unrecorded holder in this checkout', function () {
    pid = startDetached(['/bin/sleep', '60'], repoRoot);
    const { status, output } = check(pid);
    expect(status).toBe(1);
    expect(output).toMatch(new RegExp(`pids=${pid} owner=this-checkout-unrecorded`));
    expect(output).toContain('yarn tests:e2e:release --include-unrecorded --only jet --slot=1');
    // Causes are examples: a yarn tests:* step that does not record what it starts counts too.
    expect(output).toContain(
      'no run recorded it (for example started outside yarn tests:*, before the run record existed, or by a step that does not record what it starts)',
    );
    expect(output).not.toMatch(/first free slot/);
  });

  it('labels an unrecorded device booted from this checkout this-checkout-unrecorded', function () {
    // The identity's simulator, booted by a launchd_sim whose cwd is this repo (e.g.
    // before the run record existed).
    pid = startDetached(
      [
        process.execPath,
        '-e',
        'setTimeout(() => {}, 60000)',
        'launchd_sim',
        '/sims/CoreSimulator/Devices/UDID-T66U/data/var/run/launchd_bootstrap.plist',
      ],
      repoRoot,
    );
    fs.writeFileSync(path.join(dir, 'lsof.out'), '');
    let result;
    try {
      execFileSync(
        '/bin/bash',
        [path.join(repoRoot, 'scripts/e2e/check-e2e-resources.sh'), '--platform=ios'],
        {
          encoding: 'utf8',
          cwd: repoRoot,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv({
            PATH: `${dir}:${process.env.PATH}`,
            RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec'),
            RNFB_FAKE_LSOF: path.join(dir, 'lsof.out'),
            RNFB_FAKE_SIMCTL_JSON:
              '{"devices":{"rt":[{"udid":"UDID-T66U","name":"iPhone 17","state":"Booted"}]}}',
          }),
        },
      );
      result = { status: 0, output: '' };
    } catch (error) {
      result = { status: error.status, output: `${error.stdout || ''}${error.stderr || ''}` };
    }
    expect(result.status).toBe(1);
    expect(result.output).toMatch(
      /BUSY\s+ios simulator booted \(iPhone 17 UDID-T66U\) owner=this-checkout-unrecorded/,
    );
    expect(result.output).toContain('yarn tests:e2e:release --include-unrecorded --only ios-sims');
  });
});

describe('owned-only recording and cleanup', function () {
  let dir;
  const pids = [];
  let savedEnv;

  beforeEach(function () {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-owned-only-'));
    savedEnv = { ...process.env };
    for (const key of ['RNFB_E2E_SLOT', 'RNFB_E2E_HOST_SLOT', 'E2E_SLOT_OVERRIDE']) {
      delete process.env[key];
    }
    process.env.RNFB_E2E_RUN_RECORD_DIR = dir;
  });

  afterEach(function () {
    process.env = savedEnv;
    for (const pid of pids.splice(0)) {
      killQuietly(pid);
    }
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const listenScript = port =>
    `require('net').createServer().listen(${port}, '127.0.0.1'); setTimeout(() => {}, 60000)`;

  async function detachedListener(port) {
    const { listTcpListenPids } = require(path.join(repoRoot, 'tests/e2e/portOwnership'));
    const pid = startDetached([process.execPath, '-e', listenScript(port)]);
    pids.push(pid);
    expect(await waitFor(() => listTcpListenPids(port).includes(String(pid)))).toBe(true);
    return pid;
  }

  function recordedPids() {
    return runRecord.listEntries('pid').map(({ fields }) => Number(fields[1]));
  }

  function runShell(script) {
    return execFileSync('/bin/bash', ['-c', `source "${recordLib}"\n${script}`], {
      encoding: 'utf8',
      env: cleanEnv({ RNFB_E2E_RUN_RECORD_DIR: dir }),
    });
  }

  it('shell: ready-time listener recording skips a foreign listener and keeps an owned one', async function () {
    const foreignPort = await freePort();
    const foreign = await detachedListener(foreignPort);
    runShell(`e2e_run_record_owned_port_listeners ${foreignPort} metro:${foreignPort}`);
    expect(recordedPids()).not.toContain(foreign);

    const ownPort = await freePort();
    const out = runShell(`
e2e_run_record_pid $$ root
"${process.execPath}" -e "${listenScript(ownPort)}" & child=$!
for _ in $(seq 1 50); do [[ -n "$(e2e_port_listener_pids ${ownPort})" ]] && break; /bin/sleep 0.1; done
e2e_run_record_owned_port_listeners ${ownPort} metro:${ownPort}
echo "CHILD=$child"
kill "$child"
`);
    const child = Number(out.match(/CHILD=(\d+)/)[1]);
    expect(recordedPids()).toContain(child);
  });

  it('JS: recordTcpPortListeners skips a foreign listener and keeps an owned one', async function () {
    const { recordTcpPortListeners, listTcpListenPids } = require(
      path.join(repoRoot, 'tests/e2e/portOwnership'),
    );
    const foreignPort = await freePort();
    const foreign = await detachedListener(foreignPort);
    recordTcpPortListeners(foreignPort, `jet:${foreignPort}`);
    expect(recordedPids()).not.toContain(foreign);

    const ownPort = await freePort();
    const own = spawn(process.execPath, ['-e', listenScript(ownPort)], { stdio: 'ignore' });
    try {
      expect(await waitFor(() => listTcpListenPids(ownPort).includes(String(own.pid)))).toBe(true);
      recordTcpPortListeners(ownPort, `jet:${ownPort}`);
      expect(recordedPids()).toContain(own.pid);
    } finally {
      own.kill('SIGKILL');
    }
  });

  it('failed-start cleanup kills the started tree and owned listeners, never a foreign listener', async function () {
    const foreignPort = await freePort();
    const foreign = await detachedListener(foreignPort);
    const ownedPort = await freePort();
    const owned = await detachedListener(ownedPort);
    runRecord.recordPid(owned, `emulator-suite:${ownedPort}`);

    const out = runShell(`
( /bin/sleep 60 & /bin/sleep 61 ) & root=$!
/bin/sleep 0.2
tree="$(e2e_pid_tree "$root" | tr '\\n' ' ')"
echo "TREE=$tree"
e2e_kill_started_tree "$root" ${foreignPort} ${ownedPort}
`);
    const tree = out
      .match(/TREE=([\d ]+)/)[1]
      .trim()
      .split(/\s+/)
      .map(Number);
    expect(tree.length).toBeGreaterThan(1);
    expect(await waitFor(() => tree.every(p => !alive(p)))).toBe(true);
    expect(await waitFor(() => !alive(owned))).toBe(true);
    expect(alive(foreign)).toBe(true);
  });
});

describe('device recording picks the right instance', function () {
  let dir;
  let savedEnv;
  const tokens = [];

  beforeEach(function () {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-device-record-'));
    savedEnv = { ...process.env };
    for (const key of [
      'RNFB_E2E_SLOT',
      'RNFB_E2E_HOST_SLOT',
      'E2E_SLOT_OVERRIDE',
      'ANDROID_SERIAL',
    ]) {
      delete process.env[key];
    }
    process.env.RNFB_E2E_RUN_RECORD_DIR = path.join(dir, 'rec');
    const bin = path.join(dir, 'bin');
    fs.mkdirSync(bin);
    // ps: report $RNFB_FAKE_ETIME for etime queries so "started during this run" is
    // controllable; everything else is the real ps.
    const ps = realBin('ps');
    writeExecutable(
      path.join(bin, 'ps'),
      `#!/bin/bash\nif [[ "$*" == *etime=* && -n "$RNFB_FAKE_ETIME" ]]; then echo "$RNFB_FAKE_ETIME"; exit 0; fi\nexec ${ps} "$@"\n`,
    );
    writeExecutable(
      path.join(bin, 'xcrun'),
      `#!/bin/bash\nprintf '%s\\n' '{"devices":{"rt":[{"udid":"UDID-T66H","name":"T66 Hook Sim","state":"Booted"}]}}'\n`,
    );
    process.env.PATH = `${bin}:${process.env.PATH}`;
  });

  afterEach(async function () {
    process.env = savedEnv;
    for (const t of tokens.splice(0)) {
      t.child.kill('SIGKILL');
      await t.exited;
    }
    fs.rmSync(dir, { recursive: true, force: true });
  });

  function token(...args) {
    const t = startTokenProcess(...args);
    tokens.push(t);
    return t;
  }

  it('records the serial from qemu -port, not the caller’s fallback, and matches the complete AVD name', function () {
    token('qemu-system-fake', '@T66PortAvd-1', '-port', '5594');
    const qemu = token('qemu-system-fake', '@T66PortAvd', '-port', '5592');
    expect(runRecord.recordAndroidDevice('emulator-5554', 'T66PortAvd')).toBe('emulator-5592');
    const [entry] = runRecord.listEntries('android');
    expect(entry.fields.slice(0, 4)).toEqual([
      'android',
      'emulator-5592',
      'T66PortAvd',
      String(qemu.child.pid),
    ]);
  });

  it('the Detox hook records only a device that booted during this run', function () {
    token('qemu-system-fake', '@T66HookAvd', '-port', '5596');
    token(
      'launchd_sim',
      '/sims/CoreSimulator/Devices/UDID-T66H/data/var/run/launchd_bootstrap.plist',
    );
    process.env.RNFB_ANDROID_AVD = 'T66HookAvd';
    process.env.RNFB_IOS_SIMULATOR = 'T66 Hook Sim';

    // Booted long before this process started: another owner's, or an earlier run's.
    process.env.RNFB_FAKE_ETIME = '10-00:00:00';
    expect(runRecord.recordRunDevice('android')).toBeNull();
    expect(runRecord.recordRunDevice('ios')).toBeNull();
    expect(runRecord.listEntries('android')).toEqual([]);
    expect(runRecord.listEntries('ios-sim')).toEqual([]);

    process.env.RNFB_FAKE_ETIME = '00:01';
    expect(runRecord.recordRunDevice('android')).toBe('emulator-5596');
    expect(runRecord.recordRunDevice('ios')).toBe('UDID-T66H');
  });

  it('harness simulator reboot keeps log streams off locally and on in CI', function () {
    const { simulatorRebootEnv } = require(path.join(repoRoot, 'tests/e2e/simulatorBootEnv'));
    expect(simulatorRebootEnv({ CI: '', RNFB_START_SIM_LOGS: '1' }).RNFB_START_SIM_LOGS).toBe('0');
    expect(simulatorRebootEnv({}).RNFB_START_SIM_LOGS).toBe('0');
    expect(simulatorRebootEnv({ CI: 'true' }).RNFB_START_SIM_LOGS).toBe('1');
    expect(simulatorRebootEnv({ CI: 'true', RNFB_START_SIM_LOGS: '0' }).RNFB_START_SIM_LOGS).toBe(
      '0',
    );
    const harness = fs.readFileSync(path.join(repoRoot, 'tests/e2e/firebase.test.js'), 'utf8');
    expect(harness).toMatch(
      /spawn\('bash', \[bootScript\], \{[\s\S]{0,80}env: simulatorRebootEnv\(\)/,
    );
  });
});

describe('shared-host scripts outside the run record', function () {
  let dir;

  beforeEach(function () {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-sim-logging-'));
    const log = path.join(dir, 'actions.log');
    for (const name of ['pkill', 'pgrep', 'nohup', 'xcrun', 'yarn']) {
      writeExecutable(
        path.join(dir, name),
        `#!/bin/bash\nprintf '${name} %s\\n' "$*" >> "${log}"\nexit 0\n`,
      );
    }
    writeExecutable(path.join(dir, 'sleep'), '#!/bin/bash\nexit 0\n');
  });

  afterEach(function () {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  function restartLogging(extraEnv) {
    execFileSync(
      '/bin/bash',
      [
        '-c',
        `source "${path.join(repoRoot, '.github/workflows/scripts/simulator-logging.sh')}"; restart_simulator_logging; wait; true`,
      ],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: cleanEnv({
          CI: '',
          PATH: `${dir}:${process.env.PATH}`,
          RNFB_SIM_LOG_DIR: dir,
          ...extraEnv,
        }),
      },
    );
    const log = path.join(dir, 'actions.log');
    const actions = fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '';
    fs.rmSync(log, { force: true });
    return actions;
  }

  it('simulator-logging restarts only its own UDID streams on a shared host', function () {
    const local = restartLogging({ RNFB_IOS_SIMULATOR_UDID: 'UDID-7' });
    expect(local).toMatch(/pkill -f simctl spawn UDID-7 log stream/);
    expect(local).not.toMatch(/pkill -f simctl spawn booted/);
    expect(local).not.toMatch(/pkill -f simctl io booted/);
    expect(local).not.toMatch(/resource-monitor/);

    expect(restartLogging({})).not.toMatch(/pkill/);

    const ci = restartLogging({ CI: 'true', RNFB_IOS_SIMULATOR_UDID: 'UDID-7' });
    expect(ci).toMatch(/pkill -f simctl spawn booted log stream/);
    expect(ci).toMatch(/pkill -f resource-monitor\.sh/);
    expect(ci).toMatch(/nohup .*resource-monitor\.sh/);
  });

  it.each([
    '.github/workflows/scripts/test-expo-ios-launch-smoke.sh',
    '.github/workflows/scripts/test-rn-bare-ios-launch-smoke.sh',
  ])(
    '%s never sweeps the Metro port; it fails fast and kills only its own Metro tree',
    function (rel) {
      const src = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
      expect(src).not.toMatch(/lsof -ti/);
      expect(src).not.toMatch(/xargs kill/);
      expect(src).toMatch(
        /for holder in \$\(e2e_port_listener_pids "\$METRO_PORT"\); do\n\s+fail "Metro port/,
      );
      expect(src).toMatch(/tree="\$\(e2e_pid_tree "\$metro_pid"\)"/);
    },
  );

  it('android-e2e-detox.sh refuses to run outside CI', function () {
    let status = 0;
    try {
      execFileSync(
        '/bin/bash',
        [path.join(repoRoot, '.github/workflows/scripts/android-e2e-detox.sh')],
        {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv({ CI: '', ANDROID_HOME: dir, PATH: `${dir}:${process.env.PATH}` }),
        },
      );
    } catch (error) {
      status = error.status;
    }
    expect(status).toBe(2);
    expect(fs.existsSync(path.join(dir, 'actions.log'))).toBe(false);
  });
});

describe('yarn test:full whole-host flags', function () {
  it.each(['--clear-whole-host', '--clear-all'])('%s exits 2 before any work', function (flag) {
    let result;
    try {
      execFileSync('/bin/bash', [path.join(repoRoot, 'scripts/run-full-tests.sh'), flag], {
        encoding: 'utf8',
        cwd: repoRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: cleanEnv({}),
      });
      result = { status: 0, stderr: '' };
    } catch (error) {
      result = { status: error.status, stderr: error.stderr || '' };
    }
    expect(result.status).toBe(2);
    expect(result.stderr).toContain(`${flag} was removed`);
    expect(result.stderr).toContain('manual-only, at explicit user direction');
  });
});

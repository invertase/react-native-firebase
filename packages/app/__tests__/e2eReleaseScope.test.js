const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const release = path.join(repoRoot, 'scripts/e2e/release-e2e-resources.sh');
const check = path.join(repoRoot, 'scripts/e2e/check-e2e-resources.sh');

// Unreachable pid: kill on a stubbed listener must never hit a real process.
const FAKE_PID = '99999999';
// Serial Metro; slot 1 ios Metro; slot 2 android and ios Metro.
const LISTEN_PORTS = ['8081', '13107', '14007', '14107'];
const ADB_AVDS = {
  'emulator-5554': 'TestingAVD',
  'emulator-5556': 'TestingAVD-0',
  'emulator-5558': 'TestingAVD-1',
  'emulator-5560': 'TestingAVD-2',
  'emulator-16222': 'TestingAVD-1',
  'emulator-16224': 'TestingAVD-2',
};

function cleanEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (
      key.startsWith('RNFB_') ||
      key.startsWith('JET_') ||
      key.startsWith('E2E_') ||
      ['RCT_METRO_PORT', 'ANDROID_SERIAL', 'AVD_NAME', 'SIMCTL_CHILD_RCT_METRO_PORT'].includes(key)
    ) {
      delete env[key];
    }
  }
  env.E2E_SLOTTED_MAX = '2';
  return env;
}

function writeStub(dir, name, body) {
  const file = path.join(dir, name);
  fs.writeFileSync(
    file,
    `#!/bin/bash\nprintf '%s %s\\n' ${name} "$*" >> "$RNFB_ACTION_LOG"\n${body}\n`,
  );
  fs.chmodSync(file, 0o755);
}

function stubHost() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-release-scope-'));
  const devices = Object.keys(ADB_AVDS)
    .map(s => `${s}\tdevice`)
    .join('\\n');
  const avdCases = Object.entries(ADB_AVDS)
    .map(([s, avd]) => `    ${s}) printf '%s\\r\\nOK\\r\\n' ${avd} ;;`)
    .join('\n');
  writeStub(
    dir,
    'adb',
    `if [[ "$1" == devices ]]; then printf 'List of devices attached\\n${devices}\\n'; exit 0; fi
if [[ "$1" == -s && "$3 $4 $5" == "emu avd name" ]]; then
  case "$2" in
${avdCases}
  esac
  exit 0
fi
[[ "$3" == shell && "$4" == pidof ]] && exit 1
exit 0`,
  );
  writeStub(
    dir,
    'lsof',
    `ports="${LISTEN_PORTS.join(' ')}"
for a in "$@"; do
  case "$a" in
    -iTCP:*)
      p="\${a#-iTCP:}"
      [[ " $ports " == *" $p "* ]] || exit 1
      [[ " $* " == *" -t "* ]] && echo ${FAKE_PID} || echo "node ${FAKE_PID} u 20u IPv4 0 0t0 TCP *:$p (LISTEN)"
      exit 0
      ;;
  esac
done
for p in $ports; do echo "node ${FAKE_PID} u 20u IPv4 0 0t0 TCP *:$p (LISTEN)"; done`,
  );
  writeStub(
    dir,
    'xcrun',
    `[[ " $* " == *" list devices booted -j "* ]] && echo '{"devices":{}}'
exit 0`,
  );
  writeStub(dir, 'pgrep', 'exit 0');
  for (const name of ['pkill', 'killall', 'emulator', 'sleep']) {
    writeStub(dir, name, 'exit 0');
  }
  return dir;
}

function runRelease(args, extraEnv = {}, script = release, { observeCheckTmp = false } = {}) {
  const dir = stubHost();
  const log = path.join(dir, 'actions.log');
  const tmp = path.join(dir, 'tmp');
  fs.mkdirSync(tmp);
  if (observeCheckTmp) {
    // release runs the recheck as `bash check-e2e-resources.sh`: list TMPDIR while it runs.
    writeStub(
      dir,
      'bash',
      `if [[ "$1" == */check-e2e-resources.sh ]]; then
  printf 'check-tmp %s\\n' "$(ls "$TMPDIR" | tr '\\n' ' ')" >> "$RNFB_ACTION_LOG"
fi
exec /bin/bash "$@"`,
    );
  }
  try {
    const env = {
      ...cleanEnv(),
      TMPDIR: `${tmp}/`,
      ...extraEnv,
      PATH: `${dir}:${process.env.PATH || '/usr/bin:/bin'}`,
      RNFB_ACTION_LOG: log,
    };
    const res = spawnSync('/bin/bash', [script, ...args], {
      cwd: repoRoot,
      env,
      encoding: 'utf8',
    });
    const actions = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n') : [];
    const out = `${res.stdout}${res.stderr}`;
    const pick = re =>
      [...new Set(actions.map(l => (l.match(re) || [])[1]).filter(Boolean))].sort();
    return {
      status: res.status,
      out,
      actions,
      tmpLeft: fs.readdirSync(tmp),
      emuKill: pick(/^adb -s (\S+) emu kill$/),
      forceStop: pick(/^adb -s (\S+) shell am force-stop/),
      pkillAvd: pick(/^pkill -f qemu-system\.\*@(\S+?)\(/),
      simShutdown: pick(/^xcrun simctl shutdown (.+)$/),
      killall: pick(/^killall (?:-9 )?(\S+)$/),
      ports: [...new Set([...out.matchAll(/SIG(?:TERM|KILL) :(\d+)/g)].map(m => m[1]))].sort(),
      emulatorCalls: actions.filter(l => l.startsWith('emulator ')),
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('release-e2e-resources grant-shape scoping', function () {
  it('a desk slot-2 release stops only slot 2 devices, apps, and ports', function () {
    const r = runRelease(['--placement=slot', '--slot=2', '--devices']);
    expect(r.emuKill).toEqual(['emulator-16224', 'emulator-5560']);
    expect(r.forceStop).toEqual(['emulator-5560']);
    expect(r.pkillAvd).toEqual(['TestingAVD-2']);
    expect(r.simShutdown).toEqual(['RN E2E iOS slot-2']);
    expect(r.killall).toEqual(['io.invertase.testing.s2']);
    expect(r.ports).toEqual(['14007', '14107']);
    expect(r.emulatorCalls).toEqual([]);
  });

  it('a bare --slot=2 re-applies slot 2 env instead of the serial emulator-5554', function () {
    const r = runRelease(['--slot=2', '--devices']);
    expect(r.emuKill).toEqual(['emulator-16224', 'emulator-5560']);
    expect(r.pkillAvd).toEqual(['TestingAVD-2']);
  });

  it('a guest (placement host) release drops leftover slot env and cleans everything', function () {
    const r = runRelease(['--placement=host', '--devices'], {
      RNFB_E2E_SLOT: '1',
      RNFB_E2E_HOST_SLOT: '1',
      RNFB_ANDROID_AVD: 'TestingAVD-1',
      ANDROID_SERIAL: 'emulator-5558',
    });
    expect(r.emuKill).toEqual(expect.arrayContaining(Object.keys(ADB_AVDS)));
    expect(r.pkillAvd).toEqual(['TestingAVD', 'TestingAVD-0', 'TestingAVD-1', 'TestingAVD-2']);
    expect(r.simShutdown).toEqual(
      expect.arrayContaining(['iPhone 17', 'RN E2E iOS slot-0', 'RN E2E iOS slot-2']),
    );
    expect(r.ports).toEqual(LISTEN_PORTS.slice().sort());
  });

  it('keeps a caller RNFB_E2E_PLATFORM=android narrowing across the slot re-apply', function () {
    const r = runRelease(['--slot=2', '--devices'], { RNFB_E2E_PLATFORM: 'android' });
    expect(r.emuKill).toEqual(['emulator-16224', 'emulator-5560']);
    expect(r.pkillAvd).toEqual(['TestingAVD-2']);
    expect(r.simShutdown).toEqual([]);
    expect(r.killall).toEqual([]);
    expect(r.ports).toEqual(['14007']);
  });

  it('lets --platform= win over a caller RNFB_E2E_PLATFORM', function () {
    const r = runRelease(['--slot=2', '--devices', '--platform=ios'], {
      RNFB_E2E_PLATFORM: 'android',
    });
    expect(r.emuKill).toEqual([]);
    expect(r.pkillAvd).toEqual([]);
    expect(r.simShutdown).toEqual(['RN E2E iOS slot-2']);
  });

  it('prints the recheck output and leaves no check-output file in TMPDIR', function () {
    const r = runRelease(['--placement=slot', '--slot=2', '--devices']);
    expect(r.out).toContain('[release-e2e-resources] still BUSY');
    expect(r.out).toMatch(/BUSY\s+port :14007/);
    expect(r.tmpLeft).toEqual([]);
  });

  it('creates the check output under the caller TMPDIR during the recheck and removes it', function () {
    const r = runRelease(['--placement=slot', '--slot=2', '--devices'], {}, release, {
      observeCheckTmp: true,
    });
    const seen = r.actions.filter(l => l.startsWith('check-tmp '));
    // Two forceful rounds plus the final recheck.
    expect(seen).toHaveLength(3);
    for (const line of seen) {
      expect(line).toMatch(/^check-tmp rnfb-check-e2e-resources\.\w{6} $/);
    }
    expect(new Set(seen).size).toBe(1);
    expect(r.tmpLeft).toEqual([]);
  });

  it('check --slot=2 with no slot env reports only the TestingAVD-2 stray', function () {
    const r = runRelease(['--slot=2'], {}, check);
    expect(r.status).not.toBe(0);
    expect(r.out).toMatch(/BUSY\s+android stray emulator serial emulator-16224/);
    expect(r.out).not.toMatch(/stray emulator serial emulator-16222/);
    expect(r.emuKill).toEqual([]);
  });

  it.each([
    [['--placement=slot', '--devices'], {}, 'requires --slot=N'],
    [['--placement=slot', '--slot=2', '--all-slots'], {}, 'refuses --all-slots'],
    [['--placement=host', '--slot=1'], {}, 'takes no --slot'],
    [['--placement=desk'], {}, 'must be slot|host'],
    [['--placement=slot', '--slot=2'], { RNFB_E2E_SLOT: '1' }, 'does not match the loaded slot 1'],
  ])('refuses %j before touching anything', function (args, env, message) {
    const r = runRelease(args, env);
    expect(r.status).toBe(2);
    expect(r.out).toContain(message);
    expect(r.actions).toEqual([]);
  });
});

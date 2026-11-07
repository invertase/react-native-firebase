const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const release = path.join(repoRoot, 'scripts/e2e/release-e2e-resources.sh');
const check = path.join(repoRoot, 'scripts/e2e/check-e2e-resources.sh');

const SLOT2_ANDROID = 'android serial=emulator-5560 avd=TestingAVD-2 ios_sim=RN E2E iOS slot-2';

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

// An idle host: lsof sees no listener and no emulator, simulator, or macOS app runs. The
// Jet-port loopback probe still reaches the real host, so tests do not assert CLEAR ports.
function stubHost() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-release-scope-'));
  writeStub(
    dir,
    'adb',
    `[[ "$1" == devices ]] && printf 'List of devices attached\\n\\n'
exit 1`,
  );
  writeStub(dir, 'lsof', 'exit 1');
  writeStub(dir, 'xcrun', `[[ " $* " == *" list devices "* ]] && echo '{"devices":{}}'\nexit 0`);
  writeStub(dir, 'pgrep', 'exit 1');
  writeStub(dir, 'ps', `[[ " $* " == *" pid=,args= "* ]] && exit 0\nexec /bin/ps "$@"`);
  for (const name of ['pkill', 'killall', 'emulator', 'sleep']) {
    writeStub(dir, name, 'exit 0');
  }
  return dir;
}

function run(script, args, extraEnv = {}) {
  const dir = stubHost();
  const log = path.join(dir, 'actions.log');
  try {
    const res = spawnSync('/bin/bash', [script, ...args], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...cleanEnv(),
        ...extraEnv,
        PATH: `${dir}:${process.env.PATH || '/usr/bin:/bin'}`,
        RNFB_ACTION_LOG: log,
        RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec'),
      },
    });
    const actions = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n') : [];
    return {
      status: res.status,
      out: `${res.stdout}${res.stderr}`,
      // Device and app actions; read-only probes (devices, list, pgrep, ps) are excluded.
      kills: actions.filter(l =>
        /^(adb -s \S+ (emu kill|shell am force-stop)|xcrun simctl shutdown|pkill|killall)/.test(l),
      ),
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function ports(out) {
  return [...out.matchAll(/^(?:CLEAR|BUSY)\s+port :(\d+) \(/gm)].map(m => Number(m[1]));
}

describe('check and release --slot=N re-apply the slot env', function () {
  it('check --slot=2 with no slot env targets slot 2 devices, app, and ports', function () {
    const r = run(check, ['--slot=2']);
    expect(r.status).not.toBe(2);
    expect(r.out).toContain(SLOT2_ANDROID);
    expect(r.out).toMatch(/CLEAR\s+macos app process io\.invertase\.testing\.s2$/m);
    expect(r.out).toMatch(/CLEAR\s+ios simulator \(RN E2E iOS slot-2\)$/m);
    expect(ports(r.out)).toEqual(expect.arrayContaining([14010, 14110, 14210]));
    expect(ports(r.out).every(p => p >= 14000 && p < 14300)).toBe(true);
  });

  it('release --slot=2 with no slot env uses the slot-2 identity and rechecks slot 2', function () {
    const r = run(release, ['--slot=2', '--devices']);
    expect(r.status).not.toBe(2);
    expect(r.out).toMatch(/identity: slot-2 .*scope=recorded only/);
    expect(r.out).toContain(SLOT2_ANDROID);
    expect(r.out).not.toContain('serial=emulator-5554');
    expect(r.kills).toEqual([]);
  });

  it('keeps a caller RNFB_E2E_PLATFORM=android narrowing across the re-apply', function () {
    const r = run(check, ['--slot=2'], { RNFB_E2E_PLATFORM: 'android' });
    expect(r.status).not.toBe(2);
    expect(r.out).toMatch(/platforms: android\s*$/m);
    expect(r.out).toContain(SLOT2_ANDROID);
    expect(ports(r.out)).toContain(14010);
    expect(ports(r.out).every(p => p >= 14000 && p < 14100)).toBe(true);
    expect(r.out).not.toMatch(/macos app process/);
  });

  it('lets --platform= win over a caller RNFB_E2E_PLATFORM', function () {
    const r = run(check, ['--slot=2', '--platform=ios'], { RNFB_E2E_PLATFORM: 'android' });
    expect(r.status).not.toBe(2);
    expect(r.out).toMatch(/platforms: ios\s*$/m);
    expect(r.out).toMatch(/CLEAR\s+ios simulator \(RN E2E iOS slot-2\)$/m);
  });

  it('accepts --slot=N that matches the loaded slot env', function () {
    const r = run(check, ['--slot=2'], { RNFB_E2E_SLOT: '2' });
    expect(r.status).not.toBe(2);
    expect(r.out).toContain(SLOT2_ANDROID);
  });

  it.each([
    ['check', check, ['--slot=2']],
    ['release', release, ['--slot=2', '--devices']],
  ])(
    '%s refuses --slot=2 when slot 1 env is loaded, before touching anything',
    function (_name, script, args) {
      const r = run(script, args, { RNFB_E2E_SLOT: '1' });
      expect(r.status).toBe(2);
      expect(r.out).toContain('--slot=2 does not match the loaded slot 1 env');
      expect(r.kills).toEqual([]);
    },
  );

  it('leaves --all-slots unscoped (no slot env applied)', function () {
    const r = run(check, ['--slot=2', '--all-slots']);
    expect(r.out).toContain('android serial=emulator-5554 avd=TestingAVD');
  });
});

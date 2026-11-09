const { execFileSync, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const { processStartTime } = require(path.join(repoRoot, 'tests/e2e/runRecord'));

function checkIos(bootedJson, args) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-ios-sim-check-serial-'));
  fs.writeFileSync(
    path.join(dir, 'xcrun'),
    `#!/bin/bash
if [[ "$*" == "simctl list devices booted -j" ]]; then
  printf '%s\\n' '${bootedJson}'
  exit 0
fi
exit 92
`,
  );
  fs.writeFileSync(path.join(dir, 'lsof'), '#!/bin/bash\nexit 1\n');
  fs.chmodSync(path.join(dir, 'xcrun'), 0o755);
  fs.chmodSync(path.join(dir, 'lsof'), 0o755);
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
  env.PATH = `${dir}:${env.PATH}`;
  env.RNFB_E2E_RUN_RECORD_DIR = path.join(dir, 'rec');
  try {
    return {
      status: 0,
      output: execFileSync(
        '/bin/bash',
        [path.join(repoRoot, 'scripts/e2e/check-e2e-resources.sh'), ...args],
        { encoding: 'utf8', cwd: repoRoot, env, stdio: ['pipe', 'pipe', 'pipe'] },
      ),
    };
  } catch (error) {
    return { status: error.status, output: `${error.stdout || ''}${error.stderr || ''}` };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('e2e device setup default count', function () {
  it('create-android-avds.sh defaults count=1 and loops i < COUNT', function () {
    const src = fs.readFileSync(path.join(repoRoot, 'scripts/e2e/create-android-avds.sh'), 'utf8');
    expect(src).toMatch(/COUNT="\$\{1:-1\}"/);
    expect(src).toMatch(/for \(\(i = 0; i < COUNT; i\+\+\)\)/);
    expect(src).not.toMatch(/seq 0 "\$COUNT"/);
  });

  it('create-ios-simulators.sh defaults count=1 and loops i < COUNT', function () {
    const src = fs.readFileSync(
      path.join(repoRoot, 'scripts/e2e/create-ios-simulators.sh'),
      'utf8',
    );
    expect(src).toMatch(/COUNT="\$\{1:-1\}"/);
    expect(src).toMatch(/for \(\(i = 0; i < COUNT; i\+\+\)\)/);
  });

  it('rejects unsupported setup counts before invoking device runners', function () {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-device-count-'));
    const actionLog = path.join(dir, 'actions.log');
    fs.writeFileSync(
      path.join(dir, 'xcrun'),
      `#!/bin/bash
printf 'xcrun %s\\n' "$*" >> "$RNFB_ACTION_LOG"
exit 90
`,
    );
    fs.chmodSync(path.join(dir, 'xcrun'), 0o755);
    const androidHome = path.join(dir, 'sdk');
    fs.mkdirSync(path.join(androidHome, 'emulator'), { recursive: true });
    fs.writeFileSync(
      path.join(androidHome, 'emulator', 'emulator'),
      `#!/bin/bash
printf 'emulator %s\\n' "$*" >> "$RNFB_ACTION_LOG"
exit 90
`,
    );
    fs.chmodSync(path.join(androidHome, 'emulator', 'emulator'), 0o755);
    const env = {
      ...process.env,
      PATH: `${dir}:${process.env.PATH}`,
      ANDROID_HOME: androidHome,
      RNFB_ACTION_LOG: actionLog,
    };
    const scripts = ['create-ios-simulators.sh', 'create-android-avds.sh'];

    try {
      for (const script of scripts) {
        for (const count of ['9', '99', '0', '-1', '1.5', 'foo', '08']) {
          let result;
          try {
            result = {
              status: 0,
              stdout: execFileSync(
                '/bin/bash',
                [path.join(repoRoot, 'scripts/e2e', script), count],
                {
                  encoding: 'utf8',
                  cwd: repoRoot,
                  env,
                  stdio: ['pipe', 'pipe', 'pipe'],
                },
              ),
              stderr: '',
            };
          } catch (error) {
            result = {
              status: error.status,
              stdout: error.stdout || '',
              stderr: error.stderr || '',
            };
          }
          expect(result.status).toBe(2);
          expect(result.stdout).toBe('');
          expect(result.stderr).toContain(`count must be an integer 1..8 (got ${count})`);
        }
      }
      expect(fs.existsSync(actionLog)).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reuses exact neutral bases and only creates missing neutral bases', function () {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-ios-sim-setup-'));
    const xcrun = path.join(dir, 'xcrun');
    const log = path.join(dir, 'xcrun.log');
    fs.writeFileSync(
      xcrun,
      `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$RNFB_XCRUN_LOG"
case "$*" in
  "simctl list runtimes available -j")
    printf '%s\\n' '{"runtimes":[{"isAvailable":true,"platform":"iOS","version":"27.0","name":"iOS 27.0","identifier":"runtime-ios-27"}]}'
    ;;
  "simctl list devices available")
    # Text listing used by rnfb_resolve_ios_sim_udid_for_name (pinned runtime section).
    printf '%s\\n' '-- iOS 27.0 --'
    printf '%s\\n' '    RN E2E iOS slot-0 (AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA) (Shutdown)'
    printf '%s\\n' '    RNFB E2E iOS slot-0 (BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB) (Shutdown)'
    ;;
  "simctl create RN E2E iOS slot-1 iPhone 17 runtime-ios-27")
    printf '%s\\n' created-slot-1
    ;;
  *)
    exit 91
    ;;
esac
`,
    );
    fs.chmodSync(xcrun, 0o755);

    try {
      const output = execFileSync(
        'bash',
        [path.join(repoRoot, 'scripts/e2e/create-ios-simulators.sh'), '2'],
        {
          encoding: 'utf8',
          cwd: repoRoot,
          env: {
            ...process.env,
            PATH: `${dir}:${process.env.PATH}`,
            RNFB_XCRUN_LOG: log,
          },
        },
      );
      const calls = fs.readFileSync(log, 'utf8');
      expect(output).toMatch(/RN E2E iOS slot-0 exists udid=AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA/);
      expect(calls).toMatch(/^simctl create RN E2E iOS slot-1 iPhone 17 runtime-ios-27$/m);
      expect(calls).not.toMatch(/simctl create RN E2E iOS slot-0/);
      expect(calls).not.toMatch(/-Detox/);
      expect(calls).not.toMatch(/\b(delete|erase|rename|shutdown)\b/);
      expect(calls).not.toMatch(/simctl create RNFB E2E iOS/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('release shuts down only the simulator the selected slot recorded', async function () {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-ios-sim-release-'));
    const log = path.join(dir, 'xcrun.log');
    fs.writeFileSync(
      path.join(dir, 'xcrun'),
      `#!/bin/bash
if [[ "$*" == "simctl list devices booted -j" ]]; then
  booted='{"devices":{}}'
  printf '%s\\n' "\${RNFB_FAKE_SIMCTL_JSON:-$booted}"
  exit 0
fi
printf '%s\\n' "$*" >> "$RNFB_XCRUN_LOG"
`,
    );
    fs.writeFileSync(
      path.join(dir, 'bash'),
      `#!/bin/bash
if [[ "$1" == *"/check-e2e-resources.sh" ]]; then
  exit 0
fi
exec /bin/bash "$@"
`,
    );
    fs.writeFileSync(path.join(dir, 'sleep'), '#!/bin/bash\nexit 0\n');
    const realLsof = execFileSync('/bin/sh', ['-c', 'command -v lsof'], {
      encoding: 'utf8',
    }).trim();
    // No listeners, but the real cwd lookup (`lsof -a -p <pid> -d cwd`).
    fs.writeFileSync(
      path.join(dir, 'lsof'),
      `#!/bin/bash\n[[ "$1" == "-a" ]] && exec ${realLsof} "$@"\nexit 1\n`,
    );
    for (const command of ['xcrun', 'bash', 'sleep', 'lsof']) {
      fs.chmodSync(path.join(dir, command), 0o755);
    }
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
    env.PATH = `${dir}:${env.PATH}`;
    env.TMPDIR = dir;
    env.RNFB_XCRUN_LOG = log;
    env.RNFB_E2E_RUN_RECORD_DIR = path.join(dir, 'rec');
    const release = (...extra) =>
      execFileSync(
        '/bin/bash',
        [
          path.join(repoRoot, 'scripts/e2e/release-e2e-resources.sh'),
          '--platform=ios',
          '--slot=1',
          '--only=ios-sims',
          ...extra,
        ],
        { encoding: 'utf8', cwd: repoRoot, env },
      );

    // Stands in for the recorded launchd_sim instance of UDID-1.
    const token = spawn(
      process.execPath,
      [
        '-e',
        'setTimeout(() => {}, 60000)',
        'launchd_sim',
        '/sims/CoreSimulator/Devices/UDID-1/data/var/run/launchd_bootstrap.plist',
      ],
      { stdio: 'ignore' },
    );
    const tokenExited = new Promise(resolve => token.once('exit', resolve));
    let foreign;
    let own;

    try {
      release();
      expect(fs.existsSync(log)).toBe(false);

      const slotRecord = path.join(dir, 'rec', 'slot-1');
      const entry = path.join(slotRecord, 'ios-sim-UDID-1');
      fs.mkdirSync(slotRecord, { recursive: true });
      fs.writeFileSync(
        entry,
        `ios-sim\tUDID-1\tRN E2E iOS slot-1\t${token.pid}\t${processStartTime(token.pid)}\n`,
      );
      release();
      expect(fs.readFileSync(log, 'utf8').trim().split('\n')).toEqual(['simctl shutdown UDID-1']);
      // Kept while the recorded instance is still alive (a later round can retry).
      expect(fs.existsSync(entry)).toBe(true);

      token.kill('SIGKILL');
      await tokenExited;
      fs.rmSync(log);
      release();
      // That instance is gone (e.g. rebooted by another owner): no shutdown, entry pruned.
      expect(fs.existsSync(log)).toBe(false);
      expect(fs.existsSync(entry)).toBe(false);

      // --include-unrecorded: nothing booted, nothing shut down.
      release('--include-unrecorded');
      expect(fs.existsSync(log)).toBe(false);

      // The identity's simulator booted by another owner (launchd_sim outside this
      // checkout, as every real launchd_sim is): left running.
      env.RNFB_FAKE_SIMCTL_JSON = JSON.stringify({
        devices: { runtime: [{ name: 'RN E2E iOS slot-1', udid: 'UDID-2', state: 'Booted' }] },
      });
      foreign = spawn(
        process.execPath,
        [
          '-e',
          'setTimeout(() => {}, 60000)',
          'launchd_sim',
          '/sims/CoreSimulator/Devices/UDID-2/data/var/run/launchd_bootstrap.plist',
        ],
        { stdio: 'ignore', cwd: os.tmpdir() },
      );
      release('--include-unrecorded');
      expect(fs.existsSync(log)).toBe(false);

      // Traceable to this checkout (launchd_sim cwd inside it): shut down by UDID.
      env.RNFB_FAKE_SIMCTL_JSON = JSON.stringify({
        devices: { runtime: [{ name: 'RN E2E iOS slot-1', udid: 'UDID-3', state: 'Booted' }] },
      });
      own = spawn(
        process.execPath,
        [
          '-e',
          'setTimeout(() => {}, 60000)',
          'launchd_sim',
          '/sims/CoreSimulator/Devices/UDID-3/data/var/run/launchd_bootstrap.plist',
        ],
        { stdio: 'ignore', cwd: repoRoot },
      );
      release('--include-unrecorded');
      expect(fs.readFileSync(log, 'utf8').trim().split('\n')).toEqual(['simctl shutdown UDID-3']);
    } finally {
      token.kill('SIGKILL');
      foreign?.kill('SIGKILL');
      own?.kill('SIGKILL');
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('caps all-slot release device actions at slot 7 when configured max is 99', function () {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-all-slot-release-'));
    const log = path.join(dir, 'actions.log');
    fs.writeFileSync(
      path.join(dir, 'adb'),
      `#!/bin/bash
printf 'adb %s\\n' "$*" >> "$RNFB_ACTION_LOG"
if [[ "$1" == "devices" ]]; then
  printf '%s\\n' 'List of devices attached'
fi
exit 0
`,
    );
    fs.writeFileSync(
      path.join(dir, 'pkill'),
      `#!/bin/bash
printf 'pkill %s\\n' "$*" >> "$RNFB_ACTION_LOG"
exit 0
`,
    );
    fs.writeFileSync(
      path.join(dir, 'bash'),
      `#!/bin/bash
if [[ "$1" == *"/check-e2e-resources.sh" ]]; then
  exit 0
fi
exec /bin/bash "$@"
`,
    );
    fs.writeFileSync(path.join(dir, 'sleep'), '#!/bin/bash\nexit 0\n');
    fs.writeFileSync(path.join(dir, 'lsof'), '#!/bin/bash\nexit 1\n');
    for (const command of ['adb', 'pkill', 'bash', 'sleep', 'lsof']) {
      fs.chmodSync(path.join(dir, command), 0o755);
    }
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
    env.E2E_SLOTTED_MAX = '99';
    env.PATH = `${dir}:${env.PATH}`;
    env.TMPDIR = dir;
    env.RNFB_ACTION_LOG = log;
    env.RNFB_E2E_RUN_RECORD_DIR = path.join(dir, 'rec');

    try {
      execFileSync(
        '/bin/bash',
        [
          path.join(repoRoot, 'scripts/e2e/release-e2e-resources.sh'),
          '--platform=android',
          '--all-slots',
          '--devices',
          '--only=android-emulator',
        ],
        { encoding: 'utf8', cwd: repoRoot, env },
      );
      const calls = fs.readFileSync(log, 'utf8');
      expect(calls).toMatch(/@TestingAVD-7/);
      expect(calls).not.toMatch(/@TestingAVD-8/);
      expect(calls).toMatch(/adb -s emulator-5570 emu kill/);
      expect(calls).not.toMatch(/adb -s emulator-5572 emu kill/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('check reports a selected slot busy when its exact neutral base is booted', function () {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-ios-sim-check-'));
    fs.writeFileSync(
      path.join(dir, 'xcrun'),
      `#!/bin/bash
if [[ "$*" == "simctl list devices booted -j" ]]; then
  printf '%s\\n' '{"devices":{"runtime":[{"name":"RN E2E iOS slot-1","state":"Booted"}]}}'
  exit 0
fi
exit 92
`,
    );
    fs.writeFileSync(path.join(dir, 'lsof'), '#!/bin/bash\nexit 1\n');
    fs.chmodSync(path.join(dir, 'xcrun'), 0o755);
    fs.chmodSync(path.join(dir, 'lsof'), 0o755);
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
    env.PATH = `${dir}:${env.PATH}`;

    try {
      let status = 0;
      let output = '';
      try {
        output = execFileSync(
          '/bin/bash',
          [path.join(repoRoot, 'scripts/e2e/check-e2e-resources.sh'), '--platform=ios', '--slot=1'],
          { encoding: 'utf8', cwd: repoRoot, env, stdio: ['pipe', 'pipe', 'pipe'] },
        );
      } catch (error) {
        status = error.status;
        output = `${error.stdout || ''}${error.stderr || ''}`;
      }
      expect(status).toBe(1);
      expect(output).toMatch(/BUSY\s+ios simulator booted \(RN E2E iOS slot-1/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('check CLEAR names the probed slot base, not serial iPhone 17', function () {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-ios-sim-check-clear-'));
    fs.writeFileSync(
      path.join(dir, 'xcrun'),
      `#!/bin/bash
if [[ "$*" == "simctl list devices booted -j" ]]; then
  printf '%s\\n' '{"devices":{}}'
  exit 0
fi
exit 92
`,
    );
    fs.writeFileSync(path.join(dir, 'lsof'), '#!/bin/bash\nexit 1\n');
    fs.chmodSync(path.join(dir, 'xcrun'), 0o755);
    fs.chmodSync(path.join(dir, 'lsof'), 0o755);
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
    env.PATH = `${dir}:${env.PATH}`;

    try {
      const output = execFileSync(
        '/bin/bash',
        [path.join(repoRoot, 'scripts/e2e/check-e2e-resources.sh'), '--platform=ios', '--slot=1'],
        { encoding: 'utf8', cwd: repoRoot, env, stdio: ['pipe', 'pipe', 'pipe'] },
      );
      expect(output).toMatch(/CLEAR\s+ios simulator \(RN E2E iOS slot-1\)/);
      expect(output).not.toMatch(/CLEAR\s+ios simulator \(iPhone 17\)/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('serial iOS check fails only on its own iPhone 17 and reports other booted simulators as INFO', function () {
    const other = checkIos(
      '{"devices":{"rt":[{"udid":"OTHER-1","name":"iPhone 18 Pro","state":"Booted"}]}}',
      ['--platform=ios'],
    );
    expect(other.status).toBe(0);
    expect(other.output).toMatch(
      /INFO\s+ios simulator iPhone 18 Pro \(OTHER-1\) booted — not this identity's device/,
    );
    expect(other.output).not.toMatch(/BUSY\s+ios simulator/);

    const own = checkIos(
      '{"devices":{"rt":[{"udid":"SERIAL-1","name":"iPhone 17","state":"Booted"}]}}',
      ['--platform=ios'],
    );
    expect(own.status).toBe(1);
    expect(own.output).toMatch(
      /BUSY\s+ios simulator booted \(iPhone 17 SERIAL-1\) owner=unrecorded/,
    );
  });
});

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');

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
    printf '%s\\n' '{"runtimes":[{"isAvailable":true,"platform":"iOS","version":"26.0","identifier":"runtime-ios-26"}]}'
    ;;
  "simctl list devices available -j")
    printf '%s\\n' '{"devices":{"runtime-ios-26":[
      {"name":"RN E2E iOS slot-0","isAvailable":true},
      {"name":"RNFB E2E iOS slot-0","isAvailable":true}
    ]}}'
    ;;
  "simctl create RN E2E iOS slot-1 iPhone 17 runtime-ios-26")
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
      expect(output).toMatch(/RN E2E iOS slot-0 exists/);
      expect(calls).toMatch(/^simctl create RN E2E iOS slot-1 iPhone 17 runtime-ios-26$/m);
      expect(calls).not.toMatch(/simctl create RN E2E iOS slot-0/);
      expect(calls).not.toMatch(/-Detox/);
      expect(calls).not.toMatch(/\b(delete|erase|rename|shutdown)\b/);
      expect(calls).not.toMatch(/simctl create RNFB E2E iOS/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('release shuts down only the selected exact neutral base', function () {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-ios-sim-release-'));
    const log = path.join(dir, 'xcrun.log');
    fs.writeFileSync(
      path.join(dir, 'xcrun'),
      `#!/bin/bash
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
    fs.writeFileSync(path.join(dir, 'lsof'), '#!/bin/bash\nexit 1\n');
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
    env.RNFB_XCRUN_LOG = log;

    try {
      execFileSync(
        '/bin/bash',
        [
          path.join(repoRoot, 'scripts/e2e/release-e2e-resources.sh'),
          '--platform=ios',
          '--slot=1',
          '--only=ios-sims',
        ],
        { encoding: 'utf8', cwd: repoRoot, env },
      );
      expect(fs.readFileSync(log, 'utf8').trim().split('\n')).toEqual([
        'simctl shutdown RN E2E iOS slot-1',
      ]);
    } finally {
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
    env.RNFB_ACTION_LOG = log;

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
});

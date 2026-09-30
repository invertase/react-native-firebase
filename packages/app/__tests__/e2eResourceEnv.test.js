const { execFileSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const lib = path.join(repoRoot, 'scripts/e2e/lib/e2e-resource-env.sh');

function cleanEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (
      key.startsWith('RNFB_') ||
      key.startsWith('JET_') ||
      key === 'RCT_METRO_PORT' ||
      key === 'ANDROID_SERIAL' ||
      key === 'AVD_NAME' ||
      key === 'E2E_PLATFORM_OVERRIDE' ||
      key === 'E2E_MELLIFERA_FLAG' ||
      key === 'E2E_SLOTTED_MAX' ||
      key === 'E2E_MACOS_SLOTTED_MAX' ||
      key === 'E2E_ALL_SLOTS' ||
      key === 'E2E_SLOT_OVERRIDE'
    ) {
      delete env[key];
    }
  }
  env.E2E_SLOTTED_MAX = '2';
  return env;
}

function bashSnippet(body, extra = {}) {
  return execFileSync(
    'bash',
    [
      '-c',
      `set -euo pipefail
source ${JSON.stringify(lib)}
${body}`,
    ],
    { encoding: 'utf8', cwd: repoRoot, env: cleanEnv(), ...extra },
  );
}

describe('e2e_validate_platform_name', function () {
  it('accepts android, ios, and macos', function () {
    expect(bashSnippet('e2e_validate_platform_name android && echo OK_ANDROID')).toMatch(
      /OK_ANDROID/,
    );
    expect(bashSnippet('e2e_validate_platform_name ios && echo OK_IOS')).toMatch(/OK_IOS/);
    expect(bashSnippet('e2e_validate_platform_name macos && echo OK_MACOS')).toMatch(/OK_MACOS/);
  });

  it('rejects unknown platform with exit 2', function () {
    let status = 0;
    let err = '';
    try {
      bashSnippet('e2e_validate_platform_name foo');
    } catch (e) {
      status = e.status;
      err = `${e.stderr || ''}${e.stdout || ''}${e.message || ''}`;
    }
    expect(status).toBe(2);
    expect(err).toMatch(/platform must be android\|ios\|macos \(got foo\)/);
  });
});

describe('check-e2e-resources --platform validation', function () {
  it('rejects invalid --platform=foo with exit 2', function () {
    const checkPath = path.join(repoRoot, 'scripts/e2e/check-e2e-resources.sh');
    let status = 0;
    let err = '';
    try {
      execFileSync('bash', [checkPath, '--platform=foo'], {
        encoding: 'utf8',
        cwd: repoRoot,
        env: cleanEnv(),
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (e) {
      status = e.status;
      err = `${e.stderr || ''}${e.stdout || ''}${e.message || ''}`;
    }
    expect(status).toBe(2);
    expect(err).toMatch(/platform must be android\|ios\|macos \(got foo\)/);
  });
});

describe('e2e_slot_env_apply platform validation', function () {
  it('rejects unknown platform with exit 1', function () {
    const slotLib = path.join(repoRoot, 'scripts/e2e/lib/e2e-slot-env.sh');
    let status = 0;
    let err = '';
    try {
      execFileSync(
        'bash',
        [
          '-c',
          `set -euo pipefail
source ${JSON.stringify(slotLib)}
e2e_slot_env_apply foo 0
`,
        ],
        { encoding: 'utf8', cwd: repoRoot, env: cleanEnv(), stdio: ['pipe', 'pipe', 'pipe'] },
      );
    } catch (e) {
      status = e.status;
      err = `${e.stderr || ''}${e.stdout || ''}${e.message || ''}`;
    }
    expect(status).toBe(1);
    expect(err).toMatch(/platform must be android\|ios\|macos \(got foo\)/);
  });
});

describe('E2E_SLOTTED_MAX default', function () {
  it('defaults to 7 aligned with Detox slots 0-7', function () {
    const slotLib = path.join(repoRoot, 'scripts/e2e/lib/e2e-slot-env.sh');
    const env = { ...process.env };
    delete env.E2E_SLOTTED_MAX;
    delete env.E2E_MACOS_SLOTTED_MAX;
    const out = execFileSync(
      'bash',
      [
        '-c',
        `set -euo pipefail
source ${JSON.stringify(slotLib)}
echo "$E2E_SLOTTED_MAX"
`,
      ],
      { encoding: 'utf8', cwd: repoRoot, env },
    );
    expect(out.trim()).toBe('7');
  });
});

describe('unscoped e2e_collect_targets leftover slots', function () {
  it('serial default does not include leftover slotted hubs', function () {
    const out = bashSnippet(`
e2e_collect_targets
e2e_print_collected_ports
`);
    expect(out).not.toMatch(/emulator-hub:android-slot1/);
    expect(out).not.toMatch(/metro:ios-slot2/);
    expect(out).toMatch(/^4400 emulator-hub:global$/m);
  });

  it('includes android slot 1 hub 13005 and ios slot 2 metro 14107 with --all-slots', function () {
    const env = cleanEnv();
    env.E2E_ALL_SLOTS = '1';
    const out = execFileSync(
      'bash',
      [
        '-c',
        `set -euo pipefail
source ${JSON.stringify(lib)}
e2e_collect_targets
e2e_print_collected_ports
`,
      ],
      { encoding: 'utf8', cwd: repoRoot, env },
    );
    expect(out).toMatch(/^13005 emulator-hub:android-slot1$/m);
    expect(out).toMatch(/^14107 metro:ios-slot2$/m);
    expect(out).toMatch(/^4400 emulator-hub:global$/m);
  });

  it('sweeps slot 7 and excludes slot 8 at the shared default ceiling', function () {
    const env = cleanEnv();
    env.E2E_ALL_SLOTS = '1';
    env.E2E_SLOTTED_MAX = '7';
    const out = execFileSync(
      'bash',
      [
        '-c',
        `set -euo pipefail
source ${JSON.stringify(lib)}
e2e_collect_targets
e2e_print_collected_ports
`,
      ],
      { encoding: 'utf8', cwd: repoRoot, env },
    );
    expect(out).toMatch(/^19005 emulator-hub:android-slot7$/m);
    expect(out).toMatch(/^19107 metro:ios-slot7$/m);
    expect(out).not.toMatch(/android-slot8|ios-slot8|macos-slot8/);
  });

  it('caps a configured max of 99 at slot 7 for every all-slot port sweep', function () {
    const env = cleanEnv();
    env.E2E_ALL_SLOTS = '1';
    env.E2E_SLOTTED_MAX = '99';
    const out = execFileSync(
      'bash',
      [
        '-c',
        `set -euo pipefail
source ${JSON.stringify(lib)}
e2e_collect_targets
e2e_print_collected_ports
`,
      ],
      { encoding: 'utf8', cwd: repoRoot, env },
    );
    expect(out).toMatch(/^19005 emulator-hub:android-slot7$/m);
    expect(out).toMatch(/^19107 metro:ios-slot7$/m);
    expect(out).not.toMatch(/android-slot8|ios-slot8|macos-slot8/);
  });

  it('honors a lower max for every all-slot port sweep', function () {
    const env = cleanEnv();
    env.E2E_ALL_SLOTS = '1';
    env.E2E_SLOTTED_MAX = '2';
    const out = execFileSync(
      'bash',
      [
        '-c',
        `set -euo pipefail
source ${JSON.stringify(lib)}
e2e_collect_targets
e2e_print_collected_ports
`,
      ],
      { encoding: 'utf8', cwd: repoRoot, env },
    );
    expect(out).toMatch(/android-slot2|ios-slot2|macos-slot2/);
    expect(out).not.toMatch(/android-slot3|ios-slot3|macos-slot3/);
  });

  it('does not include leftover slotted hubs when slot env is loaded', function () {
    const env = cleanEnv();
    env.RNFB_E2E_SLOT = '1';
    env.RNFB_E2E_HOST_SLOT = '1';
    const out = execFileSync(
      'bash',
      [
        '-c',
        `set -euo pipefail
source ${JSON.stringify(lib)}
e2e_collect_targets
e2e_print_collected_ports
`,
      ],
      { encoding: 'utf8', cwd: repoRoot, env },
    );
    expect(out).not.toMatch(/emulator-hub:android-slot1/);
    expect(out).toMatch(/^4400 emulator-hub:global$/m);
  });
});

describe('e2e_qemu_avd_pgrep_pattern', function () {
  it('does not match @TestingAVD-0 when looking for TestingAVD', function () {
    const out = bashSnippet(`
pat=$(e2e_qemu_avd_pgrep_pattern TestingAVD)
serial='/sdk/qemu-system-aarch64 -avd TestingAVD @TestingAVD'
slot0='/sdk/qemu-system-aarch64 -avd TestingAVD-0 @TestingAVD-0'
[[ "$serial" =~ $pat ]] && echo MATCH_SERIAL || echo MISS_SERIAL
[[ "$slot0" =~ $pat ]] && echo MATCH_SLOT0 || echo MISS_SLOT0
echo "$pat"
`);
    expect(out).toMatch(/MATCH_SERIAL/);
    expect(out).toMatch(/MISS_SLOT0/);
    expect(out).toContain('qemu-system.*@TestingAVD([[:space:]]|$)');
  });
});

describe('unscoped device names', function () {
  it('lists only serial TestingAVD / iPhone 17 by default', function () {
    const avds = bashSnippet('e2e_android_avd_names_for_release');
    expect(avds).toMatch(/^TestingAVD$/m);
    expect(avds).not.toMatch(/^TestingAVD-0$/m);
    const sims = bashSnippet('e2e_ios_simulator_names_for_release');
    expect(sims).toMatch(/^iPhone 17$/m);
    expect(sims).not.toMatch(/^RN E2E iOS slot-0$/m);
  });

  it('lists serial plus every exact neutral base through MAX with --all-slots', function () {
    const env = cleanEnv();
    env.E2E_ALL_SLOTS = '1';
    env.E2E_SLOTTED_MAX = '7';
    const avds = execFileSync(
      'bash',
      [
        '-c',
        `set -euo pipefail
source ${JSON.stringify(lib)}
e2e_android_avd_names_for_release
`,
      ],
      { encoding: 'utf8', cwd: repoRoot, env },
    );
    expect(avds).toMatch(/^TestingAVD$/m);
    expect(avds).toMatch(/^TestingAVD-0$/m);
    expect(avds).toMatch(/^TestingAVD-7$/m);
    expect(avds).not.toMatch(/^TestingAVD-8$/m);
    const sims = execFileSync(
      'bash',
      [
        '-c',
        `set -euo pipefail
source ${JSON.stringify(lib)}
e2e_ios_simulator_names_for_release
`,
      ],
      { encoding: 'utf8', cwd: repoRoot, env },
    );
    expect(sims).toMatch(/^iPhone 17$/m);
    expect(sims).toMatch(/^RN E2E iOS slot-0$/m);
    expect(sims).toMatch(/^RN E2E iOS slot-7$/m);
    expect(sims).not.toMatch(/^RN E2E iOS slot-8$/m);
    expect(sims).not.toMatch(/-Detox$/m);
    expect(sims).not.toMatch(/^RNFB E2E iOS slot-/m);
  });

  it('caps configured 99 and honors lower max across Android, iOS, and macOS names', function () {
    const renderNames = max => {
      const env = cleanEnv();
      env.E2E_ALL_SLOTS = '1';
      env.E2E_SLOTTED_MAX = max;
      return execFileSync(
        'bash',
        [
          '-c',
          `set -euo pipefail
source ${JSON.stringify(lib)}
e2e_android_avd_names_for_release
e2e_ios_simulator_names_for_release
e2e_macos_process_names_for_probe
`,
        ],
        { encoding: 'utf8', cwd: repoRoot, env },
      );
    };

    const capped = renderNames('99');
    expect(capped).toMatch(/^TestingAVD-7$/m);
    expect(capped).toMatch(/^RN E2E iOS slot-7$/m);
    expect(capped).toMatch(/^io\.invertase\.testing\.s7$/m);
    expect(capped).not.toMatch(/TestingAVD-8|slot-8|\.s8$/m);

    const lowered = renderNames('2');
    expect(lowered).toMatch(/^TestingAVD-2$/m);
    expect(lowered).toMatch(/^RN E2E iOS slot-2$/m);
    expect(lowered).toMatch(/^io\.invertase\.testing\.s2$/m);
    expect(lowered).not.toMatch(/TestingAVD-3|slot-3|\.s3$/m);
  });

  it('targets only the selected exact neutral base', function () {
    const env = cleanEnv();
    env.E2E_SLOT_OVERRIDE = '1';
    const sims = execFileSync(
      'bash',
      [
        '-c',
        `set -euo pipefail
source ${JSON.stringify(lib)}
e2e_ios_simulator_names_for_release
`,
      ],
      { encoding: 'utf8', cwd: repoRoot, env },
    );
    expect(sims.trim().split('\n')).toEqual(['RN E2E iOS slot-1']);
  });
});

describe('exact iOS simulator boot checks', function () {
  it('distinguishes a neutral base from suffixed and substring-collision names', function () {
    const out = bashSnippet(`
xcrun() {
  cat <<'JSON'
{"devices":{"runtime":[
  {"name":"RN E2E iOS slot-1-other","state":"Booted"},
  {"name":"RN E2E iOS slot-10","state":"Booted"}
]}}
JSON
}
e2e_ios_sim_booted 'RN E2E iOS slot-1' && echo BASE_BUSY || echo BASE_CLEAR
`);
    expect(out).toMatch(/^BASE_CLEAR$/m);
    expect(out).not.toMatch(/^BASE_BUSY$/m);
  });
});

describe('e2e_lsof_cache', function () {
  it('e2e_port_listening and e2e_listener_pids read one lsof snapshot', function () {
    const out = bashSnippet(`
E2E_LSOF_CACHE_LOADED=1
E2E_LSOF_CACHE_LINES='node    123 user   23u  IPv4 0x0      0t0  TCP *:8081 (LISTEN)
java    456 user   44u  IPv4 0x0      0t0  TCP 127.0.0.1:13005 (LISTEN)'
e2e_port_listening 8081 && echo YES8081
e2e_port_listening 8082 && echo YES8082 || echo NO8082
e2e_port_listening 13005 && echo YES13005
e2e_port_listening 130050 && echo BAD130050 || echo NO130050
e2e_listener_pids 8081
e2e_listener_pids 13005
`);
    expect(out).toMatch(/YES8081/);
    expect(out).toMatch(/NO8082/);
    expect(out).toMatch(/YES13005/);
    expect(out).toMatch(/NO130050/);
    expect(out).toMatch(/^123$/m);
    expect(out).toMatch(/^456$/m);
  });
});

describe('e2e_abort_if_emulator_suite_ports_busy', function () {
  it('exits 1 and names the busy hub when a mock listener is bound', function () {
    let err = '';
    try {
      bashSnippet(
        `
e2e_port_listening() { [[ "$1" == "13005" ]]; }
e2e_listener_pids() { echo 4242; }
e2e_abort_if_emulator_suite_ports_busy 13000 13001 13002 13003 13004 13005 13006
`,
        { stdio: ['pipe', 'pipe', 'pipe'] },
      );
    } catch (e) {
      err = `${e.stderr || ''}${e.stdout || ''}${e.message || ''}`;
    }
    expect(err).toMatch(/hub :13005/);
    expect(err).toMatch(/pids=4242/);
    expect(err).toMatch(/zero flake budget/);
  });

  it('returns success when no suite ports are listening', function () {
    const out = bashSnippet(`
e2e_port_listening() { return 1; }
e2e_abort_if_emulator_suite_ports_busy 13000 13001 13002 13003 13004 13005 13006
echo FREE
`);
    expect(out.trim()).toBe('FREE');
  });
});

describe('e2e_collect_targets --slot=N', function () {
  it('--slot=1 without env collects slot-1 formula hub 13005 not leftover slot-2 metro', function () {
    const env = cleanEnv();
    env.E2E_SLOT_OVERRIDE = '1';
    const out = execFileSync(
      'bash',
      [
        '-c',
        `set -euo pipefail
source ${JSON.stringify(lib)}
e2e_collect_targets
e2e_print_collected_ports
`,
      ],
      { encoding: 'utf8', cwd: repoRoot, env },
    );
    expect(out).toMatch(/^13005 emulator-hub:android-slot1$/m);
    expect(out).not.toMatch(/metro:ios-slot2/);
    expect(out).not.toMatch(/^4400 emulator-hub:global$/m);
  });

  it('canonical check and release reject invalid selectors before output or actions', function () {
    const fs = require('fs');
    const os = require('os');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-slot-selector-'));
    const actionLog = path.join(dir, 'actions.log');
    for (const command of ['xcrun', 'lsof', 'adb', 'pgrep', 'pkill', 'killall', 'sleep']) {
      fs.writeFileSync(
        path.join(dir, command),
        `#!/bin/bash
printf '%s %s\\n' ${JSON.stringify(command)} "$*" >> "$RNFB_ACTION_LOG"
exit 0
`,
      );
      fs.chmodSync(path.join(dir, command), 0o755);
    }
    const env = cleanEnv();
    env.E2E_SLOTTED_MAX = '99';
    env.PATH = `${dir}:${env.PATH || '/usr/bin:/bin'}`;
    env.RNFB_ACTION_LOG = actionLog;
    const scripts = ['check-e2e-resources.sh', 'release-e2e-resources.sh'];

    try {
      for (const script of scripts) {
        for (const { max, slot, expectedMax } of [
          { max: '99', slot: '8', expectedMax: '7' },
          { max: '99', slot: '99', expectedMax: '7' },
          { max: '99', slot: '-1', expectedMax: '7' },
          { max: '99', slot: '1.5', expectedMax: '7' },
          { max: '99', slot: 'foo', expectedMax: '7' },
          { max: '99', slot: '07', expectedMax: '7' },
          { max: '99', slot: '', expectedMax: '7' },
          { max: '2', slot: '3', expectedMax: '2' },
        ]) {
          env.E2E_SLOTTED_MAX = max;
          let result;
          try {
            result = {
              status: 0,
              stdout: execFileSync(
                '/bin/bash',
                [path.join(repoRoot, 'scripts/e2e', script), `--slot=${slot}`],
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
          expect(result.status).toBe(1);
          expect(result.stdout).toBe('');
          expect(result.stderr).toContain(`slot must be an integer 0..${expectedMax}`);
        }
      }
      expect(fs.existsSync(actionLog)).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('adb stray emulator serials (UNI-adb-leftover)', function () {
  it('treats emulator-16222 as stray and keeps 5554/5556 allocated', function () {
    const out = bashSnippet(`
e2e_adb_emulator_serials() { printf '%s\\n' emulator-16222 emulator-5554 emulator-5556; }
e2e_android_console_port_allocated 5554 && echo ALLOC_5554
e2e_android_console_port_allocated 5556 && echo ALLOC_5556
e2e_android_console_port_allocated 16222 && echo ALLOC_16222 || echo STRAY_PORT_16222
e2e_adb_stray_emulator_serials
`);
    expect(out).toMatch(/ALLOC_5554/);
    expect(out).toMatch(/ALLOC_5556/);
    expect(out).toMatch(/STRAY_PORT_16222/);
    expect(out).toMatch(/^emulator-16222$/m);
    expect(out).not.toMatch(/^emulator-5554$/m);
    expect(out).not.toMatch(/^emulator-5556$/m);
  });

  it('check --services is BUSY when adb lists a FreePortFinder serial (negative of expected-serial-only probes)', function () {
    const fs = require('fs');
    const os = require('os');
    const checkPath = path.join(repoRoot, 'scripts/e2e/check-e2e-resources.sh');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-fake-adb-'));
    const adb = path.join(dir, 'adb');
    fs.writeFileSync(
      adb,
      `#!/bin/bash
if [[ "$1" == "devices" ]]; then
  printf '%s\\n' 'List of devices attached' 'emulator-16222\tdevice' 'emulator-5554\tdevice'
  exit 0
fi
exit 1
`,
    );
    fs.chmodSync(adb, 0o755);
    const env = cleanEnv();
    env.PATH = `${dir}:${env.PATH || '/usr/bin:/bin'}`;
    let status = 0;
    let combined = '';
    try {
      combined = execFileSync('bash', [checkPath, '--services'], {
        encoding: 'utf8',
        cwd: repoRoot,
        env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (e) {
      status = e.status;
      combined = `${e.stdout || ''}${e.stderr || ''}`;
    }
    expect(status).not.toBe(0);
    expect(combined).toMatch(/BUSY\s+android stray emulator serial emulator-16222/);
    expect(combined).not.toMatch(/stray emulator serial emulator-5554/);
  });
});

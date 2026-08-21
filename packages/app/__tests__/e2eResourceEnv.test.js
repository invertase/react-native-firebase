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
      key === 'E2E_MACOS_SLOTTED_MAX'
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

describe('unscoped e2e_collect_targets slotted leftovers', function () {
  it('includes android slot 1 hub 13005 and ios slot 2 metro 14107', function () {
    const out = bashSnippet(`
e2e_collect_targets
e2e_print_collected_ports
`);
    expect(out).toMatch(/^13005 emulator-hub:android-slot1$/m);
    expect(out).toMatch(/^14107 metro:ios-slot2$/m);
    expect(out).toMatch(/^4400 emulator-hub:global$/m);
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
  it('lists TestingAVD plus TestingAVD-0..MAX and iOS slot sims', function () {
    const avds = bashSnippet('e2e_android_avd_names_for_release');
    expect(avds).toMatch(/^TestingAVD$/m);
    expect(avds).toMatch(/^TestingAVD-0$/m);
    expect(avds).toMatch(/^TestingAVD-2$/m);
    const sims = bashSnippet('e2e_ios_simulator_names_for_release');
    expect(sims).toMatch(/^iPhone 17$/m);
    expect(sims).toMatch(/^RNFB E2E iOS slot-0$/m);
    expect(sims).toMatch(/^RNFB E2E iOS slot-2$/m);
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

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const scriptPath = path.join(repoRoot, '.github/workflows/scripts/start-firebase-emulator.sh');

function bashSnippet(body) {
  return execFileSync(
    'bash',
    [
      '-c',
      `set -euo pipefail
${body}`,
    ],
    { encoding: 'utf8', cwd: repoRoot },
  );
}

describe('start-firebase-emulator.sh ready-then-return contract', function () {
  const src = fs.readFileSync(scriptPath, 'utf8');

  it('backgrounds emulators:start and waits for readiness unless --no-daemon', function () {
    expect(src).toMatch(/emulators:start[\s\S]*&\s*\n\s*EMU_PID=\$!/);
    expect(src).toMatch(/while ! e2e_port_listening "\$FN_PORT"/);
    expect(src).toMatch(/ready functions=:\$\{FN_PORT\}[\s\S]*\nexit 0\s*$/);
    expect(src).toMatch(/--no-daemon/);
    expect(src).not.toMatch(/localhost:8080/);

    const out = bashSnippet(`
src=$(cat ${JSON.stringify(scriptPath)})
start_line=$(grep -n 'emulators:start' <<<"\$src" | head -1 | cut -d: -f1)
wait_line=$(grep -n 'e2e_port_listening "\$FN_PORT"' <<<"\$src" | head -1 | cut -d: -f1)
echo "start=\$start_line wait=\$wait_line"
test "\$start_line" -lt "\$wait_line"
tail -n 3 ${JSON.stringify(scriptPath)}
`);
    expect(out).toMatch(/start=\d+ wait=\d+/);
    expect(out).toMatch(/ready functions=/);
    expect(out).toMatch(/exit 0/);
  });

  it('readiness waits on Functions port (FN_PORT), not hardcoded :8080', function () {
    expect(src).toMatch(/while ! e2e_port_listening "\$FN_PORT"/);
    expect(src).toMatch(/waiting for Functions :\$\{FN_PORT\}/);
    expect(src).not.toMatch(/curl[^\n]*localhost:8080/);
    const waitBlock = src.match(
      /ready_deadline=[\s\S]*?while ! e2e_port_listening "\$FN_PORT"; do[\s\S]*?done/,
    );
    expect(waitBlock).not.toBeNull();
    expect(waitBlock[0]).not.toMatch(/e2e_port_listening "\$HUB_PORT"/);
    expect(waitBlock[0]).toContain('FN_PORT');
  });

  it('does not register kill_started_suite on EXIT (healthy exit leaves suite up)', function () {
    expect(src).toMatch(/kill_started_suite\(\) \{/);
    expect(src).toMatch(/Never register[\s\S]*on EXIT/);
    expect(src).not.toMatch(/trap\s+['"]?kill_started_suite['"]?\s+EXIT/);
    expect(src).not.toMatch(/trap\s+kill_started_suite\b/);
  });

  it('timeout path calls kill_started_suite before exit 1', function () {
    const timeoutBlock = src.match(
      /if \(\( SECONDS >= ready_deadline \)\); then[\s\S]*?exit 1\s*\n\s*fi/,
    );
    expect(timeoutBlock).not.toBeNull();
    expect(timeoutBlock[0]).toMatch(/kill_started_suite/);
    expect(timeoutBlock[0]).toMatch(/timed out after/);
  });

  it('early firebase-death path calls kill_started_suite before exit 1', function () {
    const deathBlock = src.match(
      /if ! kill -0 "\$\{EMU_PID\}" 2>\/dev\/null; then[\s\S]*?exit 1\s*\n\s*fi/,
    );
    expect(deathBlock).not.toBeNull();
    expect(deathBlock[0]).toMatch(/kill_started_suite/);
    expect(deathBlock[0]).toMatch(/exited before Functions/);
  });

  it('pins aux FS+8/+9/+12 when slotted and aborts if suite ports are busy', function () {
    expect(src).toMatch(/WS_PORT=\$\(\(FS_PORT \+ 8\)\)/);
    expect(src).toMatch(/EVENTARC_PORT=\$\(\(FS_PORT \+ 9\)\)/);
    expect(src).toMatch(/TASKS_PORT=\$\(\(FS_PORT \+ 12\)\)/);
    expect(src).toMatch(/e2e_abort_if_emulator_suite_ports_busy/);
  });

  it('rejects invalid resolved platform with exit 2 (matches check/release)', function () {
    expect(src).toMatch(/e2e_validate_platform_name "\$resolved"[\s\S]*?return 2/);
    expect(src).toMatch(/\[\[ "\$_platform_rc" -eq 2 \]\][\s\S]*?exit 2/);
    let status = 0;
    let err = '';
    try {
      bashSnippet(`
source ${JSON.stringify(path.join(repoRoot, 'scripts/e2e/lib/e2e-resource-env.sh'))}
resolved=foo
if ! e2e_validate_platform_name "$resolved"; then exit 2; fi
`);
    } catch (e) {
      status = e.status;
      err = `${e.stderr || ''}${e.stdout || ''}${e.message || ''}`;
    }
    expect(status).toBe(2);
    expect(err).toMatch(/platform must be android\|ios\|macos \(got foo\)/);
  });
});

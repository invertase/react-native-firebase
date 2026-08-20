const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const scriptPath = path.join(repoRoot, 'scripts/e2e/start-emulator-slotted.sh');

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

describe('start-emulator-slotted.sh Intent B shell contract', function () {
  const src = fs.readFileSync(scriptPath, 'utf8');

  it('backgrounds emulators:start and waits for readiness (not bare foreground terminal start)', function () {
    // Background start + capture PID (Intent B: leave suite running after ready).
    expect(src).toMatch(/emulators:start[\s\S]*&\s*\n\s*EMU_PID=\$!/);
    expect(src).toMatch(/while ! e2e_port_listening "\$FN_PORT"/);
    expect(src).toMatch(/ready functions=:\$\{FN_PORT\}[\s\S]*\nexit 0\s*$/);

    // Ordering: background start appears before the Functions ready-wait.
    const out = bashSnippet(`
src=$(cat ${JSON.stringify(scriptPath)})
start_line=$(grep -n 'emulators:start' <<<"\$src" | head -1 | cut -d: -f1)
wait_line=$(grep -n 'e2e_port_listening "\$FN_PORT"' <<<"\$src" | head -1 | cut -d: -f1)
amp_line=$(grep -n '&\$' <<<"\$src" | head -1 | cut -d: -f1)
echo "start=\$start_line wait=\$wait_line amp=\$amp_line"
test "\$start_line" -lt "\$wait_line"
test "\$amp_line" -le "\$wait_line"
# Final actionable success is exit 0 after ready, not a foreground-only start.
tail -n 3 ${JSON.stringify(scriptPath)}
`);
    expect(out).toMatch(/start=\d+ wait=\d+ amp=\d+/);
    expect(out).toMatch(/ready functions=/);
    expect(out).toMatch(/exit 0/);
    expect(out).not.toMatch(/emulators:start[^\n]*\n?\s*$/);
  });

  it('readiness waits on Functions port (FN_PORT), not hub-only', function () {
    expect(src).toMatch(/while ! e2e_port_listening "\$FN_PORT"/);
    expect(src).toMatch(/waiting for Functions :\$\{FN_PORT\}/);
    const waitBlock = src.match(
      /ready_deadline=[\s\S]*?while ! e2e_port_listening "\$FN_PORT"; do[\s\S]*?done/,
    );
    expect(waitBlock).not.toBeNull();
    expect(waitBlock[0]).not.toMatch(/e2e_port_listening "\$HUB_PORT"/);
    expect(waitBlock[0]).toContain('FN_PORT');

    const out = bashSnippet(`
# Hub-only readiness would probe HUB_PORT in the wait condition — forbid that.
if grep -E 'while ! e2e_port_listening "\\\$HUB_PORT"' ${JSON.stringify(scriptPath)}; then
  echo HUB_ONLY_WAIT
  exit 1
fi
grep -E 'while ! e2e_port_listening "\\\$FN_PORT"' ${JSON.stringify(scriptPath)}
echo FN_WAIT_OK
`);
    expect(out).toMatch(/FN_WAIT_OK/);
    expect(out).toMatch(/e2e_port_listening "\$FN_PORT"/);
  });

  it('does not register kill_started_suite on EXIT (healthy exit leaves suite up)', function () {
    expect(src).toMatch(/kill_started_suite\(\) \{/);
    expect(src).toMatch(/Never register[\s\S]*on EXIT/);
    expect(src).not.toMatch(/trap\s+['"]?kill_started_suite['"]?\s+EXIT/);
    expect(src).not.toMatch(/trap\s+kill_started_suite\b/);

    const out = bashSnippet(`
if grep -E "trap[[:space:]]+['\\"]?kill_started_suite" ${JSON.stringify(scriptPath)}; then
  echo TRAP_PRESENT
  exit 1
fi
echo NO_EXIT_TRAP
`);
    expect(out.trim()).toBe('NO_EXIT_TRAP');
  });

  it('timeout path calls kill_started_suite before exit 1', function () {
    const timeoutBlock = src.match(
      /if \(\( SECONDS >= ready_deadline \)\); then[\s\S]*?exit 1\s*\n\s*fi/,
    );
    expect(timeoutBlock).not.toBeNull();
    expect(timeoutBlock[0]).toMatch(/kill_started_suite/);
    expect(timeoutBlock[0]).toMatch(/timed out after/);

    const out = bashSnippet(`
# Timeout branch: kill_started_suite must precede exit 1
python3 - <<'PY'
from pathlib import Path
src = Path(${JSON.stringify(scriptPath)}).read_text()
start = src.index("SECONDS >= ready_deadline")
end = src.index("exit 1", start)
block = src[start:end + len("exit 1")]
assert "timed out after" in block
assert "kill_started_suite" in block
assert block.index("kill_started_suite") < block.index("exit 1")
print("TIMEOUT_KILL_OK")
PY
`);
    expect(out.trim()).toBe('TIMEOUT_KILL_OK');
  });

  it('early firebase-death path calls kill_started_suite before exit 1', function () {
    const deathBlock = src.match(
      /if ! kill -0 "\$\{EMU_PID\}" 2>\/dev\/null; then[\s\S]*?exit 1\s*\n\s*fi/,
    );
    expect(deathBlock).not.toBeNull();
    expect(deathBlock[0]).toMatch(/kill_started_suite/);
    expect(deathBlock[0]).toMatch(/exited before Functions/);

    const out = bashSnippet(`
python3 - <<'PY'
from pathlib import Path
src = Path(${JSON.stringify(scriptPath)}).read_text()
needle = 'firebase emulators exited before Functions'
start = src.index(needle)
# Walk back to the if ! kill -0 branch
branch_start = src.rindex('if ! kill -0', 0, start)
end = src.index('exit 1', start)
block = src[branch_start:end + len('exit 1')]
assert 'kill_started_suite' in block, block
assert block.index('kill_started_suite') < block.index('exit 1')
print('EARLY_DEATH_KILL_OK')
PY
`);
    expect(out.trim()).toBe('EARLY_DEATH_KILL_OK');
  });
});

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const scriptPath = path.join(repoRoot, 'scripts/e2e/start-packager.sh');
const rootPkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));

describe('start-packager.sh yarn surface', function () {
  const src = fs.readFileSync(scriptPath, 'utf8');

  it('honors RCT_METRO_PORT and interpolates TMPDIR with the listen port', function () {
    expect(src).toMatch(/PORT="\$\{RCT_METRO_PORT:-/);
    expect(src).toMatch(/\$\{HOME\}\/\.metro\/rnfb-\$\{PORT\}/);
  });

  it('always SIGTERM then SIGKILL listeners on the Metro port (no PGID / setsid)', function () {
    expect(src).toMatch(/kill_port_listeners/);
    expect(src).toMatch(/SIGTERM/);
    expect(src).toMatch(/SIGKILL/);
    expect(src).not.toMatch(/os\.setsid|setsid -w|exec-new-session/);
  });

  it('watch-del this Metro project root and allowlists watch-project trees', function () {
    expect(src).toMatch(/watchman watch-del "\$METRO_ROOT"/);
    expect(src).not.toMatch(/watchman watch-del "\$REPO_ROOT"/);
    expect(src).toMatch(/watchman watch-project "\$METRO_ROOT"/);
    expect(src).toMatch(/watchman watch-project "\$dir"/);
  });

  it('waits for /status packager-status:running then fails on timeout', function () {
    expect(src).toMatch(/packager-status:running/);
    expect(src).toMatch(/RNFB_METRO_STATUS_WAIT_SEC/);
    expect(src).toMatch(/timed out after \$\{STATUS_WAIT_SEC\}s/);
  });

  it('root yarn packager scripts call start-packager.sh and drop slotted aliases', function () {
    expect(rootPkg.scripts['tests:packager:jet']).toMatch(/start-packager\.sh tests/);
    expect(rootPkg.scripts['tests:packager:jet-reset-cache']).toMatch(
      /start-packager\.sh tests --reset-cache/,
    );
    expect(rootPkg.scripts['tests:macos:packager:jet']).toMatch(/start-packager\.sh tests-macos/);
    expect(rootPkg.scripts['tests:e2e:slotted-packager']).toBeUndefined();
    expect(rootPkg.scripts['tests:e2e:slotted-test-cover']).toBeUndefined();
    expect(rootPkg.scripts['tests:e2e:check']).toMatch(/check-e2e-resources\.sh/);
    expect(rootPkg.scripts['tests:e2e:release']).toMatch(/release-e2e-resources\.sh/);
  });

  it('mellifera verify Metro uses Law yarn tests:packager:* (no second lifecycle)', function () {
    const metro = fs.readFileSync(path.join(repoRoot, 'scripts/e2e/mellifera-metro.sh'), 'utf8');
    expect(metro).toMatch(/yarn "\$\{yarn_script\}"/);
    expect(metro).toMatch(/tests:packager:jet/);
    expect(metro).toMatch(/tests:macos:packager:jet/);
    expect(metro).toMatch(/tests:packager:jet-reset-cache/);
    expect(metro).toMatch(/tests:macos:packager:jet-reset-cache/);
    expect(metro).not.toMatch(/yarn react-native start/);
  });

  it('root yarn exposes tests:e2e:clear-slot-env', function () {
    expect(rootPkg.scripts['tests:e2e:clear-slot-env']).toMatch(/clear-slot-env\.sh/);
  });

  it(':test-cover scripts sanitize serial env and do not one-shot restart Metro', function () {
    expect(rootPkg.scripts['tests:android:test-cover']).toMatch(/e2e_sanitize_serial_env/);
    expect(rootPkg.scripts['tests:android:test-cover']).toMatch(
      /e2e_assert_android_apk_metro_port/,
    );
    expect(rootPkg.scripts['tests:android:test']).toMatch(/e2e_assert_android_apk_metro_port/);
    expect(rootPkg.scripts['tests:ios:test-cover']).toMatch(/e2e_sanitize_serial_env/);
    expect(rootPkg.scripts['tests:macos:test-cover']).toMatch(/e2e_sanitize_serial_env/);
    expect(rootPkg.scripts['tests:android:test-cover']).not.toMatch(
      /slotted-packager|start-packager/,
    );
    expect(rootPkg.scripts['tests:ios:test-cover']).not.toMatch(/slotted-packager|start-packager/);
    expect(rootPkg.scripts['tests:macos:test-cover']).not.toMatch(
      /slotted-packager|start-packager/,
    );
  });
});

describe('check-e2e-resources.sh CLI', function () {
  const checkPath = path.join(repoRoot, 'scripts/e2e/check-e2e-resources.sh');

  it('rejects --mellifera (core surface is RNFB_* env only)', function () {
    let status = 0;
    try {
      execFileSync('bash', [checkPath, '--mellifera'], {
        encoding: 'utf8',
        cwd: repoRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (e) {
      status = e.status;
      expect(`${e.stderr || ''}`).toMatch(/unknown arg: --mellifera/);
    }
    expect(status).toBe(2);
  });
});

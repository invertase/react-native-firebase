const { execFileSync, spawn, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
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

  it('SIGTERM then SIGKILL only recorded listeners on the Metro port (no PGID / setsid)', function () {
    expect(src).toMatch(/kill_port_listeners/);
    expect(src).toMatch(/owned_port_listeners/);
    expect(src).toMatch(/SIGTERM/);
    expect(src).toMatch(/SIGKILL/);
    expect(src).not.toMatch(/os\.setsid|setsid -w|exec-new-session/);
  });

  it('records Metro at spawn, so a start that never becomes ready stays this checkout’s', function () {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-packager-spawn-'));
    for (const [name, body] of [
      ['lsof', '#!/bin/bash\nexit 1\n'],
      ['curl', '#!/bin/bash\nexit 7\n'],
      ['watchman', '#!/bin/bash\nexit 0\n'],
      // Stands in for `yarn react-native start`: alive, never ready.
      ['yarn', '#!/bin/bash\nexec /bin/sleep 60\n'],
    ]) {
      fs.writeFileSync(path.join(dir, name), body);
      fs.chmodSync(path.join(dir, name), 0o755);
    }
    const env = { ...process.env };
    for (const key of Object.keys(env)) {
      if (key.startsWith('RNFB_') || key.startsWith('E2E_') || key.startsWith('JET_')) {
        delete env[key];
      }
    }
    Object.assign(env, {
      HOME: dir,
      PATH: `${dir}:${env.PATH}`,
      RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec'),
      RNFB_METRO_LOG: path.join(dir, 'metro.log'),
      RNFB_METRO_STATUS_WAIT_SEC: '1',
    });
    delete env.RCT_METRO_PORT;
    let metroPid;
    try {
      const result = spawnSync('/bin/bash', [scriptPath, 'tests'], { encoding: 'utf8', env });
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/timed out after 1s/);
      const recDir = path.join(dir, 'rec', 'serial');
      const entries = fs
        .readdirSync(recDir)
        .filter(f => f.startsWith('pid-'))
        .map(f => fs.readFileSync(path.join(recDir, f), 'utf8').trim().split('\t'));
      const metro = entries.find(fields => fields[3] === 'metro:8081');
      expect(metro).toBeDefined();
      metroPid = Number(metro[1]);
      // The recorded pid is the still-running orphan Metro, not a dead wrapper.
      expect(() => process.kill(metroPid, 0)).not.toThrow();
    } finally {
      if (metroPid) {
        try {
          process.kill(metroPid, 'SIGKILL');
        } catch (_) {
          // already gone
        }
      }
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('fails fast without killing a Metro port holder this checkout did not record', async function () {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-packager-foreign-'));
    const holder = spawn('/bin/sleep', ['60'], { stdio: 'ignore' });
    const exited = new Promise(resolve => holder.once('exit', (_code, signal) => resolve(signal)));
    const yarnLog = path.join(dir, 'yarn.log');
    for (const [name, body] of [
      ['lsof', `#!/bin/bash\n[[ "$*" == *"-t" ]] && echo ${holder.pid} && exit 0\nexit 1\n`],
      ['yarn', `#!/bin/bash\necho "$*" >> "${yarnLog}"\n`],
      ['sleep', '#!/bin/bash\nexit 0\n'],
    ]) {
      fs.writeFileSync(path.join(dir, name), body);
      fs.chmodSync(path.join(dir, name), 0o755);
    }
    const env = { ...process.env };
    for (const key of Object.keys(env)) {
      if (key.startsWith('RNFB_') || key.startsWith('E2E_') || key.startsWith('JET_')) {
        delete env[key];
      }
    }
    Object.assign(env, {
      HOME: dir,
      PATH: `${dir}:${env.PATH}`,
      RNFB_E2E_RUN_RECORD_DIR: path.join(dir, 'rec'),
    });
    delete env.RCT_METRO_PORT;
    try {
      const result = spawnSync('/bin/bash', [scriptPath, 'tests'], { encoding: 'utf8', env });
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(
        new RegExp(`:8081 is held by pid=${holder.pid}\\b[\\s\\S]*not killed`),
      );
      expect(result.stderr).toMatch(/yarn tests:e2e:export-slot-env/);
      expect(fs.existsSync(yarnLog)).toBe(false);
      const state = await Promise.race([
        exited,
        new Promise(resolve => setTimeout(() => resolve('running'), 200).unref()),
      ]);
      expect(state).toBe('running');
    } finally {
      holder.kill('SIGKILL');
      await exited;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('conditionally watch-del metro root; always allowlists; never del REPO_ROOT', function () {
    expect(src).toMatch(/e2e_sibling_metro_owns_root/);
    expect(src).toMatch(/RNFB_METRO_FORCE_WATCHMAN_RESET:-\}" != "1"/);
    expect(src).toMatch(/watchman skip watch-del \(sibling Metro owns/);
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

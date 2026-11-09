const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const rubyInstall = path.join(repoRoot, 'scripts/ruby-install.sh');

describe('ruby-install.sh', function () {
  let tmp;

  beforeAll(function () {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-ruby-install-'));
  });

  afterAll(function () {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  // Stub `ruby` prints RUBY_VERSION; stub `bundle` logs its args and exits with
  // the per-subcommand status from the env.
  function stubBin(name, { ruby, bundle }) {
    const dir = path.join(tmp, name);
    fs.mkdirSync(dir, { recursive: true });
    if (ruby !== undefined) {
      fs.writeFileSync(path.join(dir, 'ruby'), `#!/bin/sh\nprintf '%s' '${ruby}'\n`);
      fs.chmodSync(path.join(dir, 'ruby'), 0o755);
    }
    if (bundle) {
      fs.writeFileSync(
        path.join(dir, 'bundle'),
        [
          '#!/bin/sh',
          'echo "$*" >> "$BUNDLE_LOG"',
          'case "$1" in',
          '  --version) exit "${BUNDLE_VERSION_RC:-0}" ;;',
          '  check) exit "${BUNDLE_CHECK_RC:-0}" ;;',
          '  install) exit "${BUNDLE_INSTALL_RC:-0}" ;;',
          'esac',
          '',
        ].join('\n'),
      );
      fs.chmodSync(path.join(dir, 'bundle'), 0o755);
    }
    return dir;
  }

  function run(dir, env = {}) {
    const log = path.join(dir, 'bundle.log');
    fs.rmSync(log, { force: true });
    const result = spawnSync('/bin/bash', [rubyInstall], {
      cwd: tmp,
      encoding: 'utf8',
      env: { PATH: dir, BUNDLE_LOG: log, ...env },
    });
    const calls = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n') : [];
    return { ...result, calls };
  }

  it('skips with exit 0 when bundle is not on PATH', function () {
    const result = run(stubBin('no-bundle', { ruby: '3.4.7' }));
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(
      /^ruby:install: bundle not on PATH — skipping root Gemfile install$/m,
    );
  });

  it('skips with one line naming the version when ruby is older than 3.3.1', function () {
    for (const version of ['2.6.10', '3.3.0']) {
      const result = run(stubBin(`ruby-${version}`, { ruby: version, bundle: true }));
      expect(result.status).toBe(0);
      expect(result.stdout.trim().split('\n')).toHaveLength(1);
      expect(result.stdout).toMatch(
        new RegExp(
          `ruby:install: ruby ${version.replace(/\./g, '\\.')} at .* is older than 3\\.3\\.1 — skipping`,
        ),
      );
      expect(result.stdout).toMatch(/CONTRIBUTING\.md#ruby-for-ios-and-macos-work/);
      expect(result.calls).toEqual([]);
    }
  });

  it('skips when bundle is on PATH but ruby is not', function () {
    const result = run(stubBin('bundle-only', { bundle: true }));
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/ruby:install: bundle is on PATH but ruby is not — skipping/);
    expect(result.calls).toEqual([]);
  });

  it('skips when bundle cannot run', function () {
    const result = run(stubBin('bundle-broken', { ruby: '3.3.1', bundle: true }), {
      BUNDLE_VERSION_RC: '1',
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/ruby:install: .*bundle cannot run with this Gemfile\.lock/);
    expect(result.calls).toEqual(['--version']);
  });

  it('runs bundle check and installs only when check fails', function () {
    const dir = stubBin('ruby-ok', { ruby: '3.10.0', bundle: true });
    const satisfied = run(dir);
    expect(satisfied.status).toBe(0);
    expect(satisfied.calls).toEqual(['--version', 'check']);

    const missing = run(dir, { BUNDLE_CHECK_RC: '1' });
    expect(missing.status).toBe(0);
    expect(missing.calls).toEqual(['--version', 'check', 'install']);
  });

  it('keeps a failed bundle install as a failure', function () {
    const result = run(stubBin('install-fails', { ruby: '3.4.7', bundle: true }), {
      BUNDLE_CHECK_RC: '1',
      BUNDLE_INSTALL_RC: '5',
    });
    expect(result.status).toBe(5);
  });
});

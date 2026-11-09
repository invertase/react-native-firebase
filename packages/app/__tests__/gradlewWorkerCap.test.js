const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const scriptPath = path.join(repoRoot, 'tests/android/gradlew-with-worker-cap.sh');

function writeExecutable(file, body) {
  fs.writeFileSync(file, body);
  fs.chmodSync(file, 0o755);
}

describe('gradlew-with-worker-cap.sh', function () {
  let dir;
  let binDir;

  beforeEach(function () {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-gradle-cap-'));
    binDir = path.join(dir, 'bin');
    fs.mkdirSync(binDir);
    // The script runs ./gradlew next to itself.
    fs.copyFileSync(scriptPath, path.join(dir, 'gradlew-with-worker-cap.sh'));
    writeExecutable(path.join(dir, 'gradlew'), '#!/bin/bash\necho "gradlew $*"\n');
    writeExecutable(path.join(binDir, 'uname'), '#!/bin/bash\necho Linux\n');
    writeExecutable(
      path.join(binDir, 'lscpu'),
      '#!/bin/bash\n[[ "$1" == -p=CORE ]] || exit 1\necho "# Core"\nfor ((i = 0; i < FAKE_PHYSICAL; i++)); do echo "$i"; done\n',
    );
    // A real nproc honours OMP_NUM_THREADS; the script must unset it.
    writeExecutable(
      path.join(binDir, 'nproc'),
      '#!/bin/bash\necho "${OMP_NUM_THREADS:-$FAKE_ONLINE}"\n',
    );
    writeExecutable(path.join(binDir, 'getconf'), '#!/bin/bash\necho "$FAKE_ONLINE"\n');
  });

  afterEach(function () {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  function maxWorkers(env) {
    const out = execFileSync('bash', [path.join(dir, 'gradlew-with-worker-cap.sh'), 'assemble'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      env: { PATH: `${binDir}:/usr/bin:/bin`, ...env },
    });
    expect(out).toMatch(/ assemble$/m);
    return Number(out.match(/--max-workers=(\d+)/)[1]);
  }

  it('uses physical cores when the host is unrestricted', function () {
    expect(maxWorkers({ FAKE_PHYSICAL: '4', FAKE_ONLINE: '8' })).toBe(4);
  });

  it('uses the online count when a cpuset allows fewer CPUs than physical cores', function () {
    expect(maxWorkers({ FAKE_PHYSICAL: '8', FAKE_ONLINE: '2' })).toBe(2);
  });

  it('ignores OMP_NUM_THREADS', function () {
    expect(maxWorkers({ FAKE_PHYSICAL: '4', FAKE_ONLINE: '8', OMP_NUM_THREADS: '1' })).toBe(4);
  });

  it('caps workers at GRADLE_WORKER_CAP (default 6)', function () {
    expect(maxWorkers({ FAKE_PHYSICAL: '16', FAKE_ONLINE: '32' })).toBe(6);
    expect(maxWorkers({ FAKE_PHYSICAL: '4', FAKE_ONLINE: '8', GRADLE_WORKER_CAP: '2' })).toBe(2);
  });
});

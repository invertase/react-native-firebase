const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const helper = path.join(repoRoot, '.github/workflows/scripts/resolve-ios-simulator-name.sh');

function resolveName(env, detoxrcContents) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-sim-'));
  const detoxrc = path.join(dir, '.detoxrc.js');
  fs.writeFileSync(detoxrc, detoxrcContents);
  try {
    return execFileSync('bash', [helper, detoxrc], {
      encoding: 'utf8',
      env: { ...process.env, ...env },
    }).trim();
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('resolve_ios_simulator_name', function () {
  const fixture = [
    '// Slotted devices (including slot 0) — distinct from serial iPhone 17 / TestingAVD',
    '# also a hash comment with iPhone 17',
    "const deviceType = process.env.RNFB_IOS_BASE_SIMULATOR || 'iPhone 17';",
  ].join('\n');

  it('prefers RNFB_IOS_SIMULATOR when set', function () {
    expect(resolveName({ RNFB_IOS_SIMULATOR: 'RNFB E2E iOS slot-0' }, fixture)).toBe(
      'RNFB E2E iOS slot-0',
    );
  });

  it('skips // and # comment lines that mention iPhone', function () {
    expect(resolveName({ RNFB_IOS_SIMULATOR: '' }, fixture)).toBe('iPhone 17');
  });

  it('resolves iPhone 17 from tests/.detoxrc.js without RNFB_IOS_SIMULATOR', function () {
    const name = execFileSync('bash', [helper, path.join(repoRoot, 'tests/.detoxrc.js')], {
      encoding: 'utf8',
      env: { ...process.env, RNFB_IOS_SIMULATOR: '' },
    }).trim();
    expect(name).toBe('iPhone 17');
  });
});

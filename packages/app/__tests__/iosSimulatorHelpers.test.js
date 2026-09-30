const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const helpers = path.join(repoRoot, 'scripts/e2e/lib/ios-simulator-helpers.sh');
const bootSimulator = path.join(repoRoot, '.github/workflows/scripts/boot-simulator.sh');
const tartBoot = path.join(repoRoot, 'scripts/tart/lib/boot-simulator.sh');
const createSims = path.join(repoRoot, 'scripts/e2e/create-ios-simulators.sh');

function bashHelper(fn, args = []) {
  return execFileSync(
    'bash',
    ['-c', `source "${helpers}" && ${fn} ${args.map(a => `"${a}"`).join(' ')}`],
    { encoding: 'utf8', env: process.env },
  ).trim();
}

describe('ios-simulator-helpers (selected Xcode + iOS 27)', function () {
  it('resolves DeviceHub.app under selected Xcode (not open -a)', function () {
    const src = fs.readFileSync(helpers, 'utf8');
    expect(src).toMatch(/rnfb_resolve_device_hub_app/);
    expect(src).toMatch(/Applications\/DeviceHub\.app/);
    expect(src).not.toMatch(/open -a Simulator/);
    expect(src).toMatch(/open "\$app" --args -CurrentDeviceUDID/);
  });

  it('pins runtime via RNFB_IOS_SIM_RUNTIME default iOS 27.0', function () {
    const src = fs.readFileSync(helpers, 'utf8');
    expect(src).toMatch(/RNFB_IOS_SIM_RUNTIME:-iOS 27\.0/);
    expect(src).toMatch(/rnfb_resolve_ios_sim_runtime_identifier/);
    expect(src).toMatch(/xcrun simctl list runtimes available -j/);
  });

  it('resolves slot-1 UDID on pinned runtime when present', function () {
    // Live simctl requires macOS + Xcode; Linux CI only static-checks the helper source.
    if (process.platform !== 'darwin') {
      const src = fs.readFileSync(helpers, 'utf8');
      expect(src).toMatch(/rnfb_resolve_ios_sim_udid_for_name/);
      return;
    }
    const udid = bashHelper('rnfb_resolve_ios_sim_udid_for_name', ['RNFB E2E iOS slot-1']);
    expect(udid).toMatch(/^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/i);
  });
});

describe('boot-simulator.sh Device Hub integration', function () {
  it('sources ios-simulator-helpers and boots by UDID', function () {
    const src = fs.readFileSync(bootSimulator, 'utf8');
    expect(src).toMatch(/ios-simulator-helpers\.sh/);
    expect(src).toMatch(/rnfb_ensure_ios_simulator_udid/);
    expect(src).toMatch(/simctl boot "\$SIM_UDID"/);
    expect(src).toMatch(/rnfb_open_device_hub_for_udid/);
    expect(src).not.toMatch(/open -a Simulator/);
  });

  it('tart boot delegates to canonical boot-simulator', function () {
    const src = fs.readFileSync(tartBoot, 'utf8');
    expect(src).toMatch(/\.github\/workflows\/scripts\/boot-simulator\.sh/);
    expect(src).not.toMatch(/open -a/);
  });

  it('create-ios-simulators uses pinned runtime helper', function () {
    const src = fs.readFileSync(createSims, 'utf8');
    expect(src).toMatch(/ios-simulator-helpers\.sh/);
    expect(src).toMatch(/rnfb_resolve_ios_sim_runtime_identifier/);
    expect(src).not.toMatch(/sort\(\(a,b\)=>compareVersions/);
  });
});

describe('detox patch foreground UI', function () {
  it('opens selected-Xcode DeviceHub path instead of open -a Simulator', function () {
    const patched = path.join(
      repoRoot,
      'tests/node_modules/detox/src/devices/common/drivers/ios/tools/AppleSimUtils.js',
    );
    const src = fs.readFileSync(patched, 'utf8');
    expect(src).toMatch(/DeviceHub\.app/);
    expect(src).toMatch(/open \$\{quote\(\[appPath\]\)\}/);
    expect(src).not.toMatch(/open -a Simulator --args/);
  });
});

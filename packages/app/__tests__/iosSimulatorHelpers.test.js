const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const helpers = path.join(repoRoot, 'scripts/e2e/lib/ios-simulator-helpers.sh');
const bootSimulator = path.join(repoRoot, '.github/workflows/scripts/boot-simulator.sh');
const tartBoot = path.join(repoRoot, 'scripts/tart/lib/boot-simulator.sh');
const createSims = path.join(repoRoot, 'scripts/e2e/create-ios-simulators.sh');

function bashHelper(fn, args = [], env = process.env) {
  return execFileSync(
    'bash',
    ['-c', `source "${helpers}" && ${fn} ${args.map(a => `"${a}"`).join(' ')}`],
    { encoding: 'utf8', env },
  ).trim();
}

const FAKE_DEVICES = `== Devices ==
-- iOS 26.0 --
    RN E2E iOS slot-1 (11111111-1111-1111-1111-111111111111) (Shutdown)
-- iOS 27.0 --
    iPhone 17 (22222222-2222-2222-2222-222222222222) (Shutdown)
    RN E2E iOS slot-1 (3A4B5C6D-7E8F-9012-3456-789ABCDEF012) (Shutdown)
-- watchOS 27.0 --
    RN E2E iOS slot-3 (44444444-4444-4444-4444-444444444444) (Shutdown)
`;

function helperStatus(args, env) {
  try {
    bashHelper('rnfb_resolve_ios_sim_udid_for_name', args, env);
    return 0;
  } catch (e) {
    return e.status;
  }
}

function withFakeXcrun(run) {
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-fake-xcrun-'));
  try {
    fs.writeFileSync(path.join(bin, 'devices.txt'), FAKE_DEVICES);
    fs.writeFileSync(
      path.join(bin, 'xcrun'),
      `#!/usr/bin/env bash\n[[ "$*" == "simctl list devices available" ]] || exit 9\ncat "${path.join(bin, 'devices.txt')}"\n`,
      { mode: 0o755 },
    );
    const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}` };
    delete env.RNFB_IOS_SIM_RUNTIME;
    return run(env);
  } finally {
    fs.rmSync(bin, { recursive: true, force: true });
  }
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
    withFakeXcrun(env => {
      expect(bashHelper('rnfb_resolve_ios_sim_udid_for_name', ['RN E2E iOS slot-1'], env)).toBe(
        '3A4B5C6D-7E8F-9012-3456-789ABCDEF012',
      );
    });
  });

  it('fails to resolve a device absent from the pinned runtime', function () {
    withFakeXcrun(env => {
      expect(helperStatus(['RN E2E iOS slot-2'], env)).toBe(1);
      expect(helperStatus(['RN E2E iOS slot-3'], env)).toBe(1);
      expect(
        helperStatus(['RN E2E iOS slot-1'], { ...env, RNFB_IOS_SIM_RUNTIME: 'iOS 25.0' }),
      ).toBe(1);
    });
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

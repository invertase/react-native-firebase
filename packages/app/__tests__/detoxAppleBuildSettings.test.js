/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { describe, expect, it, jest } from '@jest/globals';

const REPO_ROOT = join(__dirname, '..', '..', '..');
const EXPLICIT_MODULES_OFF = 'SWIFT_ENABLE_EXPLICIT_MODULES=NO';
const NO_LAUNCH_PACKAGER = 'RCT_NO_LAUNCH_PACKAGER=true';

describe('Apple Detox/test build settings — explicit modules', () => {
  it('ios.debug and ios.release xcodebuild do not disable Swift explicit modules', () => {
    const detox = require(join(REPO_ROOT, 'tests', '.detoxrc.js'));
    expect(detox.apps['ios.debug'].build).not.toContain(EXPLICIT_MODULES_OFF);
    expect(detox.apps['ios.release'].build).not.toContain(EXPLICIT_MODULES_OFF);
  });

  it('tests-macos build:macos xcodebuild does not disable Swift explicit modules', () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'tests-macos', 'package.json'), 'utf8'));
    expect(pkg.scripts['build:macos']).not.toContain(EXPLICIT_MODULES_OFF);
  });
});

describe('Apple Detox/test build settings — RCT_NO_LAUNCH_PACKAGER', () => {
  it('ios.debug must not set RCT_NO_LAUNCH_PACKAGER', () => {
    const detox = require(join(REPO_ROOT, 'tests', '.detoxrc.js'));
    expect(detox.apps['ios.debug'].build).not.toContain(NO_LAUNCH_PACKAGER);
  });

  it('ios.release keeps RCT_NO_LAUNCH_PACKAGER until its own negative test', () => {
    const detox = require(join(REPO_ROOT, 'tests', '.detoxrc.js'));
    expect(detox.apps['ios.release'].build).toContain(NO_LAUNCH_PACKAGER);
  });

  it('tests-macos build:macos must not set RCT_NO_LAUNCH_PACKAGER', () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'tests-macos', 'package.json'), 'utf8'));
    expect(pkg.scripts['build:macos']).not.toContain(NO_LAUNCH_PACKAGER);
  });
});

describe('slotted Detox device contracts', () => {
  const detox = require(join(REPO_ROOT, 'tests', '.detoxrc.js'));

  it('configures exact neutral iOS bases for slots 0 through 7', () => {
    expect(detox.devices['simulator-slot0'].device.name).toBe('RN E2E iOS slot-0');
    expect(detox.devices['simulator-slot7'].device.name).toBe('RN E2E iOS slot-7');
    expect(detox.devices['simulator-slot8']).toBeUndefined();
    expect(detox.devices['simulator-slot0'].device.name).not.toContain('-Detox');
    expect(detox.configurations['ios.sim.debug.slot7']).toEqual({
      device: 'simulator-slot7',
      app: 'ios.debug',
    });
    expect(detox.configurations['ios.sim.debug.slot8']).toBeUndefined();
  });

  it('keeps serial iOS and Android formulas unchanged while extending Android through slot 7', () => {
    expect(detox.devices.simulator.device.name).toBe('iPhone 17');
    expect(detox.devices.emulator.device.avdName).toBe('TestingAVD');
    expect(detox.devices['emulator-slot0'].device.avdName).toBe('TestingAVD-0');
    expect(detox.devices['emulator-slot7'].device.avdName).toBe('TestingAVD-7');
    expect(detox.devices['emulator-slot8']).toBeUndefined();
    expect(detox.apps['android.debug.slot7']).toBeDefined();
    expect(detox.apps['android.debug.slot8']).toBeUndefined();
    expect(detox.configurations['android.emu.debug.slot7']).toEqual({
      device: 'emulator-slot7',
      app: 'android.debug.slot7',
    });
    expect(detox.configurations['android.emu.debug.slot8']).toBeUndefined();
  });
});

describe('neutral iOS slot Detox allocation', () => {
  const SimulatorAllocDriver = require(
    join(
      REPO_ROOT,
      'tests',
      'node_modules',
      'detox',
      'src',
      'devices',
      'allocation',
      'drivers',
      'ios',
      'SimulatorAllocDriver.js',
    ),
  );
  const SimulatorQuery = require(
    join(
      REPO_ROOT,
      'tests',
      'node_modules',
      'detox',
      'src',
      'devices',
      'allocation',
      'drivers',
      'ios',
      'SimulatorQuery.js',
    ),
  );

  function makeAllocator(takenDevices = []) {
    const prototypeDevice = {
      udid: 'base-udid',
      name: 'RN E2E iOS slot-3',
      deviceType: { identifier: 'com.apple.CoreSimulator.SimDeviceType.iPhone-17' },
      os: { identifier: 'com.apple.CoreSimulator.SimRuntime.iOS-26-0' },
    };
    const applesimutils = {
      create: jest.fn(async () => 'created-clone-udid'),
      list: jest.fn(async query => {
        if (query.byName === 'iPhone 17') {
          return [{ ...prototypeDevice, name: 'iPhone 17', udid: 'serial-udid' }];
        }
        return [prototypeDevice];
      }),
      takeScreenshot: jest.fn(async () => undefined),
    };
    const driver = new SimulatorAllocDriver({
      detoxConfig: { behavior: { cleanup: { shutdownDevice: false } } },
      deviceRegistry: { getTakenDevicesSync: () => takenDevices },
      applesimutils,
    });
    return { applesimutils, driver, prototypeDevice };
  }

  it('reuses the exact neutral base when it is free', async () => {
    const { applesimutils, driver } = makeAllocator();
    const udid = await driver._findOrCreateDevice(
      new SimulatorQuery({ name: 'RN E2E iOS slot-3', type: 'iPhone 17' }),
    );
    expect(udid).toBe('base-udid');
    expect(applesimutils.create).not.toHaveBeenCalled();
  });

  it('fails with ownership guidance instead of cloning an occupied neutral base', async () => {
    const { applesimutils, driver } = makeAllocator(['base-udid']);
    await expect(
      driver._findOrCreateDevice(
        new SimulatorQuery({ name: 'RN E2E iOS slot-3', type: 'iPhone 17' }),
      ),
    ).rejects.toThrow(
      /The neutral iOS slot RN E2E iOS slot-3 is already allocated[\s\S]*Confirm Mellifera\/manual ownership[\s\S]*device\.registry\.json/,
    );
    expect(applesimutils.create).not.toHaveBeenCalled();
  });

  it('preserves Detox base allocation for serial iPhone 17', async () => {
    const { applesimutils, driver } = makeAllocator();
    const udid = await driver._findOrCreateDevice(
      new SimulatorQuery({ name: 'iPhone 17', type: 'iPhone 17' }),
    );
    expect(udid).toBe('serial-udid');
    expect(applesimutils.create).not.toHaveBeenCalled();
  });

  it('guards exact neutral slots through 7 without changing unrelated stock cloning', async () => {
    const { applesimutils, driver, prototypeDevice } = makeAllocator();
    jest
      .spyOn(driver, '_groupDevicesByStatus')
      .mockResolvedValue({ free: [], taken: [prototypeDevice] });

    await expect(
      driver._findOrCreateDevice(new SimulatorQuery({ name: 'RN E2E iOS slot-7' })),
    ).rejects.toThrow('already allocated');
    await expect(
      driver._findOrCreateDevice(new SimulatorQuery({ name: 'RN E2E iOS slot-8' })),
    ).resolves.toBe('created-clone-udid');
    await expect(
      driver._findOrCreateDevice(new SimulatorQuery({ name: 'custom simulator' })),
    ).resolves.toBe('created-clone-udid');
    expect(applesimutils.create).toHaveBeenCalledTimes(2);
    expect(applesimutils.create).toHaveBeenCalledWith(prototypeDevice);
  });
});

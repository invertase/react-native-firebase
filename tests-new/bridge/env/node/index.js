/* eslint-disable no-param-reassign */
global.bridge = {};

const detox = require('detox');
const ws = require('./ws');
const ready = require('./ready');

/* ---------------------
 *   DEVICE OVERRIDES
 * --------------------- */

let device;
Object.defineProperty(global, 'device', {
  get() {
    return device;
  },
  set(originalDevice) {
    // device.reloadReactNative({ ... })
    // todo detoxOriginalReloadReactNative currently broken it seems
    // const detoxOriginalReloadReactNative = originalDevice.reloadReactNative.bind(originalDevice);
    originalDevice.reloadReactNative = async () => {
      ready.reset();
      global.bridge.reload();
      return ready.wait();
    };

    // device.launchApp({ ... })
    const detoxOriginalLaunchApp = originalDevice.launchApp.bind(
      originalDevice
    );
    originalDevice.launchApp = async (...args) => {
      ready.reset();
      await detoxOriginalLaunchApp(...args);
      return ready.wait();
    };

    device = originalDevice;
    return originalDevice;
  },
});

/* -------------------
 *   DETOX OVERRIDES
 * ------------------- */

// detox.init()
const detoxOriginalInit = detox.init.bind(detox);
detox.init = async (...args) => {
  ready.reset();
  await detoxOriginalInit(...args);
  return ready.wait();
};

// detox.cleanup()
const detoxOriginalCleanup = detox.cleanup.bind(detox);
detox.cleanup = async (...args) => {
  ws.close();
  await detoxOriginalCleanup(...args);
};

global.bridge = {};

const detox = require('detox');

require('./vm');
const ws = require('./ws');

const detoxOriginalInit = detox.init.bind(detox);
const detoxOriginalCleanup = detox.cleanup.bind(detox);

let bridgeReady = false;
process.on('rn-ready', () => {
  bridgeReady = true;
});

function onceBridgeReady() {
  if (bridgeReady) return Promise.resolve();
  return new Promise(resolve => {
    process.once('rn-ready', resolve);
  });
}

function shimDevice() {
  // reloadReactNative
  // todo detoxOriginalReloadReactNative currently broken
  // const detoxOriginalReloadReactNative = device.reloadReactNative.bind(device);
  device.reloadReactNative = async () => {
    bridgeReady = false;
    global.bridge.reload();
    return onceBridgeReady();
  };

  // launchApp
  const detoxOriginalLaunchApp = device.launchApp.bind(device);
  device.launchApp = async (...args) => {
    bridgeReady = false;
    await detoxOriginalLaunchApp(...args);
    return onceBridgeReady();
  };

  // todo other device reloading related methods
}

detox.init = async (...args) => {
  bridgeReady = false;
  return detoxOriginalInit(...args).then(() => {
    shimDevice();
    return onceBridgeReady();
  });
};

detox.cleanup = async (...args) =>
  detoxOriginalCleanup(...args).then(() => {
    ws.close();
  });

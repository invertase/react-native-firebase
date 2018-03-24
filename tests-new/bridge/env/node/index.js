const detox = require('detox');
const vm = require('./vm');
const ws = require('./ws');

const detoxOriginalInit = detox.init.bind(detox);
const detoxOriginalCleanup = detox.cleanup.bind(detox);
let detoxOriginalReloadReactNative = null;

let bridgeReady = false;
process.on('rn-ready', () => {
  // console.log('READY', true);
  bridgeReady = true;
});

function onceBridgeReady() {
  if (bridgeReady) return Promise.resolve();
  return new Promise(resolve => {
    process.once('rn-ready', resolve);
  });
}

detox.init = async (...args) => {
  bridgeReady = false;
  console.log('detox.init.start');

  return detoxOriginalInit(...args).then(() => {
    console.log('detox.init.complete');

    detoxOriginalReloadReactNative = device.reloadReactNative.bind(device);
    device.reloadReactNative = async () => {
      console.log('reloadReactNative.start');
      bridgeReady = false;
      // return device.launchApp({ newInstance: true }).then(() => {
      global.bridge.reload();

      return onceBridgeReady();
    };

    return onceBridgeReady();
  });
};

detox.cleanup = async (...args) => {
  console.log('detox.cleanup');

  return detoxOriginalCleanup(...args).then(() => {
    console.log('detox.cleanup.end');

    ws.close();
    process.exit();
  });
};

global.bridge = {
  _ws: null,

  rootSetState(state) {
    // todo
    return Promise.resolve();
  },
};

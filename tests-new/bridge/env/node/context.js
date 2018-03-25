/* eslint-disable guard-for-in,no-restricted-syntax */
global.bridge.context = null;

const consoleContext = require('./console');
const { createContext } = require('vm');
const chalk = require('chalk');

let customBridgeProps = [];
let driftCheckStart = null;

module.exports = {
  /**
   * Cleanup existing context  - just some quick iterations over common fb/rn/bridge locations
   * garbage collection will do the rest. This is probably not needed...
   */
  async cleanup() {
    if (global.bridge.context) {
      if (global.bridge.beforeContextReset) {
        await global.bridge.beforeContextReset();
      }

      for (const name in global.bridge.context.__fbBatchedBridge) {
        global.bridge.context.__fbBatchedBridge[name] = undefined;
        delete global.bridge.context.__fbBatchedBridge[name];
      }

      for (const name in global.bridge.context.__fbGenNativeModule) {
        global.bridge.context.__fbGenNativeModule[name] = undefined;
        delete global.bridge.context.__fbGenNativeModule[name];
      }

      for (const name in global.bridge.context.__fbBatchedBridgeConfig) {
        global.bridge.context.__fbBatchedBridgeConfig[name] = undefined;
        delete global.bridge.context.__fbBatchedBridgeConfig[name];
      }

      for (const name in global.bridge.context) {
        global.bridge.context[name] = undefined;
        delete global.bridge.context[name];
      }

      global.bridge.context = undefined;

      // clear custom props and reset props track array
      for (let i = 0; i < customBridgeProps.length; i++) {
        global.bridge[customBridgeProps[i]] = undefined;
        delete global.bridge[customBridgeProps[i]];
      }

      customBridgeProps = [];
    }
  },

  /**
   * Create a new context for a RN app to attach to, we additionally provide __bridgeNode for
   * the counterpart RN bridge code to attach to and communicate back
   */
  create() {
    global.bridge.context = createContext({
      console: consoleContext(),
      __bridgeNode: {
        _ready() {
          if (!driftCheckStart) {
            driftCheckStart = Date.now();
            global.bridge.context.__driftCheck(1);
          } else {
            setTimeout(() => process.emit('bridge-attached'), 1);
          }
        },

        _callbackDriftCheck() {
          const timeTaken = Date.now() - driftCheckStart;
          if (timeTaken > 5000) {
            console.log(
              `${chalk.blue(
                '[bridge] ⚠️ '
              )} It looks like there's an issue with device timer performance...`
            );
            console.log(
              `${chalk.blue(
                '[bridge] ⚠️ '
              )} You may experience slow testing times as a result - ensure your device date/time correctly matches your debugger machine.`
            );
            // todo android only
            // fake the RN warning for this
            global.bridge.context.console.warn(
              `Debugger and device times have drifted. ` +
                `Please correct this by running adb shell "date \`date +%m%d%H%M%Y.%S\`" on your debugger machine.`
            );
          }
          setTimeout(() => process.emit('bridge-attached'), 1);
        },

        setBridgeProperty(key, value) {
          customBridgeProps.push(key);
          global.bridge[key] = value;
        },
      },
    });
  },
};

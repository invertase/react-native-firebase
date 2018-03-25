import ReactNative from 'react-native';
import RNRestart from 'react-native-restart'; // Import package from node modules

const { Platform, NativeModules } = ReactNative;

const bridgeNode = global.__bridgeNode;
const INTERNAL_KEYS = ['context', 'rn', 'reload'];

// https://github.com/facebook/react-native/blob/master/React/Modules/RCTDevSettings.mm
if (Platform.OS === 'ios' && !bridgeNode) {
  NativeModules.RCTDevSettings.setIsDebuggingRemotely(true);
} else {
  if (Platform.OS === 'android' && !bridgeNode) {
    // TODO warn to add:
    // getReactNativeHost().getReactInstanceManager().getDevSupportManager().getDevSettings().setRemoteJSDebugEnabled(true);
    // to MainApplication onCreate
  }

  if (bridgeNode) {
    if (Platform.OS === 'ios') {
      bridgeNode.setBridgeProperty(
        'reload',
        NativeModules.RCTDevSettings.reload
      );
    } else {
      bridgeNode.setBridgeProperty('reload', RNRestart.Restart);
    }

    bridgeNode.setBridgeProperty('rn', ReactNative);

    // keep alive
    setInterval(() => {
      // I don't do anything...
      // BUT i am needed - otherwise RN's batched bridge starts to hang in detox... ???
    }, 60);
  }
}

let hasInitialized = false;

export default {
  /**
   * Expose a property in node on the global.bridge object
   * @param key
   * @param value
   */
  setBridgeProperty(key, value) {
    if (INTERNAL_KEYS.includes(key)) return;
    if (bridgeNode) {
      bridgeNode.setBridgeProperty(key, value);

      // notify ready on first setBridgeProp
      if (!hasInitialized) {
        bridgeNode._ready();
        hasInitialized = true;
      }
    }
  },
};

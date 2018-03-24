import reactNative, { Platform, NativeModules } from 'react-native';
import RNRestart from 'react-native-restart'; // Import package from node modules

const bridgeNode = global.__bridgeNode;

// https://github.com/facebook/react-native/blob/master/React/Modules/RCTDevSettings.mm
if (Platform.OS === 'ios' && !bridgeNode) {
  NativeModules.RCTDevSettings.setIsDebuggingRemotely(true);
}

if (bridgeNode) {
  bridgeNode.provideReload(RNRestart.Restart);
  bridgeNode.provideReactNativeModule(reactNative);

  // keep alive
  setInterval(() => {
    // I don't do anything lol
    // BUT i am needed - otherwise RN's batch bridge starts to hang in detox... ???
  }, 60);
}

export default {
  /**
   * Makes the main module to be tested accessible to nodejs
   * @param moduleExports
   */
  provideModule(moduleExports) {
    if (bridgeNode) {
      bridgeNode.provideModule(moduleExports);
      bridgeNode.ready();
    }
  },

  /**
   * Makes the root component accessible to nodejs - e.g. bridge.root.setState({ ... });
   * @param rootComponent
   */
  provideRoot(rootComponent) {
    if (bridgeNode) {
      bridgeNode.provideRoot(rootComponent);
    }
  },
};

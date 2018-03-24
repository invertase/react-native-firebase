import reactNative, { Platform, NativeModules } from 'react-native';
import RNRestart from 'react-native-restart'; // Import package from node modules

const bridgeNode = global.__bridgeNode;

// https://github.com/ptmt/react-native-macos/blob/master/React/Modules/RCTDevSettings.mm
if (Platform.OS === 'ios' && !bridgeNode) {
  NativeModules.RCTDevSettings.setIsDebuggingRemotely(true);
}

if (bridgeNode) {
  bridgeNode.provideReactNativeModule(reactNative);
  bridgeNode.provideReload(RNRestart.Restart);
}

export default {
  provideModule(moduleExports) {
    if (bridgeNode) {
      bridgeNode.provideModule(moduleExports);
      bridgeNode.ready();
    }
  },
  provideRoot(rootComponent) {
    if (bridgeNode) {
      bridgeNode.provideRoot(rootComponent);
    }
  },
};

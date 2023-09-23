import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';
import { withExpoPluginFirebaseNotification } from './android';

/**
 * A config plugin for configuring `@react-native-firebase/app`
 */
const withRnFirebaseApp: ConfigPlugin = config => {
  return withPlugins(config, [
    // iOS

    // Android
    withExpoPluginFirebaseNotification,
  ]);
};

const pak = require('@react-native-firebase/messaging/package.json');
export default createRunOncePlugin(withRnFirebaseApp, pak.name, pak.version);

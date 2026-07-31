import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';
import { withExpoPluginFirebaseNotification } from './android';
import { PluginConfigType } from './pluginConfig';

/**
 * A config plugin for configuring `@react-native-firebase/messaging`
 */
const withRnFirebaseMessaging: ConfigPlugin<PluginConfigType | undefined> = (config, props) => {
  return withPlugins(config, [
    // iOS

    // Android
    [withExpoPluginFirebaseNotification, props],
  ]);
};

const pak = require('@react-native-firebase/messaging/package.json');
export default createRunOncePlugin(withRnFirebaseMessaging, pak.name, pak.version);

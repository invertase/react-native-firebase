import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';
import { withFirebaseAppDelegate } from './ios';

/**
 * A config plugin for configuring `@react-native-firebase/dynamic-links`
 */
const withRnFirebaseDynamicLinks: ConfigPlugin = config => {
  return withPlugins(config, [
    // iOS
    withFirebaseAppDelegate,
  ]);
};

const pak = require('@react-native-firebase/dynamic-links/package.json');
export default createRunOncePlugin(withRnFirebaseDynamicLinks, pak.name, pak.version);

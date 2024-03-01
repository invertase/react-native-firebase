import { ConfigPlugin, createRunOncePlugin, withPlugins } from '@expo/config-plugins';
import { withFirebaseAppDelegate } from './ios';

/**
 * A config plugin for configuring `@react-native-firebase/app-check`
 */
const withRnFirebaseAppCheck: ConfigPlugin = config => {
  return withPlugins(config, [
    // iOS
    withFirebaseAppDelegate,
  ]);
};

const pak = require('@react-native-firebase/app-check/package.json');
export default createRunOncePlugin(withRnFirebaseAppCheck, pak.name, pak.version);

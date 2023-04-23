import { ConfigPlugin, withPlugins, createRunOncePlugin, IOSConfig } from '@expo/config-plugins';

/**
 * A config plugin for configuring `@react-native-firebase/auth`
 */
const withRnFirebaseAuth: ConfigPlugin = config => {
  return withPlugins(config, [IOSConfig.Google.withGoogle]);
};

const pak = require('@react-native-firebase/auth/package.json');

export default createRunOncePlugin(withRnFirebaseAuth, pak.name, pak.version);

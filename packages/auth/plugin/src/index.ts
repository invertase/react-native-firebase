import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';

import { withIosCaptchaUrlTypes } from './ios';

/**
 * A config plugin for configuring `@react-native-firebase/auth`
 */
const withRnFirebaseAuth: ConfigPlugin = config => {
  return withPlugins(config, [
    // iOS
    withIosCaptchaUrlTypes,
  ]);
};

const pak = require('@react-native-firebase/auth/package.json');
export default createRunOncePlugin(withRnFirebaseAuth, pak.name, pak.version);

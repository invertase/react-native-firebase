import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';

import { withIosCaptchaUrlTypes, withIosCaptchaOpenUrlFix } from './ios';
import { PluginConfigType } from './pluginConfig';

/**
 * A config plugin for configuring `@react-native-firebase/auth`
 */
const withRnFirebaseAuth: ConfigPlugin<PluginConfigType> = (config, props) => {
  return withPlugins(config, [
    // iOS
    [withIosCaptchaUrlTypes, props],
    [withIosCaptchaOpenUrlFix, props],
  ]);
};

const pak = require('@react-native-firebase/auth/package.json');
export default createRunOncePlugin(withRnFirebaseAuth, pak.name, pak.version);

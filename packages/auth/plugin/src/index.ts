import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';

import {
  withIosCaptchaUrlTypes,
  withIosCaptchaOpenUrlFix,
  withIosCaptchaSceneDelegateFix,
} from './ios';
import { PluginConfigType } from './pluginConfig';

/**
 * A config plugin for configuring `@react-native-firebase/auth`
 */
const withRnFirebaseAuth: ConfigPlugin<PluginConfigType> = (config, props) => {
  return withPlugins(config, [
    // iOS
    [withIosCaptchaUrlTypes, props],
    // The two openURL fixes are mutually exclusive and detect which applies at prebuild time:
    // app-delegate life cycle patches `AppDelegate.swift`, UIScene life cycle (Expo SDK 58+)
    // patches `SceneDelegate.swift`.
    [withIosCaptchaOpenUrlFix, props],
    [withIosCaptchaSceneDelegateFix, props],
  ]);
};

const pak = require('@react-native-firebase/auth/package.json');
export default createRunOncePlugin(withRnFirebaseAuth, pak.name, pak.version);

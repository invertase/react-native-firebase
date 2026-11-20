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
    // Each openURL fix detects at prebuild time whether it applies. The app-delegate fix patches an
    // `application(_:open:options:)` override in `AppDelegate.swift`; the UIScene fix (Expo SDK 58+)
    // patches `SceneDelegate.swift`. Both apply when a UIScene AppDelegate still has that override,
    // such as the one the Analytics plugin adds for link attribution.
    [withIosCaptchaOpenUrlFix, props],
    [withIosCaptchaSceneDelegateFix, props],
  ]);
};

const pak = require('@react-native-firebase/auth/package.json');
export default createRunOncePlugin(withRnFirebaseAuth, pak.name, pak.version);

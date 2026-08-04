import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';

import {
  withApplyGoogleServicesPlugin,
  withBuildscriptDependency,
  withCopyAndroidGoogleServices,
} from './android';
import { withFirebaseAppDelegate, withIosGoogleServicesFile, withIosDisableSPM } from './ios';
import { PluginConfigType } from './pluginConfig';

/**
 * A config plugin for configuring `@react-native-firebase/app`
 */
const withRnFirebaseApp: ConfigPlugin<PluginConfigType> = (config, props) => {
  return withPlugins(config, [
    // iOS
    withFirebaseAppDelegate,
    withIosGoogleServicesFile,
    [withIosDisableSPM, props],

    // Android
    withBuildscriptDependency,
    withApplyGoogleServicesPlugin,
    withCopyAndroidGoogleServices,
  ]);
};

const pak = require('@react-native-firebase/app/package.json');
export default createRunOncePlugin(withRnFirebaseApp, pak.name, pak.version);

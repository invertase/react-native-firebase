import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';

import {
  withApplyGoogleServicesPlugin,
  withBuildscriptDependency,
  withCopyAndroidGoogleServices,
} from './android';
import { withFirebaseAppDelegate, withIosGoogleServicesFile } from './ios';

const DEFAULT_ANDROID_GOOGLE_SERVICES_PATH = './google-services.json';
const DEFAULT_IOS_GOOGLE_SERVICES_PATH = './GoogleService-Info.plist';

interface PluginProps {
  /**
   * Custom location of `google-services.json`,
   * relative to project root
   */
  androidGoogleServicesPath?: string;
  /**
   * Custom location of `GoogleService-Info.plist`,
   * relative to project root
   */
  iosGoogleServicesPath?: string;
}

/**
 * A config plugin for configuring `@react-native-firebase/app`
 */
const withRnFirebaseApp: ConfigPlugin<PluginProps> = (
  config,
  { androidGoogleServicesPath, iosGoogleServicesPath } = {},
) => {
  const resolvedAndroidServicesPath =
    androidGoogleServicesPath ||
    config.android?.googleServicesFile ||
    DEFAULT_ANDROID_GOOGLE_SERVICES_PATH;

  const resolvedIosServicePath =
    iosGoogleServicesPath || config.ios?.googleServicesFile || DEFAULT_IOS_GOOGLE_SERVICES_PATH;

  return withPlugins(config, [
    // iOS
    withFirebaseAppDelegate,
    [
      withIosGoogleServicesFile,
      {
        relativePath: resolvedIosServicePath,
      },
    ],
    // Android
    withBuildscriptDependency,
    withApplyGoogleServicesPlugin,
    [
      withCopyAndroidGoogleServices,
      {
        relativePath: resolvedAndroidServicesPath,
      },
    ],
  ]);
};

const pak = require('@react-native-firebase/app/package.json');
export default createRunOncePlugin(withRnFirebaseApp, pak.name, pak.version);

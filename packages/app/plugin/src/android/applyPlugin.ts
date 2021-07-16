import { ConfigPlugin, WarningAggregator, withAppBuildGradle } from '@expo/config-plugins';

import { googleServicesPlugin } from './constants';

/**
 * Update `app/build.gradle` by applying google-services plugin
 */
export const withApplyGoogleServicesPlugin: ConfigPlugin = config => {
  return withAppBuildGradle(config, config => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = applyPlugin(config.modResults.contents);
    } else {
      WarningAggregator.addWarningAndroid(
        'react-native-firebase-app',
        `Cannot automatically configure app build.gradle if it's not groovy`,
      );
    }
    return config;
  });
};

export function applyPlugin(appBuildGradle: string) {
  // Make sure the project does not have the plugin already
  const pattern = new RegExp(`apply\\s+plugin:\\s+['"]${googleServicesPlugin}['"]`);
  if (!appBuildGradle.match(pattern)) {
    return appBuildGradle + `\napply plugin: '${googleServicesPlugin}'`;
  }

  return appBuildGradle;
}

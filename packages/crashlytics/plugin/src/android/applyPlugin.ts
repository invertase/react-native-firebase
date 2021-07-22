import { ConfigPlugin, WarningAggregator, withAppBuildGradle } from '@expo/config-plugins';

import { crashlyticsPlugin } from './constants';

/**
 * Update `app/build.gradle` by applying crashlytics plugin
 */
export const withApplyCrashlyticsPlugin: ConfigPlugin = config => {
  return withAppBuildGradle(config, config => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = applyPlugin(config.modResults.contents);
    } else {
      WarningAggregator.addWarningAndroid(
        'react-native-firebase-crashlytics',
        `Cannot automatically configure app build.gradle if it's not groovy`,
      );
    }
    return config;
  });
};

export function applyPlugin(appBuildGradle: string) {
  const crashlyticsPattern = new RegExp(`apply\\s+plugin:\\s+['"]${crashlyticsPlugin}['"]`);
  if (!appBuildGradle.match(crashlyticsPattern)) {
    appBuildGradle += `\napply plugin: '${crashlyticsPlugin}'`;
  }

  return appBuildGradle;
}

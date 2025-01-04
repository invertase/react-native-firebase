import { ConfigPlugin, WarningAggregator, withAppBuildGradle } from '@expo/config-plugins';
import { appDistributionMonitoringPlugin } from './constants';

/**
 * Update `app/build.gradle` by applying app-distribution monitoring plugin
 */
export const withApplyappDistributionPlugin: ConfigPlugin = config => {
  return withAppBuildGradle(config, config => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = applyPlugin(config.modResults.contents);
    } else {
      WarningAggregator.addWarningAndroid(
        'react-native-firebase-app-distribution',
        `Cannot automatically configure app build.gradle if it's not groovy`,
      );
    }
    return config;
  });
};

export function applyPlugin(appBuildGradle: string) {
  const appDistributionPattern = new RegExp(
    `apply\\s+plugin:\\s+['"]${appDistributionMonitoringPlugin}['"]`,
  );
  if (!appBuildGradle.match(appDistributionPattern)) {
    appBuildGradle += `\napply plugin: '${appDistributionMonitoringPlugin}'`;
  }
  return appBuildGradle;
}

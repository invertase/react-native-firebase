import { ConfigPlugin, WarningAggregator, withAppBuildGradle } from '@expo/config-plugins';
import { perfMonitoringPlugin } from './constants';

/**
 * Update `app/build.gradle` by applying performance monitoring plugin
 */
export const withApplyPerfPlugin: ConfigPlugin = config => {
  return withAppBuildGradle(config, config => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = applyPlugin(config.modResults.contents);
    } else {
      WarningAggregator.addWarningAndroid(
        'react-native-firebase-perf',
        `Cannot automatically configure app build.gradle if it's not groovy`,
      );
    }
    return config;
  });
};

export function applyPlugin(appBuildGradle: string) {
  const perfPattern = new RegExp(`apply\\s+plugin:\\s+['"]${perfMonitoringPlugin}['"]`);
  if (!appBuildGradle.match(perfPattern)) {
    appBuildGradle += `\napply plugin: '${perfMonitoringPlugin}'`;
  }
  return appBuildGradle;
}

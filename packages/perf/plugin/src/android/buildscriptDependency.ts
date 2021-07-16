import { ConfigPlugin, WarningAggregator, withProjectBuildGradle } from '@expo/config-plugins';

import { perfMonitoringClassPath, perfMonitoringVersion } from './constants';

/**
 * Update `<project>/build.gradle` by adding performance monitoring dependency to buildscript
 */
export const withBuildscriptDependency: ConfigPlugin = config => {
  return withProjectBuildGradle(config, config => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = setBuildscriptDependency(config.modResults.contents);
    } else {
      WarningAggregator.addWarningAndroid(
        'react-native-firebase-perf',
        `Cannot automatically configure project build.gradle if it's not groovy`,
      );
    }
    return config;
  });
};

export function setBuildscriptDependency(buildGradle: string) {
  // TODO: Find a more stable solution for this
  if (!buildGradle.includes(perfMonitoringClassPath)) {
    return buildGradle.replace(
      /dependencies\s?{/,
      `dependencies {
        classpath '${perfMonitoringClassPath}:${perfMonitoringVersion}'`,
    );
  }

  return buildGradle;
}

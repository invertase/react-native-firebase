import { ConfigPlugin, WarningAggregator, withProjectBuildGradle } from '@expo/config-plugins';

import { googleServicesClassPath, googleServicesVersion } from './constants';

/**
 * Update `<project>/build.gradle` by adding google-services dependency to buildscript
 */
export const withBuildscriptDependency: ConfigPlugin = config => {
  return withProjectBuildGradle(config, config => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = setBuildscriptDependency(config.modResults.contents);
    } else {
      WarningAggregator.addWarningAndroid(
        'react-native-firebase-app',
        `Cannot automatically configure project build.gradle if it's not groovy`,
      );
    }
    return config;
  });
};

export function setBuildscriptDependency(buildGradle: string) {
  if (!buildGradle.includes(googleServicesClassPath)) {
    // TODO: Find a more stable solution for this
    return buildGradle.replace(
      /dependencies\s?{/,
      `dependencies {
        classpath '${googleServicesClassPath}:${googleServicesVersion}'`,
    );
  } else {
    return buildGradle;
  }
}

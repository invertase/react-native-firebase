import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';

import { withApplyappDistributionPlugin, withBuildscriptDependency } from './android';

/**
 * A config plugin for configuring `@react-native-firebase/app-distribution`
 */
const withRnFirebaseAppDistribution: ConfigPlugin = config => {
  return withPlugins(config, [withBuildscriptDependency, withApplyappDistributionPlugin]);
};

const pak = require('@react-native-firebase/app-distribution/package.json');
export default createRunOncePlugin(withRnFirebaseAppDistribution, pak.name, pak.version);

import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';

import { withApplyCrashlyticsPlugin, withBuildscriptDependency } from './android';

/**
 * A config plugin for configuring `@react-native-firebase/crashlytics`
 */
const withRnFirebaseCrashlytics: ConfigPlugin = config => {
  return withPlugins(config, [withBuildscriptDependency, withApplyCrashlyticsPlugin]);
};

const pak = require('@react-native-firebase/crashlytics/package.json');
export default createRunOncePlugin(withRnFirebaseCrashlytics, pak.name, pak.version);

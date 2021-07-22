import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';

import { withApplyPerfPlugin, withBuildscriptDependency } from './android';

/**
 * A config plugin for configuring `@react-native-firebase/perf`
 */
const withRnFirebasePerf: ConfigPlugin = config => {
  return withPlugins(config, [withBuildscriptDependency, withApplyPerfPlugin]);
};

const pak = require('@react-native-firebase/perf/package.json');
export default createRunOncePlugin(withRnFirebasePerf, pak.name, pak.version);

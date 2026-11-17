import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';

import {
  withIosWithoutAdIdSupport,
  withIosGoogleAppMeasurementOnDeviceConversion,
  withIosSceneLinkAttribution,
} from './ios';
import { PluginConfigType } from './pluginConfig';

/**
 * A config plugin for configuring `@react-native-firebase/analytics`
 */
const withRnFirebaseAnalytics: ConfigPlugin<PluginConfigType> = (config, props) => {
  return withPlugins(config, [
    // iOS
    [withIosWithoutAdIdSupport, props],
    [withIosGoogleAppMeasurementOnDeviceConversion, props],
    withIosSceneLinkAttribution,
  ]);
};

const pak = require('../../package.json');
export default createRunOncePlugin(withRnFirebaseAnalytics, pak.name, pak.version);

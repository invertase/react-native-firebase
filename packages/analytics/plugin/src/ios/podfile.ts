import { ConfigPlugin, withPodfile } from '@expo/config-plugins';
import {
  mergeContents,
  removeGeneratedContents,
} from '@expo/config-plugins/build/utils/generateCode';

import { PluginConfigType } from '../pluginConfig';

const TAG = '@react-native-firebase/analytics-withoutAdIdSupport';
const ANCHOR = /prepare_react_native_project!/;
const FLAG = '$RNFirebaseAnalyticsWithoutAdIdSupport = true';
const TAG_ODM = '@react-native-firebase/analytics-googleAppMeasurementOnDeviceConversion';
const FLAG_ODM = '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true';

export function setAnalyticsPodfileWithoutAdIdSupport(
  src: string,
  enabled: boolean = false,
): string {
  if (!enabled) {
    return removeGeneratedContents(src, TAG) ?? src;
  }

  return mergeContents({
    src,
    newSrc: FLAG,
    tag: TAG,
    anchor: ANCHOR,
    offset: 1,
    comment: '#',
  }).contents;
}

export function setAnalyticsPodfileGoogleAppMeasurementOnDeviceConversion(
  src: string,
  enabled: boolean = false,
): string {
  if (!enabled) {
    return removeGeneratedContents(src, TAG_ODM) ?? src;
  }

  return mergeContents({
    src,
    newSrc: FLAG_ODM,
    tag: TAG_ODM,
    anchor: ANCHOR,
    offset: 1,
    comment: '#',
  }).contents;
}

export const withIosGoogleAppMeasurementOnDeviceConversion: ConfigPlugin<PluginConfigType> = (config, props) => {
  return withPodfile(config, config => {
    config.modResults.contents = setAnalyticsPodfileGoogleAppMeasurementOnDeviceConversion(
      config.modResults.contents,
      props?.ios?.googleAppMeasurementOnDeviceConversion === true,
    );

    return config;
  });
};

export const withIosWithoutAdIdSupport: ConfigPlugin<PluginConfigType> = (config, props) => {
  return withPodfile(config, config => {
    config.modResults.contents = setAnalyticsPodfileWithoutAdIdSupport(
      config.modResults.contents,
      props?.ios?.withoutAdIdSupport === true,
    );

    return config;
  });
};

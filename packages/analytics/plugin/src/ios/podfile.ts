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

function setAnalyticsPodfileFlag(
  src: string,
  tag: string,
  flag: string,
  enabled: boolean = false,
): string {
  if (!enabled) {
    return removeGeneratedContents(src, tag) ?? src;
  }

  return mergeContents({
    src,
    newSrc: flag,
    tag,
    anchor: ANCHOR,
    offset: 1,
    comment: '#',
  }).contents;
}

export function setAnalyticsPodfileWithoutAdIdSupport(
  src: string,
  enabled: boolean = false,
): string {
  return setAnalyticsPodfileFlag(src, TAG, FLAG, enabled);
}

export function setAnalyticsPodfileGoogleAppMeasurementOnDeviceConversion(
  src: string,
  enabled: boolean = false,
): string {
  return setAnalyticsPodfileFlag(src, TAG_ODM, FLAG_ODM, enabled);
}

export const withIosGoogleAppMeasurementOnDeviceConversion: ConfigPlugin<PluginConfigType> = (
  config,
  props,
) => {
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

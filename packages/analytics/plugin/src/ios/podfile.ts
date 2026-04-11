import { ConfigPlugin, withPodfile } from '@expo/config-plugins';
import {
  mergeContents,
  removeGeneratedContents,
} from '@expo/config-plugins/build/utils/generateCode';

import { PluginConfigType } from '../pluginConfig';

const TAG = '@react-native-firebase/analytics-withoutAdIdSupport';
const ANCHOR = /prepare_react_native_project!/;
const FLAG = '$RNFirebaseAnalyticsWithoutAdIdSupport = true';

export function setAnalyticsPodfileWithoutAdIdSupport(
  src: string,
  enabled: boolean = false,
): string {
  if (!enabled) {
    return removeGeneratedContents(src, TAG) ?? src;
  }

  if (src.includes(FLAG)) {
    return src;
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

export const withIosWithoutAdIdSupport: ConfigPlugin<PluginConfigType> = (config, props) => {
  return withPodfile(config, config => {
    config.modResults.contents = setAnalyticsPodfileWithoutAdIdSupport(
      config.modResults.contents,
      props.ios?.withoutAdIdSupport === true,
    );

    return config;
  });
};

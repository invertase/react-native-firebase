import { ConfigPlugin, withPodfile } from '@expo/config-plugins';
import {
  mergeContents,
  removeGeneratedContents,
} from '@expo/config-plugins/build/utils/generateCode';

import { PluginConfigType } from '../pluginConfig';

const TAG = '@react-native-firebase/app-disableSPM';
const ANCHOR = /prepare_react_native_project!/;
const FLAG = '$RNFirebaseDisableSPM = true';

// The flag must be defined before any target block so firebase_spm.rb sees it
// when pods are declared - anchoring just after `prepare_react_native_project!`
// guarantees that in the Podfile Expo generates.
export function setAppPodfileDisableSPM(src: string, enabled: boolean = false): string {
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

export const withIosDisableSPM: ConfigPlugin<PluginConfigType> = (config, props) => {
  return withPodfile(config, config => {
    config.modResults.contents = setAppPodfileDisableSPM(
      config.modResults.contents,
      props?.ios?.disableSPM === true,
    );

    return config;
  });
};

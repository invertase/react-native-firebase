import { ConfigPlugin, withPodfile } from '@expo/config-plugins';
import { removeGeneratedContents } from '@expo/config-plugins/build/utils/generateCode';

import { PluginConfigType } from '../pluginConfig';

const TAG = '@react-native-firebase/app-disableSPM';

const DISABLE_SPM_UNSUPPORTED =
  '[react-native-firebase] ios.disableSPM is no longer supported. ' +
  'Firebase Apple SDK 13+ is distributed only through Swift Package Manager. ' +
  'Remove `disableSPM` from the `@react-native-firebase/app` config plugin and ' +
  'use dynamic frameworks (`expo-build-properties` ios.useFrameworks: "dynamic"). ' +
  'See https://rnfirebase.io/ios-spm';

// Historically injected `$RNFirebaseDisableSPM = true` before target blocks.
// Firebase 13+ is SPM-only: enabling this option must fail loudly, and any
// leftover generated flag is stripped on prebuild.
export function setAppPodfileDisableSPM(src: string, enabled: boolean = false): string {
  if (enabled) {
    throw new Error(DISABLE_SPM_UNSUPPORTED);
  }

  return removeGeneratedContents(src, TAG) ?? src;
}

export const withIosDisableSPM: ConfigPlugin<PluginConfigType> = (config, props) => {
  if (props?.ios?.disableSPM === true) {
    throw new Error(DISABLE_SPM_UNSUPPORTED);
  }

  return withPodfile(config, config => {
    // Strip a leftover DisableSPM flag from older prebuilds; never re-add it.
    config.modResults.contents = setAppPodfileDisableSPM(config.modResults.contents, false);

    return config;
  });
};

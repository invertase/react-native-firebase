import { Config, AndroidProjectConfig, IOSProjectConfig } from '@react-native-community/cli-types';

export default function getConfig(
  reactNativeConfig: Config,
): [AndroidProjectConfig, IOSProjectConfig] {
  const androidProjectConfig = reactNativeConfig.platforms.android.projectConfig(
    reactNativeConfig.root,
  ) as AndroidProjectConfig;

  const iosProjectConfig = reactNativeConfig.platforms.ios.projectConfig(
    reactNativeConfig.root,
  ) as IOSProjectConfig;

  return [androidProjectConfig, iosProjectConfig];
}

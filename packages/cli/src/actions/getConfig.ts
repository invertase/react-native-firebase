import { Config, AndroidProjectConfig, IOSProjectConfig } from '@react-native-community/cli-types';

export function getAndroidConfig(reactNativeConfig: Config) {
    return reactNativeConfig.platforms.android.projectConfig(
        reactNativeConfig.root,
    ) as AndroidProjectConfig;
}

export function getIosConfig(reactNativeConfig: Config) {
    return reactNativeConfig.platforms.ios.projectConfig(
        reactNativeConfig.root,
        {} as any,
    ) as IOSProjectConfig;
}

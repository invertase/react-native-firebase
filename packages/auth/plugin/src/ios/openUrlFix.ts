import {
  ConfigPlugin,
  withAppDelegate,
  withInfoPlist,
  ExportedConfigWithProps,
  WarningAggregator,
} from '@expo/config-plugins';
import type { ExpoConfig } from '@expo/config/build/Config.types';
import type { AppDelegateProjectFile } from '@expo/config-plugins/build/ios/Paths';
import type { InfoPlist } from '@expo/config-plugins/build/ios/IosConfig.types';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';
import { PluginConfigType } from '../pluginConfig';

export const withIosCaptchaOpenUrlFix: ConfigPlugin<PluginConfigType> = (
  config: ExpoConfig,
  props?: PluginConfigType,
) => {
  // check configuration
  if (!shouldApplyIosOpenUrlFix({ config, props })) {
    return config;
  }

  // check that swizzling is enabled; otherwise patch must be customized and applied manually
  withInfoPlist(config, config => {
    ensureFirebaseSwizzlingIsEnabled(config);
    return config;
  });

  // apply patch
  return withAppDelegate(config, config => {
    return withOpenUrlFixForAppDelegate({ config, props });
  });
};

// Interpret the plugin config to determine whether this fix should be applied
export function shouldApplyIosOpenUrlFix({
  config,
  props,
}: {
  config: ExpoConfig;
  props?: PluginConfigType;
}): boolean {
  const flag = props?.ios?.captchaOpenUrlFix;
  if (flag === undefined || flag === 'default') {
    // by default, apply the fix whenever 'expo-router' is detected in the same project
    return isPluginEnabled(config, 'expo-router');
  } else if (flag === true || flag === false) {
    const isEnabled: boolean = flag;
    return isEnabled;
  } else {
    throw new Error(`Unexpected value for 'captchaOpenUrlFix' config option`);
  }
}

export function withOpenUrlFixForAppDelegate({
  config,
  props,
}: {
  config: ExportedConfigWithProps<AppDelegateProjectFile>;
  props?: PluginConfigType;
}) {
  const { language, contents } = config.modResults;
  const configValue = props?.ios?.captchaOpenUrlFix || 'default';

  const newContents = modifyAppDelegate(contents, language);
  if (newContents === null) {
    if (configValue === true) {
      throw new Error("Failed to apply iOS openURL fix because no 'openURL' method was found");
    } else {
      WarningAggregator.addWarningIOS(
        '@react-native-firebase/auth',
        "Skipping iOS openURL fix because no 'openURL' method was found",
      );
      return config;
    }
  } else {
    if (configValue === 'default') {
      WarningAggregator.addWarningIOS(
        '@react-native-firebase/auth',
        'modifying iOS AppDelegate openURL method to ignore firebaseauth reCAPTCHA redirect URLs',
      );
    }
    return {
      ...config,
      modResults: {
        ...config.modResults,
        contents: newContents,
      },
    };
  }
}

export function modifyAppDelegate(contents: string, language: string): string | null {
  if (language === 'objc' || language === 'objcpp') {
    return modifyObjcAppDelegate(contents);
  } else if (language === 'swift') {
    return modifySwiftAppDelegate(contents);
  } else {
    throw new Error(`Don't know how to apply openUrlFix to AppDelegate of language "${language}"`);
  }
}

const skipOpenUrlForFirebaseAuthBlock: string = `\
  if (url.host && [url.host caseInsensitiveCompare:@"firebaseauth"] == NSOrderedSame) {
    // invocations for Firebase Auth are handled elsewhere and should not be forwarded to Expo Router
    return NO;
  }\
`;

// NOTE: `mergeContents()` requires that this pattern not match newlines
export const appDelegateOpenUrlInsertionPointAfter: RegExp =
  /-\s*\(\s*BOOL\s*\)\s*application\s*:\s*\(\s*UIApplication\s*\*\s*\)\s*application\s+openURL\s*:\s*\(\s*NSURL\s*\*\s*\)\s*url\s+options\s*:\s*\(\s*NSDictionary\s*<\s*UIApplicationOpenURLOptionsKey\s*,\s*id\s*>\s*\*\s*\)\s*options\s*/; // 🙈

export const multiline_appDelegateOpenUrlInsertionPointAfter = new RegExp(
  appDelegateOpenUrlInsertionPointAfter.source + '\\s*{\\s*\\n',
);

// Returns contents of new AppDelegate with modification applied, or returns null if this patch is not applicable because the AppDelegate doesn't have an 'openURL' method to handle deep links.
export function modifyObjcAppDelegate(contents: string): string | null {
  const pattern = appDelegateOpenUrlInsertionPointAfter;
  const multilinePattern = multiline_appDelegateOpenUrlInsertionPointAfter;
  const fullMatch = contents.match(multilinePattern);
  if (!fullMatch) {
    if (contents.match(pattern)) {
      throw new Error("Failed to find insertion point; expected newline after '{'");
    } else if (contents.match(/openURL\s*:/)) {
      throw new Error(
        [
          "Failed to apply 'captchaOpenUrlFix' but detected 'openURL' method.",
          "Please manually apply the fix to your AppDelegate's openURL method,",
          "then update your app.config.json by configuring the '@react-native-firebase/auth' plugin",
          'to set `captchaOpenUrlFix: false`.',
        ].join(' '),
      );
    } else {
      // openURL method was not found in AppDelegate
      return null;
    }
  }
  const fullMatchNumLines = fullMatch[0].split('\n').length;
  const offset = fullMatchNumLines - 1;
  if (offset < 0) {
    throw new Error(`Failed to find insertion point; fullMatchNumLines=${fullMatchNumLines}`);
  }
  return mergeContents({
    tag: '@react-native-firebase/auth-openURL',
    src: contents,
    newSrc: skipOpenUrlForFirebaseAuthBlock,
    anchor: appDelegateOpenUrlInsertionPointAfter,
    offset,
    comment: '//',
  }).contents;
}

// NOTE: `mergeContents()` doesn't support newlines for the `anchor` regex, so we have to replace it manually
const skipOpenUrlForFirebaseAuthBlockSwift: string = `\
// @generated begin @react-native-firebase/auth-openURL - expo prebuild (DO NOT MODIFY)
    if url.host?.lowercased() == "firebaseauth" {
      // invocations for Firebase Auth are handled elsewhere and should not be forwarded to Expo Router
      return false
    }
// @generated end @react-native-firebase/auth-openURL\
`;

export const appDelegateSwiftOpenUrlInsertionPointAfter: RegExp =
  /public\s*override\s*func\s*application\s*\(\n\s*_\s*app\s*:\s*UIApplication,\n\s*open\s*url\s*:\s*URL,\n\s*options\s*:\s*\[UIApplication\.OpenURLOptionsKey\s*:\s*Any\]\s*=\s*\[:\]\n\s*\)\s*->\s*Bool\s*{\n/;

export function modifySwiftAppDelegate(contents: string): string | null {
  const pattern = appDelegateSwiftOpenUrlInsertionPointAfter;
  const fullMatch = contents.match(pattern);
  if (!fullMatch) {
    if (contents.match(/open url\s*:/)) {
      throw new Error(
        [
          "Failed to apply 'captchaOpenUrlFix' but detected 'openURL' method.",
          "Please manually apply the fix to your AppDelegate's openURL method,",
          "then update your app.config.json by configuring the '@react-native-firebase/auth' plugin",
          'to set `captchaOpenUrlFix: false`.',
        ].join(' '),
      );
    } else {
      // openURL method was not found in AppDelegate
      return null;
    }
  }
  return contents.replace(pattern, `${fullMatch[0]}${skipOpenUrlForFirebaseAuthBlockSwift}\n`);
}

export type ExpoConfigPluginEntry = string | [] | [string] | [string, any];

// Search the ExpoConfig plugins array to see if `pluginName` is present
function isPluginEnabled(config: ExpoConfig, pluginName: string): boolean {
  if (config.plugins === undefined) {
    return false;
  }
  return config.plugins.some((plugin: ExpoConfigPluginEntry) => {
    if (plugin === pluginName) {
      return true;
    } else if (Array.isArray(plugin) && plugin.length >= 1 && plugin[0] === pluginName) {
      return true;
    } else {
      return false;
    }
  });
}

export function isFirebaseSwizzlingDisabled(config: ExportedConfigWithProps<InfoPlist>): boolean {
  return config.ios?.infoPlist?.['FirebaseAppDelegateProxyEnabled'] === false;
}

export function ensureFirebaseSwizzlingIsEnabled(
  config: ExportedConfigWithProps<InfoPlist>,
): boolean {
  if (isFirebaseSwizzlingDisabled(config)) {
    throw new Error(
      [
        'Your app has disabled swizzling by setting FirebaseAppDelegateProxyEnabled=false in its Info.plist.',
        "Please update your app.config.json to configure the '@react-native-firebase/auth' plugin to set `captchaOpenUrlFix: false`",
        'and see https://firebase.google.com/docs/auth/ios/phone-auth#appendix:-using-phone-sign-in-without-swizzling for instructions.',
      ].join(' '),
    );
  } else {
    return true;
  }
}

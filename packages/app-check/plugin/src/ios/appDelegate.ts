import { ConfigPlugin, IOSConfig, WarningAggregator, withDangerousMod } from '@expo/config-plugins';
import { AppDelegateProjectFile } from '@expo/config-plugins/build/ios/Paths';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';
import fs from 'fs';

const methodInvocationBlock = `[RNFBAppCheckModule sharedInstance];`;
// https://regex101.com/r/mPgaq6/1
const methodInvocationLineMatcher =
  /(?:self\.moduleName\s*=\s*@\"([^"]*)\";)|(?:(self\.|_)(\w+)\s?=\s?\[\[UMModuleRegistryAdapter alloc\])|(?:RCTBridge\s?\*\s?(\w+)\s?=\s?\[(\[RCTBridge alloc\]|self\.reactDelegate))/g;

// https://regex101.com/r/nHrTa9/1/
// if the above regex fails, we can use this one as a fallback:
const fallbackInvocationLineMatcher =
  /-\s*\(BOOL\)\s*application:\s*\(UIApplication\s*\*\s*\)\s*\w+\s+didFinishLaunchingWithOptions:/g;

export function modifyObjcAppDelegate(contents: string): string {
  // Add import
  if (!contents.includes('#import <RNFBAppCheckModule.h>')) {
    contents = contents.replace(
      /#import "AppDelegate.h"/g,
      `#import "AppDelegate.h"
#import <RNFBAppCheckModule.h>`,
    );
  }

  // To avoid potential issues with existing changes from older plugin versions
  if (contents.includes(methodInvocationBlock)) {
    return contents;
  }

  if (
    !methodInvocationLineMatcher.test(contents) &&
    !fallbackInvocationLineMatcher.test(contents)
  ) {
    WarningAggregator.addWarningIOS(
      '@react-native-firebase/app-check',
      'Unable to determine correct Firebase insertion point in AppDelegate.m. Skipping Firebase addition.',
    );
    return contents;
  }

  // Add invocation
  try {
    return mergeContents({
      tag: '@react-native-firebase/app-check-didFinishLaunchingWithOptions',
      src: contents,
      newSrc: methodInvocationBlock,
      anchor: methodInvocationLineMatcher,
      offset: 0, // new line will be inserted right above matched anchor
      comment: '//',
    }).contents;
  } catch (_: any) {
    // tests if the opening `{` is in the new line
    const multilineMatcher = new RegExp(fallbackInvocationLineMatcher.source + '.+\\n*{');
    const isHeaderMultiline = multilineMatcher.test(contents);

    // we fallback to another regex if the first one fails
    return mergeContents({
      tag: '@react-native-firebase/app-didFinishLaunchingWithOptions-fallback',
      src: contents,
      newSrc: methodInvocationBlock,
      anchor: fallbackInvocationLineMatcher,
      // new line will be inserted right below matched anchor
      // or two lines, if the `{` is in the new line
      offset: isHeaderMultiline ? 2 : 1,
      comment: '//',
    }).contents;
  }
}

export function modifySwiftAppDelegate(contents: string): string {
  // Add imports for Swift
  if (!contents.includes('import RNFBAppCheck')) {
    // Try to add after FirebaseCore if it exists
    if (contents.includes('import FirebaseCore')) {
      contents = contents.replace(
        /import FirebaseCore/g,
        `import FirebaseCore
import RNFBAppCheck`,
      );
    } else {
      // Otherwise add after Expo
      contents = contents.replace(
        /import Expo/g,
        `import Expo
import RNFBAppCheck`,
      );
    }
  }

  // Check if App Check code is already added to avoid duplication
  if (contents.includes('RNFBAppCheckModule.sharedInstance()')) {
    return contents;
  }

  // Find the Firebase initialization end line to insert after
  const firebaseLine = '// @generated end @react-native-firebase/app-didFinishLaunchingWithOptions';

  if (contents.includes(firebaseLine)) {
    // Insert right after Firebase initialization
    return contents.replace(
      firebaseLine,
      `${firebaseLine}
        RNFBAppCheckModule.sharedInstance()
        FirebaseApp.configure()
      `,
    );
  }

  // If Firebase initialization block not found, add both Firebase and App Check initialization
  // This is to make sure Firebase is initialized before App Check
  const methodInvocationBlock = `RNFBAppCheckModule.sharedInstance()
    FirebaseApp.configure()`;

  const methodInvocationLineMatcher = /(?:factory\.startReactNative\()/;

  if (!methodInvocationLineMatcher.test(contents)) {
    WarningAggregator.addWarningIOS(
      '@react-native-firebase/app-check',
      'Unable to determine correct insertion point in AppDelegate.swift. Skipping App Check addition.',
    );
    return contents;
  }

  try {
    return mergeContents({
      tag: '@react-native-firebase/app-check',
      src: contents,
      newSrc: methodInvocationBlock,
      anchor: methodInvocationLineMatcher,
      offset: 0,
      comment: '//',
    }).contents;
  } catch (_e) {
    WarningAggregator.addWarningIOS(
      '@react-native-firebase/app-check',
      'Failed to insert App Check initialization code.',
    );
    return contents;
  }
}

export async function modifyAppDelegateAsync(appDelegateFileInfo: AppDelegateProjectFile) {
  const { language, path, contents } = appDelegateFileInfo;

  let newContents;
  if (['objc', 'objcpp'].includes(language)) {
    newContents = modifyObjcAppDelegate(contents);
  } else if (language === 'swift') {
    newContents = modifySwiftAppDelegate(contents);
  } else {
    throw new Error(`Cannot add Firebase code to AppDelegate of language "${language}"`);
  }

  await fs.promises.writeFile(path, newContents);
}

export const withFirebaseAppDelegate: ConfigPlugin = config => {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const fileInfo = IOSConfig.Paths.getAppDelegate(config.modRequest.projectRoot);
      await modifyAppDelegateAsync(fileInfo);
      return config;
    },
  ]);
};

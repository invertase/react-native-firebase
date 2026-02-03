import { ConfigPlugin, IOSConfig, WarningAggregator, withDangerousMod } from '@expo/config-plugins';
import { AppDelegateProjectFile } from '@expo/config-plugins/build/ios/Paths';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';
import fs from 'fs';
import path from 'path';

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

export function modifySwiftBridgingHeader(projectRoot: string): void {
  // RNFBAppCheck is an Obj-C pod without a Swift module map, so
  // `import RNFBAppCheck` in Swift fails. Instead, expose the
  // Obj-C header via the bridging header.
  const iosDir = path.join(projectRoot, 'ios');
  if (!fs.existsSync(iosDir)) return;

  // Find the bridging header (ProjectName-Bridging-Header.h)
  const entries = fs.readdirSync(iosDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const bridgingHeader = path.join(iosDir, entry.name, `${entry.name}-Bridging-Header.h`);
    if (fs.existsSync(bridgingHeader)) {
      let contents = fs.readFileSync(bridgingHeader, 'utf-8');
      contents = modifySwiftBridgingHeaderContents(contents);
      fs.writeFileSync(bridgingHeader, contents);
      break;
    }
  }
}

export function modifySwiftBridgingHeaderContents(contents: string): string {
  if (!contents.includes('#import <RNFBAppCheckModule.h>')) {
    contents += '\n#import <RNFBAppCheckModule.h>\n';
  }
  return contents;
}

export function modifySwiftAppDelegate(contents: string): string {
  // Remove any previously added `import RNFBAppCheck` since the pod
  // is Obj-C only and doesn't produce a Swift module. The class is
  // made available to Swift via the bridging header instead.
  contents = contents.replace(/import RNFBAppCheck\n/g, '');

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

export async function modifyAppDelegateAsync(
  appDelegateFileInfo: AppDelegateProjectFile,
  projectRoot?: string,
) {
  const { language, path: filePath, contents } = appDelegateFileInfo;

  let newContents;
  if (['objc', 'objcpp'].includes(language)) {
    newContents = modifyObjcAppDelegate(contents);
  } else if (language === 'swift') {
    newContents = modifySwiftAppDelegate(contents);
    if (projectRoot) {
      modifySwiftBridgingHeader(projectRoot);
    }
  } else {
    throw new Error(`Cannot add Firebase code to AppDelegate of language "${language}"`);
  }

  await fs.promises.writeFile(filePath, newContents);
}

export const withFirebaseAppDelegate: ConfigPlugin = config => {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const fileInfo = IOSConfig.Paths.getAppDelegate(config.modRequest.projectRoot);
      await modifyAppDelegateAsync(fileInfo, config.modRequest.projectRoot);
      return config;
    },
  ]);
};

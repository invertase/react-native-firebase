import { ConfigPlugin, IOSConfig, WarningAggregator, withDangerousMod } from '@expo/config-plugins';
import { AppDelegateProjectFile } from '@expo/config-plugins/build/ios/Paths';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';
import fs from 'fs';

function addImport(
  contents: string,
  importLine: string,
  existingImportMatcher: RegExp,
  preferredAnchorMatcher: RegExp,
  anyImportMatcher: RegExp,
): string {
  if (existingImportMatcher.test(contents)) {
    return contents;
  }

  const newline = contents.includes('\r\n') ? '\r\n' : '\n';
  const preferredAnchor = preferredAnchorMatcher.exec(contents);
  if (preferredAnchor?.index !== undefined) {
    const insertionPoint = preferredAnchor.index + preferredAnchor[0].length;
    return `${contents.slice(0, insertionPoint)}${newline}${importLine}${contents.slice(
      insertionPoint,
    )}`;
  }

  const firstImport = anyImportMatcher.exec(contents);
  if (firstImport?.index !== undefined) {
    return `${contents.slice(0, firstImport.index)}${importLine}${newline}${contents.slice(
      firstImport.index,
    )}`;
  }

  return `${importLine}${newline}${contents}`;
}

export function modifyObjcAppDelegate(contents: string): string {
  const methodInvocationBlock = `[FIRApp configure];`;
  // https://regex101.com/r/mPgaq6/1
  const methodInvocationLineMatcher =
    /(?:self\.moduleName\s*=\s*@\"([^"]*)\";)|(?:(self\.|_)(\w+)\s?=\s?\[\[UMModuleRegistryAdapter alloc\])|(?:RCTBridge\s?\*\s?(\w+)\s?=\s?\[(\[RCTBridge alloc\]|self\.reactDelegate))/g;

  // https://regex101.com/r/nHrTa9/1/
  // if the above regex fails, we can use this one as a fallback:
  const fallbackInvocationLineMatcher =
    /-\s*\(BOOL\)\s*application:\s*\(UIApplication\s*\*\s*\)\s*\w+\s+didFinishLaunchingWithOptions:/g;

  // Add import
  contents = addImport(
    contents,
    '#import <Firebase/Firebase.h>',
    /^[ \t]*#import\s+<Firebase\/Firebase\.h>[ \t]*$/m,
    /^[ \t]*#import\s+"AppDelegate\.h"[ \t]*$/m,
    /^[ \t]*#import\b[^\r\n]*$/m,
  );

  // To avoid potential issues with existing changes from older plugin versions
  if (contents.includes(methodInvocationBlock)) {
    return contents;
  }

  if (
    !methodInvocationLineMatcher.test(contents) &&
    !fallbackInvocationLineMatcher.test(contents)
  ) {
    WarningAggregator.addWarningIOS(
      '@react-native-firebase/app',
      'Unable to determine correct Firebase insertion point in AppDelegate.m. Skipping Firebase addition.',
    );
    return contents;
  }

  // Add invocation
  try {
    return mergeContents({
      tag: '@react-native-firebase/app-didFinishLaunchingWithOptions',
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
  const methodInvocationBlock = `FirebaseApp.configure()`;
  const methodInvocationLineMatcher =
    /(?:self\.moduleName\s*=\s*"([^"]*)")|(?:factory\.startReactNative\()/;

  // Add import
  contents = addImport(
    contents,
    'import FirebaseCore',
    /^[ \t]*import\s+FirebaseCore[ \t]*$/m,
    /^[ \t]*import\s+Expo[ \t]*$/m,
    /^[ \t]*import\b[^\r\n]*$/m,
  );

  // To avoid potential issues with existing changes from older plugin versions
  if (contents.includes(methodInvocationBlock)) {
    return contents;
  }

  if (!methodInvocationLineMatcher.test(contents)) {
    WarningAggregator.addWarningIOS(
      '@react-native-firebase/app',
      'Unable to determine correct Firebase insertion point in AppDelegate.swift. Skipping Firebase addition.',
    );
    return contents;
  }

  // Add invocation
  return mergeContents({
    tag: '@react-native-firebase/app-didFinishLaunchingWithOptions',
    src: contents,
    newSrc: methodInvocationBlock,
    anchor: methodInvocationLineMatcher,
    offset: 0, // new line will be inserted right above matched anchor
    comment: '//',
  }).contents;
}

export async function modifyAppDelegateAsync(appDelegateFileInfo: AppDelegateProjectFile) {
  const { language, path, contents } = appDelegateFileInfo;

  let newContents = contents;

  switch (language) {
    case 'objc':
    case 'objcpp': {
      newContents = modifyObjcAppDelegate(contents);
      break;
    }
    case 'swift': {
      newContents = modifySwiftAppDelegate(contents);
      break;
    }
    default:
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

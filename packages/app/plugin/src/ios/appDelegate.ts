import { ConfigPlugin, IOSConfig, withDangerousMod } from '@expo/config-plugins';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';
import fs from 'fs';

const methodInvocationBlock = `[FIRApp configure];`;
// https://regex101.com/r/Imm3E8/1
const methodInvocationLineMatcher =
  /(?:(self\.|_)(\w+)\s?=\s?\[\[UMModuleRegistryAdapter alloc\])|(?:RCTBridge\s?\*\s?(\w+)\s?=\s?\[\[RCTBridge alloc\])/g;

export function modifyObjcAppDelegate(contents: string): string {
  // Add import
  if (!contents.includes('@import Firebase;')) {
    contents = contents.replace(
      /#import "AppDelegate.h"/g,
      `#import "AppDelegate.h"
@import Firebase;`,
    );
  }

  // To avoid potential issues with existing changes from older plugin versions
  if (contents.includes(methodInvocationBlock)) {
    return contents;
  }

  // Add invocation
  return mergeContents({
    tag: '@react-native-firebase/app-didFinishLaunchingWithOptions',
    src: contents,
    newSrc: methodInvocationBlock,
    anchor: methodInvocationLineMatcher,
    offset: 0, // new line will be inserted right before matched anchor
    comment: '//',
  }).contents;
}

export const withFirebaseAppDelegate: ConfigPlugin = config => {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const fileInfo = IOSConfig.Paths.getAppDelegate(config.modRequest.projectRoot);
      let contents = await fs.promises.readFile(fileInfo.path, 'utf-8');
      if (fileInfo.language === 'objc') {
        contents = modifyObjcAppDelegate(contents);
      } else {
        // TODO: Support Swift
        throw new Error(
          `Cannot add Firebase code to AppDelegate of language "${fileInfo.language}"`,
        );
      }
      await fs.promises.writeFile(fileInfo.path, contents);

      return config;
    },
  ]);
};

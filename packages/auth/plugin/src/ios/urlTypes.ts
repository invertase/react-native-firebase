import {
  ConfigPlugin,
  IOSConfig,
  withInfoPlist,
  withAppDelegate,
  ExportedConfigWithProps,
} from '@expo/config-plugins';
import type { AppDelegateProjectFile } from '@expo/config-plugins/build/ios/Paths';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';
import fs from 'fs';
import path from 'path';
import plist from 'plist';

// does this for you: https://firebase.google.com/docs/auth/ios/phone-auth#enable-phone-number-sign-in-for-your-firebase-project
export const withIosCaptchaUrlTypes: ConfigPlugin = config => {
  config = withInfoPlist(config, config => {
    return setUrlTypesForCaptcha({ config });
  });
  config = withAppDelegate(config, config => {
    return patchOpenUrlForCaptcha({ config });
  });
  return config;
};

function getReversedClientId(googleServiceFilePath: string): string {
  try {
    const googleServicePlist = fs.readFileSync(googleServiceFilePath, 'utf8');

    const googleServiceJson = plist.parse(googleServicePlist) as { REVERSED_CLIENT_ID: string };
    const REVERSED_CLIENT_ID = googleServiceJson.REVERSED_CLIENT_ID;

    if (!REVERSED_CLIENT_ID) {
      throw new TypeError('REVERSED_CLIENT_ID missing');
    }

    return REVERSED_CLIENT_ID;
  } catch {
    throw new Error(
      '[@react-native-firebase/auth] Failed to parse your GoogleService-Info.plist. Are you sure it is a valid Info.Plist file with a REVERSE_CLIENT_ID field?',
    );
  }
}

// add phone auth support by configuring recaptcha
// https://github.com/invertase/react-native-firebase/pull/6167
function addUriScheme(
  config: ExportedConfigWithProps<IOSConfig.InfoPlist>,
  reversedClientId: string,
): ExportedConfigWithProps<IOSConfig.InfoPlist> {
  if (!config.modResults) {
    config.modResults = {};
  }

  if (!config.modResults.CFBundleURLTypes) {
    config.modResults.CFBundleURLTypes = [];
  }

  const hasReverseClientId = config.modResults.CFBundleURLTypes?.some(urlType =>
    urlType.CFBundleURLSchemes.includes(reversedClientId),
  );

  if (!hasReverseClientId) {
    config.modResults.CFBundleURLTypes.push({
      CFBundleURLSchemes: [reversedClientId],
    });
  }

  return config;
}

export function setUrlTypesForCaptcha({
  config,
}: {
  config: ExportedConfigWithProps<IOSConfig.InfoPlist>;
}) {
  const googleServicesFileRelativePath = config.ios?.googleServicesFile;
  if (!googleServicesFileRelativePath) {
    throw new Error(
      `[@react-native-firebase/auth] Your app.json file is missing ios.googleServicesFile. Please add this field.`,
    );
  }
  const googleServiceFilePath = path.resolve(
    config.modRequest.projectRoot,
    googleServicesFileRelativePath,
  );

  if (!fs.existsSync(googleServiceFilePath)) {
    throw new Error(
      `[@react-native-firebase/auth] GoogleService-Info.plist doesn't exist in ${googleServiceFilePath}. Place it there or configure the path in app.json`,
    );
  }

  const reversedClientId = getReversedClientId(googleServiceFilePath);
  addUriScheme(config, reversedClientId);

  return config;
}

const skipOpenUrlForFirebaseAuthBlock = `\
  if ([url.host caseInsensitiveCompare:@"firebaseauth"] == NSOrderedSame) {
    // invocations for Firebase Auth are handled elsewhere and should not be forwarded to Expo Router
    return NO;
  }\
`;

// NOTE: `mergeContents()` requires that this pattern not match newlines
const appDelegateOpenUrlInsertionPointAfter =
  /-\s*\(\s*BOOL\s*\)\s*application\s*:\s*\(\s*UIApplication\s*\*\s*\)\s*application\s+openURL\s*:\s*\(\s*NSURL\s*\*\s*\)\s*url\s+options\s*:\s*\(\s*NSDictionary\s*<\s*UIApplicationOpenURLOptionsKey\s*,\s*id\s*>\s*\*\s*\)\s*options\s*/; // 🙈

function patchOpenUrlForCaptcha({ config }: {
  config: ExportedConfigWithProps<AppDelegateProjectFile>;
}) {
  const {contents} = config.modResults;
  const multilineMatcher = new RegExp(appDelegateOpenUrlInsertionPointAfter.source + '\\s*{\\s*\\n');
  const fullMatch = contents.match(multilineMatcher);
  if(!fullMatch) {
    throw new Error("Failed to find insertion point; expected newline after '{'");
  }
  const fullMatchNumLines = fullMatch[0].split('\n').length;
  const offset = fullMatchNumLines - 1;
  if(offset < 0) {
    throw new Error(`Failed to find insertion point; fullMatchNumLines=${fullMatchNumLines}`);
  }

  const newContents = mergeContents({
    tag: '@react-native-firebase/auth-openURL',
    src: contents,
    newSrc: skipOpenUrlForFirebaseAuthBlock ,
    anchor: appDelegateOpenUrlInsertionPointAfter,
    offset,
    comment: '//',
  }).contents;

  const newConfig = {
    ...config,
    modResults: {
      ...config.modResults,
      contents: newContents,
    },
  };
  return newConfig;
}

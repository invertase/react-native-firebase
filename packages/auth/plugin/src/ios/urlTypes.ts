import {
  ConfigPlugin,
  IOSConfig,
  withInfoPlist,
  ExportedConfigWithProps,
} from '@expo/config-plugins';
import fs from 'fs';
import path from 'path';
import plist from 'plist';

// does this for you: https://firebase.google.com/docs/auth/ios/phone-auth#enable-phone-number-sign-in-for-your-firebase-project
export const withIosCaptchaUrlTypes: ConfigPlugin = config => {
  return withInfoPlist(config, config => {
    if (!config.ios?.googleServicesFile) {
      throw new Error(
        'Path to GoogleService-Info.plist is not defined. Please specify the `expo.ios.googleServicesFile` field in app.json.',
      );
    }

    return setUrlTypesForCaptcha({ config });
  });
};

export function setUrlTypesForCaptcha({
  config,
}: {
  config: ExportedConfigWithProps<IOSConfig.InfoPlist>;
}) {
  const googleServicesFileRelativePath = config.ios.googleServicesFile;
  const googleServiceFilePath = path.resolve(
    config.modRequest.projectRoot,
    googleServicesFileRelativePath,
  );

  if (!fs.existsSync(googleServiceFilePath)) {
    throw new Error(
      `GoogleService-Info.plist doesn't exist in ${googleServiceFilePath}. Place it there or configure the path in app.json`,
    );
  }

  let REVERSED_CLIENT_ID: string;
  try {
    const googleServicePlist = fs.readFileSync(googleServiceFilePath, 'utf8');

    const googleServiceJson = plist.parse(googleServicePlist) as { REVERSED_CLIENT_ID: string };
    REVERSED_CLIENT_ID = googleServiceJson.REVERSED_CLIENT_ID;
  } catch {
    throw new Error(
      '[@react-native-firebase/app] Failed to parse your GoogleService-Info.plist. Are you sure it is a valid Info.Plist file with a REVERSE_CLIENT_ID field?',
    );
  }

  if (!config.modResults) {
    config.modResults = {};
  }

  if (config.modResults.CFBundleURLTypes) {
    config.modResults.CFBundleURLTypes = [];
  }

  const hasReverseClientId = config.modResults.CFBundleURLTypes.some(urlType =>
    urlType.CFBundleURLSchemes.includes(REVERSED_CLIENT_ID),
  );

  if (!hasReverseClientId) {
    config.modResults.CFBundleURLTypes.push({
      CFBundleURLSchemes: [REVERSED_CLIENT_ID],
    });
  }
  return config;
}

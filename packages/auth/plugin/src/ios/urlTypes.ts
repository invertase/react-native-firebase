import {
  ConfigPlugin,
  IOSConfig,
  withInfoPlist,
  ExportedConfigWithProps,
} from '@expo/config-plugins';
import fs from 'fs';
import path from 'path';
import plist from 'plist';
import { PluginConfigType } from '../pluginConfig';

// does this for you: https://firebase.google.com/docs/auth/ios/phone-auth#enable-phone-number-sign-in-for-your-firebase-project
export const withIosCaptchaUrlTypes: ConfigPlugin<PluginConfigType> = config => {
  return withInfoPlist(config, config => {
    return setUrlTypesForCaptcha({ config });
  });
};

function getReversedClientId(googleServiceFilePath: string): string {
  try {
    const googleServicePlist = fs.readFileSync(googleServiceFilePath, 'utf8');

    const googleServiceJson = plist.parse(googleServicePlist) as { REVERSED_CLIENT_ID: string };
    const REVERSED_CLIENT_ID = googleServiceJson.REVERSED_CLIENT_ID;

    return REVERSED_CLIENT_ID;
  } catch {
    throw new Error(
      '[@react-native-firebase/auth] Failed to parse your GoogleService-Info.plist. Are you sure it is a valid Info.Plist file with a REVERSED_CLIENT_ID field?',
    );
  }
}

// Utility function to make REVERSED_CLIENT_ID optional by only proceeding if it exists in Google-Services.plist
function reversedClientIDExists(googleServiceFilePath: string): boolean {
  try {
    const googleServicePlist = fs.readFileSync(googleServiceFilePath, 'utf8');
    const googleServiceJson = plist.parse(googleServicePlist) as { REVERSED_CLIENT_ID: string };
    return !!googleServiceJson.REVERSED_CLIENT_ID;
  } catch {
    return false;
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

  if (reversedClientIDExists(googleServiceFilePath)) {
    const reversedClientId = getReversedClientId(googleServiceFilePath);
    addUriScheme(config, reversedClientId);
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      '[@react-native-firebase/auth] REVERSED_CLIENT_ID field not found in GoogleServices-Info.plist. Google Sign-In requires this is - if you need Google Sign-In, enable it and re-download your plist file',
    );
  }

  return config;
}

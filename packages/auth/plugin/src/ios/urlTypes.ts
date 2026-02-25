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

// Derives the Encoded App ID from GOOGLE_APP_ID for reCAPTCHA URL scheme registration.
// Firebase requires this scheme for phone auth / SMS MFA reCAPTCHA fallback on iOS.
// See: https://firebase.google.com/docs/auth/ios/multi-factor#using_recaptcha_verification
// Transformation: "1:123456789012:ios:abc123" -> "app-1-123456789012-ios-abc123"
function getEncodedAppId(googleServiceFilePath: string): string {
  try {
    const googleServicePlist = fs.readFileSync(googleServiceFilePath, 'utf8');
    const googleServiceJson = plist.parse(googleServicePlist) as { GOOGLE_APP_ID: string };
    const GOOGLE_APP_ID = googleServiceJson.GOOGLE_APP_ID;
    return 'app-' + GOOGLE_APP_ID.replace(/:/g, '-');
  } catch {
    throw new Error(
      '[@react-native-firebase/auth] Failed to parse your GoogleService-Info.plist. Are you sure it is a valid Info.Plist file with a GOOGLE_APP_ID field?',
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

  if (reversedClientIDExists(googleServiceFilePath)) {
    const reversedClientId = getReversedClientId(googleServiceFilePath);
    addUriScheme(config, reversedClientId);
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      '[@react-native-firebase/auth] REVERSED_CLIENT_ID not found in GoogleService-Info.plist. This is required for Google Sign-In — if you need it, enable Google Sign-In in the Firebase console and re-download your plist. Phone auth reCAPTCHA will still work via the Encoded App ID scheme.',
    );
  }

  // Always add the Encoded App ID derived from GOOGLE_APP_ID for phone auth reCAPTCHA fallback.
  // Firebase requires this URL scheme on iOS when APNs is unavailable (e.g. Simulator).
  // GOOGLE_APP_ID is always present in a valid GoogleService-Info.plist, so no warning needed here.
  // See: https://firebase.google.com/docs/auth/ios/multi-factor#using_recaptcha_verification
  try {
    const encodedAppId = getEncodedAppId(googleServiceFilePath);
    addUriScheme(config, encodedAppId);
  } catch {
    // silently skip — a missing GOOGLE_APP_ID means the plist is malformed;
    // the file-existence and parse checks above will have already surfaced the real problem.
  }

  return config;
}

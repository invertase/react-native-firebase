const fs = require('fs');
const path = require('path');

const appDir = __dirname;
const localConfigPath = path.join(appDir, '.build-harness.local.json');
const defaultIosBundleId = 'io.invertase.react-native-demo';
const defaultAndroidApplicationId = 'com.invertase.testing';

function readLocalConfig() {
  if (!fs.existsSync(localConfigPath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));
  } catch (_error) {
    return {};
  }
}

module.exports = ({config}) => {
  const localConfig = readLocalConfig();
  const iosBundleIdentifier =
    process.env.RNFB_BUILD_HARNESS_IOS_BUNDLE_ID ||
    localConfig.iosBundleId ||
    defaultIosBundleId;
  const androidPackage =
    process.env.RNFB_BUILD_HARNESS_ANDROID_APPLICATION_ID ||
    localConfig.androidApplicationId ||
    defaultAndroidApplicationId;

  return {
    ...config,
    name: 'RNFB Expo Harness',
    slug: 'rnfb-build-harness-expo',
    scheme: 'rnfirebase-build-harness-expo',
    version: '0.0.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      bundleIdentifier: iosBundleIdentifier,
      googleServicesFile: './GoogleService-Info.plist',
      supportsTablet: true,
    },
    android: {
      package: androidPackage,
      googleServicesFile: './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
        backgroundColor: '#E6F4FE',
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-build-properties',
        // force static linking of RNFBApp to avoid issues with the static library being linked to the app's main executable
        // See: https://github.com/invertase/react-native-firebase/issues/8657
        {ios: {useFrameworks: 'static', forceStaticLinking: ['RNFBApp']}},
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/analytics',
      '@react-native-firebase/app-check',
      '@react-native-firebase/app-distribution',
      '@react-native-firebase/auth',
      '@react-native-firebase/crashlytics',
      '@react-native-firebase/messaging',
      '@react-native-firebase/perf',
    ],
    extra: {
      ...config.extra,
      buildHarness: {
        flavor: 'expo',
      },
    },
  };
};

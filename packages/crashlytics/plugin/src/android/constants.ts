const appPackageJson = require('@react-native-firebase/app/package.json');

export const crashlyticsClassPath = 'com.google.firebase:firebase-crashlytics-gradle';
export const crashlyticsPlugin = 'com.google.firebase.crashlytics';
export const crashlyticsVersion = appPackageJson.sdkVersions.android.firebaseCrashlyticsGradle;

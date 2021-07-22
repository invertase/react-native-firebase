const appPackageJson = require('@react-native-firebase/app/package.json');

export const perfMonitoringClassPath = 'com.google.firebase:perf-plugin';
export const perfMonitoringPlugin = 'com.google.firebase.firebase-perf';
export const perfMonitoringVersion = appPackageJson.sdkVersions.android.firebasePerfGradle;

const appPackageJson = require('@react-native-firebase/app/package.json');

export const appDistributionMonitoringClassPath =
  'com.google.firebase:firebase-appdistribution-gradle';
export const appDistributionMonitoringPlugin = 'com.google.firebase.appdistribution';
export const appDistributionMonitoringVersion =
  appPackageJson.sdkVersions.android.firebaseAppDistributionGradle;

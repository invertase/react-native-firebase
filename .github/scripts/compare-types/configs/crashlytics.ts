/**
 * Known differences between the firebase-js-sdk public API and
 * the @react-native-firebase/crashlytics modular API.
 *
 * Each entry must have a `name` and a `reason`. Undocumented drift fails CI.
 */

import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  nameMapping: {},

  missingInRN: [
  ],

  extraInRN: [
    { name: 'getCrashlytics', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'checkForUnsentReports', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'deleteUnsentReports', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'didCrashOnPreviousExecution', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'crash', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'log', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'recordError', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'sendUnsentReports', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'setUserId', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'setAttribute', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'setAttributes', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'setCrashlyticsCollectionEnabled', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'SDK_VERSION', reason: 'RN Firebase package version string exported from the modular entry point. The firebase-js-sdk does not export SDK_VERSION from @firebase/crashlytics.' },
    { name: 'Crashlytics', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'Statics', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'FirebaseApp', reason: 'RN Firebase export for the native crashlytics module. The firebase-js-sdk does not ship a modular public API for this product.' },
  ],

  differentShape: [
  ],
};

export default config;

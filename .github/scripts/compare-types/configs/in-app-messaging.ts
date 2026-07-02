/**
 * Known differences between the firebase-js-sdk public API and
 * the @react-native-firebase/in-app-messaging modular API.
 *
 * Each entry must have a `name` and a `reason`. Undocumented drift fails CI.
 */

import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  nameMapping: {},

  missingInRN: [
  ],

  extraInRN: [
    { name: 'getInAppMessaging', reason: 'RN Firebase export for the native in-app-messaging module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'isMessagesDisplaySuppressed', reason: 'RN Firebase export for the native in-app-messaging module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'setMessagesDisplaySuppressed', reason: 'RN Firebase export for the native in-app-messaging module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'isAutomaticDataCollectionEnabled', reason: 'RN Firebase export for the native in-app-messaging module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'setAutomaticDataCollectionEnabled', reason: 'RN Firebase export for the native in-app-messaging module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'triggerEvent', reason: 'RN Firebase export for the native in-app-messaging module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'SDK_VERSION', reason: 'RN Firebase package version string exported from the modular entry point. The firebase-js-sdk does not export SDK_VERSION from @firebase/in-app-messaging.' },
    { name: 'InAppMessaging', reason: 'RN Firebase export for the native in-app-messaging module. The firebase-js-sdk does not ship a modular public API for this product.' },
  ],

  differentShape: [
  ],
};

export default config;

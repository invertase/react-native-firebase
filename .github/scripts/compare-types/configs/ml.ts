/**
 * Known differences between the firebase-js-sdk public API and
 * the @react-native-firebase/ml modular API.
 *
 * Each entry must have a `name` and a `reason`. Undocumented drift fails CI.
 */

import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  nameMapping: {},

  missingInRN: [
  ],

  extraInRN: [
    { name: 'getML', reason: 'RN Firebase export for the native ml module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'SDK_VERSION', reason: 'RN Firebase package version string exported from the modular entry point. The firebase-js-sdk does not export SDK_VERSION from @firebase/ml.' },
    { name: 'FirebaseApp', reason: 'RN Firebase export for the native ml module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'FirebaseML', reason: 'RN Firebase export for the native ml module. The firebase-js-sdk does not ship a modular public API for this product.' },
  ],

  differentShape: [
  ],
};

export default config;

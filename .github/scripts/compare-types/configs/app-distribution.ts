/**
 * Known differences between the firebase-js-sdk public API and
 * the @react-native-firebase/app-distribution modular API.
 *
 * Each entry must have a `name` and a `reason`. Undocumented drift fails CI.
 */

import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  nameMapping: {},

  missingInRN: [
  ],

  extraInRN: [
    { name: 'getAppDistribution', reason: 'RN Firebase export for the native app-distribution module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'isTesterSignedIn', reason: 'RN Firebase export for the native app-distribution module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'signInTester', reason: 'RN Firebase export for the native app-distribution module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'checkForUpdate', reason: 'RN Firebase export for the native app-distribution module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'signOutTester', reason: 'RN Firebase export for the native app-distribution module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'SDK_VERSION', reason: 'RN Firebase package version string exported from the modular entry point. The firebase-js-sdk does not export SDK_VERSION from @firebase/app-distribution.' },
    { name: 'AppDistribution', reason: 'RN Firebase export for the native app-distribution module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'AppDistributionRelease', reason: 'RN Firebase export for the native app-distribution module. The firebase-js-sdk does not ship a modular public API for this product.' },
  ],

  differentShape: [
  ],
};

export default config;

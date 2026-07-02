/**
 * Known differences between the firebase-js-sdk public API and
 * the @react-native-firebase/functions modular API.
 *
 * Each entry must have a `name` and a `reason`. Undocumented drift fails CI.
 */

import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  nameMapping: {
    httpsCallableFromURL: 'httpsCallableFromUrl',
  },

  missingInRN: [
    { name: 'FunctionsError', reason: 'RN Firebase surfaces callable failures through the `HttpsError` class instead of the firebase-js-sdk `FunctionsError` export.' },
    { name: 'FunctionsErrorCodeCore', reason: 'Internal firebase-js-sdk error-code helper not re-exported by RN Firebase. Callable errors use `HttpsErrorCode` constants instead.' },
  ],

  extraInRN: [
    { name: 'HttpsErrorCode', reason: 'RN Firebase exposes callable error code constants as a standalone export. The firebase-js-sdk surfaces these through the `FunctionsErrorCode` enum instead.' },
    { name: 'SDK_VERSION', reason: 'RN Firebase package version string exported from the modular entry point. The firebase-js-sdk does not export SDK_VERSION from @firebase/functions.' },
    { name: 'HttpsError', reason: 'RN Firebase re-exports the callable `HttpsError` class from its modular entry point for ergonomic imports.' },
    { name: 'FunctionsStatics', reason: 'RN Firebase statics namespace type used by the legacy namespaced API surface. Not part of the firebase-js-sdk modular public API.' },
    { name: 'FirebaseApp', reason: 'RN Firebase re-exports `FirebaseApp` from the modular entry point for convenience.' },
  ],

  differentShape: [
    { name: 'Functions', reason: 'RN Firebase extends the Functions service interface with native region/custom-domain helpers and uses async callable factories.' },
    { name: 'FunctionsErrorCode', reason: 'RN Firebase `FunctionsErrorCode` enum includes additional native bridge error codes beyond the firebase-js-sdk set.' },
  ],
};

export default config;

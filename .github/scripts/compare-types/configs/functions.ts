/**
 * Known differences between the firebase-js-sdk @firebase/functions public
 * API and the @react-native-firebase/functions modular API.
 *
 * Each entry must have a `name` (the export name) and a `reason` explaining
 * why the difference exists. Any difference NOT listed here will cause CI to
 * fail so that new drift is caught and deliberately acknowledged.
 */

import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  nameMapping: {
    httpsCallableFromURL: 'httpsCallableFromUrl',
  },
  missingInRN: [],
  extraInRN: [
    {
      name: 'SDK_VERSION',
      reason:
        'RN Firebase package version string exported from the modular entry point. The firebase-js-sdk does not export SDK_VERSION from @firebase/functions.',
    },
    {
      name: 'HttpsError',
      reason:
        'RN Firebase exports the runtime callable error class as `HttpsError` (also aliased as `FunctionsError`). ' +
        'The firebase-js-sdk exports the `FunctionsError` class name only.',
    },
    {
      name: 'HttpsErrorCode',
      reason:
        'RN Firebase exports a const object of callable error code strings for backwards-compatible namespaced usage. ' +
        'The firebase-js-sdk does not export this helper from the modular entry point.',
    },
    {
      name: 'HttpsErrorCodeValue',
      reason:
        'RN Firebase type for unprefixed error codes returned by `HttpsError`, including RN-specific codes. ' +
        'The firebase-js-sdk uses prefixed `FunctionsErrorCode` values at runtime.',
    },
    {
      name: 'FunctionsStatics',
      reason:
        'Deprecated namespaced statics type retained for backwards compatibility. The firebase-js-sdk modular API does not export this helper type.',
    },
    {
      name: 'FirebaseApp',
      reason:
        'Deprecated re-export of `@react-native-firebase/app` `FirebaseApp` from the functions types module. ' +
        'Prefer importing `FirebaseApp` from `@react-native-firebase/app`.',
    },
  ],
  differentShape: [
    {
      name: 'FunctionsError',
      reason:
        'RN Firebase `FunctionsError` is an alias for `HttpsError`, whose runtime `code` values are unprefixed ' +
        'strings from the native bridge. The firebase-js-sdk `FunctionsError` class extends `FirebaseError` with ' +
        'prefixed `functions/` error codes.',
    },
    {
      name: 'Functions',
      reason:
        'RN Firebase `Functions` is a native module wrapper with `useEmulator` / deprecated `useFunctionsEmulator` ' +
        'methods. The firebase-js-sdk modular `Functions` service type has a different class shape.',
    },
  ],
};

export default config;

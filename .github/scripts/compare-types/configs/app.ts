/**
 * Known differences between firebase-js-sdk @firebase/app and
 * @react-native-firebase/app modular API.
 *
 * Each entry must have a `name` and a `reason`. Any undocumented
 * difference or stale entry will fail `yarn compare:types`.
 */

import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  nameMapping: {},

  missingInRN: [
    {
      name: 'initializeServerApp',
      reason:
        'firebase-js-sdk server-side rendering entry point. Not applicable to React Native.',
    },
    {
      name: 'FirebaseAppSettings',
      reason:
        'Settings type for firebase-js-sdk `FirebaseServerApp`. RN Firebase has no server-app API.',
    },
    {
      name: 'FirebaseError',
      reason:
        'firebase-js-sdk base error class. RN Firebase uses `ReactNativeFirebase.NativeFirebaseError` from the native bridge instead.',
    },
    {
      name: 'FirebaseOptions',
      reason:
        'firebase-js-sdk options interface. RN Firebase uses `ReactNativeFirebase.FirebaseAppOptions` (extends the same fields with RN-specific optional keys).',
    },
    {
      name: 'FirebaseServerApp',
      reason:
        'firebase-js-sdk server-side app instance type. Not applicable to React Native.',
    },
    {
      name: 'FirebaseServerAppSettings',
      reason:
        'Settings type for firebase-js-sdk server apps. Not applicable to React Native.',
    },
  ],

  extraInRN: [
    {
      name: 'setReactNativeAsyncStorage',
      reason:
        'RN Firebase-specific hook to wire `@react-native-async-storage/async-storage` into the firebase-js-sdk Other/Hermes persistence path.',
    },
    {
      name: 'metaGetAll',
      reason:
        'RN Firebase native bridge helper — reads all entries from the native Firebase metadata store.',
    },
    {
      name: 'jsonGetAll',
      reason:
        'RN Firebase native bridge helper — reads all entries from the native JSON config store.',
    },
    {
      name: 'preferencesClearAll',
      reason:
        'RN Firebase native bridge helper — clears native shared preferences used by Firebase.',
    },
    {
      name: 'preferencesGetAll',
      reason:
        'RN Firebase native bridge helper — reads all native shared preference entries.',
    },
    {
      name: 'preferencesSetBool',
      reason:
        'RN Firebase native bridge helper — sets a native boolean preference.',
    },
    {
      name: 'preferencesSetString',
      reason:
        'RN Firebase native bridge helper — sets a native string preference.',
    },
    {
      name: 'getUtils',
      reason:
        'RN Firebase entry point for the native Utils module (Play Services, file paths, etc.). No firebase-js-sdk modular equivalent.',
    },
    {
      name: 'FilePath',
      reason:
        'RN Firebase native device file-path constants for Storage and similar file-based APIs.',
    },
    {
      name: 'LogCallbackParams',
      reason:
        'RN Firebase log-handler callback payload type exported for modular `setLogLevel` wiring.',
    },
    {
      name: 'LogCallback',
      reason:
        'RN Firebase log-handler callback type exported for modular logging configuration.',
    },
    {
      name: 'LogOptions',
      reason:
        'RN Firebase log-handler options type exported for modular logging configuration.',
    },
  ],

  differentShape: [
    {
      name: 'deleteApp',
      reason:
        'Parameter type is `ReactNativeFirebase.FirebaseApp` instead of firebase-js-sdk `FirebaseApp`. Runtime behavior matches.',
    },
    {
      name: 'getApp',
      reason:
        'Return type is `ReactNativeFirebase.FirebaseApp` instead of firebase-js-sdk `FirebaseApp`. Runtime behavior matches.',
    },
    {
      name: 'getApps',
      reason:
        'Return type is `ReactNativeFirebase.FirebaseApp[]` instead of firebase-js-sdk `FirebaseApp[]`. Runtime behavior matches.',
    },
    {
      name: 'initializeApp',
      reason:
        'Returns `Promise<ReactNativeFirebase.FirebaseApp>` because initialization crosses the native bridge. Accepts `ReactNativeFirebase.FirebaseAppOptions` and optional `ReactNativeFirebase.FirebaseAppConfig` (name / auth domain) instead of firebase-js-sdk `(FirebaseOptions, string)` only.',
    },
    {
      name: 'setLogLevel',
      reason:
        'Parameter type is `ReactNativeFirebase.LogLevelString` instead of firebase-js-sdk `LogLevelString`. Accepted values match (`debug`, `verbose`, `info`, `warn`, `error`, `silent`).',
    },
    {
      name: 'FirebaseApp',
      reason:
        'RN Firebase exports the `ReactNativeFirebase.FirebaseApp` class/interface from shared app declarations instead of re-exporting firebase-js-sdk `FirebaseApp`.',
    },
  ],
};

export default config;

/**
 * Known differences between the firebase-js-sdk @firebase/remote-config public
 * API and the @react-native-firebase/remote-config modular API.
 *
 * Each entry must have a `name` (the export name) and a `reason` explaining
 * why the difference exists. Any difference NOT listed here will cause CI to
 * fail so that new drift is caught and deliberately acknowledged.
 *
 * Sections:
 *  nameMapping     — exports that exist in both packages but under different names
 *  missingInRN     — firebase-js-sdk exports absent from RN Firebase
 *  extraInRN       — RN Firebase exports not present in the firebase-js-sdk
 *  differentShape  — exports present in both but with differing signatures/members
 */

import type { PackageConfig } from '../../src/types';

const config: PackageConfig = {
  // ---------------------------------------------------------------------------
  // Name mapping
  // ---------------------------------------------------------------------------
  // ValueSource exists in both packages. In RN Firebase we export only the
  // value (from modular/statics) and use the value as the type; no type alias.
  // Both sides see `ValueSource` and they match — no mapping entry needed.
  nameMapping: {},

  // ---------------------------------------------------------------------------
  // Missing in RN Firebase
  // ---------------------------------------------------------------------------
  missingInRN: [
    // Currently empty — all firebase-js-sdk remote-config exports are present
    // in the RN Firebase modular API (though some have different shapes; see below).
  ],

  // ---------------------------------------------------------------------------
  // Extra in RN Firebase
  // ---------------------------------------------------------------------------
  extraInRN: [
    {
      name: 'LastFetchStatus',
      reason:
        'Namespaced constant re-exported from statics.d.ts for backwards ' +
        'compatibility with the class-based (namespaced) API. Not part of ' +
        'the firebase-js-sdk modular API.',
    },
    {
      name: 'fetchTimeMillis',
      reason:
        'Getter function returning the last fetch timestamp. In the ' +
        'firebase-js-sdk this value is accessed as the `fetchTimeMillis` ' +
        'property on the `RemoteConfig` object rather than a standalone function.',
    },
    {
      name: 'lastFetchStatus',
      reason:
        'Getter function returning the last fetch status. In the ' +
        'firebase-js-sdk this value is accessed as the `lastFetchStatus` ' +
        'property on the `RemoteConfig` object rather than a standalone function.',
    },
    {
      name: 'settings',
      reason:
        'Getter function returning the current `ConfigSettings`. In the ' +
        'firebase-js-sdk settings are accessed via the `settings` property ' +
        'on the `RemoteConfig` object rather than a standalone function.',
    },
    {
      name: 'onConfigUpdated',
      reason:
        'Deprecated RN Firebase listener for real-time config updates. ' +
        'Replaced by `onConfigUpdate()` which matches the firebase-js-sdk API.',
    },
    {
      name: 'reset',
      reason:
        'Android-only API that deletes all activated, fetched and default ' +
        'configs and resets all Remote Config settings. No equivalent exists ' +
        'in the firebase-js-sdk.',
    },
    {
      name: 'setConfigSettings',
      reason:
        'RN Firebase helper to update `minimumFetchIntervalMillis` and ' +
        '`fetchTimeoutMillis` asynchronously via the native module. In the ' +
        'firebase-js-sdk these properties are set by direct property assignment ' +
        'on the `RemoteConfig.settings` object.',
    },
    {
      name: 'setDefaults',
      reason:
        'RN Firebase API for setting default config values programmatically. ' +
        'The firebase-js-sdk uses direct assignment to `RemoteConfig.defaultConfig` ' +
        'instead.',
    },
    {
      name: 'setDefaultsFromResource',
      reason:
        'RN Firebase-specific API that loads default config values from a ' +
        'platform resource file (iOS .plist / Android XML). No equivalent ' +
        'exists in the firebase-js-sdk web API.',
    },
  ],

  // ---------------------------------------------------------------------------
  // Different shape
  // ---------------------------------------------------------------------------
  differentShape: [
    {
      name: 'ConfigUpdateObserver',
      reason:
        'The `error` callback parameter uses `ReactNativeFirebase.NativeFirebaseError` ' +
        'instead of `FirebaseError` from `@firebase/app`. Both represent Firebase ' +
        'errors but the RN type extends the native bridge error structure.',
    },
    {
      name: 'getRemoteConfig',
      reason:
        'The optional `app` parameter uses `ReactNativeFirebase.FirebaseApp` from ' +
        '`@react-native-firebase/app` instead of `FirebaseApp` from `@firebase/app`. ' +
        'Both types represent a Firebase app instance but come from different packages.',
    },
    {
      name: 'setLogLevel',
      reason:
        'Uses `LogLevel` matching firebase-js-sdk. RN Firebase returns `LogLevel`; ' +
        'firebase-js-sdk returns `void`. The return type is a legacy artefact of the RN implementation.',
    },
    {
      name: 'setCustomSignals',
      reason:
        'Returns `Promise<null>` in RN Firebase vs `Promise<void>` in the ' +
        'firebase-js-sdk. The native module resolves with `null` rather than ' +
        '`undefined`; both signal successful completion.',
    },
  ],
};

export default config;

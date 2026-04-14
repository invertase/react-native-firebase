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
  missingInRN: [
    {
      name: 'FetchResponse',
      reason:
        'Part of the firebase-js-sdk initialization options surface. RN Firebase ' +
        'does not expose `RemoteConfigOptions` or the web fetch-response bootstrap path.',
    },
    {
      name: 'FetchType',
      reason:
        'Used by the firebase-js-sdk web fetch-response bootstrap path. RN Firebase ' +
        'does not expose that initialization surface.',
    },
    {
      name: 'FirebaseExperimentDescription',
      reason:
        'Only used by the firebase-js-sdk fetch-response bootstrap types. RN Firebase ' +
        'does not expose that initialization surface.',
    },
    {
      name: 'FirebaseRemoteConfigObject',
      reason:
        'Only used by the firebase-js-sdk fetch-response bootstrap types. RN Firebase ' +
        'does not expose that initialization surface.',
    },
    {
      name: 'RemoteConfigOptions',
      reason:
        'The firebase-js-sdk supports optional initialization options when creating ' +
        'a Remote Config instance. RN Firebase does not expose this initialization API.',
    },
  ],
  // ---------------------------------------------------------------------------
  // Extra in RN Firebase
  // ---------------------------------------------------------------------------
  extraInRN: [
    {
      name: 'reset',
      reason:
        'Android-only API that deletes all activated, fetched and default ' +
        'configs and resets all Remote Config settings. No equivalent exists ' +
        'in the firebase-js-sdk.',
    },
    {
      name: 'setDefaultsFromResource',
      reason:
        'RN Firebase-specific API that loads default config values from a ' +
        'platform resource file (iOS .plist / Android XML). No equivalent ' +
        'exists in the firebase-js-sdk web API.',
    },
  ],
  differentShape: [
    {
      name: 'ConfigUpdateObserver',
      reason:
        'The `error` callback parameter uses `ReactNativeFirebase.NativeFirebaseError` ' +
        'instead of `FirebaseError` from `@firebase/app`. Both represent Firebase ' +
        'errors but the RN type extends the native bridge error structure.',
    },
    {
      name: 'FetchStatus',
      reason:
        'RN Firebase preserves the long-standing native string literals ' +
        '(`no_fetch_yet` / `throttled`) used by both the namespaced API and native bridge, ' +
        'instead of the firebase-js-sdk web literals (`no-fetch-yet` / `throttle`).',
    },
    {
      name: 'getRemoteConfig',
      reason:
        'The firebase-js-sdk accepts an optional `RemoteConfigOptions` second argument. ' +
        'RN Firebase only accepts the optional app instance and does not expose the ' +
        'initialization-options surface.',
    },
  ],
};

export default config;

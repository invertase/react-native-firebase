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
  nameMapping: {
    FetchStatus: 'LastFetchStatusType',
    LogLevel: 'RemoteConfigLogLevel',
    RemoteConfigSettings: 'ConfigSettings',
    Value: 'ConfigValue',
  },

  // ---------------------------------------------------------------------------
  // Missing in RN Firebase
  // ---------------------------------------------------------------------------
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
      name: 'ConfigValues',
      reason:
        'RN Firebase-specific type alias for `{ [key: string]: Value }`, ' +
        'semantically equivalent to `Record<string, Value>` used in the ' +
        'firebase-js-sdk. Kept for backwards compatibility.',
    },
    {
      name: 'LastFetchStatus',
      reason:
        'Namespaced constant re-exported from statics.d.ts for backwards ' +
        'compatibility with the class-based (namespaced) API. Not part of ' +
        'the firebase-js-sdk modular API.',
    },
    {
      name: 'ConfigDefaults',
      reason:
        'RN Firebase-specific exported alias for the default-config object shape. ' +
        'The firebase-js-sdk exposes this shape inline on `RemoteConfig.defaultConfig` ' +
        'rather than as a standalone named export.',
    },
    {
      name: 'fetch',
      reason:
        'Legacy RN Firebase fetch API that accepts an optional ' +
        '`expirationDurationSeconds` parameter. Prefer `fetchConfig()` which ' +
        'matches the firebase-js-sdk API. Kept for backwards compatibility.',
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
        '`fetchTimeMillis` asynchronously via the native module. In the ' +
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
      name: 'FetchStatus',
      reason:
        'Mapped to `LastFetchStatusType` in RN Firebase. The literal values differ ' +
        '(`no-fetch-yet`/`throttle` in the firebase-js-sdk versus ' +
        '`no_fetch_yet`/`throttled` in RN Firebase).',
    },
    {
      name: 'getAll',
      reason:
        'Returns `ConfigValues` (RN Firebase type alias for `{ [key: string]: Value }`) ' +
        'instead of `Record<string, Value>`. The two types are structurally equivalent; ' +
        'the alias is retained for backwards compatibility.',
    },
    {
      name: 'getValue',
      reason:
        'Returns `ConfigValue` in RN Firebase instead of the firebase-js-sdk `Value` ' +
        'type. `nameMapping` only remaps top-level exports, so this nested return type ' +
        'difference still needs to be documented on the function itself.',
    },
    {
      name: 'getRemoteConfig',
      reason:
        'The firebase-js-sdk accepts an optional `RemoteConfigOptions` second argument. ' +
        'RN Firebase only accepts the optional app instance and does not expose the ' +
        'initialization-options surface.',
    },
    {
      name: 'RemoteConfig',
      reason:
        'The RN Firebase interface extends the native module surface and uses ' +
        'RN-specific named exports such as `ConfigSettings`, `ConfigDefaults`, and ' +
        '`LastFetchStatusType`, so the public shape differs from the firebase-js-sdk.',
    },
    {
      name: 'RemoteConfigSettings',
      reason:
        'Mapped to `ConfigSettings` in RN Firebase. RN Firebase uses the legacy ' +
        '`fetchTimeMillis` property and makes both settings optional, whereas the ' +
        'firebase-js-sdk exposes `fetchTimeoutMillis` and required fields.',
    },
    {
      name: 'setLogLevel',
      reason:
        'The RN Firebase implementation accepts `RemoteConfigLogLevel` (a type alias ' +
        'for `LogLevel`) and returns it, whereas the firebase-js-sdk accepts `LogLevel` ' +
        'and returns `void`. The parameter types are semantically identical; the return ' +
        'type difference is a legacy artefact of the RN implementation.',
    },
    {
      name: 'Value',
      reason:
        'Mapped to `ConfigValue` in RN Firebase. The RN type returns `true | false` ' +
        'from `asBoolean()` and inlines the `getSource()` string union rather than ' +
        'referencing the SDK `ValueSource` type alias.',
    },
    {
      name: 'ValueSource',
      reason:
        'The firebase-js-sdk exports `ValueSource` as a type alias string union, ' +
        'whereas RN Firebase exports a backwards-compatible value object constant ' +
        'with `REMOTE`, `DEFAULT`, and `STATIC` properties.',
    },
  ],
};

export default config;

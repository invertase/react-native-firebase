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

import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  missingInRN: [
    {
      name: 'FetchType',
      reason:
        'Used by the firebase-js-sdk web fetch-response bootstrap path. RN Firebase ' +
        'does not expose that initialization surface.',
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
    {
      name: 'LastFetchStatus',
      reason:
        'RN Firebase exports fetch-status string literals as a named const object ' +
        '(`SUCCESS`, `FAILURE`, etc.) for modular callers. The firebase-js-sdk does ' +
        'not export this helper; web callers compare against string literals directly.',
    },
    {
      name: 'SDK_VERSION',
      reason:
        'RN Firebase package version string exported from the modular entry point. ' +
        'The firebase-js-sdk does not export `SDK_VERSION` from `@firebase/remote-config`.',
    },
  ],
  differentShape: [
    {
      name: 'FetchStatus',
      reason:
        'Intentional native bridge contract: RN Firebase preserves underscore literals ' +
        '(`no_fetch_yet`, `throttled`) returned by the iOS/Android Remote Config SDKs and ' +
        'used by the long-standing namespaced API. Aligning to firebase-js-sdk hyphen literals ' +
        '(`no-fetch-yet`, `throttle`) would be a breaking change for existing comparisons and ' +
        'cannot be normalized without native/bridge churn; not planned for compare-types parity.',
    },
    {
      name: 'ValueSource',
      reason:
        'RN Firebase exports value-source string literals as a named const object ' +
        '(`REMOTE`, `DEFAULT`, `STATIC`). The firebase-js-sdk exposes `ValueSource` as ' +
        'a string-literal type alias instead of a runtime constants object.',
    },
  ],
};

export default config;

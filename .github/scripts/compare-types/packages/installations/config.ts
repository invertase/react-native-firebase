/**
 * Known differences between the firebase-js-sdk @firebase/installations public
 * API and the @react-native-firebase/installations modular API.
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
  nameMapping: {},

  // ---------------------------------------------------------------------------
  // Missing in RN Firebase
  // ---------------------------------------------------------------------------
  missingInRN: [
    {
      name: 'IdChangeCallbackFn',
      reason:
        'The firebase-js-sdk exports this type alias for the callback passed to ' +
        '`onIdChange`. RN Firebase does not export it; the callback is typed inline. ' +
        '`onIdChange` itself is present but throws at runtime (unsupported).',
    },
    {
      name: 'IdChangeUnsubscribeFn',
      reason:
        'The firebase-js-sdk exports this type alias for the unsubscribe return of ' +
        '`onIdChange`. RN Firebase does not export it; the return type is inline `() => void`. ' +
        '`onIdChange` itself is present but throws at runtime (unsupported).',
    },
  ],

  // ---------------------------------------------------------------------------
  // Extra in RN Firebase
  // ---------------------------------------------------------------------------
  extraInRN: [
    {
      name: 'Statics',
      reason:
        'RN Firebase exposes a `Statics` interface (e.g. `SDK_VERSION`) for package ' +
        'version and static metadata. The firebase-js-sdk does not expose an equivalent ' +
        'named type in its public installations API.',
    },
    {
      name: 'FirebaseInstallationsTypes',
      reason:
        'RN Firebase exports the deprecated `FirebaseInstallationsTypes` namespace for ' +
        'backwards compatibility with the namespaced API. The firebase-js-sdk has no ' +
        'equivalent; it only exposes the modular API.',
    },
  ],

  // ---------------------------------------------------------------------------
  // Different shape
  // ---------------------------------------------------------------------------
  differentShape: [
    {
      name: 'getInstallations',
      reason:
        'The optional `app` parameter is typed as `ReactNativeFirebase.FirebaseApp` in RN Firebase ' +
        'and as `FirebaseApp` from `@firebase/app` in the firebase-js-sdk. Both represent the app ' +
        'instance; the RN type comes from the React Native Firebase app package.',
    },
    {
      name: 'Installations',
      reason:
        'The `app` property is typed as `ReactNativeFirebase.FirebaseApp` in RN Firebase ' +
        'and as `FirebaseApp` from `@firebase/app` in the firebase-js-sdk. Both represent ' +
        'the app instance; the RN type comes from the React Native Firebase app package.',
    },
    {
      name: 'onIdChange',
      reason:
        'RN Firebase exposes `onIdChange` with the same signature as the firebase-js-sdk ' +
        'for API compatibility, but it is not implemented: it throws at runtime with a message ' +
        'that the method is unsupported. The JS SDK supports ID change callbacks; the native ' +
        'RN implementations do not yet provide this.',
    },
  ],
};

export default config;

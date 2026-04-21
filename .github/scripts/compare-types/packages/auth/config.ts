/**
 * Known differences between the firebase-js-sdk @firebase/auth public
 * API and the @react-native-firebase/auth modular API.
 *
 * Each entry must have a `name` (the export name) and a `reason` explaining
 * why the difference exists. Any difference NOT listed here will cause CI to
 * fail so that new drift is caught and deliberately acknowledged.
 */

import type { PackageConfig } from '../../src/types';

const config: PackageConfig = {
  nameMapping: {},

  missingInRN: [
    {
      name: 'initializeRecaptchaConfig',
      reason:
        'Web-only reCAPTCHA bootstrap helper from the firebase-js-sdk. RN Firebase does not expose browser reCAPTCHA initialization because native SDKs own the phone-auth verification flow.',
    },
    {
      name: 'ActionCodeOperation',
      reason:
        'Not yet exported as a standalone modular enum map. RN Firebase currently exposes action-code operations through older auth result shapes instead of the firebase-js-sdk public enum export.',
    },
    {
      name: 'AuthError',
      reason:
        'RN Firebase surfaces auth failures as `NativeFirebaseAuthError` / native bridge errors rather than exporting the firebase-js-sdk `AuthError` interface directly.',
    },
    {
      name: 'AuthErrorCodes',
      reason:
        'Not yet exported as the firebase-js-sdk `AuthErrorCodes` constant map. RN Firebase still relies on native error code strings.',
    },
    {
      name: 'browserCookiePersistence',
      reason:
        'Browser-only persistence implementation from the firebase-js-sdk. Not applicable to React Native native-auth persistence.',
    },
    {
      name: 'browserLocalPersistence',
      reason:
        'Browser-only localStorage persistence implementation from the firebase-js-sdk. Not applicable to React Native native-auth persistence.',
    },
    {
      name: 'browserPopupRedirectResolver',
      reason:
        'Browser-only popup/redirect resolver from the firebase-js-sdk. Native provider flows do not use the browser popup resolver stack.',
    },
    {
      name: 'browserSessionPersistence',
      reason:
        'Browser-only sessionStorage persistence implementation from the firebase-js-sdk. Not applicable to React Native native-auth persistence.',
    },
    {
      name: 'CompleteFn',
      reason:
        'Not yet surfaced as a first-class auth export in the compare-types modular surface. Listener completion callbacks are typed through RN Firebase helper types instead.',
    },
    {
      name: 'CustomParameters',
      reason:
        'Not yet exported as the firebase-js-sdk standalone custom-parameters interface. Provider parameter bags are still modeled through the legacy RNFB auth provider types.',
    },
    {
      name: 'debugErrorMap',
      reason:
        'firebase-js-sdk web error-map helper. RN Firebase does not expose the SDK error-map selection API.',
    },
    {
      name: 'EmailAuthCredential',
      reason:
        'Not yet exported as a standalone modular credential type. Email credentials are created and consumed through `EmailAuthProvider` and legacy auth credential shapes.',
    },
    {
      name: 'EmulatorConfig',
      reason:
        'Not yet exported as the firebase-js-sdk `EmulatorConfig` interface. RN Firebase connects to the emulator but does not currently surface the web SDK emulator config object.',
    },
    {
      name: 'ErrorFn',
      reason:
        'Not yet surfaced as a first-class auth export in the compare-types modular surface. Listener error callbacks are typed through RN Firebase helper types instead.',
    },
    {
      name: 'FacebookAuthProvider',
      reason:
        'Not yet surfaced as a direct modular/public auth export in the split TS surface. It remains available through the legacy namespaced export path.',
    },
    {
      name: 'GithubAuthProvider',
      reason:
        'Not yet surfaced as a direct modular/public auth export in the split TS surface. It remains available through the legacy namespaced export path.',
    },
    {
      name: 'GoogleAuthProvider',
      reason:
        'Not yet surfaced as a direct modular/public auth export in the split TS surface. It remains available through the legacy namespaced export path.',
    },
    {
      name: 'indexedDBLocalPersistence',
      reason:
        'IndexedDB persistence is web-only and not applicable to React Native native-auth persistence.',
    },
    {
      name: 'inMemoryPersistence',
      reason:
        'The firebase-js-sdk persistence object is not currently exported from RN Firebase. Native SDK state is managed by the underlying platform auth implementation.',
    },
    {
      name: 'NextFn',
      reason:
        'Not yet surfaced as a first-class auth export in the compare-types modular surface. Listener callback types are still routed through RN Firebase helper exports.',
    },
    {
      name: 'NextOrObserver',
      reason:
        'Not yet exported as the firebase-js-sdk standalone listener helper alias. RN Firebase currently uses its own package-local observer helper in the modular wrapper.',
    },
    {
      name: 'OAuthCredential',
      reason:
        'Not yet exported as a standalone modular credential type. OAuth credentials are still represented through the legacy RNFB auth credential surface.',
    },
    {
      name: 'OAuthCredentialOptions',
      reason:
        'Not yet exported as the firebase-js-sdk standalone OAuth credential options interface.',
    },
    {
      name: 'OperationType',
      reason:
        'Not yet exported as the firebase-js-sdk operation-type enum map. RN Firebase still models operation types through the legacy namespaced auth surface.',
    },
    {
      name: 'ParsedToken',
      reason:
        'Not yet exported as the firebase-js-sdk standalone parsed-token interface. RN Firebase exposes token claims through `IdTokenResult` only.',
    },
    {
      name: 'PhoneAuthCredential',
      reason:
        'Not yet exported as a standalone modular credential type. Phone credentials are created through `PhoneAuthProvider.credential()` and consumed through the legacy auth credential surface.',
    },
    {
      name: 'PhoneAuthProvider',
      reason:
        'Not yet surfaced as a direct modular/public auth export in the split TS surface. It remains available through the legacy namespaced export path.',
    },
    {
      name: 'PhoneInfoOptions',
      reason:
        'Not yet exported as the firebase-js-sdk standalone phone-info options interface. RN Firebase still uses older package-specific MFA phone option types.',
    },
    {
      name: 'PhoneMultiFactorAssertion',
      reason:
        'Not yet exported as the firebase-js-sdk standalone phone multi-factor assertion type.',
    },
    {
      name: 'PhoneSingleFactorInfoOptions',
      reason:
        'Not yet exported as the firebase-js-sdk standalone phone single-factor info options interface.',
    },
    {
      name: 'prodErrorMap',
      reason:
        'firebase-js-sdk web error-map helper. RN Firebase does not expose the SDK error-map selection API.',
    },
    {
      name: 'ProviderId',
      reason:
        'Not yet exported as the firebase-js-sdk provider-id enum map. RN Firebase still relies on provider ID strings and legacy provider classes.',
    },
    {
      name: 'ReactNativeAsyncStorage',
      reason:
        'The firebase-js-sdk React Native persistence helper type is not exported by RN Firebase because persistence is delegated to the native iOS/Android SDKs rather than configured through `initializeAuth()`.',
    },
    {
      name: 'RecaptchaParameters',
      reason: 'Browser reCAPTCHA configuration is not part of the RN Firebase native auth surface.',
    },
    {
      name: 'RecaptchaVerifier',
      reason:
        'Browser reCAPTCHA verifier implementation is not available in RN Firebase because native SDKs own application verification.',
    },
    {
      name: 'SAMLAuthProvider',
      reason:
        'SAMLAuthProvider is not yet surfaced on the RN Firebase modular/public auth surface.',
    },
    {
      name: 'SignInMethod',
      reason:
        'Not yet exported as the firebase-js-sdk sign-in-method enum map. RN Firebase still uses provider ID strings and legacy provider helpers.',
    },
    {
      name: 'TotpMultiFactorAssertion',
      reason:
        'Not yet exported as the firebase-js-sdk standalone TOTP multi-factor assertion type.',
    },
    {
      name: 'TwitterAuthProvider',
      reason:
        'Not yet surfaced as a direct modular/public auth export in the split TS surface. It remains available through the legacy namespaced export path.',
    },
    {
      name: 'Unsubscribe',
      reason:
        'Not yet surfaced as a first-class auth export in the compare-types modular surface. Unsubscribe functions are currently emitted through package-local callback typing.',
    },
    {
      name: 'UserProfile',
      reason:
        'Not yet exported as the firebase-js-sdk standalone `UserProfile` alias. RN Firebase still models profile payloads through `UpdateProfile` and the legacy user surface.',
    },
  ],

  extraInRN: [
    {
      name: 'FirebaseApp',
      reason:
        'RN Firebase-specific re-export of `ReactNativeFirebase.FirebaseApp` from `@react-native-firebase/app`. Not part of the firebase-js-sdk auth public API.',
    },
    {
      name: 'NativeFirebaseAuthError',
      reason:
        'RN Firebase-specific native bridge auth error type used in place of the firebase-js-sdk `AuthError` export.',
    },
    {
      name: 'OIDCProvider',
      reason:
        'RN Firebase-specific OIDC provider class export retained for compatibility with the existing package surface.',
    },
    {
      name: 'PhoneAuthState',
      reason: 'RN Firebase-specific enum-like object describing native phone-auth listener states.',
    },
    {
      name: 'MultiFactorInfoCommon',
      reason: 'RN Firebase-specific compatibility type used by the legacy namespaced MFA surface.',
    },
    {
      name: 'MultiFactor',
      reason:
        'RN Firebase-specific extra public type retained from the existing namespaced-compatible auth surface.',
    },
    {
      name: 'UpdateProfile',
      reason:
        'RN Firebase-specific named type export for the user profile update payload. The firebase-js-sdk inlines this object shape instead of exporting it separately.',
    },
    {
      name: 'ActionCodeSettingsAndroid',
      reason:
        'RN Firebase-specific split helper type for the Android portion of `ActionCodeSettings`.',
    },
    {
      name: 'ActionCodeInfoData',
      reason: 'RN Firebase-specific split helper type for the `ActionCodeInfo.data` payload.',
    },
    {
      name: 'ActionCodeSettingsIos',
      reason: 'RN Firebase-specific split helper type for the iOS portion of `ActionCodeSettings`.',
    },
    {
      name: 'AuthListenerCallback',
      reason:
        'RN Firebase-specific named callback alias retained from the existing auth package surface.',
    },
    {
      name: 'PhoneAuthSnapshot',
      reason:
        'RN Firebase-specific phone verification snapshot type used by native phone-auth listeners.',
    },
    {
      name: 'PhoneAuthError',
      reason:
        'RN Firebase-specific phone verification error snapshot type used by native phone-auth listeners.',
    },
    {
      name: 'PhoneAuthListener',
      reason: 'RN Firebase-specific listener object returned by `verifyPhoneNumber()`.',
    },
    {
      name: 'verifyPhoneNumber',
      reason:
        'RN Firebase-specific helper exposing the native phone verification listener flow; the firebase-js-sdk does not export this helper.',
    },
    {
      name: 'setLanguageCode',
      reason:
        'RN Firebase-specific modular helper function mirroring the existing native package surface; the firebase-js-sdk uses the writable `auth.languageCode` property instead.',
    },
    {
      name: 'useUserAccessGroup',
      reason:
        'RN Firebase-specific iOS keychain sharing helper with no firebase-js-sdk equivalent.',
    },
    {
      name: 'getCustomAuthDomain',
      reason:
        'RN Firebase-specific helper that exposes the configured native auth domain; no firebase-js-sdk equivalent exists.',
    },
  ],

  differentShape: [
    {
      name: 'beforeAuthStateChanged',
      reason:
        'RN Firebase exposes the helper as unsupported and returns a plain unsubscribe function type `() => void` rather than the firebase-js-sdk `Unsubscribe` alias.',
    },
    {
      name: 'connectAuthEmulator',
      reason:
        'The optional `disableWarnings` property is modeled as optional in RN Firebase, while the firebase-js-sdk public type text shows a required boolean property.',
    },
    {
      name: 'getMultiFactorResolver',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.getMultiFactorResolver` alias instead of a firebase-js-sdk-aligned direct modular function type.',
    },
    {
      name: 'isSignInWithEmailLink',
      reason:
        'RN Firebase resolves this check asynchronously through the native bridge and returns `Promise<boolean>`, whereas the firebase-js-sdk returns a synchronous `boolean`.',
    },
    {
      name: 'linkWithRedirect',
      reason:
        'Native provider flows resolve immediately with a `UserCredential` instead of following the browser redirect contract used by the firebase-js-sdk.',
    },
    {
      name: 'multiFactor',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.multiFactor` alias instead of a firebase-js-sdk-aligned direct modular function type.',
    },
    {
      name: 'onAuthStateChanged',
      reason:
        'RN Firebase uses its package-local observer helper type and returns a plain `() => void` unsubscribe function instead of the firebase-js-sdk `Unsubscribe` alias text.',
    },
    {
      name: 'onIdTokenChanged',
      reason:
        'RN Firebase uses its package-local observer helper type and returns a plain `() => void` unsubscribe function instead of the firebase-js-sdk `Unsubscribe` alias text.',
    },
    {
      name: 'reauthenticateWithRedirect',
      reason:
        'Native provider flows do not follow the browser redirect contract. RN Firebase models this as `Promise<void>` rather than the firebase-js-sdk `Promise<never>` redirect signature.',
    },
    {
      name: 'sendEmailVerification',
      reason:
        'RN Firebase models the optional action code settings as `ActionCodeSettings | undefined`, while the firebase-js-sdk public type uses `ActionCodeSettings | null`.',
    },
    {
      name: 'signInWithRedirect',
      reason:
        'Native provider flows resolve immediately with a `UserCredential` instead of following the browser redirect contract used by the firebase-js-sdk.',
    },
    {
      name: 'updatePhoneNumber',
      reason:
        'RN Firebase accepts the broader `AuthCredential` surface, while the firebase-js-sdk narrows this parameter to `PhoneAuthCredential`.',
    },
    {
      name: 'updateProfile',
      reason:
        'RN Firebase exports and reuses the named `UpdateProfile` type alias rather than the firebase-js-sdk inline object type text.',
    },
    {
      name: 'verifyBeforeUpdateEmail',
      reason:
        'RN Firebase models the optional action code settings as `ActionCodeSettings | undefined`, while the firebase-js-sdk public type uses `ActionCodeSettings | null`.',
    },
    {
      name: 'ActionCodeInfo',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.ActionCodeInfo` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'ActionCodeSettings',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.ActionCodeSettings` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'AdditionalUserInfo',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.AdditionalUserInfo` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'Auth',
      reason:
        'The modular `Auth` type still aliases `FirebaseAuthTypes.Module`, so compare-types sees the older namespaced-compatible auth surface rather than a firebase-js-sdk-aligned modular interface.',
    },
    {
      name: 'AuthProvider',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.AuthProvider` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'ConfirmationResult',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.ConfirmationResult` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'FactorId',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.FactorId` alias instead of a firebase-js-sdk-aligned direct enum-map declaration.',
    },
    {
      name: 'IdTokenResult',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.IdTokenResult` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'MultiFactorAssertion',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.MultiFactorAssertion` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'MultiFactorError',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.MultiFactorError` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'MultiFactorInfo',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.MultiFactorInfo` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'MultiFactorResolver',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.MultiFactorResolver` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'MultiFactorSession',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.MultiFactorSession` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'MultiFactorUser',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.MultiFactorUser` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'Persistence',
      reason:
        'RN Firebase exports `Persistence` as a readonly object type alias, while the firebase-js-sdk declares it as an interface.',
    },
    {
      name: 'PhoneMultiFactorEnrollInfoOptions',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.PhoneMultiFactorEnrollInfoOptions` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'PhoneMultiFactorInfo',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.PhoneMultiFactorInfo` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'PhoneMultiFactorSignInInfoOptions',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.PhoneMultiFactorSignInInfoOptions` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'TotpMultiFactorInfo',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.TotpMultiFactorInfo` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'User',
      reason:
        'The modular `User` type still aliases the legacy `FirebaseAuthTypes.User` surface, so compare-types sees the older namespaced-compatible user shape.',
    },
    {
      name: 'UserCredential',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.UserCredential` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'UserInfo',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.UserInfo` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
    {
      name: 'UserMetadata',
      reason:
        'Still re-exported through the legacy `FirebaseAuthTypes.UserMetadata` alias instead of a firebase-js-sdk-aligned direct modular interface declaration.',
    },
  ],
};

export default config;

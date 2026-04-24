/**
 * Known differences between the firebase-js-sdk @firebase/auth public
 * API and the @react-native-firebase/auth modular API.
 *
 * Each entry must have a `name` and a `reason`. Any undocumented
 * difference or stale entry will fail `yarn compare:types`.
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
      name: 'AuthErrorCodes',
      reason:
        'RN Firebase still relies on native auth error code strings and does not export the firebase-js-sdk AuthErrorCodes constant map.',
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
      name: 'debugErrorMap',
      reason:
        'firebase-js-sdk web error-map helper. RN Firebase does not expose the SDK error-map selection API.',
    },
    {
      name: 'EmailAuthCredential',
      reason:
        'RN Firebase does not yet expose the firebase-js-sdk EmailAuthCredential class as part of the modular public surface.',
    },
    {
      name: 'indexedDBLocalPersistence',
      reason:
        'IndexedDB persistence is web-only and not applicable to React Native native-auth persistence.',
    },
    {
      name: 'inMemoryPersistence',
      reason:
        'The firebase-js-sdk persistence object is not exported by RN Firebase because auth state is managed by the underlying native SDKs.',
    },
    {
      name: 'OAuthCredential',
      reason:
        'RN Firebase does not yet expose the firebase-js-sdk OAuthCredential class as part of the modular public surface.',
    },
    {
      name: 'OAuthCredentialOptions',
      reason:
        'RN Firebase does not yet export the firebase-js-sdk OAuthCredentialOptions interface.',
    },
    {
      name: 'PhoneAuthCredential',
      reason:
        'RN Firebase does not yet expose the firebase-js-sdk PhoneAuthCredential class as part of the modular public surface.',
    },
    {
      name: 'prodErrorMap',
      reason:
        'firebase-js-sdk web error-map helper. RN Firebase does not expose the SDK error-map selection API.',
    },
    {
      name: 'ReactNativeAsyncStorage',
      reason:
        'The firebase-js-sdk React Native persistence helper type is not exported by RN Firebase because persistence is delegated to the native iOS/Android SDKs rather than configured through initializeAuth().',
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
  ],

  extraInRN: [
    {
      name: 'AppleAuthProvider',
      reason:
        'RN Firebase-specific Apple auth provider helper exposed for native Sign in with Apple flows; the firebase-js-sdk does not export a separate AppleAuthProvider class.',
    },
    {
      name: 'NativeFirebaseAuthError',
      reason:
        'RN Firebase-specific native bridge auth error type used in place of the firebase-js-sdk AuthError export.',
    },
    {
      name: 'OIDCAuthProvider',
      reason:
        'RN Firebase-specific OIDC auth provider class retained for compatibility with the existing public package surface; the firebase-js-sdk exposes OAuthProvider instead of a separate OIDCAuthProvider class.',
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
      name: 'PhoneAuthListener',
      reason: 'RN Firebase-specific listener object returned by verifyPhoneNumber().',
    },
    {
      name: 'PhoneAuthError',
      reason:
        'RN Firebase-specific phone verification error snapshot type used by native phone-auth listeners.',
    },
    {
      name: 'PhoneAuthSnapshot',
      reason:
        'RN Firebase-specific phone verification snapshot type used by native phone-auth listeners.',
    },
    {
      name: 'verifyPhoneNumber',
      reason:
        'RN Firebase-specific helper exposing the native phone verification listener flow; the firebase-js-sdk does not export this helper.',
    },
    {
      name: 'setLanguageCode',
      reason:
        'RN Firebase keeps a modular helper for setting auth.languageCode, while the firebase-js-sdk only exposes the writable property.',
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
      name: 'connectAuthEmulator',
      reason:
        'RN Firebase models disableWarnings as an optional property, while the firebase-js-sdk emitted type text shows a required boolean property.',
    },
    {
      name: 'EmailAuthProvider',
      reason:
        'RN Firebase now exports EmailAuthProvider from the modular surface, but its native helper class still exposes a reduced static API and RNFB credential objects rather than mirroring the firebase-js-sdk EmailAuthProvider class shape.',
    },
    {
      name: 'isSignInWithEmailLink',
      reason:
        'RN Firebase resolves this check asynchronously through the native bridge and returns Promise<boolean>, whereas the firebase-js-sdk returns a synchronous boolean.',
    },
    {
      name: 'linkWithRedirect',
      reason:
        'Native provider flows resolve immediately with a UserCredential instead of following the browser redirect contract used by the firebase-js-sdk.',
    },
    {
      name: 'reauthenticateWithRedirect',
      reason:
        'Native provider flows do not follow the browser redirect contract. RN Firebase models this as Promise<void> rather than the firebase-js-sdk Promise<never> signature.',
    },
    {
      name: 'signInWithRedirect',
      reason:
        'Native provider flows resolve immediately with a UserCredential instead of following the browser redirect contract used by the firebase-js-sdk.',
    },
    {
      name: 'updatePhoneNumber',
      reason:
        'RN Firebase accepts the broader AuthCredential surface, while the firebase-js-sdk narrows this parameter to PhoneAuthCredential.',
    },
    {
      name: 'Auth',
      reason:
        'The public Auth surface now matches structurally, but the emitted declaration text still differs from the firebase-js-sdk because RN Firebase uses its local FirebaseApp and NextOrObserver<User> spellings in the generated interface.',
    },
    {
      name: 'FacebookAuthProvider',
      reason:
        'RN Firebase now exports FacebookAuthProvider from the modular surface, but its native helper class only exposes the credential factory used by RNFB and does not yet mirror the firebase-js-sdk static fields and credentialFromResult/credentialFromError helpers.',
    },
    {
      name: 'GithubAuthProvider',
      reason:
        'RN Firebase now exports GithubAuthProvider from the modular surface, but its native helper class only exposes the credential factory used by RNFB and does not yet mirror the firebase-js-sdk static fields and credentialFromResult/credentialFromError helpers.',
    },
    {
      name: 'GoogleAuthProvider',
      reason:
        'RN Firebase now exports GoogleAuthProvider from the modular surface, but its native helper class only exposes the credential factory used by RNFB and does not yet mirror the firebase-js-sdk static fields and credentialFromResult/credentialFromError helpers.',
    },
    {
      name: 'OAuthProvider',
      reason:
        'RN Firebase now exports OAuthProvider from the modular surface, but its native helper class still differs from the firebase-js-sdk class by exposing RNFB-specific credential construction and omitting credentialFromJSON/credentialFromResult/credentialFromError helpers.',
    },
    {
      name: 'ParsedToken',
      reason:
        'TypeScript emits the parsed-token property keys without quotes in the generated declaration file, so compare-types reports a text-only difference even though the property set matches the firebase-js-sdk surface.',
    },
    {
      name: 'PhoneAuthProvider',
      reason:
        'RN Firebase now exports PhoneAuthProvider from the modular surface, but the native helper class still exposes a reduced static API and looser signatures than the firebase-js-sdk PhoneAuthProvider class.',
    },
    {
      name: 'PhoneMultiFactorGenerator',
      reason:
        'RN Firebase now exports PhoneMultiFactorGenerator from the modular surface, but its helper class still returns RNFB credential/assertion shapes rather than the firebase-js-sdk PhoneMultiFactorGenerator static API exactly.',
    },
    {
      name: 'TotpMultiFactorGenerator',
      reason:
        'RN Firebase now exports TotpMultiFactorGenerator from the modular surface, but its helper class still differs from the firebase-js-sdk static API in signatures and returned assertion/secret shapes.',
    },
    {
      name: 'TotpSecret',
      reason:
        'RN Firebase now exports TotpSecret from the modular surface, but the native-backed helper class exposes a reduced field set plus async/native helper methods that do not match the firebase-js-sdk TotpSecret class shape.',
    },
    {
      name: 'TwitterAuthProvider',
      reason:
        'RN Firebase now exports TwitterAuthProvider from the modular surface, but its native helper class only exposes the credential factory used by RNFB and does not yet mirror the firebase-js-sdk static fields and credentialFromResult/credentialFromError helpers.',
    },
  ],
};

export default config;

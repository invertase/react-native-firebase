/**
 * Known differences between the firebase-js-sdk @firebase/auth public
 * API and the @react-native-firebase/auth modular API.
 *
 * Each entry must have a `name` and a `reason`. Any undocumented
 * difference or stale entry will fail `yarn compare:types`.
 */

import type { PackageConfig } from '../src/types';

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
      name: 'ActionCodeURL',
      reason:
        'RN Firebase exports the ActionCodeURL class with the same fields as firebase-js-sdk, but ActionCodeURL.parseLink is not implemented yet and returns Promise<ActionCodeURL | null> (rejecting with a not-implemented error) instead of the firebase-js-sdk synchronous ActionCodeURL | null result.',
    },
    {
      name: 'parseActionCodeURL',
      reason:
        'RN Firebase parseActionCodeURL is not implemented yet and returns Promise<ActionCodeURL | null> (rejecting with a not-implemented error) instead of the firebase-js-sdk synchronous ActionCodeURL | null result.',
    },
    {
      name: 'FacebookAuthProvider',
      reason:
        'Provider credential helpers are emitted with the RN Firebase OAuthCredential class return type alias; behavior matches firebase-js-sdk credentialFromResult/credentialFromError stubs.',
    },
    {
      name: 'GithubAuthProvider',
      reason:
        'Provider credential helpers are emitted with the RN Firebase OAuthCredential class return type alias; behavior matches firebase-js-sdk credentialFromResult/credentialFromError stubs.',
    },
    {
      name: 'GoogleAuthProvider',
      reason:
        'Provider credential helpers are emitted with the RN Firebase OAuthCredential class return type alias; behavior matches firebase-js-sdk credentialFromResult/credentialFromError stubs.',
    },
    {
      name: 'OAuthCredential',
      reason:
        'RN Firebase OAuthCredential exposes rawNonce for native Sign in with Apple / limited-login flows instead of the firebase-js-sdk OAuth 1.0 secret field name, while retaining RNFB bridge fields internally.',
    },
    {
      name: 'TwitterAuthProvider',
      reason:
        'Provider credential helpers are emitted with the RN Firebase OAuthCredential class return type alias; behavior matches firebase-js-sdk credentialFromResult/credentialFromError stubs.',
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
      name: 'OAuthProvider',
      reason:
        'RN Firebase OAuthProvider retains native provider configuration helpers (scopes/custom parameters/toObject) used by the native auth bridge.',
    },
    {
      name: 'PhoneAuthProvider',
      reason:
        'RN Firebase mirrors the firebase-js-sdk credential and single-factor verifyPhoneNumber signatures while retaining an RNFB multi-factor overload.',
    },
    {
      name: 'TotpMultiFactorGenerator',
      reason:
        'RN Firebase now mirrors the firebase-js-sdk assertion return types and default-app generateSecret signature while retaining an RNFB auth overload for non-default native apps.',
    },
    {
      name: 'TotpSecret',
      reason:
        'RN Firebase TotpSecret.generateQrCodeUrl returns Promise<string> because QR code generation is performed through the React Native native bridge, and the class exposes native helper methods not present on the firebase-js-sdk TotpSecret class.',
    },
  ],
};

export default config;

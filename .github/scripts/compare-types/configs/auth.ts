/**
 * Known differences between the firebase-js-sdk @firebase/auth public
 * API and the @react-native-firebase/auth modular API.
 *
 * Each entry must have a `name` and a `reason`. Any undocumented
 * difference or stale entry will fail `yarn compare:types`.
 *
 * Platform shorthand used in reasons:
 * - iOS/Android: native Firebase Auth SDK
 * - Other/All: Other/Hermes + Other/Web (firebase-js-sdk JS bridge)
 * - Other/Hermes: react-native-macos, Windows RN, etc. (no DOM)
 * - Other/Web: true browser/DOM context
 */

import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  nameMapping: {},

  missingInRN: [
    {
      name: 'initializeRecaptchaConfig',
      reason:
        'iOS/Android: native SDKs own phone verification. Other/Hermes: not applicable (no DOM). Other/Web: not implemented yet; firebase-js-sdk support is possible.',
    },
    {
      name: 'AuthErrorCodes',
      reason:
        'iOS/Android: native auth error code strings. Other/All: not exported yet; firebase-js-sdk re-export is possible.',
    },
    {
      name: 'browserCookiePersistence',
      reason:
        'iOS/Android: not applicable. Other/Hermes: not applicable. Other/Web: not exported yet; firebase-js-sdk browser persistence is possible.',
    },
    {
      name: 'browserLocalPersistence',
      reason:
        'iOS/Android: not applicable. Other/Hermes: not applicable. Other/Web: not exported yet; firebase-js-sdk browser persistence is possible.',
    },
    {
      name: 'browserPopupRedirectResolver',
      reason:
        'iOS/Android: native provider flows. Other/Hermes: not applicable. Other/Web: not exported yet; firebase-js-sdk popup/redirect resolver is possible.',
    },
    {
      name: 'browserSessionPersistence',
      reason:
        'iOS/Android: not applicable. Other/Hermes: not applicable. Other/Web: not exported yet; firebase-js-sdk browser persistence is possible.',
    },
    {
      name: 'debugErrorMap',
      reason:
        'iOS/Android: not exported. Other/All: not implemented yet; firebase-js-sdk error-map selection via initializeAuth is possible.',
    },
    {
      name: 'indexedDBLocalPersistence',
      reason:
        'iOS/Android: not applicable. Other/Hermes: not applicable. Other/Web: not exported yet; firebase-js-sdk IndexedDB persistence is possible.',
    },
    {
      name: 'inMemoryPersistence',
      reason:
        'iOS/Android: native SDKs manage persistence. Other/All: not exported yet; firebase-js-sdk inMemoryPersistence via initializeAuth is possible.',
    },
    {
      name: 'prodErrorMap',
      reason:
        'iOS/Android: not exported. Other/All: not implemented yet; firebase-js-sdk error-map selection via initializeAuth is possible.',
    },
    {
      name: 'ReactNativeAsyncStorage',
      reason:
        'iOS/Android: persistence delegated to native SDKs. Other/Hermes: not exported yet; firebase-js-sdk React Native persistence via initializeAuth is possible.',
    },
    {
      name: 'RecaptchaParameters',
      reason:
        'iOS/Android: not applicable. Other/Hermes: not applicable. Other/Web: not exported; browser reCAPTCHA configuration only.',
    },
    {
      name: 'RecaptchaVerifier',
      reason:
        'iOS/Android: native verification. Other/Hermes: not applicable (no DOM). Other/Web: not implemented yet; firebase-js-sdk RecaptchaVerifier is possible.',
    },
    {
      name: 'SAMLAuthProvider',
      reason:
        'iOS/Android: not exported. Other/Hermes: not applicable. Other/Web: not exported yet; firebase-js-sdk SAML provider is possible.',
    },
  ],

  extraInRN: [
    {
      name: 'AppleAuthProvider',
      reason:
        'Deprecated RN Firebase helper for Sign in with Apple. Prefer OAuthProvider("apple.com"). Retained for compatibility; firebase-js-sdk uses OAuthProvider only.',
    },
    {
      name: 'NativeFirebaseAuthError',
      reason:
        'RN Firebase-specific native bridge auth error type used in place of the firebase-js-sdk AuthError export.',
    },
    {
      name: 'OIDCAuthProvider',
      reason:
        'Deprecated RN Firebase OIDC helper. Prefer OAuthProvider("oidc.<suffix>"). Retained for compatibility; firebase-js-sdk uses OAuthProvider only.',
    },
    {
      name: 'OIDCProvider',
      reason:
        'Deprecated with OIDCAuthProvider. Prefer OAuthProvider for OIDC flows.',
    },
    {
      name: 'PhoneAuthState',
      reason:
        'RN Firebase-specific enum-like object describing native phone-auth listener states. iOS/Android only; Other uses js-sdk phone flows instead of verifyPhoneNumber().',
    },
    {
      name: 'PhoneAuthListener',
      reason:
        'RN Firebase-specific listener object returned by verifyPhoneNumber(). iOS/Android only.',
    },
    {
      name: 'PhoneAuthError',
      reason:
        'RN Firebase-specific phone verification error snapshot type used by native phone-auth listeners. iOS/Android only.',
    },
    {
      name: 'PhoneAuthSnapshot',
      reason:
        'RN Firebase-specific phone verification snapshot type used by native phone-auth listeners. iOS/Android only.',
    },
    {
      name: 'verifyPhoneNumber',
      reason:
        'RN Firebase-specific native phone verification listener flow. iOS/Android only; Other/All: use signInWithPhoneNumber / PhoneAuthProvider via js-sdk instead.',
    },
    {
      name: 'setLanguageCode',
      reason:
        'RN Firebase modular helper for auth.languageCode. iOS/Android: native. Other/All: not delegated yet; firebase-js-sdk languageCode / useDeviceLanguage is possible.',
    },
    {
      name: 'useUserAccessGroup',
      reason:
        'RN Firebase-specific iOS keychain sharing helper. iOS native only.',
    },
    {
      name: 'getCustomAuthDomain',
      reason:
        'RN Firebase-specific native auth domain helper on iOS/Android. Other/All: auth.config from firebase-js-sdk may cover this instead (see auth.config in migration guide).',
    },
    {
      name: 'revokeToken',
      reason:
        'RN Firebase-specific Sign in with Apple authorization-code revocation helper. iOS: native revokeTokenWithAuthorizationCode. Android/Web: bridge no-op. Distinct from firebase-js-sdk revokeAccessToken (web-only OAuth token revocation).',
    },
    {
      name: 'AdditionalUserInfoNative',
      reason:
        'RN Firebase extension type: firebase-js-sdk AdditionalUserInfo core fields plus index signature for extra native bridge keys. Use when typing values from getAdditionalUserInfo or UserCredential.additionalUserInfo that may include provider-specific native fields.',
    },
    {
      name: 'SDK_VERSION',
      reason:
        'RN Firebase package version string exported from the modular entry point. The firebase-js-sdk does not export SDK_VERSION from @firebase/auth.',
    },
    {
      name: 'AuthListenerCallback',
      reason:
        'RN Firebase exported auth state listener callback type. firebase-js-sdk uses inline callback types on onAuthStateChanged / onIdTokenChanged rather than exporting this alias.',
    },
    {
      name: 'CallbackOrObserver',
      reason:
        'RN Firebase exported union type for auth listener callbacks and observers. firebase-js-sdk uses inline overloads rather than exporting this helper type.',
    },
    {
      name: 'UpdateProfile',
      reason:
        'RN Firebase exported profile update options type for updateProfile(). firebase-js-sdk declares the shape inline on updateProfile rather than exporting this alias.',
    },
    {
      name: 'MultiFactor',
      reason:
        'RN Firebase exported MultiFactor interface type. firebase-js-sdk exposes multi-factor enrollment through the multiFactor() helper without exporting this interface at the package root.',
    },
  ],

  differentShape: [
    {
      name: 'OAuthCredential',
      reason:
        'RN Firebase OAuthCredential exposes rawNonce for Apple / limited-login flows. OAuth 1.0 token secrets use the inherited AuthCredential.secret field (firebase-js-sdk optional secret on OAuthCredential).',
    },
    {
      name: 'FacebookAuthProvider',
      reason:
        'RN Firebase exports an extra credential(token, secret) overload for Facebook limited-login nonce behaviour. firebase-js-sdk public types only declare credential(accessToken). credentialFromResult / credentialFromError always return null at runtime today (types match js-sdk). Same runtime applies to GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider, OAuthProvider, and PhoneAuthProvider — see those entries. iOS/Android: no native extraction planned. Other/Hermes: not delegated. Other/Web: future implementation should delegate to firebase-js-sdk in RNFBAuthModule — do not invest in native iOS/Android extraction.',
    },
    {
      name: 'UserCredential',
      reason:
        'RN Firebase modular UserCredential includes optional enumerable additionalUserInfo (firebase-js-sdk core fields plus preserved native bridge keys). firebase-js-sdk keeps additionalUserInfo off the public UserCredential interface — use getAdditionalUserInfo there.',
    },
    {
      name: 'linkWithRedirect',
      reason:
        'iOS/Android: resolves immediately with UserCredential. Other/Hermes: not applicable (no DOM). Other/Web: not delegated yet; firebase-js-sdk redirect flow is possible.',
    },
    {
      name: 'reauthenticateWithRedirect',
      reason:
        'iOS/Android: Promise<void> after native in-app provider flow. Other/Hermes: not applicable. Other/Web: not delegated yet; firebase-js-sdk redirect semantics are possible.',
    },
    {
      name: 'signInWithRedirect',
      reason:
        'iOS/Android: resolves immediately with UserCredential. Other/Hermes: not applicable. Other/Web: not delegated yet; firebase-js-sdk redirect flow is possible.',
    },
    {
      name: 'OAuthProvider',
      reason:
        'iOS/Android: retains toObject() and native bridge configuration helpers. Other/Hermes: scopes/custom parameters via js-sdk are possible. Other/Web: full js-sdk OAuthProvider surface is possible; toObject() remains iOS/Android bridge-only. credentialFromResult / credentialFromError always return null at runtime today (types match js-sdk). Same runtime applies to GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider, FacebookAuthProvider, and PhoneAuthProvider. Other/Web is the future delegation path via firebase-js-sdk; iOS/Android native extraction is not planned.',
    },
    {
      name: 'PhoneAuthProvider',
      reason:
        'RN Firebase retains native multi-factor verifyPhoneNumber overloads for iOS/Android native bridge methods. MFA also works on Other via firebase-js-sdk through the web bridge (see tests/local-tests); this overload is an intentional RN extension, not a missing Other implementation. credentialFromResult / credentialFromError always return null at runtime today (types match js-sdk). Same runtime applies to GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider, FacebookAuthProvider, and OAuthProvider. Other/Web js-sdk delegation is the future path for non-null extraction.',
    },
    {
      name: 'TotpMultiFactorGenerator',
      reason:
        'RN Firebase extension: optional Auth overload for non-default native Firebase apps. firebase-js-sdk uses the default app only.',
    },
    {
      name: 'TotpSecret',
      reason: 'RN Firebase extension: openInOtpApp is an RN-only helper.',
    },
    {
      name: 'User',
      reason:
        'RN Firebase User optionally exposes multiFactor for native MFA bridge convenience. firebase-js-sdk keeps multi-factor access on the multiFactor(user) helper only.',
    },
  ],
};

export default config;

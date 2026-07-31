import { describe, expect, it, jest } from '@jest/globals';

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
  DeviceEventEmitter: {
    emit: jest.fn(),
  },
}));

jest.mock('@react-native-firebase/app/dist/module/internal/web/firebaseAuth', () => ({
  getApp: jest.fn(),
  initializeAuth: jest.fn(() => ({
    currentUser: null,
    languageCode: null,
    tenantId: null,
  })),
  onAuthStateChanged: jest.fn(),
  onIdTokenChanged: jest.fn(),
  signInAnonymously: jest.fn(),
  sendSignInLinkToEmail: jest.fn(),
  getAdditionalUserInfo: jest.fn(),
  multiFactor: jest.fn(),
  getMultiFactorResolver: jest.fn(),
  TotpMultiFactorGenerator: {
    assertionForSignIn: jest.fn(),
    assertionForEnrollment: jest.fn(),
    generateSecret: jest.fn(),
  },
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  isSignInWithEmailLink: jest.fn(() => false),
  signInWithEmailLink: jest.fn(),
  signInWithCustomToken: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  useDeviceLanguage: jest.fn(),
  verifyPasswordResetCode: jest.fn(),
  connectAuthEmulator: jest.fn(),
  fetchSignInMethodsForEmail: jest.fn(),
  sendEmailVerification: jest.fn(),
  verifyBeforeUpdateEmail: jest.fn(),
  confirmPasswordReset: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn(),
  updateProfile: jest.fn(),
  updatePhoneNumber: jest.fn(),
  signInWithCredential: jest.fn(),
  unlink: jest.fn(),
  linkWithCredential: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  getIdToken: jest.fn(),
  getIdTokenResult: jest.fn(),
  applyActionCode: jest.fn(),
  checkActionCode: jest.fn(),
  EmailAuthProvider: { credential: jest.fn() },
  FacebookAuthProvider: { credential: jest.fn() },
  GoogleAuthProvider: { credential: jest.fn() },
  TwitterAuthProvider: { credential: jest.fn() },
  GithubAuthProvider: { credential: jest.fn() },
  PhoneAuthProvider: { credential: jest.fn() },
  OAuthProvider: jest.fn(),
  signOut: jest.fn(),
  deleteUser: jest.fn(),
  reload: jest.fn(),
}));

jest.mock('@react-native-firebase/app/dist/module/internal/web/utils', () => ({
  guard: jest.fn(<T>(fn: () => Promise<T>) => fn()),
  getWebError: jest.fn((e: Error) => e),
  emitEvent: jest.fn(),
}));

jest.mock('@react-native-firebase/app/dist/module/internal/asyncStorage', () => ({
  getReactNativeAsyncStorageInternal: jest.fn(() => ({})),
  isMemoryStorage: jest.fn(() => false),
}));

// Import the base .ts file directly — Jest's React Native preset resolves to
// .ios.ts (empty stub) by default, so we must bypass platform resolution.
const webModule = require('../lib/web/RNFBAuthModule.ts');
const mod = (webModule.default ?? webModule) as Record<string, (...args: unknown[]) => unknown>;

describe('RNFBAuthModule (web)', () => {
  describe('unsupported method stubs reject with auth/unsupported', () => {
    const unsupportedMethods = [
      'configureAuthDomain',
      'getCustomAuthDomain',
      'forceRecaptchaFlowForTesting',
      'setAutoRetrievedSmsCodeForPhoneNumber',
      'setAppVerificationDisabledForTesting',
      'signInWithProvider',
      'signInWithPhoneNumber',
      'verifyPhoneNumberWithMultiFactorInfo',
      'verifyPhoneNumberForMultiFactor',
      'resolveMultiFactorSignIn',
      'resolveTotpSignIn',
      'finalizeMultiFactorEnrollment',
      'confirmationResultConfirm',
      'verifyPhoneNumber',
      'linkWithProvider',
      'reauthenticateWithProvider',
    ];

    it.each(unsupportedMethods)('%s rejects with unsupported', async method => {
      expect(typeof mod[method]).toBe('function');
      await expect(mod[method]()).rejects.toEqual(
        expect.objectContaining({
          code: 'auth/unsupported',
          message: 'This operation is not supported in this environment.',
        }),
      );
    });
  });

  describe('all TurboModule spec methods exist on the web module', () => {
    const specMethods = [
      'configureAuthDomain',
      'getCustomAuthDomain',
      'addAuthStateListener',
      'removeAuthStateListener',
      'addIdTokenListener',
      'removeIdTokenListener',
      'forceRecaptchaFlowForTesting',
      'setAutoRetrievedSmsCodeForPhoneNumber',
      'setAppVerificationDisabledForTesting',
      'useUserAccessGroup',
      'signOut',
      'signInAnonymously',
      'createUserWithEmailAndPassword',
      'isSignInWithEmailLink',
      'signInWithEmailAndPassword',
      'signInWithEmailLink',
      'signInWithCustomToken',
      'revokeToken',
      'sendPasswordResetEmail',
      'sendSignInLinkToEmail',
      'deleteUser',
      'reload',
      'sendEmailVerification',
      'verifyBeforeUpdateEmail',
      'updateEmail',
      'updatePassword',
      'updatePhoneNumber',
      'updateProfile',
      'getIdToken',
      'getIdTokenResult',
      'signInWithCredential',
      'signInWithProvider',
      'signInWithPhoneNumber',
      'verifyPhoneNumberWithMultiFactorInfo',
      'verifyPhoneNumberForMultiFactor',
      'resolveMultiFactorSignIn',
      'resolveTotpSignIn',
      'generateTotpSecret',
      'generateQrCodeUrl',
      'openInOtpApp',
      'getSession',
      'unenrollMultiFactor',
      'finalizeMultiFactorEnrollment',
      'finalizeTotpEnrollment',
      'confirmationResultConfirm',
      'verifyPhoneNumber',
      'confirmPasswordReset',
      'applyActionCode',
      'checkActionCode',
      'linkWithCredential',
      'linkWithProvider',
      'unlink',
      'reauthenticateWithCredential',
      'reauthenticateWithProvider',
      'fetchSignInMethodsForEmail',
      'setLanguageCode',
      'setTenantId',
      'useDeviceLanguage',
      'verifyPasswordResetCode',
      'useEmulator',
    ];

    it.each(specMethods)('%s is defined as a function', method => {
      expect(typeof mod[method]).toBe('function');
    });
  });
});

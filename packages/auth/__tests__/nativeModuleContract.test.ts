import { describe, expect, it, jest } from '@jest/globals';
import { assertTurboContract } from '../../app/__tests__/turboModuleContractHelper';

const SPEC_METHODS = [
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
] as const;

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('exposes every spec method callable through the real wrapper', function () {
    assertTurboContract(
      {
        namespace: 'auth',
        nativeModuleName: 'NativeRNFBTurboAuth',
        nativeEvents: ['auth_state_changed', 'auth_id_token_changed', 'phone_auth_state_changed'],
        hasMultiAppSupport: true,
        hasCustomUrlOrRegionSupport: false,
        turboModule: true,
        specMethods: SPEC_METHODS,
        constants: {
          APP_LANGUAGE: { '[DEFAULT]': 'en-US' },
          APP_USER: { '[DEFAULT]': null },
        },
        createMock: method =>
          jest.fn(() => {
            if (method === 'isSignInWithEmailLink') {
              return false;
            }

            if (method === 'generateQrCodeUrl') {
              return 'otpauth://totp/example';
            }

            if (
              method === 'configureAuthDomain' ||
              method === 'addAuthStateListener' ||
              method === 'removeAuthStateListener' ||
              method === 'addIdTokenListener' ||
              method === 'removeIdTokenListener' ||
              method === 'setLanguageCode' ||
              method === 'useDeviceLanguage' ||
              method === 'openInOtpApp' ||
              method === 'verifyPhoneNumber' ||
              method === 'useEmulator'
            ) {
              return undefined;
            }

            return Promise.resolve();
          }),
      },
      {
        createUserWithEmailAndPassword: wrapped => {
          void wrapped.createUserWithEmailAndPassword('a@b.com', 'password');
        },
        signInWithEmailAndPassword: wrapped => {
          void wrapped.signInWithEmailAndPassword('a@b.com', 'password');
        },
        signInWithEmailLink: wrapped => {
          void wrapped.signInWithEmailLink('a@b.com', 'https://example.com/link');
        },
        signInWithCustomToken: wrapped => {
          void wrapped.signInWithCustomToken('token');
        },
        signInWithCredential: wrapped => {
          void wrapped.signInWithCredential('google.com', 'token', 'secret');
        },
        signInWithProvider: wrapped => {
          void wrapped.signInWithProvider({ providerId: 'google.com' });
        },
        signInWithPhoneNumber: wrapped => {
          void wrapped.signInWithPhoneNumber('+15555550100', true);
        },
        sendPasswordResetEmail: wrapped => {
          void wrapped.sendPasswordResetEmail('a@b.com', null);
        },
        sendSignInLinkToEmail: wrapped => {
          void wrapped.sendSignInLinkToEmail('a@b.com', { url: 'https://example.com' });
        },
        sendEmailVerification: wrapped => {
          void wrapped.sendEmailVerification(null);
        },
        verifyBeforeUpdateEmail: wrapped => {
          void wrapped.verifyBeforeUpdateEmail('new@b.com', null);
        },
        updatePhoneNumber: wrapped => {
          void wrapped.updatePhoneNumber('phone', 'token', 'secret');
        },
        updateProfile: wrapped => {
          void wrapped.updateProfile({ displayName: 'Test' });
        },
        getIdToken: wrapped => {
          void wrapped.getIdToken(true);
        },
        getIdTokenResult: wrapped => {
          void wrapped.getIdTokenResult(true);
        },
        verifyPhoneNumberWithMultiFactorInfo: wrapped => {
          void wrapped.verifyPhoneNumberWithMultiFactorInfo('uid', 'session');
        },
        verifyPhoneNumberForMultiFactor: wrapped => {
          void wrapped.verifyPhoneNumberForMultiFactor('+15555550100', 'session');
        },
        resolveMultiFactorSignIn: wrapped => {
          void wrapped.resolveMultiFactorSignIn('session', 'verification-id', '123456');
        },
        resolveTotpSignIn: wrapped => {
          void wrapped.resolveTotpSignIn('session', 'uid', '123456');
        },
        generateTotpSecret: wrapped => {
          void wrapped.generateTotpSecret('session');
        },
        generateQrCodeUrl: wrapped => {
          const result = wrapped.generateQrCodeUrl('secret', 'account', 'issuer');
          expect(result).toBe('otpauth://totp/example');
          expect(result).not.toBeInstanceOf(Promise);
        },
        openInOtpApp: wrapped => {
          wrapped.openInOtpApp('secret', 'otpauth://totp/example');
        },
        finalizeMultiFactorEnrollment: wrapped => {
          void wrapped.finalizeMultiFactorEnrollment('verification-id', '123456', 'Device');
        },
        finalizeTotpEnrollment: wrapped => {
          void wrapped.finalizeTotpEnrollment('secret', '123456', 'Device');
        },
        confirmationResultConfirm: wrapped => {
          void wrapped.confirmationResultConfirm('123456');
        },
        verifyPhoneNumber: wrapped => {
          wrapped.verifyPhoneNumber('+15555550100', 'request-key', 60, true);
        },
        confirmPasswordReset: wrapped => {
          void wrapped.confirmPasswordReset('code', 'new-password');
        },
        linkWithCredential: wrapped => {
          void wrapped.linkWithCredential('google.com', 'token', 'secret');
        },
        linkWithProvider: wrapped => {
          void wrapped.linkWithProvider({ providerId: 'google.com' });
        },
        reauthenticateWithCredential: wrapped => {
          void wrapped.reauthenticateWithCredential('google.com', 'token', 'secret');
        },
        reauthenticateWithProvider: wrapped => {
          void wrapped.reauthenticateWithProvider({ providerId: 'google.com' });
        },
        setTenantId: wrapped => {
          void wrapped.setTenantId('tenant-id');
        },
        useEmulator: wrapped => {
          wrapped.useEmulator('localhost', 9099);
        },
        isSignInWithEmailLink: wrapped => {
          const result = wrapped.isSignInWithEmailLink('https://example.com/link');
          expect(result).toBe(false);
          expect(result).not.toBeInstanceOf(Promise);
        },
        forceRecaptchaFlowForTesting: wrapped => {
          void wrapped.forceRecaptchaFlowForTesting(true);
        },
        setAutoRetrievedSmsCodeForPhoneNumber: wrapped => {
          void wrapped.setAutoRetrievedSmsCodeForPhoneNumber('+15555550100', '123456');
        },
        setAppVerificationDisabledForTesting: wrapped => {
          void wrapped.setAppVerificationDisabledForTesting(true);
        },
        useUserAccessGroup: wrapped => {
          void wrapped.useUserAccessGroup('group.example');
        },
      },
    );
  });
});

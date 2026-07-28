import { describe, expect, it, jest } from '@jest/globals';
// @ts-ignore
import User from '../lib/User';
import {
  getAuth,
  initializeAuth,
  applyActionCode,
  beforeAuthStateChanged,
  checkActionCode,
  confirmPasswordReset,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getMultiFactorResolver,
  getRedirectResult,
  isSignInWithEmailLink,
  onAuthStateChanged,
  onIdTokenChanged,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  setPersistence,
  signInAnonymously,
  signInWithCredential,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPhoneNumber,
  verifyPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateCurrentUser,
  useDeviceLanguage,
  useUserAccessGroup,
  verifyPasswordResetCode,
  parseActionCodeURL,
  ActionCodeURL,
  deleteUser,
  getIdToken,
  getIdTokenResult,
  linkWithCredential,
  linkWithPhoneNumber,
  linkWithPopup,
  linkWithRedirect,
  multiFactor,
  reauthenticateWithCredential,
  reauthenticateWithPhoneNumber,
  reauthenticateWithPopup,
  reauthenticateWithRedirect,
  reload,
  sendEmailVerification,
  unlink,
  updateEmail,
  updatePassword,
  updatePhoneNumber,
  updateProfile,
  verifyBeforeUpdateEmail,
  getAdditionalUserInfo,
  getCustomAuthDomain,
  validatePassword,
  AppleAuthProvider,
  EmailAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  OIDCAuthProvider,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  TotpSecret,
  TotpMultiFactorGenerator,
  TwitterAuthProvider,
  EmailAuthCredential,
  OAuthCredential,
  PhoneAuthCredential,
} from '../lib';

const { PasswordPolicyImpl } = require('../lib/password-policy/PasswordPolicyImpl');

describe('Auth', function () {
  describe('modular', function () {
    it('`getAuth` function is properly exposed to end user', function () {
      expect(getAuth).toBeDefined();
    });

    it('getAuth returns a modular auth instance', function () {
      const auth = getAuth();
      expect(auth).toBeDefined();
      expect(auth.app).toBeDefined();
      expect(getAuth()).toBe(auth);
    });

    it('`initializeAuth` function is properly exposed to end user', function () {
      expect(initializeAuth).toBeDefined();
    });

    it('initializeAuth returns a modular auth instance', function () {
      const { getApp } = require('@react-native-firebase/app');
      const auth = initializeAuth(getApp());
      expect(auth).toBeDefined();
      expect(getAuth(getApp())).toBe(auth);
    });

    it('`applyActionCode` function is properly exposed to end user', function () {
      expect(applyActionCode).toBeDefined();
    });

    it('`beforeAuthStateChanged` function is properly exposed to end user', function () {
      expect(beforeAuthStateChanged).toBeDefined();
    });

    it('`checkActionCode` function is properly exposed to end user', function () {
      expect(checkActionCode).toBeDefined();
    });

    it('`confirmPasswordReset` function is properly exposed to end user', function () {
      expect(confirmPasswordReset).toBeDefined();
    });

    it('`connectAuthEmulator` function is properly exposed to end user', function () {
      expect(connectAuthEmulator).toBeDefined();
    });

    it('`createUserWithEmailAndPassword` function is properly exposed to end user', function () {
      expect(createUserWithEmailAndPassword).toBeDefined();
    });

    it('`fetchSignInMethodsForEmail` function is properly exposed to end user', function () {
      expect(fetchSignInMethodsForEmail).toBeDefined();
    });

    it('`getMultiFactorResolver` function is properly exposed to end user', function () {
      expect(getMultiFactorResolver).toBeDefined();
    });

    it('`getRedirectResult` function is properly exposed to end user', function () {
      expect(getRedirectResult).toBeDefined();
    });

    it('`isSignInWithEmailLink` function is properly exposed to end user', function () {
      expect(isSignInWithEmailLink).toBeDefined();
    });

    it('`isSignInWithEmailLink` returns synchronously', function () {
      const result = isSignInWithEmailLink(getAuth(), 'https://example.com/link');

      expect(result).toBe(false);
      expect(result).not.toBeInstanceOf(Promise);
    });

    it('`onAuthStateChanged` function is properly exposed to end user', function () {
      expect(onAuthStateChanged).toBeDefined();
    });

    it('`onIdTokenChanged` function is properly exposed to end user', function () {
      expect(onIdTokenChanged).toBeDefined();
    });

    it('`sendPasswordResetEmail` function is properly exposed to end user', function () {
      expect(sendPasswordResetEmail).toBeDefined();
    });

    it('`sendSignInLinkToEmail` function is properly exposed to end user', function () {
      expect(sendSignInLinkToEmail).toBeDefined();
    });

    it('`setPersistence` function is properly exposed to end user', function () {
      expect(setPersistence).toBeDefined();
    });

    it('`signInAnonymously` function is properly exposed to end user', function () {
      expect(signInAnonymously).toBeDefined();
    });

    it('`signInWithCredential` function is properly exposed to end user', function () {
      expect(signInWithCredential).toBeDefined();
    });

    it('`signInWithCustomToken` function is properly exposed to end user', function () {
      expect(signInWithCustomToken).toBeDefined();
    });

    it('`signInWithEmailAndPassword` function is properly exposed to end user', function () {
      expect(signInWithEmailAndPassword).toBeDefined();
    });

    it('`signInWithEmailLink` function is properly exposed to end user', function () {
      expect(signInWithEmailLink).toBeDefined();
    });

    it('`signInWithPhoneNumber` function is properly exposed to end user', function () {
      expect(signInWithPhoneNumber).toBeDefined();
    });

    it('`verifyPhoneNumber` function is properly exposed to end user', function () {
      expect(verifyPhoneNumber).toBeDefined();
    });

    it('`signInWithPopup` function is properly exposed to end user', function () {
      expect(signInWithPopup).toBeDefined();
    });

    it('`signInWithRedirect` function is properly exposed to end user', function () {
      expect(signInWithRedirect).toBeDefined();
    });

    it('`signOut` function is properly exposed to end user', function () {
      expect(signOut).toBeDefined();
    });

    it('`updateCurrentUser` function is properly exposed to end user', function () {
      expect(updateCurrentUser).toBeDefined();
    });

    it('`useDeviceLanguage` function is properly exposed to end user', function () {
      expect(useDeviceLanguage).toBeDefined();
    });

    it('`useUserAccessGroup` function is properly exposed to end user', function () {
      expect(useUserAccessGroup).toBeDefined();
    });

    it('`verifyPasswordResetCode` function is properly exposed to end user', function () {
      expect(verifyPasswordResetCode).toBeDefined();
    });

    it('`parseActionCodeURL` function is properly exposed to end user', function () {
      expect(parseActionCodeURL).toBeDefined();
    });

    it('`parseActionCodeURL` and `ActionCodeURL.parseLink` parse valid action links', function () {
      const link =
        'https://example.firebaseapp.com/__/auth/action?apiKey=test-api-key&mode=verifyEmail&oobCode=test-code&lang=en&continueUrl=https%3A%2F%2Fexample.com';

      const parsedFromFunction = parseActionCodeURL(link);
      const parsedFromClass = ActionCodeURL.parseLink(link);

      expect(parsedFromFunction).not.toBeNull();
      expect(parsedFromClass).toEqual(parsedFromFunction);
      expect(parsedFromFunction?.apiKey).toBe('test-api-key');
      expect(parsedFromFunction?.code).toBe('test-code');
      expect(parsedFromFunction?.operation).toBe('VERIFY_EMAIL');
      expect(parsedFromFunction?.languageCode).toBe('en');
      expect(parsedFromFunction?.continueUrl).toBe('https://example.com');
    });

    it('`parseActionCodeURL` returns null for invalid action links', function () {
      expect(parseActionCodeURL('https://example.com/not-an-action-link')).toBeNull();
      expect(ActionCodeURL.parseLink('https://example.com/not-an-action-link')).toBeNull();
    });

    it('`TotpSecret.generateQrCodeUrl` returns synchronously with default account and issuer', function () {
      const generateQrCodeUrl = jest.fn(
        (_secretKey: string, _account: string, _issuer: string) => 'otpauth://totp/example',
      );
      const secret = new TotpSecret('secret-key', {
        app: { name: '[DEFAULT]' },
        currentUser: { email: 'user@example.com' },
        native: { generateQrCodeUrl },
      } as never);

      const result = secret.generateQrCodeUrl();

      expect(result).toBe('otpauth://totp/example');
      expect(result).not.toBeInstanceOf(Promise);
      expect(generateQrCodeUrl).toHaveBeenCalledWith('secret-key', 'user@example.com', '[DEFAULT]');
    });

    it('`TotpSecret.generateQrCodeUrl` throws auth/invalid-multi-factor-secret for a missing secret', function () {
      const generateQrCodeUrl = jest.fn((_secretKey: string, _account: string, _issuer: string) => {
        const error = new Error("can't find secret for provided key");
        error.name = 'invalid-multi-factor-secret';
        throw error;
      });
      const secret = new TotpSecret('missing-secret-key', {
        app: { name: '[DEFAULT]' },
        currentUser: { email: 'user@example.com' },
        native: { generateQrCodeUrl },
      } as never);

      expect(() => secret.generateQrCodeUrl()).toThrow(
        "[auth/invalid-multi-factor-secret] can't find secret for provided key",
      );
      expect(generateQrCodeUrl).toHaveBeenCalledWith(
        'missing-secret-key',
        'user@example.com',
        '[DEFAULT]',
      );
    });

    it('`TotpSecret.generateQrCodeUrl` forwards explicit account and issuer synchronously', function () {
      const generateQrCodeUrl = jest.fn(
        (_secretKey: string, _account: string, _issuer: string) =>
          'otpauth://totp/Example%20App:account%40example.com',
      );
      const secret = new TotpSecret('secret-key', {
        app: { name: '[DEFAULT]' },
        currentUser: { email: 'user@example.com' },
        native: { generateQrCodeUrl },
      } as never);

      const result = secret.generateQrCodeUrl('account@example.com', 'Example App');

      expect(result).toBe('otpauth://totp/Example%20App:account%40example.com');
      expect(result).not.toBeInstanceOf(Promise);
      expect(generateQrCodeUrl).toHaveBeenCalledWith(
        'secret-key',
        'account@example.com',
        'Example App',
      );
    });

    it('`deleteUser` function is properly exposed to end user', function () {
      expect(deleteUser).toBeDefined();
    });

    it('`getIdToken` function is properly exposed to end user', function () {
      expect(getIdToken).toBeDefined();
    });

    it('`getIdTokenResult` function is properly exposed to end user', function () {
      expect(getIdTokenResult).toBeDefined();
    });

    it('`linkWithCredential` function is properly exposed to end user', function () {
      expect(linkWithCredential).toBeDefined();
    });

    it('`linkWithPhoneNumber` function is properly exposed to end user', function () {
      expect(linkWithPhoneNumber).toBeDefined();
    });

    it('`linkWithPopup` function is properly exposed to end user', function () {
      expect(linkWithPopup).toBeDefined();
    });

    it('`linkWithRedirect` function is properly exposed to end user', function () {
      expect(linkWithRedirect).toBeDefined();
    });

    it('`multiFactor` function is properly exposed to end user', function () {
      expect(multiFactor).toBeDefined();
    });

    it('`reauthenticateWithCredential` function is properly exposed to end user', function () {
      expect(reauthenticateWithCredential).toBeDefined();
    });

    it('`reauthenticateWithPhoneNumber` function is properly exposed to end user', function () {
      expect(reauthenticateWithPhoneNumber).toBeDefined();
    });

    it('`reauthenticateWithPopup` function is properly exposed to end user', function () {
      expect(reauthenticateWithPopup).toBeDefined();
    });

    it('`reauthenticateWithRedirect` function is properly exposed to end user', function () {
      expect(reauthenticateWithRedirect).toBeDefined();
    });

    it('`reload` function is properly exposed to end user', function () {
      expect(reload).toBeDefined();
    });

    it('`sendEmailVerification` function is properly exposed to end user', function () {
      expect(sendEmailVerification).toBeDefined();
    });

    it('`unlink` function is properly exposed to end user', function () {
      expect(unlink).toBeDefined();
    });

    it('`updateEmail` function is properly exposed to end user', function () {
      expect(updateEmail).toBeDefined();
    });

    it('`updatePassword` function is properly exposed to end user', function () {
      expect(updatePassword).toBeDefined();
    });

    it('`updatePhoneNumber` function is properly exposed to end user', function () {
      expect(updatePhoneNumber).toBeDefined();
    });

    it('`updateProfile` function is properly exposed to end user', function () {
      expect(updateProfile).toBeDefined();
    });

    it('`verifyBeforeUpdateEmail` function is properly exposed to end user', function () {
      expect(verifyBeforeUpdateEmail).toBeDefined();
    });

    it('`getAdditionalUserInfo` function is properly exposed to end user', function () {
      expect(getAdditionalUserInfo).toBeDefined();
    });

    it('`getCustomAuthDomain` function is properly exposed to end user', function () {
      expect(getCustomAuthDomain).toBeDefined();
    });

    it('`validatePassword` function is properly exposed to end user', function () {
      expect(validatePassword).toBeDefined();
    });

    it('`AppleAuthProvider` class is properly exposed to end user', function () {
      expect(AppleAuthProvider).toBeDefined();
    });

    it('`EmailAuthProvider` class is properly exposed to end user', function () {
      expect(EmailAuthProvider).toBeDefined();
    });

    it('`FacebookAuthProvider` class is properly exposed to end user', function () {
      expect(FacebookAuthProvider).toBeDefined();
    });

    it('`GithubAuthProvider` class is properly exposed to end user', function () {
      expect(GithubAuthProvider).toBeDefined();
    });

    it('`GoogleAuthProvider` class is properly exposed to end user', function () {
      expect(GoogleAuthProvider).toBeDefined();
    });

    it('`OAuthProvider` class is properly exposed to end user', function () {
      expect(OAuthProvider).toBeDefined();
    });

    it('`OIDCProvider` class is properly exposed to end user', function () {
      expect(OIDCAuthProvider).toBeDefined();
    });

    it('`PhoneAuthProvider` class is properly exposed to end user', function () {
      expect(PhoneAuthProvider).toBeDefined();
    });

    it('`PhoneMultiFactorGenerator` class is properly exposed to end user', function () {
      expect(PhoneMultiFactorGenerator).toBeDefined();
    });

    it('`TotpSecret` class is properly exposed to end user', function () {
      expect(TotpSecret).toBeDefined();
    });

    it('`TotpMultiFactorGenerator` class is properly exposed to end user', function () {
      expect(TotpMultiFactorGenerator).toBeDefined();
    });

    it('`TwitterAuthProvider` class is properly exposed to end user', function () {
      expect(TwitterAuthProvider).toBeDefined();
    });

    describe('credential classes', function () {
      it('EmailAuthCredential.fromJSON deserializes password credentials', function () {
        const credential = EmailAuthCredential.fromJSON({
          email: 'test@example.com',
          password: 'secret',
          signInMethod: 'password',
        });
        expect(credential?.token).toBe('test@example.com');
        expect(credential?.secret).toBe('secret');
      });

      it('OAuthProvider credentialFromResult and credentialFromError return null', function () {
        expect(OAuthProvider.credentialFromResult({} as any)).toBeNull();
        expect(OAuthProvider.credentialFromError({} as any)).toBeNull();
      });

      it('PhoneAuthProvider credentialFromResult and credentialFromError return null', function () {
        expect(PhoneAuthProvider.credentialFromResult({} as any)).toBeNull();
        expect(PhoneAuthProvider.credentialFromError({} as any)).toBeNull();
      });

      it('OAuthCredential.fromJSON deserializes provider credentials', function () {
        const credential = OAuthCredential.fromJSON({
          providerId: 'google.com',
          idToken: 'id-token',
          accessToken: 'access-token',
        });
        expect(credential?.providerId).toBe('google.com');
        expect(credential?.idToken).toBe('id-token');
      });

      it('GoogleAuthProvider.credential maps id-token-only credentials for native bridge', function () {
        const credential = GoogleAuthProvider.credential('google-id-token', null);
        expect(credential.providerId).toBe('google.com');
        expect(credential.signInMethod).toBe('google.com');
        expect(credential.idToken).toBe('google-id-token');
        expect(credential.accessToken).toBeUndefined();
        expect(credential.token).toBe('google-id-token');
        expect(credential.secret).toBe('');
      });

      it('GoogleAuthProvider.credential maps access-token-only credentials for native bridge', function () {
        const credential = GoogleAuthProvider.credential(null, 'google-access-token');
        expect(credential.providerId).toBe('google.com');
        expect(credential.signInMethod).toBe('google.com');
        expect(credential.accessToken).toBe('google-access-token');
        expect(credential.idToken).toBeUndefined();
        expect(credential.token).toBe('');
        expect(credential.secret).toBe('google-access-token');
      });

      it('PhoneAuthCredential.fromJSON deserializes phone credentials', function () {
        const credential = PhoneAuthCredential.fromJSON({
          verificationId: 'vid',
          verificationCode: '123456',
        });
        expect(credential?.token).toBe('vid');
        expect(credential?.secret).toBe('123456');
      });
    });

    describe('User.reauthenticateWithRedirect', function () {
      it('updates current user via _setUserCredential', async function () {
        const setUserCredential = jest.fn();
        const authInternal = {
          native: {
            reauthenticateWithProvider: jest.fn(() =>
              Promise.resolve({ user: { uid: 'test-uid' }, additionalUserInfo: null }),
            ),
          },
          _setUserCredential: setUserCredential,
        };
        const user = new User(authInternal as any, { uid: 'test-uid' } as any);
        await user.reauthenticateWithRedirect({
          toObject: () => ({ providerId: 'google.com' }),
        } as any);
        expect(setUserCredential).toHaveBeenCalled();
      });
    });

    describe('PasswordPolicyImpl', function () {
      const TEST_MIN_PASSWORD_LENGTH = 6;
      const TEST_SCHEMA_VERSION = 1;

      const testPolicy = {
        customStrengthOptions: {
          minPasswordLength: 6,
          maxPasswordLength: 4096,
          containsLowercaseCharacter: true,
          containsUppercaseCharacter: true,
          containsNumericCharacter: true,
          containsNonAlphanumericCharacter: true,
        },
        allowedNonAlphanumericCharacters: ['$', '*'],
        schemaVersion: 1,
        enforcementState: 'OFF',
      };

      it('should create a password policy', async () => {
        let passwordPolicy = new PasswordPolicyImpl(testPolicy);
        expect(passwordPolicy).toBeDefined();
        expect(passwordPolicy.customStrengthOptions.minPasswordLength).toEqual(
          TEST_MIN_PASSWORD_LENGTH,
        );
        expect(passwordPolicy.schemaVersion).toEqual(TEST_SCHEMA_VERSION);
      });

      it('should return statusValid: true when the password satisfies the password policy', async () => {
        const passwordPolicy = new PasswordPolicyImpl(testPolicy);
        let password = 'Password$123';
        let status = passwordPolicy.validatePassword(password);
        expect(status).toBeDefined();
        expect(status.isValid).toEqual(true);
      });

      it('should return statusValid: false when the password is too short', async () => {
        const passwordPolicy = new PasswordPolicyImpl(testPolicy);
        let password = 'Pa1$';
        let status = passwordPolicy.validatePassword(password);
        expect(status).toBeDefined();
        expect(status.isValid).toEqual(false);
      });

      it('should return statusValid: false when the password has no capital characters', async () => {
        const passwordPolicy = new PasswordPolicyImpl(testPolicy);
        let password = 'password123$';
        let status = passwordPolicy.validatePassword(password);
        expect(status).toBeDefined();
        expect(status.isValid).toEqual(false);
      });

      it('should return statusValid: false when the password has no lowercase characters', async () => {
        const passwordPolicy = new PasswordPolicyImpl(testPolicy);
        let password = 'PASSWORD123$';
        let status = passwordPolicy.validatePassword(password);
        expect(status).toBeDefined();
        expect(status.isValid).toEqual(false);
      });

      it('should return statusValid: false when the password has no numbers', async () => {
        const passwordPolicy = new PasswordPolicyImpl(testPolicy);
        let password = 'Password$';
        let status = passwordPolicy.validatePassword(password);
        expect(status).toBeDefined();
        expect(status.isValid).toEqual(false);
      });

      it('should return statusValid: false when the password has no special characters', async () => {
        const passwordPolicy = new PasswordPolicyImpl(testPolicy);
        let password = 'Password123';
        let status = passwordPolicy.validatePassword(password);
        expect(status).toBeDefined();
        expect(status.isValid).toEqual(false);
      });
    });
  });
});

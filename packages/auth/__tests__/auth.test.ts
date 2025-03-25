import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { FirebaseAuthTypes } from '../lib/index';
// @ts-ignore
import User from '../lib/User';
// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';

import auth, {
  firebase,
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
  TwitterAuthProvider,
} from '../lib';

const { fetchPasswordPolicy } = require('../lib/password-policy/passwordPolicyApi');
const { PasswordPolicyImpl } = require('../lib/password-policy/passwordPolicyImpl');

// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';
// @ts-ignore - We don't mind missing types here
import { NativeFirebaseError } from '../../app/lib/internal';
//import { fetchPasswordPolicy } from '../lib/password-policy/passwordPolicy';

describe('Auth', function () {
  describe('namespace', function () {
    beforeAll(async function () {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
      });
    });

    afterAll(async function () {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.auth).toBeDefined();
      expect(app.auth().useEmulator).toBeDefined();
    });

    describe('useEmulator()', function () {
      it('useEmulator requires a string url', function () {
        // @ts-ignore because we pass an invalid argument...
        expect(() => auth().useEmulator()).toThrow(
          'firebase.auth().useEmulator() takes a non-empty string',
        );
        expect(() => auth().useEmulator('')).toThrow(
          'firebase.auth().useEmulator() takes a non-empty string',
        );
        // @ts-ignore because we pass an invalid argument...
        expect(() => auth().useEmulator(123)).toThrow(
          'firebase.auth().useEmulator() takes a non-empty string',
        );
      });

      it('useEmulator requires a well-formed url', function () {
        // No http://
        expect(() => auth().useEmulator('localhost:9099')).toThrow(
          'firebase.auth().useEmulator() takes a non-empty string URL',
        );
        // No port
        expect(() => auth().useEmulator('http://localhost')).toThrow(
          'firebase.auth().useEmulator() unable to parse host and port from URL',
        );
      });

      it('useEmulator -> remaps Android loopback to host', function () {
        const foo = auth().useEmulator('http://localhost:9099');
        expect(foo).toEqual(['10.0.2.2', 9099]);

        const bar = auth().useEmulator('http://127.0.0.1:9099');
        expect(bar).toEqual(['10.0.2.2', 9099]);
      });

      it('useEmulator allows hyphens in the hostname', function () {
        const result = auth().useEmulator('http://my-host:9099');
        expect(result).toEqual(['my-host', 9099]);
    });

    describe('tenantId', function () {
      it('should be able to set tenantId ', function () {
        const auth = firebase.app().auth();
        auth.setTenantId('test-id').then(() => {
          expect(auth.tenantId).toBe('test-id');
          });
        });
      });

      it('should throw error when tenantId is a non string object ', async function () {
        try {
          await firebase.app().auth().setTenantId(Object());
          return Promise.reject('It should throw an error');
        } catch (e: any) {
          expect(e.message).toBe(
            "firebase.auth().setTenantId(*) expected 'tenantId' to be a string",
          );
          return Promise.resolve('Error catched');
        }
      });
    });

    describe('getMultiFactorResolver', function () {
      it('should return null if no resolver object is found', function () {
        const unknownError = NativeFirebaseError.fromEvent(
          {
            code: 'unknown',
          },
          'auth',
        );
        const actual = auth.getMultiFactorResolver(auth(), unknownError);
        expect(actual).toBe(null);
      });

      it('should return null if resolver object is null', function () {
        const unknownError = NativeFirebaseError.fromEvent(
          {
            code: 'unknown',
            resolver: null,
          },
          'auth',
        );
        const actual = auth.getMultiFactorResolver(firebase.app().auth(), unknownError);
        expect(actual).toBe(null);
      });

      it('should return the resolver object if its found', function () {
        const resolver = { session: '', hints: [] };
        const errorWithResolver = NativeFirebaseError.fromEvent(
          {
            code: 'multi-factor-auth-required',
            resolver,
          },
          'auth',
        );
        const actual = auth.getMultiFactorResolver(firebase.app().auth(), errorWithResolver);
        // Using expect(actual).toEqual(resolver) causes unexpected errors:
        //  You attempted to use "firebase.app('[DEFAULT]').appCheck" but this module could not be found.
        expect(actual).not.toBeNull();
        // @ts-ignore We know actual is not null
        expect(actual.session).toEqual(resolver.session);
        // @ts-ignore We know actual is not null
        expect(actual.hints).toEqual(resolver.hints);
        // @ts-ignore We know actual is not null
        expect(actual._auth).not.toBeNull();
      });
    });
  });

describe('modular', function () {
  it('`getAuth` function is properly exposed to end user', function () {
    expect(getAuth).toBeDefined();
  });

  it('`initializeAuth` function is properly exposed to end user', function () {
    expect(initializeAuth).toBeDefined();
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

  it('`TwitterAuthProvider` class is properly exposed to end user', function () {
    expect(TwitterAuthProvider).toBeDefined();
  });

  describe('ActionCodeSettings', function () {
    beforeAll(function () {
      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: () => jest.fn().mockResolvedValue({} as never),
          },
        );
      });
    });

  describe('ActionCodeSettings', function () {
    beforeAll(function () {
      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: () => jest.fn().mockResolvedValue({} as never),
          },
        );
      });
    });

    it('should allow linkDomain as `ActionCodeSettings.linkDomain`', function () {
      const auth = firebase.app().auth();
      const actionCodeSettings: FirebaseAuthTypes.ActionCodeSettings = {
        url: 'https://example.com',
        handleCodeInApp: true,
        linkDomain: 'example.com',
      };
      const email = 'fake@example.com';
      auth.sendSignInLinkToEmail(email, actionCodeSettings);
      auth.sendPasswordResetEmail(email, actionCodeSettings);
      sendPasswordResetEmail(auth, email, actionCodeSettings);
      sendSignInLinkToEmail(auth, email, actionCodeSettings);

      const user: FirebaseAuthTypes.User = new User(auth, {});

      user.sendEmailVerification(actionCodeSettings);
      user.verifyBeforeUpdateEmail(email, actionCodeSettings);
      sendEmailVerification(user, actionCodeSettings);
      verifyBeforeUpdateEmail(user, email, actionCodeSettings);
    });

    it('should warn using `ActionCodeSettings.dynamicLinkDomain`', function () {
      const auth = firebase.app().auth();
      const actionCodeSettings: FirebaseAuthTypes.ActionCodeSettings = {
        url: 'https://example.com',
        handleCodeInApp: true,
        linkDomain: 'example.com',
        dynamicLinkDomain: 'example.com',
      };
      const email = 'fake@example.com';
      let warnings = 0;
      const consoleWarnSpy = jest.spyOn(console, 'warn');
      consoleWarnSpy.mockReset();
      consoleWarnSpy.mockImplementation(warnMessage => {
        if (
          warnMessage.includes(
            'Instead, use ActionCodeSettings.linkDomain to set up a custom domain',
          )
        ) {
          warnings++;
        }
      });
      auth.sendSignInLinkToEmail(email, actionCodeSettings);
      expect(warnings).toBe(1);
      auth.sendPasswordResetEmail(email, actionCodeSettings);
      expect(warnings).toBe(2);
      sendPasswordResetEmail(auth, email, actionCodeSettings);
      expect(warnings).toBe(3);
      sendSignInLinkToEmail(auth, email, actionCodeSettings);
      expect(warnings).toBe(4);
      const user: FirebaseAuthTypes.User = new User(auth, {});

      user.sendEmailVerification(actionCodeSettings);
      expect(warnings).toBe(5);
      user.verifyBeforeUpdateEmail(email, actionCodeSettings);
      expect(warnings).toBe(6);
      sendEmailVerification(user, actionCodeSettings);
      expect(warnings).toBe(7);
      verifyBeforeUpdateEmail(user, email, actionCodeSettings);
      expect(warnings).toBe(8);
      consoleWarnSpy.mockReset();
      consoleWarnSpy.mockRestore();
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

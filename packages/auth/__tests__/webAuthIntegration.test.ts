/**
 * Integration-style tests that simulate the web runtime environment
 * and verify the auth module initializes and operates without crashing.
 *
 * These reproduce the exact failures from issue #7921:
 * 1. ReferenceError: setImmediate is not defined
 * 2. NativeFirebaseError: [auth/unknown] "" is not a function (missing methods)
 * 3. Misleading AsyncStorage warning on web
 */
import { describe, expect, it, jest, beforeAll, afterAll } from '@jest/globals';

let originalSetImmediate: typeof setImmediate;

beforeAll(() => {
  originalSetImmediate = globalThis.setImmediate;
  // @ts-expect-error — simulating browser where setImmediate is absent
  delete globalThis.setImmediate;
});

afterAll(() => {
  globalThis.setImmediate = originalSetImmediate;
});

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
  DeviceEventEmitter: {
    emit: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

const mockOnAuthStateChanged = jest.fn(
  (_auth: unknown, callback: (user: null) => void) => {
    setTimeout(() => callback(null), 0);
    return jest.fn();
  },
);

jest.mock('@react-native-firebase/app/dist/module/internal/web/firebaseAuth', () => ({
  getApp: jest.fn(() => ({ name: '[DEFAULT]' })),
  initializeAuth: jest.fn(() => ({
    currentUser: null,
    languageCode: 'en',
    tenantId: null,
    signOut: jest.fn(),
  })),
  onAuthStateChanged: mockOnAuthStateChanged,
  onIdTokenChanged: jest.fn((_auth: unknown, callback: (user: null) => void) => {
    setTimeout(() => callback(null), 0);
    return jest.fn();
  }),
  isSignInWithEmailLink: jest.fn(() => false),
  signOut: jest.fn(() => Promise.resolve()),
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
  deleteUser: jest.fn(),
  reload: jest.fn(),
}));

jest.mock('@react-native-firebase/app/dist/module/internal/asyncStorage', () => ({
  getReactNativeAsyncStorageInternal: jest.fn(() => ({})),
  isMemoryStorage: jest.fn(() => true),
}));

// Import with explicit .ts extension to bypass Jest's iOS platform resolution
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webModule = require('../lib/web/RNFBAuthModule.ts');
const mod = webModule.default as Record<string, (...args: unknown[]) => unknown>;

describe('Web auth integration (simulated browser — no setImmediate)', () => {
  it('setImmediate is confirmed absent (simulating browser)', () => {
    expect(typeof globalThis.setImmediate).toBe('undefined');
  });

  it('addAuthStateListener does not crash (was: "" is not a function)', () => {
    // Issue #7921: this.native.addAuthStateListener() threw
    // NativeFirebaseError: [auth/unknown] "" is not a function
    expect(() => mod.addAuthStateListener('[DEFAULT]')).not.toThrow();
    expect(mockOnAuthStateChanged).toHaveBeenCalled();
  });

  it('addIdTokenListener does not crash (was: "" is not a function)', () => {
    // Issue #7921: this.native.addIdTokenListener() threw the same error
    expect(() => mod.addIdTokenListener('[DEFAULT]')).not.toThrow();
  });

  it('signInWithCustomToken is a callable function (was: "" is not a function)', () => {
    // Issue #7921: this.native.signInWithCustomToken() threw the same error
    expect(typeof mod.signInWithCustomToken).toBe('function');
  });

  it('configureAuthDomain rejects gracefully instead of crashing', async () => {
    // Issue #7921: this.native.configureAuthDomain() threw
    // NativeFirebaseError: [auth/unsupported] This operation is not supported
    // Now guarded in index.ts with `if (!isOther)`, but the web module also
    // rejects cleanly if called directly.
    await expect(mod.configureAuthDomain('[DEFAULT]')).rejects.toBeDefined();
  });

  it('does not warn about AsyncStorage on web (persistence uses IndexedDB)', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // Force a new auth instance creation
    mod.setLanguageCode('[DEFAULT]', 'fr');
    expect(warnSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Firebase Auth persistence is disabled'),
    );
    warnSpy.mockRestore();
  });

  it('verifyPhoneNumberWithMultiFactorInfo exists and rejects (was: crash)', () => {
    // This method was completely missing from the web module,
    // causing runtime crash when called via this.native
    expect(typeof mod.verifyPhoneNumberWithMultiFactorInfo).toBe('function');
    return expect(mod.verifyPhoneNumberWithMultiFactorInfo()).rejects.toBeDefined();
  });

  it('resolveTotpSignIn exists and rejects (was: crash)', () => {
    // This method was completely missing from the web module
    expect(typeof mod.resolveTotpSignIn).toBe('function');
    return expect(mod.resolveTotpSignIn()).rejects.toBeDefined();
  });
});

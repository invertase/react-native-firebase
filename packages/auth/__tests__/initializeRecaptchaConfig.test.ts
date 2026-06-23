import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockJsInitializeRecaptchaConfig = jest.fn((_auth?: unknown) => Promise.resolve());

jest.mock('@react-native-firebase/app/dist/module/common', () => ({
  ...jest.requireActual<typeof import('@react-native-firebase/app/dist/module/common')>(
    '@react-native-firebase/app/dist/module/common',
  ),
  isOtherHermes: false,
  isOther: true,
  isWeb: true,
}));

jest.mock('@react-native-firebase/app/dist/module/internal/web/firebaseAuth', () => ({
  getApp: jest.fn(() => ({ name: '[DEFAULT]' })),
  initializeAuth: jest.fn(() => ({ name: 'mock-auth' })),
  initializeRecaptchaConfig: (auth: unknown) => mockJsInitializeRecaptchaConfig(auth),
  onAuthStateChanged: jest.fn(),
  onIdTokenChanged: jest.fn(),
  makeIDBAvailable: jest.fn(),
}));

jest.mock('@react-native-firebase/app/dist/module/internal/web/utils', () => ({
  guard: (fn: () => Promise<unknown>) => fn(),
  getWebError: jest.fn(),
  emitEvent: jest.fn(),
}));

jest.mock('@react-native-firebase/app/dist/module/internal/asyncStorage', () => ({
  getReactNativeAsyncStorageInternal: jest.fn(),
  isMemoryStorage: jest.fn(() => false),
}));

import { initializeRecaptchaConfig, signInWithPhoneNumber } from '../lib/modular';

// Force the web bridge implementation (avoid platform-specific .ios/.android stubs).
const RNFBAuthModule = (
  jest.requireActual('../lib/web/RNFBAuthModule.ts') as {
    default: {
      initializeRecaptchaConfig(appName: string): Promise<void>;
    };
  }
).default;

/**
 * Documented Enterprise Web phone sign-in sequence. Upstream firebase-js-sdk requires
 * initializeRecaptchaConfig(auth) before signInWithPhoneNumber when Enterprise is enforced.
 */
async function startEnterpriseWebPhoneSignIn(
  auth: {
    app: { name: string };
    initializeRecaptchaConfig(): Promise<void>;
    signInWithPhoneNumber(phoneNumber: string): Promise<{ verificationId: string }>;
  },
  phoneNumber: string,
) {
  await initializeRecaptchaConfig(auth as never);
  return signInWithPhoneNumber(auth as never, phoneNumber);
}

describe('initializeRecaptchaConfig', function () {
  beforeEach(function () {
    mockJsInitializeRecaptchaConfig.mockClear();
    mockJsInitializeRecaptchaConfig.mockImplementation(() => Promise.resolve());
  });

  describe('Other/Web web bridge', function () {
    it('delegates to firebase-js-sdk initializeRecaptchaConfig', async function () {
      await RNFBAuthModule.initializeRecaptchaConfig('[DEFAULT]');

      expect(mockJsInitializeRecaptchaConfig).toHaveBeenCalledTimes(1);
      expect(mockJsInitializeRecaptchaConfig).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'mock-auth' }),
      );
    });

    it('modular initializeRecaptchaConfig delegates through auth bridge to js-sdk', async function () {
      const mockAuth = {
        app: { name: '[DEFAULT]' },
        initializeRecaptchaConfig: jest.fn(function (this: { app: { name: string } }) {
          return RNFBAuthModule.initializeRecaptchaConfig(this.app.name);
        }),
      };

      await initializeRecaptchaConfig(mockAuth as never);

      expect(mockAuth.initializeRecaptchaConfig).toHaveBeenCalledTimes(1);
      expect(mockJsInitializeRecaptchaConfig).toHaveBeenCalledTimes(1);
      expect(mockJsInitializeRecaptchaConfig).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'mock-auth' }),
      );
    });

    /**
     * Upstream firebase-js-sdk behaviour (not re-tested here): when reCAPTCHA Enterprise is
     * enforced for Web phone auth and initializeRecaptchaConfig(auth) was not called first,
     * signInWithPhoneNumber / PhoneAuthProvider.verifyPhoneNumber fails or falls back to v2.
     * Enterprise phone examples must call initializeRecaptchaConfig before starting verification.
     */
    it('Enterprise Web phone flow calls initializeRecaptchaConfig before phone verification', async function () {
      const callOrder: string[] = [];

      mockJsInitializeRecaptchaConfig.mockImplementation(async () => {
        callOrder.push('js-sdk.initializeRecaptchaConfig');
      });

      const mockAuth = {
        app: { name: '[DEFAULT]' },
        initializeRecaptchaConfig: jest.fn(async function (this: { app: { name: string } }) {
          callOrder.push('auth.initializeRecaptchaConfig');
          return RNFBAuthModule.initializeRecaptchaConfig(this.app.name);
        }),
        signInWithPhoneNumber: jest.fn(async () => {
          callOrder.push('auth.signInWithPhoneNumber');
          return { verificationId: 'test-verification-id' };
        }),
      };

      await startEnterpriseWebPhoneSignIn(mockAuth, '+15555550100');

      expect(callOrder).toEqual([
        'auth.initializeRecaptchaConfig',
        'js-sdk.initializeRecaptchaConfig',
        'auth.signInWithPhoneNumber',
      ]);
      expect(mockAuth.initializeRecaptchaConfig).toHaveBeenCalledTimes(1);
      expect(mockAuth.signInWithPhoneNumber).toHaveBeenCalledTimes(1);
      expect(mockJsInitializeRecaptchaConfig).toHaveBeenCalledTimes(1);
    });
  });
});

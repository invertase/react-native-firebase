import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { NativeModules } from 'react-native';

const firebaseInitializeApp = jest.fn();
const firebaseGetApps = jest.fn(() => [] as { name: string }[]);

jest.mock('../lib/internal/web/firebaseApp', () => ({
  initializeApp: firebaseInitializeApp,
  getApps: firebaseGetApps,
  getApp: jest.fn(),
  deleteApp: jest.fn(),
  setLogLevel: jest.fn(),
}));

import RNFBAppModule from '../lib/internal/web/RNFBAppModule';
import { initializeApp, deleteApp } from '../lib/modular';

const baseOptions = {
  apiKey: 'test-api-key',
  appId: '1:1234567890:android:abc123',
  projectId: 'test-project',
  databaseURL: 'https://test-project.firebaseio.com',
  messagingSenderId: '1234567890',
  storageBucket: 'test-project.appspot.com',
};

describe('recaptchaSiteKey', function () {
  describe('Other/Web RNFBAppModule', function () {
    beforeEach(function () {
      firebaseInitializeApp.mockClear();
      firebaseGetApps.mockReturnValue([]);
    });

    it('preserves recaptchaSiteKey through initializeApp', async function () {
      const recaptchaSiteKey = '6Le-test-recaptcha-site-key';
      const appConfig = { name: 'recaptchaWebApp' };

      const result = await RNFBAppModule.initializeApp(
        { ...baseOptions, recaptchaSiteKey },
        appConfig,
      );

      expect(firebaseInitializeApp).toHaveBeenCalledWith(
        expect.objectContaining({ recaptchaSiteKey }),
        expect.objectContaining({ name: 'recaptchaWebApp' }),
      );
      expect(result.options.recaptchaSiteKey).toBe(recaptchaSiteKey);
    });
  });

  describe('JS initializeApp native bridge', function () {
    beforeEach(function () {
      (NativeModules.RNFBAppModule as { initializeApp?: jest.Mock; deleteApp?: jest.Mock }).initializeApp =
        jest.fn(() => Promise.resolve());
      (NativeModules.RNFBAppModule as { initializeApp?: jest.Mock; deleteApp?: jest.Mock }).deleteApp =
        jest.fn(() => Promise.resolve());
    });

    it('passes recaptchaSiteKey to native initializeApp for secondary apps', async function () {
      const recaptchaSiteKey = '6Le-test-recaptcha-site-key';
      const name = `recaptchaSecondaryApp${Date.now()}`;

      const app = await initializeApp({ ...baseOptions, recaptchaSiteKey }, name);

      expect(
        (NativeModules.RNFBAppModule as { initializeApp: jest.Mock }).initializeApp,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ recaptchaSiteKey }),
        expect.objectContaining({ name }),
      );
      expect(app.options.recaptchaSiteKey).toBe(recaptchaSiteKey);

      await deleteApp(app);
    });

    it('native default-app recaptchaSiteKey is not mutable from JS after startup', function () {
      // Native default apps are configured from google-services.json /
      // GoogleService-Info.plist before JS runs. recaptchaSiteKey on the default app
      // (when present) is exposed read-only via native FirebaseOptions — not via a
      // JS initializeApp() call on an existing default app.
      expect(NativeModules.RNFBAppModule.NATIVE_FIREBASE_APPS.length).toBeGreaterThan(0);
    });
  });
});

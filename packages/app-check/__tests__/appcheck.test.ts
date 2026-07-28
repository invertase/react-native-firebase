import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { Platform } from 'react-native';

import {
  initializeAppCheck,
  getToken,
  getLimitedUseToken,
  setTokenAutoRefreshEnabled,
  onTokenChanged,
  CustomProvider,
  ReactNativeFirebaseAppCheckProvider,
  type ReactNativeFirebaseAppCheckProviderOptions,
  type ReactNativeFirebaseAppCheckProviderAndroidOptions,
  type ReactNativeFirebaseAppCheckProviderAppleOptions,
  type ReactNativeFirebaseAppCheckProviderWebOptions,
} from '../lib';

describe('appCheck()', function () {
  describe('modular', function () {
    it('`initializeAppCheck` function is properly exposed to end user', function () {
      expect(initializeAppCheck).toBeDefined();
    });

    it('`initializeAppCheck` throws when options are missing at runtime', function () {
      expect(() => initializeAppCheck(undefined, undefined)).toThrow(
        'Invalid configuration: no options defined.',
      );
    });

    describe('provider name validation', function () {
      it('throws on invalid android provider name', function () {
        const provider = new ReactNativeFirebaseAppCheckProvider();
        provider.configure({
          android: { provider: 'invalidProvider' as any },
        });
        expect(() => initializeAppCheck(undefined, { provider })).toThrow(
          'Invalid App Check provider "invalidProvider". Valid android providers are: debug, playIntegrity.',
        );
      });

      it('does not throw validation error for valid android provider names', function () {
        for (const name of ['debug', 'playIntegrity']) {
          const provider = new ReactNativeFirebaseAppCheckProvider();
          provider.configure({
            android: { provider: name as any },
          });
          try {
            initializeAppCheck(undefined, { provider });
          } catch (e: any) {
            expect(e.message).not.toContain('Invalid App Check provider');
          }
        }
      });

      describe('apple platform', function () {
        let originalOS: string;

        beforeEach(function () {
          originalOS = Platform.OS;
          Platform.OS = 'ios' as any;
        });

        afterEach(function () {
          Platform.OS = originalOS as any;
        });

        it('throws on invalid apple provider name', function () {
          const provider = new ReactNativeFirebaseAppCheckProvider();
          provider.configure({
            apple: { provider: 'appAttestWithDebugProviderFallback' as any },
          });
          expect(() => initializeAppCheck(undefined, { provider })).toThrow(
            'Invalid App Check provider "appAttestWithDebugProviderFallback". Valid apple providers are: debug, deviceCheck, appAttest, appAttestWithDeviceCheckFallback.',
          );
        });

        it('does not throw validation error for valid apple provider names', function () {
          for (const name of [
            'debug',
            'deviceCheck',
            'appAttest',
            'appAttestWithDeviceCheckFallback',
          ]) {
            const provider = new ReactNativeFirebaseAppCheckProvider();
            provider.configure({
              apple: { provider: name as any },
            });
            try {
              initializeAppCheck(undefined, { provider });
            } catch (e: any) {
              expect(e.message).not.toContain('Invalid App Check provider');
            }
          }
        });
      });
    });

    it('`getToken` function is properly exposed to end user', function () {
      expect(getToken).toBeDefined();
    });

    it('`getLimitedUseToken` function is properly exposed to end user', function () {
      expect(getLimitedUseToken).toBeDefined();
    });

    it('`setTokenAutoRefreshEnabled` function is properly exposed to end user', function () {
      expect(setTokenAutoRefreshEnabled).toBeDefined();
    });

    it('`onTokenChanged` function is properly exposed to end user', function () {
      expect(onTokenChanged).toBeDefined();
    });

    it('`CustomProvider` function is properly exposed to end user', function () {
      expect(CustomProvider).toBeDefined();
    });

    it('ReactNativeAppCheckProvider objects are properly exposed to end user', function () {
      const provider = new ReactNativeFirebaseAppCheckProvider();
      expect(provider.configure).toBeDefined();
      const options = { debugToken: 'foo' } as ReactNativeFirebaseAppCheckProviderOptions;
      const appleOptions = {
        provider: 'debug',
        ...options,
      } as ReactNativeFirebaseAppCheckProviderAppleOptions;
      expect(appleOptions).toBeDefined();
      const androidOptions = {
        provider: 'debug',
        ...options,
      } as ReactNativeFirebaseAppCheckProviderAndroidOptions;
      expect(androidOptions).toBeDefined();
      const webOptions = {
        provider: 'debug',
        ...options,
      } as ReactNativeFirebaseAppCheckProviderWebOptions;
      expect(webOptions).toBeDefined();
      expect(ReactNativeFirebaseAppCheckProvider).toBeDefined();
    });
  });
});

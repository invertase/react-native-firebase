import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
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

    describe('initializeAppCheck native call order (AppCheck-AD-4)', function () {
      it('calls configureProvider before setTokenAutoRefreshEnabled', async function () {
        const provider = new ReactNativeFirebaseAppCheckProvider();
        provider.configure({
          android: { provider: 'debug' },
        });

        // Bootstrap the modular instance, then flush the fire-and-forget init.
        const appCheck = initializeAppCheck(undefined, {
          provider,
          isTokenAutoRefreshEnabled: true,
        }) as any;
        await Promise.resolve();
        await Promise.resolve();

        const callOrder: string[] = [];
        const configureProvider = jest.fn((_provider?: string, _debugToken?: string) => {
          callOrder.push('configureProvider');
          return Promise.resolve();
        });
        const setTokenAutoRefreshEnabledNative = jest.fn((_enabled?: boolean) => {
          callOrder.push('setTokenAutoRefreshEnabled');
        });
        appCheck._nativeModule = {
          configureProvider,
          setTokenAutoRefreshEnabled: setTokenAutoRefreshEnabledNative,
        };

        await appCheck.initializeAppCheck({
          provider,
          isTokenAutoRefreshEnabled: true,
        });

        expect(configureProvider).toHaveBeenCalledWith('debug', undefined);
        expect(setTokenAutoRefreshEnabledNative).toHaveBeenCalledWith(true);
        expect(callOrder).toEqual(['configureProvider', 'setTokenAutoRefreshEnabled']);
      });

      it('calls configureProvider before setTokenAutoRefreshEnabled on apple', async function () {
        const originalOS = Platform.OS;
        Platform.OS = 'ios' as typeof Platform.OS;

        try {
          const provider = new ReactNativeFirebaseAppCheckProvider();
          provider.configure({
            apple: { provider: 'debug' },
          });

          const appCheck = initializeAppCheck(undefined, {
            provider,
            isTokenAutoRefreshEnabled: false,
          }) as any;
          await Promise.resolve();
          await Promise.resolve();

          const callOrder: string[] = [];
          const configureProvider = jest.fn((_provider?: string, _debugToken?: string) => {
            callOrder.push('configureProvider');
            return Promise.resolve();
          });
          const setTokenAutoRefreshEnabledNative = jest.fn((_enabled?: boolean) => {
            callOrder.push('setTokenAutoRefreshEnabled');
          });
          appCheck._nativeModule = {
            configureProvider,
            setTokenAutoRefreshEnabled: setTokenAutoRefreshEnabledNative,
          };

          await appCheck.initializeAppCheck({
            provider,
            isTokenAutoRefreshEnabled: false,
          });

          expect(configureProvider).toHaveBeenCalledWith('debug', undefined);
          expect(setTokenAutoRefreshEnabledNative).toHaveBeenCalledWith(false);
          expect(callOrder).toEqual(['configureProvider', 'setTokenAutoRefreshEnabled']);
        } finally {
          Platform.OS = originalOS;
        }
      });
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

    // AppCheck-AD-8 locked JS reject identity (native pre-check / error map → NativeFirebaseError).
    it('surfaces appCheck/provider-not-ready from native getToken reject (AppCheck-AD-8)', async function () {
      const provider = new ReactNativeFirebaseAppCheckProvider();
      provider.configure({
        android: { provider: 'debug' },
      });
      const appCheck = initializeAppCheck(undefined, { provider }) as any;
      await Promise.resolve();
      await Promise.resolve();

      const notReady = Object.assign(new Error('appCheck/provider-not-ready'), {
        code: 'appCheck/provider-not-ready',
        message:
          '[appCheck/provider-not-ready] App Check provider is not ready. Call initializeAppCheck before requesting tokens.',
      });
      appCheck._nativeModule = {
        getToken: jest.fn(() => Promise.reject(notReady)),
        getLimitedUseToken: jest.fn(() => Promise.reject(notReady)),
      };

      await expect(getToken(appCheck, false)).rejects.toMatchObject({
        code: 'appCheck/provider-not-ready',
      });
      await expect(getLimitedUseToken(appCheck)).rejects.toMatchObject({
        code: 'appCheck/provider-not-ready',
      });
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

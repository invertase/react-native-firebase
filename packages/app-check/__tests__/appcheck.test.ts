import { describe, expect, it } from '@jest/globals';

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

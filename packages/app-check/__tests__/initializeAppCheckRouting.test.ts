import { describe, expect, it } from '@jest/globals';
import {
  resolveNativeInitializeAppCheckRoute,
  validateOtherHermesInitializeAppCheck,
} from '../lib/appCheckInitializeRouting';
import {
  ReCaptchaEnterpriseProvider,
  ReCaptchaV3Provider,
  ReactNativeFirebaseAppCheckProvider,
} from '../lib/providers';

describe('initializeAppCheck routing', function () {
  describe('resolveNativeInitializeAppCheckRoute', function () {
    const nativeContext = {
      isOtherHermes: false,
      platformOS: 'android',
      appOptions: {},
    };

    it('throws when provider is omitted', function () {
      expect(() =>
        resolveNativeInitializeAppCheckRoute({ isTokenAutoRefreshEnabled: true }, nativeContext),
      ).toThrow('App Check provider is required on iOS and Android');
    });

    it('maps ReCaptchaEnterpriseProvider to recaptcha', function () {
      expect(
        resolveNativeInitializeAppCheckRoute(
          { provider: new ReCaptchaEnterpriseProvider('enterprise-key') },
          nativeContext,
        ),
      ).toEqual({ providerName: 'recaptcha' });
    });

    it('throws for ReCaptchaV3Provider on native', function () {
      expect(() =>
        resolveNativeInitializeAppCheckRoute(
          { provider: new ReCaptchaV3Provider('v3-key') },
          nativeContext,
        ),
      ).toThrow('ReCaptchaV3Provider is not supported on iOS and Android');
    });

    it('throws when constructor siteKey differs from app.options.recaptchaSiteKey', function () {
      expect(() =>
        resolveNativeInitializeAppCheckRoute(
          { provider: new ReCaptchaEnterpriseProvider('constructor-site-key') },
          {
            ...nativeContext,
            appOptions: { recaptchaSiteKey: 'config-site-key' },
          },
        ),
      ).toThrow('does not match app.options.recaptchaSiteKey');
    });

    it('preserves ReactNativeFirebaseAppCheckProvider configureProvider path', function () {
      const provider = new ReactNativeFirebaseAppCheckProvider({
        android: { provider: 'playIntegrity' },
      });

      expect(
        resolveNativeInitializeAppCheckRoute({ provider }, nativeContext),
      ).toEqual({ providerName: 'playIntegrity', debugToken: undefined });
    });
  });

  describe('validateOtherHermesInitializeAppCheck', function () {
    it('throws when provider is omitted on Other/Hermes', function () {
      expect(() =>
        validateOtherHermesInitializeAppCheck(
          { isTokenAutoRefreshEnabled: true },
          { isOtherHermes: true },
        ),
      ).toThrow('Provider-less App Check initialization is not supported on this platform');
    });

    it('allows provider-less init on Other/Web', function () {
      expect(() =>
        validateOtherHermesInitializeAppCheck(
          { isTokenAutoRefreshEnabled: true },
          { isOtherHermes: false },
        ),
      ).not.toThrow();
    });

    it('throws for ReCaptchaEnterpriseProvider on Other/Hermes', function () {
      expect(() =>
        validateOtherHermesInitializeAppCheck(
          { provider: new ReCaptchaEnterpriseProvider('enterprise-key') },
          { isOtherHermes: true },
        ),
      ).toThrow('ReCaptcha providers are not supported on this platform');
    });

    it('throws for ReCaptchaV3Provider on Other/Hermes', function () {
      expect(() =>
        validateOtherHermesInitializeAppCheck(
          { provider: new ReCaptchaV3Provider('v3-key') },
          { isOtherHermes: true },
        ),
      ).toThrow('ReCaptcha providers are not supported on this platform');
    });
  });
});

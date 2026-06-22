import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@react-native-firebase/app/dist/module/internal/web/firebaseAppCheck', () => ({
  getApp: jest.fn((_appName?: string) => ({ options: {} as Record<string, unknown> })),
  initializeAppCheck: jest.fn((_app: unknown, _options?: unknown) => ({})),
  getToken: jest.fn(),
  getLimitedUseToken: jest.fn(),
  setTokenAutoRefreshEnabled: jest.fn(),
  CustomProvider: jest.fn(function (
    this: { options: { getToken: () => Promise<unknown> } },
    options: { getToken: () => Promise<unknown> },
  ) {
    this.options = options;
  }),
  ReCaptchaV3Provider: jest.fn(function (this: { siteKey: string }, siteKey: string) {
    this.siteKey = siteKey;
  }),
  ReCaptchaEnterpriseProvider: jest.fn(function (this: { siteKey: string }, siteKey: string) {
    this.siteKey = siteKey;
  }),
  onTokenChanged: jest.fn(),
  makeIDBAvailable: jest.fn(),
}));

import * as firebaseAppCheck from '@react-native-firebase/app/dist/module/internal/web/firebaseAppCheck';
import {
  buildWebAppCheckInitOptions,
  resolveWebAppCheckProvider,
} from '../lib/web/appCheckWebProviderRouting';
import {
  CustomProvider,
  ReCaptchaV3Provider,
  ReCaptchaEnterpriseProvider,
  ReactNativeFirebaseAppCheckProvider,
} from '../lib/providers';

const mockJsReCaptchaV3Provider = firebaseAppCheck.ReCaptchaV3Provider as jest.Mock;
const mockJsReCaptchaEnterpriseProvider =
  firebaseAppCheck.ReCaptchaEnterpriseProvider as jest.Mock;
const mockJsCustomProvider = firebaseAppCheck.CustomProvider as jest.Mock;

describe('RNFBAppCheckModule web provider routing', function () {
  beforeEach(function () {
    mockJsReCaptchaV3Provider.mockClear();
    mockJsReCaptchaEnterpriseProvider.mockClear();
    mockJsCustomProvider.mockClear();
  });

  it('routes ReCaptchaEnterpriseProvider to js-sdk ReCaptchaEnterpriseProvider', function () {
    const siteKey = 'enterprise-site-key';
    const initOptions = buildWebAppCheckInitOptions(
      { options: {} },
      {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true,
      },
    );

    expect(mockJsReCaptchaEnterpriseProvider).toHaveBeenCalledWith(siteKey);
    expect(mockJsReCaptchaV3Provider).not.toHaveBeenCalled();
    expect(initOptions).toEqual(
      expect.objectContaining({
        provider: expect.objectContaining({ siteKey }),
        isTokenAutoRefreshEnabled: true,
      }),
    );
  });

  it('routes ReCaptchaV3Provider to js-sdk ReCaptchaV3Provider', function () {
    const siteKey = 'v3-site-key';
    const initOptions = buildWebAppCheckInitOptions(
      { options: {} },
      {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: false,
      },
    );

    expect(mockJsReCaptchaV3Provider).toHaveBeenCalledWith(siteKey);
    expect(mockJsReCaptchaEnterpriseProvider).not.toHaveBeenCalled();
    expect(initOptions).toEqual(
      expect.objectContaining({
        provider: expect.objectContaining({ siteKey }),
        isTokenAutoRefreshEnabled: false,
      }),
    );
  });

  it('routes ReactNativeFirebaseAppCheckProvider web config to js-sdk providers', function () {
    buildWebAppCheckInitOptions(
      { options: {} },
      {
        provider: new ReactNativeFirebaseAppCheckProvider({
          web: { provider: 'reCaptchaEnterprise', siteKey: 'rnfb-enterprise-key' },
        }),
        isTokenAutoRefreshEnabled: true,
      },
    );

    expect(mockJsReCaptchaEnterpriseProvider).toHaveBeenCalledWith('rnfb-enterprise-key');

    mockJsReCaptchaEnterpriseProvider.mockClear();

    buildWebAppCheckInitOptions(
      { options: {} },
      {
        provider: {
          providerOptions: {
            web: { provider: 'reCaptchaV3', siteKey: 'rnfb-v3-key' },
          },
        },
        isTokenAutoRefreshEnabled: true,
      },
    );

    expect(mockJsReCaptchaV3Provider).toHaveBeenCalledWith('rnfb-v3-key');
  });

  it('supports provider-less initializeAppCheck when recaptchaSiteKey is present', function () {
    const recaptchaSiteKey = 'project-recaptcha-site-key';
    const initOptions = buildWebAppCheckInitOptions(
      { options: { recaptchaSiteKey } },
      { isTokenAutoRefreshEnabled: true },
    );

    expect(mockJsReCaptchaV3Provider).not.toHaveBeenCalled();
    expect(mockJsReCaptchaEnterpriseProvider).not.toHaveBeenCalled();
    expect(initOptions).toEqual({ isTokenAutoRefreshEnabled: true });
    expect(initOptions).not.toHaveProperty('provider');
  });

  it('throws when provider-less initializeAppCheck has no recaptchaSiteKey', function () {
    expect(() =>
      buildWebAppCheckInitOptions({ options: {} }, { isTokenAutoRefreshEnabled: true }),
    ).toThrow('AppCheck provider is required');
  });

  it('passes CustomProvider getToken through to js-sdk CustomProvider', async function () {
    const token = { token: 'custom-token', expireTimeMillis: Date.now() + 3600000 };
    const getToken = jest.fn(() => Promise.resolve(token));

    buildWebAppCheckInitOptions(
      { options: {} },
      {
        provider: new CustomProvider({ getToken }),
        isTokenAutoRefreshEnabled: true,
      },
    );

    expect(mockJsCustomProvider).toHaveBeenCalledWith({
      getToken: expect.any(Function),
    });

    const jsProviderOptions = mockJsCustomProvider.mock.calls[0][0] as {
      getToken: () => Promise<typeof token>;
    };
    await expect(jsProviderOptions.getToken()).resolves.toEqual(token);
    expect(getToken).toHaveBeenCalled();
  });

  it('resolveWebAppCheckProvider rejects unsupported web debug config', function () {
    expect(() =>
      resolveWebAppCheckProvider(
        new ReactNativeFirebaseAppCheckProvider({
          web: { provider: 'debug', siteKey: 'debug-key' },
        }),
      ),
    ).toThrow('web debug provider is not supported');
  });
});

import {
  CustomProvider as JsCustomProvider,
  ReCaptchaV3Provider as JsReCaptchaV3Provider,
  ReCaptchaEnterpriseProvider as JsReCaptchaEnterpriseProvider,
  type AppCheckOptions as JsAppCheckOptions,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseAppCheck';
import type { ReactNativeFirebaseAppCheckProviderConfig } from '../types/appcheck';
import {
  CustomProvider,
  ReCaptchaV3Provider,
  ReCaptchaEnterpriseProvider,
  ReactNativeFirebaseAppCheckProvider,
} from '../providers';

export type WebInitializeAppCheckOptions = {
  provider?:
    | JsAppCheckOptions['provider']
    | ReCaptchaV3Provider
    | ReCaptchaEnterpriseProvider
    | CustomProvider
    | ReactNativeFirebaseAppCheckProvider
    | ReactNativeFirebaseAppCheckProviderConfig;
  isTokenAutoRefreshEnabled?: boolean;
};

function hasProviderOptions(
  provider: unknown,
): provider is
  | ReactNativeFirebaseAppCheckProvider
  | ReactNativeFirebaseAppCheckProviderConfig {
  return (
    provider !== undefined &&
    typeof provider === 'object' &&
    provider !== null &&
    'providerOptions' in provider &&
    (provider as { providerOptions?: unknown }).providerOptions !== undefined
  );
}

export function resolveWebAppCheckProvider(
  provider: NonNullable<WebInitializeAppCheckOptions['provider']>,
): NonNullable<JsAppCheckOptions['provider']> {
  if (provider instanceof ReCaptchaEnterpriseProvider) {
    return new JsReCaptchaEnterpriseProvider(provider.siteKey);
  }

  if (provider instanceof ReCaptchaV3Provider) {
    return new JsReCaptchaV3Provider(provider.siteKey);
  }

  if (provider instanceof CustomProvider) {
    return new JsCustomProvider({
      getToken: () => provider.getToken(),
    });
  }

  if (provider instanceof ReactNativeFirebaseAppCheckProvider || hasProviderOptions(provider)) {
    const webOptions = provider.providerOptions?.web;
    if (!webOptions) {
      throw new Error(
        'Invalid configuration: ReactNativeFirebaseAppCheckProvider requires web providerOptions on web.',
      );
    }

    const siteKey = webOptions.siteKey ?? 'none';
    const webProvider = webOptions.provider ?? 'reCaptchaV3';

    if (webProvider === 'reCaptchaEnterprise') {
      return new JsReCaptchaEnterpriseProvider(siteKey);
    }

    if (webProvider === 'reCaptchaV3') {
      return new JsReCaptchaV3Provider(siteKey);
    }

    throw new Error(
      'Invalid configuration: web debug provider is not supported via js-sdk routing. Use CustomProvider instead.',
    );
  }

  throw new Error('Invalid App Check provider.');
}

export function buildWebAppCheckInitOptions(
  app: { options: { recaptchaSiteKey?: string } },
  options: WebInitializeAppCheckOptions,
): JsAppCheckOptions {
  const { provider, isTokenAutoRefreshEnabled } = options;

  if (!provider) {
    const recaptchaSiteKey = app.options.recaptchaSiteKey;
    if (!recaptchaSiteKey) {
      throw new Error('AppCheck provider is required');
    }

    return { isTokenAutoRefreshEnabled };
  }

  return {
    provider: resolveWebAppCheckProvider(provider),
    isTokenAutoRefreshEnabled,
  };
}

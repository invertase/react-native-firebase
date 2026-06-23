import { isString, isUndefined } from '@react-native-firebase/app/dist/module/common';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type { AppCheckOptions } from './types/appcheck';
import type { ProviderWithOptions } from './types/internal';
import {
  ReCaptchaEnterpriseProvider,
  ReCaptchaV3Provider,
} from './providers';

export type InitializeAppCheckPlatformContext = {
  isOtherHermes: boolean;
  platformOS: string;
  appOptions: Pick<ReactNativeFirebase.FirebaseAppOptions, 'recaptchaSiteKey'>;
};

export type NativeConfigureProviderRoute = {
  providerName: string;
  debugToken?: string;
};

function hasProviderOptions(provider: unknown): provider is ProviderWithOptions {
  return (
    provider !== undefined &&
    provider !== null &&
    typeof provider === 'object' &&
    'providerOptions' in provider &&
    (provider as ProviderWithOptions).providerOptions !== undefined
  );
}

export function assertNativeRecaptchaSiteKeyConsistency(
  appOptions: Pick<ReactNativeFirebase.FirebaseAppOptions, 'recaptchaSiteKey'>,
  constructorSiteKey: string,
): void {
  const configSiteKey = appOptions.recaptchaSiteKey;
  if (configSiteKey && constructorSiteKey && configSiteKey !== constructorSiteKey) {
    throw new Error(
      'ReCaptchaEnterpriseProvider constructor siteKey does not match app.options.recaptchaSiteKey. ' +
        'On iOS and Android the site key is read from FirebaseApp options / native config, not the provider constructor.',
    );
  }
}

export function validateOtherHermesInitializeAppCheck(
  options: AppCheckOptions,
  context: Pick<InitializeAppCheckPlatformContext, 'isOtherHermes'>,
): void {
  if (!context.isOtherHermes) {
    return;
  }

  if (isUndefined(options.provider)) {
    throw new Error(
      'Provider-less App Check initialization is not supported on this platform. reCAPTCHA App Check requires a DOM environment.',
    );
  }

  if (
    options.provider instanceof ReCaptchaV3Provider ||
    options.provider instanceof ReCaptchaEnterpriseProvider
  ) {
    throw new Error(
      'ReCaptcha providers are not supported on this platform. reCAPTCHA App Check requires a DOM environment. Use CustomProvider or ReactNativeFirebaseAppCheckProvider instead.',
    );
  }
}

export function resolveNativeInitializeAppCheckRoute(
  options: AppCheckOptions,
  context: InitializeAppCheckPlatformContext,
): NativeConfigureProviderRoute {
  if (isUndefined(options.provider)) {
    throw new Error(
      'App Check provider is required on iOS and Android. Provider-less initialization is supported on web only.',
    );
  }

  const provider = options.provider;

  if (provider instanceof ReCaptchaEnterpriseProvider) {
    assertNativeRecaptchaSiteKeyConsistency(context.appOptions, provider.siteKey);
    if (context.platformOS === 'android' || context.platformOS === 'ios') {
      return { providerName: 'recaptcha' };
    }
    if (context.platformOS === 'macos') {
      throw new Error(
        'ReCaptcha App Check provider is not supported on macOS. Native recaptcha is iOS-only.',
      );
    }
    throw new Error('Unsupported platform: ' + context.platformOS);
  }

  if (provider instanceof ReCaptchaV3Provider) {
    throw new Error(
      'ReCaptchaV3Provider is not supported on iOS and Android. Native App Check uses the reCAPTCHA Enterprise factory. Use ReCaptchaEnterpriseProvider or ReactNativeFirebaseAppCheckProvider with provider "recaptcha".',
    );
  }

  if (!hasProviderOptions(provider)) {
    throw new Error('Invalid configuration: no provider or no provider options defined.');
  }

  if (context.platformOS === 'android') {
    if (!isString(provider.providerOptions?.android?.provider)) {
      throw new Error(
        'Invalid configuration: no android provider configured while on android platform.',
      );
    }
    return {
      providerName: provider.providerOptions.android.provider,
      debugToken: provider.providerOptions.android.debugToken,
    };
  }

  if (context.platformOS === 'ios' || context.platformOS === 'macos') {
    if (!isString(provider.providerOptions?.apple?.provider)) {
      throw new Error(
        'Invalid configuration: no apple provider configured while on apple platform.',
      );
    }
    const appleProvider = provider.providerOptions.apple.provider;
    if (context.platformOS === 'macos' && appleProvider === 'recaptcha') {
      throw new Error(
        'ReCaptcha App Check provider is not supported on macOS. Native recaptcha is iOS-only.',
      );
    }
    return {
      providerName: appleProvider,
      debugToken: provider.providerOptions.apple.debugToken,
    };
  }

  throw new Error('Unsupported platform: ' + context.platformOS);
}

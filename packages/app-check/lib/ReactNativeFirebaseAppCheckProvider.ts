import type {
  AppCheckProvider,
  AppCheckToken,
  ReactNativeFirebaseAppCheckProviderWebOptions,
  ReactNativeFirebaseAppCheckProviderAndroidOptions,
  ReactNativeFirebaseAppCheckProviderAppleOptions,
} from './types/appcheck';

interface ProviderOptions {
  web?: ReactNativeFirebaseAppCheckProviderWebOptions;
  android?: ReactNativeFirebaseAppCheckProviderAndroidOptions;
  apple?: ReactNativeFirebaseAppCheckProviderAppleOptions;
  isTokenAutoRefreshEnabled?: boolean;
}

export default class ReactNativeFirebaseAppCheckProvider implements AppCheckProvider {
  providerOptions?: ProviderOptions;

  constructor() {}

  configure(options: ProviderOptions): void {
    this.providerOptions = options;
  }

  async getToken(): Promise<AppCheckToken> {
    // This is a placeholder - the actual implementation is handled by the native modules
    // This method exists to satisfy the AppCheckProvider interface
    throw new Error('getToken() must be called after configure() and is handled by native modules');
  }
}

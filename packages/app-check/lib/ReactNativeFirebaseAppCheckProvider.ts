import type {
  AppCheckProvider,
  AppCheckToken,
  ReactNativeFirebaseAppCheckProviderOptionsMap as ProviderOptions,
} from './types/appcheck';

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

import type { FirebaseAppCheckTypes } from './types/appcheck';

interface ProviderOptions {
  web?: FirebaseAppCheckTypes.ReactNativeFirebaseAppCheckProviderWebOptions;
  android?: FirebaseAppCheckTypes.ReactNativeFirebaseAppCheckProviderAndroidOptions;
  apple?: FirebaseAppCheckTypes.ReactNativeFirebaseAppCheckProviderAppleOptions;
  isTokenAutoRefreshEnabled?: boolean;
}

export default class ReactNativeFirebaseAppCheckProvider {
  providerOptions?: ProviderOptions;

  constructor() {}

  configure(options: ProviderOptions): void {
    this.providerOptions = options;
  }
}

import type {
  AppCheckProvider,
  AppCheckToken,
  CustomProviderOptions,
  ReactNativeFirebaseAppCheckProviderOptionsMap as ProviderOptions,
} from './types/appcheck';
import { isFunction, isObject } from '@react-native-firebase/app/dist/module/common';

/**
 * @public Use this to configure providers for android, iOS and "other" platforms.
 */
export class ReactNativeFirebaseAppCheckProvider implements AppCheckProvider {
  providerOptions?: ProviderOptions;

  constructor(options?: ProviderOptions) {
    this.providerOptions = options;
  }

  configure(options: ProviderOptions): void {
    this.providerOptions = options;
  }

  async getToken(): Promise<AppCheckToken> {
    // This is a placeholder - the actual implementation is handled by the native modules
    // This method exists to satisfy the AppCheckProvider interface
    throw new Error('getToken() must be called after configure() and is handled by native modules');
  }
}

/**
 * @public Use this to configure a Custom Provider on "other" platform. This will not work on iOS and android.
 */
export class CustomProvider implements AppCheckProvider {
  private _customProviderOptions: CustomProviderOptions;

  constructor(_customProviderOptions: CustomProviderOptions) {
    if (!isObject(_customProviderOptions)) {
      throw new Error('Invalid configuration: no provider options defined.');
    }
    if (!isFunction(_customProviderOptions.getToken)) {
      throw new Error('Invalid configuration: no getToken function defined.');
    }
    this._customProviderOptions = _customProviderOptions;
  }

  async getToken() {
    return this._customProviderOptions.getToken();
  }
}

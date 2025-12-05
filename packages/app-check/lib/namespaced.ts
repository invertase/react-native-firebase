/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
  isBoolean,
  isIOS,
  isString,
  isObject,
  isFunction,
  isUndefined,
  isOther,
  parseListenerOrObserver,
} from '@react-native-firebase/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import { Platform } from 'react-native';
import ReactNativeFirebaseAppCheckProvider from './ReactNativeFirebaseAppCheckProvider';
import { setReactNativeModule } from '@react-native-firebase/app/lib/internal/nativeModule';
import fallBackModule from './web/RNFBAppCheckModule';
import type {
  AppCheckProvider,
  CustomProviderOptions,
  AppCheckOptions,
  AppCheckTokenResult,
  AppCheckListenerResult,
  PartialObserver,
  Statics,
} from './types/appcheck';

import { version } from './version';

const namespace = 'appCheck';

const nativeModuleName = 'RNFBAppCheckModule';

export class CustomProvider implements AppCheckProvider {
  _customProviderOptions: CustomProviderOptions;

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

const statics: Statics = {};

export interface FirebaseAppCheckModule extends FirebaseModule {
  getIsTokenRefreshEnabledDefault(): boolean | undefined;
  newReactNativeFirebaseAppCheckProvider(): ReactNativeFirebaseAppCheckProvider;
  initializeAppCheck(options: AppCheckOptions, ...args: any[]): Promise<void>;
  activate(
    siteKeyOrProvider: string | AppCheckProvider,
    isTokenAutoRefreshEnabled?: boolean,
  ): Promise<void>;
  setTokenAutoRefreshEnabled(isTokenAutoRefreshEnabled: boolean, ...args: any[]): void;
  getToken(forceRefresh?: boolean, ...args: any[]): Promise<AppCheckTokenResult>;
  getLimitedUseToken(...args: any[]): Promise<AppCheckTokenResult>;
  onTokenChanged(observer: PartialObserver<AppCheckListenerResult>, ...args: any[]): () => void;
  onTokenChanged(
    onNext: (tokenResult: AppCheckListenerResult) => void,
    onError?: (error: Error) => void,
    onCompletion?: () => void,
    ...args: any[]
  ): () => void;
}

class FirebaseAppCheckModuleImpl extends FirebaseModule implements FirebaseAppCheckModule {
  _listenerCount: number;

  constructor(...args: any[]) {
    super(...args);

    this.emitter.addListener(this.eventNameForApp('appCheck_token_changed'), (event: any) => {
      this.emitter.emit(this.eventNameForApp('onAppCheckTokenChanged'), event);
    });

    this._listenerCount = 0;
  }

  getIsTokenRefreshEnabledDefault(): boolean | undefined {
    // no default to start
    let isTokenAutoRefreshEnabled: boolean | undefined = undefined;

    return isTokenAutoRefreshEnabled;
  }

  newReactNativeFirebaseAppCheckProvider(): ReactNativeFirebaseAppCheckProvider {
    return new ReactNativeFirebaseAppCheckProvider();
  }

  initializeAppCheck(options: AppCheckOptions): Promise<void> {
    if (isOther) {
      if (!isObject(options)) {
        throw new Error('Invalid configuration: no options defined.');
      }
      if (isUndefined(options.provider)) {
        throw new Error('Invalid configuration: no provider defined.');
      }
      return this.native.initializeAppCheck(options);
    }
    // determine token refresh setting, if not specified
    if (!isBoolean(options.isTokenAutoRefreshEnabled)) {
      options.isTokenAutoRefreshEnabled = this.firebaseJson.app_check_token_auto_refresh;
    }

    // If that was not defined, attempt to use app-wide data collection setting per docs:
    if (!isBoolean(options.isTokenAutoRefreshEnabled)) {
      options.isTokenAutoRefreshEnabled = this.firebaseJson.app_data_collection_default_enabled;
    }

    // If that also was not defined, the default is documented as true.
    if (!isBoolean(options.isTokenAutoRefreshEnabled)) {
      options.isTokenAutoRefreshEnabled = true;
    }
    this.native.setTokenAutoRefreshEnabled(options.isTokenAutoRefreshEnabled);

    if (options.provider === undefined || (options.provider as any).providerOptions === undefined) {
      throw new Error('Invalid configuration: no provider or no provider options defined.');
    }
    if (Platform.OS === 'android') {
      const providerOptions = (options.provider as any).providerOptions;
      if (!isString(providerOptions?.android?.provider)) {
        throw new Error(
          'Invalid configuration: no android provider configured while on android platform.',
        );
      }
      return this.native.configureProvider(
        providerOptions.android.provider,
        providerOptions.android.debugToken,
      );
    }
    if (Platform.OS === 'ios' || Platform.OS === 'macos') {
      const providerOptions = (options.provider as any).providerOptions;
      if (!isString(providerOptions?.apple?.provider)) {
        throw new Error(
          'Invalid configuration: no apple provider configured while on apple platform.',
        );
      }
      return this.native.configureProvider(
        providerOptions.apple.provider,
        providerOptions.apple.debugToken,
      );
    }
    throw new Error('Unsupported platform: ' + Platform.OS);
  }

  activate(
    _siteKeyOrProvider: string | AppCheckProvider,
    isTokenAutoRefreshEnabled?: boolean,
  ): Promise<void> {
    if (isOther) {
      throw new Error('firebase.appCheck().activate(*) is not supported on other platforms');
    }
    if (!isString(_siteKeyOrProvider)) {
      throw new Error('siteKeyOrProvider must be a string value to match firebase-js-sdk API');
    }

    // We wrap our new flexible interface, with compatible defaults
    const rnfbProvider = new ReactNativeFirebaseAppCheckProvider();
    rnfbProvider.configure({
      android: {
        provider: 'playIntegrity',
      },
      apple: {
        provider: 'deviceCheck',
      },
      web: {
        provider: 'reCaptchaV3',
        siteKey: 'none',
      },
    });

    return this.initializeAppCheck({ provider: rnfbProvider, isTokenAutoRefreshEnabled });
  }

  setTokenAutoRefreshEnabled(isTokenAutoRefreshEnabled: boolean): void {
    this.native.setTokenAutoRefreshEnabled(isTokenAutoRefreshEnabled);
  }

  getToken(forceRefresh?: boolean): Promise<AppCheckTokenResult> {
    if (!forceRefresh) {
      return this.native.getToken(false);
    } else {
      return this.native.getToken(true);
    }
  }

  getLimitedUseToken(): Promise<AppCheckTokenResult> {
    return this.native.getLimitedUseToken();
  }

  onTokenChanged(
    onNextOrObserver:
      | PartialObserver<AppCheckListenerResult>
      | ((tokenResult: AppCheckListenerResult) => void),
    _onError?: (error: Error) => void,
    _onCompletion?: () => void,
  ): () => void {
    // iOS does not provide any native listening feature
    if (isIOS) {
      // eslint-disable-next-line no-console
      console.warn('onTokenChanged is not implemented on IOS, only for Android');
      return () => {};
    }
    const nextFn = parseListenerOrObserver(onNextOrObserver);

    const subscription = this.emitter.addListener(
      this.eventNameForApp('onAppCheckTokenChanged'),
      nextFn,
    );
    if (this._listenerCount === 0) this.native.addAppCheckListener();

    this._listenerCount++;
    return () => {
      subscription.remove();
      this._listenerCount--;
      if (this._listenerCount === 0) this.native.removeAppCheckListener();
    };
  }
}

// import { SDK_VERSION } from '@react-native-firebase/app-check';
export const SDK_VERSION = version;

// import appCheck from '@react-native-firebase/app-check';
// appCheck().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: ['appCheck_token_changed'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseAppCheckModuleImpl,
});

// import appCheck, { firebase } from '@react-native-firebase/app-check';
// appCheck().X(...);
// firebase.appCheck().X(...);
export const firebase = getFirebaseRoot();

// Register the interop module for non-native platforms.
setReactNativeModule(nativeModuleName, fallBackModule);

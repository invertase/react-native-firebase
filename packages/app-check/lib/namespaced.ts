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
import type { ModuleConfig } from '@react-native-firebase/app/lib/types/internal';
import { Platform } from 'react-native';
import ReactNativeFirebaseAppCheckProvider from './ReactNativeFirebaseAppCheckProvider';
import { setReactNativeModule } from '@react-native-firebase/app/lib/internal/nativeModule';
import fallBackModule from './web/RNFBAppCheckModule';
import { version } from './version';
import type {
  CustomProviderOptions,
  AppCheckProvider,
  AppCheckTokenResult,
  AppCheckOptions,
  AppCheckListenerResult,
  PartialObserver,
  AppCheckModule,
  AppCheckStatics,
} from './types/appcheck';
import type { ReactNativeFirebase } from '@react-native-firebase/app';

const namespace = 'appCheck';

const nativeModuleName = 'RNFBAppCheckModule';

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

const statics = {
  CustomProvider,
};

class FirebaseAppCheckModule extends FirebaseModule {
  _listenerCount: number;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    customUrlOrRegion?: string | null,
  ) {
    super(app, config, customUrlOrRegion);

    this.emitter.addListener(this.eventNameForApp('appCheck_token_changed'), event => {
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
      const tokenRefresh = this.firebaseJson.app_check_token_auto_refresh;
      if (isBoolean(tokenRefresh)) {
        options.isTokenAutoRefreshEnabled = tokenRefresh;
      }
    }

    // If that was not defined, attempt to use app-wide data collection setting per docs:
    if (!isBoolean(options.isTokenAutoRefreshEnabled)) {
      const dataCollection = this.firebaseJson.app_data_collection_default_enabled;
      if (isBoolean(dataCollection)) {
        options.isTokenAutoRefreshEnabled = dataCollection;
      }
    }

    // If that also was not defined, the default is documented as true.
    if (!isBoolean(options.isTokenAutoRefreshEnabled)) {
      options.isTokenAutoRefreshEnabled = true;
    }
    this.native.setTokenAutoRefreshEnabled(options.isTokenAutoRefreshEnabled);

    if (
      options.provider === undefined ||
      (options.provider as ReactNativeFirebaseAppCheckProvider).providerOptions === undefined
    ) {
      throw new Error('Invalid configuration: no provider or no provider options defined.');
    }
    const provider = options.provider as ReactNativeFirebaseAppCheckProvider;
    if (Platform.OS === 'android') {
      if (!isString(provider.providerOptions?.android?.provider)) {
        throw new Error(
          'Invalid configuration: no android provider configured while on android platform.',
        );
      }
      return this.native.configureProvider(
        provider.providerOptions.android.provider,
        provider.providerOptions.android.debugToken,
      );
    }
    if (Platform.OS === 'ios' || Platform.OS === 'macos') {
      if (!isString(provider.providerOptions?.apple?.provider)) {
        throw new Error(
          'Invalid configuration: no apple provider configured while on apple platform.',
        );
      }
      return this.native.configureProvider(
        provider.providerOptions.apple.provider,
        provider.providerOptions.apple.debugToken,
      );
    }
    throw new Error('Unsupported platform: ' + Platform.OS);
  }

  activate(
    siteKeyOrProvider: string | AppCheckProvider,
    isTokenAutoRefreshEnabled?: boolean,
  ): Promise<void> {
    if (isOther) {
      throw new Error('firebase.appCheck().activate(*) is not supported on other platforms');
    }
    if (!isString(siteKeyOrProvider)) {
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

  // TODO this is an async call
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
    const nextFn = parseListenerOrObserver(
      onNextOrObserver as
        | ((value: AppCheckListenerResult) => void)
        | { next: (value: AppCheckListenerResult) => void },
    );
    // let errorFn = function () { };
    // if (onNextOrObserver.error != null) {
    //   errorFn = onNextOrObserver.error.bind(onNextOrObserver);
    // }
    // else if (onError) {
    //   errorFn = onError;
    // }
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

export const SDK_VERSION = version;

const appCheckNamespace = createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: ['appCheck_token_changed'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseAppCheckModule,
});

type AppCheckNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  AppCheckModule,
  AppCheckStatics
> & {
  appCheck: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<AppCheckModule, AppCheckStatics>;
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

// import appCheck from '@react-native-firebase/app-check';
// appCheck().X(...);
export default appCheckNamespace as unknown as AppCheckNamespace;

// import appCheck, { firebase } from '@react-native-firebase/app-check';
// appCheck().X(...);
// firebase.appCheck().X(...);
export const firebase =
  getFirebaseRoot() as unknown as ReactNativeFirebase.FirebaseNamespacedExport<
    'appCheck',
    AppCheckModule,
    AppCheckStatics,
    false
  >;

// Register the interop module for non-native platforms.
setReactNativeModule(nativeModuleName, fallBackModule);

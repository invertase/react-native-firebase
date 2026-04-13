/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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

import { ReactNativeFirebase } from '@react-native-firebase/app';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace FirebaseRemoteConfigTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  /**
   * @deprecated Use modular log-level types instead.
   */
  export type RemoteConfigLogLevel = 'debug' | 'error' | 'silent';

  /**
   * @deprecated Use modular constants instead.
   */
  export interface LastFetchStatus {
    SUCCESS: 'success';
    FAILURE: 'failure';
    THROTTLED: 'throttled';
    NO_FETCH_YET: 'no_fetch_yet';
  }

  /**
   * @deprecated Use modular constants instead.
   */
  export interface ValueSource {
    REMOTE: 'remote';
    DEFAULT: 'default';
    STATIC: 'static';
  }

  /**
   * @deprecated Namespaced statics remain for backwards compatibility.
   */
  export interface Statics {
    ValueSource: ValueSource;
    LastFetchStatus: LastFetchStatus;
    SDK_VERSION: string;
  }

  /**
   * @deprecated Use modular `Value` access patterns instead.
   */
  export interface ConfigValue {
    getSource(): 'remote' | 'default' | 'static';
    asBoolean(): true | false;
    asNumber(): number;
    asString(): string;
  }

  /**
   * @deprecated Use modular APIs instead.
   */
  export interface ConfigValues {
    [key: string]: ConfigValue;
  }

  /**
   * @deprecated Use modular APIs instead.
   */
  export interface ConfigSettings {
    minimumFetchIntervalMillis?: number;
    fetchTimeMillis?: number;
  }

  /**
   * @deprecated Use modular APIs instead.
   */
  export interface ConfigDefaults {
    [key: string]: number | string | boolean;
  }

  export type LastFetchStatusType = 'success' | 'failure' | 'no_fetch_yet' | 'throttled';

  export interface ConfigUpdate {
    getUpdatedKeys(): Set<string>;
  }

  export interface ConfigUpdateObserver {
    next: (configUpdate: ConfigUpdate) => void;
    error: (error: ReactNativeFirebase.NativeFirebaseError) => void;
    complete: () => void;
  }

  export type Unsubscribe = () => void;

  /**
   * @deprecated Use the package default export or modular APIs instead.
   */
  export declare class Module extends FirebaseModule {
    app: ReactNativeFirebase.FirebaseApp;
    fetchTimeMillis: number;
    lastFetchStatus: LastFetchStatusType;
    settings: ConfigSettings;
    defaultConfig: ConfigDefaults;
    setConfigSettings(configSettings: ConfigSettings): Promise<void>;
    setDefaults(defaults: ConfigDefaults): Promise<null>;
    setDefaultsFromResource(resourceName: string): Promise<null>;
    onConfigUpdate(remoteConfig: Module, observer: ConfigUpdateObserver): Unsubscribe;
    onConfigUpdated(listener: CallbackOrObserver<OnConfigUpdatedListenerCallback>): () => void;
    activate(): Promise<boolean>;
    ensureInitialized(): Promise<void>;
    fetch(expirationDurationSeconds?: number): Promise<void>;
    fetchAndActivate(): Promise<boolean>;
    getAll(): ConfigValues;
    getValue(key: string): ConfigValue;
    getBoolean(key: string): boolean;
    getString(key: string): string;
    getNumber(key: string): number;
    reset(): Promise<void>;
  }

  export type CallbackOrObserver<T extends (...args: any[]) => any> = T | { next: T };

  export type OnConfigUpdatedListenerCallback = (
    event?: { updatedKeys: string[] },
    error?: {
      code: string;
      message: string;
      nativeErrorMessage: string;
    },
  ) => void;
}

declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;

    interface Module {
      /**
       * @deprecated Use the package default export or modular APIs instead.
       */
      remoteConfig: FirebaseModuleWithStatics<
        FirebaseRemoteConfigTypes.Module,
        FirebaseRemoteConfigTypes.Statics
      >;
    }

    interface FirebaseApp {
      /**
       * @deprecated Use the package default export or modular APIs instead.
       */
      remoteConfig(): FirebaseRemoteConfigTypes.Module;
    }
  }
}

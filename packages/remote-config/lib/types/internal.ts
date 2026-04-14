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

import type {
  ConfigUpdateObserver,
  FetchStatus,
  RemoteConfig,
  RemoteConfigSettings,
  Unsubscribe,
  Value,
  ValueSource,
} from './remote-config';
import type { FirebaseRemoteConfigTypes } from './namespaced';

export type ConfigValueSourceInternal = ValueSource;

export type LastFetchStatusInternal = FetchStatus;

export type RemoteConfigModularDeprecationArg = string;

export type WithRemoteConfigDeprecationArg<F> = F extends (...args: infer P) => infer R
  ? (...args: [...P, RemoteConfigModularDeprecationArg?]) => R
  : never;

export interface AppWithRemoteConfigInternal {
  remoteConfig(deprecationArg?: RemoteConfigModularDeprecationArg): RemoteConfig;
}

export interface ConfigSettingsStateInternal {
  fetchTimeoutMillis: number;
  minimumFetchIntervalMillis: number;
}

export interface StoredConfigValueInternal {
  value: string | number | boolean;
  source: ConfigValueSourceInternal;
}

export interface NativeRemoteConfigConstants {
  fetchTimeout?: number;
  minimumFetchInterval?: number;
  lastFetchTime?: number;
  lastFetchStatus?: LastFetchStatusInternal;
  values?: Record<string, StoredConfigValueInternal>;
}

export interface NativeRemoteConfigResult<T> {
  result: T;
  constants: NativeRemoteConfigConstants;
}

export interface RemoteConfigUpdateErrorInternal {
  code?: string;
  message?: string;
  nativeErrorMessage?: string;
}

export interface RemoteConfigUpdateSuccessEventInternal {
  resultType: 'success';
  updatedKeys: string[];
}

export interface RemoteConfigUpdateErrorEventInternal extends RemoteConfigUpdateErrorInternal {
  resultType?: string;
}

export interface RNFBConfigModule {
  activate(): Promise<NativeRemoteConfigResult<boolean>>;
  setConfigSettings(settings: {
    fetchTimeout: number;
    minimumFetchInterval: number;
  }): Promise<NativeRemoteConfigResult<void>>;
  fetch(expirationDurationSeconds: number): Promise<NativeRemoteConfigResult<void>>;
  fetchAndActivate(): Promise<NativeRemoteConfigResult<boolean>>;
  ensureInitialized(): Promise<NativeRemoteConfigResult<void>>;
  setDefaults(
    defaults: Record<string, string | number | boolean>,
  ): Promise<NativeRemoteConfigResult<null>>;
  setDefaultsFromResource(resourceName: string): Promise<NativeRemoteConfigResult<null>>;
  reset(): Promise<NativeRemoteConfigResult<void>>;
  onConfigUpdated(): void;
  removeConfigUpdateRegistration(): void;
  setCustomSignals(
    customSignals: Record<string, string | number | null>,
  ): Promise<NativeRemoteConfigResult<void>>;
}

export interface RemoteConfigInternal extends RemoteConfig {
  settings: RemoteConfigSettings & {
    fetchTimeMillis: number;
  };
  defaultConfig: {
    [key: string]: string | number | boolean;
  };
  activate(deprecationArg?: RemoteConfigModularDeprecationArg): Promise<boolean>;
  ensureInitialized(deprecationArg?: RemoteConfigModularDeprecationArg): Promise<void>;
  fetchAndActivate(deprecationArg?: RemoteConfigModularDeprecationArg): Promise<boolean>;
  fetch(
    expirationDurationSeconds?: number,
    deprecationArg?: RemoteConfigModularDeprecationArg,
  ): Promise<void>;
  getAll(deprecationArg?: RemoteConfigModularDeprecationArg): Record<string, Value>;
  getBoolean(key: string, deprecationArg?: RemoteConfigModularDeprecationArg): boolean;
  getNumber(key: string, deprecationArg?: RemoteConfigModularDeprecationArg): number;
  getString(key: string, deprecationArg?: RemoteConfigModularDeprecationArg): string;
  getValue(key: string, deprecationArg?: RemoteConfigModularDeprecationArg): Value;
  reset(deprecationArg?: RemoteConfigModularDeprecationArg): Promise<void>;
  setConfigSettings(
    settings:
      | RemoteConfigSettings
      | {
          minimumFetchIntervalMillis?: number;
          fetchTimeMillis?: number;
          fetchTimeoutMillis?: number;
        },
    deprecationArg?: RemoteConfigModularDeprecationArg,
  ): Promise<void>;
  setDefaults(
    defaults: {
      [key: string]: string | number | boolean;
    },
    deprecationArg?: RemoteConfigModularDeprecationArg,
  ): Promise<null>;
  setDefaultsFromResource(
    resourceName: string,
    deprecationArg?: RemoteConfigModularDeprecationArg,
  ): Promise<null>;
  onConfigUpdate(
    observer: ConfigUpdateObserver,
    deprecationArg?: RemoteConfigModularDeprecationArg,
  ): Unsubscribe;
  onConfigUpdated(
    listenerOrObserver: FirebaseRemoteConfigTypes.CallbackOrObserver<FirebaseRemoteConfigTypes.OnConfigUpdatedListenerCallback>,
    deprecationArg?: RemoteConfigModularDeprecationArg,
  ): Unsubscribe;
  readonly native: RNFBConfigModule;
  _promiseWithConstants(
    promise: Promise<NativeRemoteConfigResult<void>>,
    deprecationArg?: RemoteConfigModularDeprecationArg,
  ): Promise<void>;
  _promiseWithConstants<T>(
    promise: Promise<NativeRemoteConfigResult<T>>,
    deprecationArg?: RemoteConfigModularDeprecationArg,
  ): Promise<T>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBConfigModule: RNFBConfigModule;
  }
}

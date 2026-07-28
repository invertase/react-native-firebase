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

import type {
  ConfigUpdateObserver,
  FetchStatus,
  RemoteConfig,
  RemoteConfigSettings,
  Unsubscribe,
  Value,
  ValueSource,
} from './remote-config';

export type ConfigValueSourceInternal = ValueSource;

export type LastFetchStatusInternal = FetchStatus;

export type OnConfigUpdatedListenerCallback = (
  event?: { updatedKeys: string[] },
  error?: RemoteConfigUpdateErrorInternal,
) => void;

export type CallbackOrObserver<T extends (...args: any[]) => any> = T | { next: T };

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
  getConstants(): NativeRemoteConfigConstants;
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
  activate(): Promise<boolean>;
  ensureInitialized(): Promise<void>;
  fetchAndActivate(): Promise<boolean>;
  fetch(expirationDurationSeconds?: number): Promise<void>;
  getAll(): Record<string, Value>;
  getBoolean(key: string): boolean;
  getNumber(key: string): number;
  getString(key: string): string;
  getValue(key: string): Value;
  reset(): Promise<void>;
  setConfigSettings(
    settings:
      | RemoteConfigSettings
      | {
          minimumFetchIntervalMillis?: number;
          fetchTimeMillis?: number;
          fetchTimeoutMillis?: number;
        },
    fromSettingsSetter?: boolean,
  ): Promise<void>;
  setDefaults(
    defaults: {
      [key: string]: string | number | boolean;
    },
    fromDefaultConfigSetter?: boolean,
  ): Promise<null>;
  setDefaultsFromResource(resourceName: string): Promise<null>;
  onConfigUpdate(observer: ConfigUpdateObserver): Unsubscribe;
  onConfigUpdated(
    listenerOrObserver: CallbackOrObserver<OnConfigUpdatedListenerCallback>,
  ): Unsubscribe;
  readonly native: RNFBConfigModule;
  _promiseWithConstants(promise: Promise<NativeRemoteConfigResult<void>>): Promise<void>;
  _promiseWithConstants<T>(promise: Promise<NativeRemoteConfigResult<T>>): Promise<T>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    NativeRNFBTurboConfig: RNFBConfigModule;
  }
}

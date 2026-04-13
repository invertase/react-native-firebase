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

export type ConfigValueSourceInternal = 'remote' | 'default' | 'static';

export type LastFetchStatusTypeInternal = 'success' | 'failure' | 'no_fetch_yet' | 'throttled';

export interface ConfigSettingsStateInternal {
  fetchTimeMillis: number;
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
  lastFetchStatus?: LastFetchStatusTypeInternal;
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

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBConfigModule: RNFBConfigModule;
  }
}

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

import type { ReactNativeFirebase } from '@react-native-firebase/app';

export type RemoteConfigLogLevel = 'debug' | 'error' | 'silent';

export interface LastFetchStatus {
  SUCCESS: 'success';
  FAILURE: 'failure';
  THROTTLED: 'throttled';
  NO_FETCH_YET: 'no_fetch_yet';
}

export interface ValueSource {
  REMOTE: 'remote';
  DEFAULT: 'default';
  STATIC: 'static';
}

export interface ConfigValue {
  getSource(): 'remote' | 'default' | 'static';
  asBoolean(): true | false;
  asNumber(): number;
  asString(): string;
}

export interface ConfigValues {
  [key: string]: ConfigValue;
}

export interface ConfigSettings {
  minimumFetchIntervalMillis?: number;
  fetchTimeMillis?: number;
}

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

export interface CustomSignals {
  [key: string]: string | number | null;
}

export interface RemoteConfig extends ReactNativeFirebase.FirebaseModule {
  app: ReactNativeFirebase.FirebaseApp;
  fetchTimeMillis: number;
  lastFetchStatus: LastFetchStatusType;
  settings: ConfigSettings;
  defaultConfig: ConfigDefaults;
  setConfigSettings(configSettings: ConfigSettings): Promise<void>;
  setDefaults(defaults: ConfigDefaults): Promise<null>;
  setDefaultsFromResource(resourceName: string): Promise<null>;
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

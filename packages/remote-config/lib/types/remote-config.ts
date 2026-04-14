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

import type { FirebaseApp } from '@firebase/app';
import type { ReactNativeFirebase } from '@react-native-firebase/app';

export type LogLevel = 'debug' | 'error' | 'silent';

export type FetchStatus = 'success' | 'failure' | 'no_fetch_yet' | 'throttled';

export type ValueSource = 'static' | 'default' | 'remote';

export interface Value {
  getSource(): ValueSource;
  asBoolean(): boolean;
  asNumber(): number;
  asString(): string;
}

export interface RemoteConfigSettings {
  minimumFetchIntervalMillis: number;
  fetchTimeoutMillis: number;
}

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

export interface RemoteConfig {
  app: FirebaseApp;
  fetchTimeMillis: number;
  lastFetchStatus: FetchStatus;
  settings: RemoteConfigSettings;
  defaultConfig: {
    [key: string]: string | number | boolean;
  };
}

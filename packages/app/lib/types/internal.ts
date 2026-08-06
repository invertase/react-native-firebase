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

/**
 * Internal types for React Native Firebase
 * These types are used internally across multiple files and should not be exported to consumers
 */

/**
 * Firebase JSON configuration from firebase.json file
 * Structure: { "react-native": { [key: string]: boolean | string }, ... }
 */
export type FirebaseJsonConfig = Record<string, unknown>;

/**
 * Configuration for a Firebase module instance.
 */
export interface ModuleConfig {
  namespace: string;
  nativeModuleName?: string | string[];
  hasMultiAppSupport?: boolean;
  hasCustomUrlOrRegionSupport?: boolean;
  nativeEvents?: boolean | string[];
  disablePrependCustomUrlOrRegion?: boolean;
  turboModule?: boolean;
}

/**
 * Native error types
 */
export interface NativeErrorUserInfo {
  code?: string;
  message?: string;
  nativeErrorCode?: string | number;
  nativeErrorMessage?: string;
  [key: string]: any;
}

export interface NativeError {
  userInfo?: NativeErrorUserInfo;
  message?: string;
  customData?: any;
  operationType?: string;
}

/**
 * AsyncStorage interface compatible with React Native AsyncStorage
 * Internal version used by the library
 */
export interface AsyncStorageStatic {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
}

/**
 * Common utility types
 */
export interface DataUrlParts {
  base64String: string | undefined;
  mediaType: string | undefined;
}

export interface Observer<T> {
  next: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface SerializedValue {
  type: string;
  value: any;
}

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: ((value: T) => void) | null;
  reject: ((reason?: any) => void) | null;
}

export type Callback<T> =
  | ((error: Error | null, result?: T) => void)
  | ((error: Error | null) => void);

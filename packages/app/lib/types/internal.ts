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

import type { ReactNativeFirebase, Utils } from './app';

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
 * Configuration for module namespace registration
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
 * Extended configuration for namespace registration including native module details
 */
export interface NamespaceConfig extends ModuleConfig {
  nativeModuleName: string | string[];
  nativeEvents: boolean | string[];
  // ModuleClass can be FirebaseModule or any subclass of it
  // Uses FirebaseAppBase (the concrete class type) rather than FirebaseApp (the augmented interface)
  ModuleClass: new (
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    customUrlOrRegion?: string | null,
  ) => ReactNativeFirebase.FirebaseModule;
  statics?: object;
  version?: string;
}

/**
 * Type for a Firebase module getter function that can optionally accept
 * a custom URL/region/databaseId parameter
 */
export type ModuleGetter = {
  (customUrlOrRegionOrDatabaseId?: string): ReactNativeFirebase.FirebaseModule;
  [key: string]: unknown;
};

/**
 * Type for Firebase root object with module getters
 */
export interface FirebaseRoot {
  initializeApp: (
    options: ReactNativeFirebase.FirebaseAppOptions,
    configOrName?: string | ReactNativeFirebase.FirebaseAppConfig,
  ) => Promise<ReactNativeFirebase.FirebaseApp>;
  setReactNativeAsyncStorage: (asyncStorage: ReactNativeFirebase.ReactNativeAsyncStorage) => void;
  app: (name?: string) => ReactNativeFirebase.FirebaseApp;
  apps: ReactNativeFirebase.FirebaseApp[];
  SDK_VERSION: string;
  setLogLevel: (logLevel: ReactNativeFirebase.LogLevelString) => void;
  utils: Utils.Statics & (() => Utils.Module);
  [key: string]: unknown;
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

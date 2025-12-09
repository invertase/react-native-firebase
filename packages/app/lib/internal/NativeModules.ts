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

import type { ReactNativeFirebase } from '../types/app';

/**
 * Base type for all React Native Firebase native modules.
 * Each package can extend this interface via module augmentation to add their own native methods.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ReactNativeFirebaseNativeModules {
  // Base interface - packages will augment this
}

/**
 * Interface for wrapped native modules returned by getAppModule() and getNativeModule()
 * This represents the native module after wrapping with error handling
 */
export interface WrappedNativeModule {
  [key: string]: unknown;
}

/**
 * App Module native methods that are always available
 */
export interface RNFBAppModuleInterface {
  // Constants
  NATIVE_FIREBASE_APPS: Array<{
    appConfig: ReactNativeFirebase.FirebaseAppConfig;
    options: ReactNativeFirebase.FirebaseAppOptions;
  }>;
  FIREBASE_RAW_JSON: string;

  // Methods
  initializeApp(
    options: ReactNativeFirebase.FirebaseAppOptions,
    appConfig: ReactNativeFirebase.FirebaseAppConfig,
  ): Promise<void>;
  deleteApp(name: string): Promise<void>;
  setLogLevel(logLevel: string): void;
  metaGetAll(): Promise<{ [key: string]: string | boolean }>;
  jsonGetAll(): Promise<{ [key: string]: string | boolean }>;
  preferencesClearAll(): Promise<void>;
  preferencesGetAll(): Promise<{ [key: string]: string | boolean }>;
  preferencesSetBool(key: string, value: boolean): Promise<void>;
  preferencesSetString(key: string, value: string): Promise<void>;
  setAutomaticDataCollectionEnabled(name: string, enabled: boolean): void;

  // Event emitter methods
  eventsNotifyReady(ready: boolean): void;
  eventsAddListener(eventType: string): void;
  eventsRemoveListener(eventType: string, removeAll: boolean): void;

  // React Native EventEmitter compatibility
  addListener?: (eventName: string) => void;
  removeListeners?: (count: number) => void;
}

/**
 * Utils Module native methods (from the app package)
 */
export interface RNFBUtilsModuleInterface {
  // Android-only properties and methods
  isRunningInTestLab: boolean;
  androidPlayServices: {
    isAvailable: boolean;
    status: number;
    hasResolution: boolean;
    isUserResolvableError: boolean;
    error: string | undefined;
  };
  androidGetPlayServicesStatus(): Promise<{
    isAvailable: boolean;
    status: number;
    hasResolution: boolean;
    isUserResolvableError: boolean;
    error: string | undefined;
  }>;
  androidPromptForPlayServices(): Promise<void>;
  androidMakePlayServicesAvailable(): Promise<void>;
  androidResolutionForPlayServices(): Promise<void>;
}

// Augment the base interface with app package's native modules
declare module './NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBUtilsModule: RNFBUtilsModuleInterface;
    RNFBAppModule: RNFBAppModuleInterface;
  }
}

/**
 * Helper type to get a specific native module type by name
 */
export type GetNativeModule<T extends keyof ReactNativeFirebaseNativeModules> =
  ReactNativeFirebaseNativeModules[T];

/**
 * Union type of all available native module types
 */
export type AnyNativeModule =
  ReactNativeFirebaseNativeModules[keyof ReactNativeFirebaseNativeModules];

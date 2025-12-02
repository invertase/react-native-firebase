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
 * Base type for all React Native Firebase native modules.
 * Each package can extend this interface via module augmentation to add their own native methods.
 */
export interface ReactNativeFirebaseNativeModules {
  // Base interface - packages will augment this
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

/**
 * Core app module native methods
 */
export interface RNFBAppModuleInterface {
  FIREBASE_RAW_JSON: string;
  // Add other app module methods here as needed
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

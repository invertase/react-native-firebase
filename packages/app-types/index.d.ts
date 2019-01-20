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

export interface NativeFirebaseError extends Error {
  /**
   * Firebase error code, e.g. `auth/invalid-email`
   */
  readonly code: string;

  /**
   * Firebase error message
   */
  readonly message: string;

  /**
   * The firebase module namespace that this error originated from, e.g. 'analytics'
   */
  readonly namespace: string;

  /**
   * The native sdks returned error code, different per platform
   */
  readonly nativeErrorCode: string | number;

  /**
   * The native sdks returned error message, different per platform
   */
  readonly nativeErrorMessage: string;
}

export type ReactNativeFirebaseModuleAndStatics<M, S = {}> = {
  (): M;

  /**
   * This React Native Firebase module version.
   */
  readonly SDK_VERSION: string;
} & S;

export type FirebaseOptions = {
  appId: string;
  apiKey?: string;
  authDomain?: string;
  databaseURL: string;
  projectId: string;
  gaTrackingId?: string;
  storageBucket: string;
  messagingSenderId: string;

  /**
   * iOS only
   */
  clientId?: string;

  /**
   * iOS only
   */
  androidClientId?: string;

  /**
   * iOS only
   */
  deepLinkURLScheme?: string;
  [name: string]: any;
};

export interface FirebaseAppConfig {
  /**
   * The Firebase App name, defaults to [DEFAULT] if none provided.
   */
  name?: string;

  /**
   *
   */
  automaticDataCollectionEnabled?: boolean;

  /**
   * If set to true it indicates that Firebase should close database connections
   * automatically when the app is in the background. Disabled by default.
   */
  automaticResourceManagement?: boolean;
}

export interface FirebaseApp {
  /**
   * The name (identifier) for this App. '[DEFAULT]' is the default App.
   */
  readonly name: string;

  /**
   * The (read-only) configuration options from the app initialization.
   */
  readonly options: FirebaseOptions;

  /**
   * Make this app unusable and free up resources.
   */
  delete(): Promise<void>;
}

export interface ReactNativeFirebaseNamespace {
  /**
   * Create (and initialize) a FirebaseApp.
   *
   * @param options Options to configure the services used in the App.
   * @param config The optional config for your firebase app
   */
  initializeApp(options: FirebaseOptions, config?: FirebaseAppConfig): FirebaseApp;

  /**
   * Create (and initialize) a FirebaseApp.
   *
   * @param options Options to configure the services used in the App.
   * @param name The optional name of the app to initialize ('[DEFAULT]' if
   * omitted)
   */
  initializeApp(options: FirebaseOptions, name?: string): FirebaseApp;

  /**
   * Retrieve an instance of a FirebaseApp.
   *
   * @example
   * ```js
   * const app = firebase.app('foo');
   * ```
   *
   * @param name The optional name of the app to return ('[DEFAULT]' if omitted)
   */
  app(name?: string): FirebaseApp;

  /**
   * A (read-only) array of all the initialized Apps.
   */
  apps: FirebaseApp[];

  /**
   * The current React Native Firebase version.
   */
  readonly SDK_VERSION: string;
}

export interface ReactNativeFirebaseModule {
  app: FirebaseApp;
}

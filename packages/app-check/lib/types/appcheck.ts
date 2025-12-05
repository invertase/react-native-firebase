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
 * An App Check provider. This can be either the built-in reCAPTCHA provider
 * or a custom provider. For more on custom providers, see
 * https://firebase.google.com/docs/app-check/web-custom-provider
 */
export interface AppCheckProvider {
  /**
   * Returns an AppCheck token.
   */
  getToken(): Promise<AppCheckToken>;
}

/**
 * Custom provider options.
 */
export interface CustomProviderOptions {
  /**
   * Function to get an App Check token through a custom provider
   * service.
   */
  getToken: () => Promise<AppCheckToken>;
}

/**
 * Options for App Check initialization.
 */
export interface AppCheckOptions {
  /**
   * The App Check provider to use. This can be either the built-in reCAPTCHA provider
   * or a custom provider.
   */
  provider: AppCheckProvider;

  /**
   * If true, enables SDK to automatically
   * refresh AppCheck token as needed. If undefined, the value will default
   * to the value of `app.automaticDataCollectionEnabled`. That property
   * defaults to false and can be set in the app config.
   */
  isTokenAutoRefreshEnabled?: boolean;
}

/**
 * The token returned from an `AppCheckProvider`.
 */
export interface AppCheckToken {
  /**
   * The token string in JWT format.
   */
  readonly token: string;
  /**
   * The local timestamp after which the token will expire.
   */
  readonly expireTimeMillis: number;
}

/**
 * Result returned by `getToken()`.
 */
export interface AppCheckTokenResult {
  /**
   * The token string in JWT format.
   */
  readonly token: string;
}

/**
 * The result return from `onTokenChanged`
 */
export type AppCheckListenerResult = AppCheckToken & { readonly appName: string };

export type NextFn<T> = (value: T) => void;
export type ErrorFn = (error: Error) => void;
export type CompleteFn = () => void;

export interface Observer<T> {
  next: NextFn<T>;
  error: ErrorFn;
  complete: CompleteFn;
}

export type PartialObserver<T> = Partial<Observer<T>>;
export type Unsubscribe = () => void;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Statics {
  // firebase.appCheck.* static props go here
}

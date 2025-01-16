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
import { FirebaseApp } from '@firebase/app';

export interface ApiSettings {
  apiKey: string;
  project: string;
  location: string;
  getAuthToken?: () => Promise<string>;
  getAppCheckToken?: () => Promise<AppCheckTokenResult>;
}

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface _FirebaseService {
  app: FirebaseApp;
  /**
   * Delete the service and free it's resources - called from
   * {@link @firebase/app#deleteApp | deleteApp()}
   */
  _delete(): Promise<void>;
}

export interface InternalAppCheck {
  /**
   * Requests Firebase App Check token.
   * This method should only be used if you need to authorize requests to a non-Firebase backend.
   * Requests to Firebase backend are authorized automatically if configured.
   *
   * @param forceRefresh - If true, a new Firebase App Check token is requested and the token cache is ignored.
   * If false, the cached token is used if it exists and has not expired yet.
   * In most cases, false should be used. True should only be used if the server explicitly returns an error, indicating a revoked token.
   */
  getToken(forceRefresh?: boolean): Promise<AppCheckTokenResult>;
}

interface AppCheckTokenResult {
  /**
   * The token string in JWT format.
   */
  readonly token: string;
}

export interface InternalAuth {
  /**
   * Returns the currently signed-in user (or null if no user signed in). See the User interface documentation for detailed usage.
   *
   * #### Example
   *
   * ```js
   * const user = firebase.auth().currentUser;
   * ```
   *
   * > It is recommended to use {@link auth#onAuthStateChanged} to track whether the user is currently signed in.
   */
  currentUser: User | null;
}

export interface User {
  /**
   * Returns the users authentication token.
   *
   * #### Example
   *
   * ```js
   * // Force a token refresh
   * const idToken = await firebase.auth().currentUser.getIdToken(true);
   * ```
   *
   * @param forceRefresh A boolean value which forces Firebase to refresh the token.
   */
  getIdToken(forceRefresh?: boolean): Promise<string>;
}

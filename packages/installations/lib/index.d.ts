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

import { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Firebase Installations package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `installations` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/installations';
 *
 * // firebase.installations().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `installations` package:
 *
 * ```js
 * import installations from '@react-native-firebase/installations';
 *
 * // installations().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/installations';
 *
 * // firebase.installations().X
 * ```
 *
 * @firebase installations
 */
export namespace FirebaseInstallationsTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Statics {
    // firebase.installations.* static props go here
  }

  /**
   * The Firebase Installations service is available for the default app or a given app.
   *
   * #### Example 1
   *
   * Get the installations instance for the **default app**:
   *
   * ```js
   * const installationsForDefaultApp = firebase.installations();
   * ```
   *
   * #### Example 2
   *
   * Get the installations instance for a **secondary app**:
   *˚
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const installationsForOtherApp = firebase.installations(otherApp);
   * ```
   *
   */
  export class Module extends FirebaseModule {
    /**
     * Creates a Firebase Installation if there isn't one for the app and
     * returns the Installation ID. The installation ID is a globally unique,
     * stable, URL-safe base64 string identifier that uniquely identifies the app instance.
     * NOTE: If the application already has an existing FirebaseInstanceID then the InstanceID identifier will be used.
     *
     * @return Firebase Installation ID, this is a url-safe base64 string of a 128-bit integer.
     */
    getId(): Promise<string>;

    /**
     * Retrieves (locally or from the server depending on forceRefresh value) a valid installation auth token.
     * An existing token may be invalidated or expire, so it is recommended to fetch the installation auth token
     * before any request to external servers (it will be refreshed automatically for firebase API calls).
     * This method should be used with forceRefresh == YES when e.g. a request with the previously fetched
     * installation auth token failed with “Not Authorized” error.
     *
     * @param forceRefresh Options to get an auth token either by force refreshing or not.
     * @return Firebase Installation Authentication Token
     */
    getToken(forceRefresh?: boolean): Promise<string>;

    /**
     * Deletes the Firebase Installation and all associated data from the Firebase backend.
     * This call may cause Firebase Cloud Messaging, Firebase Remote Config, Firebase Predictions,
     * or Firebase In-App Messaging to not function properly. Fetching a new installations ID should
     * reset all of the dependent services to a stable state again. A network connection is required
     * for the method to succeed. If it fails, the existing installation data remains untouched.
     */
    delete(): Promise<void>;

    /**
     * TODO implement id change listener for android.
     *
     * Sets a new callback that will get called when Installlation ID changes.
     * Returns an unsubscribe function that will remove the callback when called.
     * Only the Android SDK supports sending ID change events.
     *
     * @android
     */
    // onIdChange(callback: (installationId: string) => void): () => void;
  }
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseInstallationsTypes.Module,
  FirebaseInstallationsTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  installations: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { installations(): FirebaseInstallationsTypes.Module };
};

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      installations: FirebaseModuleWithStaticsAndApp<
        FirebaseInstallationsTypes.Module,
        FirebaseInstallationsTypes.Statics
      >;
    }
    interface FirebaseApp {
      installations(): FirebaseInstallationsTypes.Module;
    }
  }
}

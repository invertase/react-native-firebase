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

import type { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Firebase Installations package for React Native.
 *
 * @firebase installations
 */

type FirebaseModule = ReactNativeFirebase.FirebaseModule;

/**
 * @deprecated Use the exported types directly instead.
 * FirebaseInstallationsTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseInstallationsTypes {
  /**
   * Cloud Installations statics.
   *
   * @deprecated Use the exported types directly instead. FirebaseInstallationsTypes namespace is kept for backwards compatibility.
   */
  export interface Statics {
    SDK_VERSION: string;
  }

  /**
   * The Firebase Installations service is available for the default app or a given app.
   *
   * @deprecated Use the modular API (getInstallations, getId, getToken, delete) and types from '@react-native-firebase/installations' instead.
   * FirebaseInstallationsTypes namespace is kept for backwards compatibility.
   *
   * #### Example
   *
   * Get the Installations instance for the **default app**:
   *
   * ```js
   * const defaultInstallations = firebase.installations();
   * ```
   */
  export interface Module extends FirebaseModule {
    /**
     * The current `FirebaseApp` instance for this Firebase service.
     *
     * @deprecated Use the modular API instead.
     */
    app: ReactNativeFirebase.FirebaseApp;

    /**
     * Creates a Firebase Installation if there isn't one for the app and returns the Installation ID.
     *
     * @deprecated Use the modular `getId(installations)` instead.
     */
    getId(): Promise<string>;

    /**
     * Retrieves a valid installation auth token.
     *
     * @deprecated Use the modular `getToken(installations, forceRefresh)` instead.
     */
    getToken(forceRefresh?: boolean): Promise<string>;

    /**
     * Deletes the Firebase Installation and all associated data from the Firebase backend.
     *
     * @deprecated Use the modular `deleteInstallations(installations)` instead.
     */
    delete(): Promise<void>;

    /**
     * Sets a new callback that will get called when Installation ID changes. Returns an unsubscribe function.
     *
     * @deprecated Not supported by React Native Firebase; use modular API for alternatives.
     */
    onIdChange(callback: (installationId: string) => void): () => void;
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

/* eslint-disable @typescript-eslint/no-namespace */
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
/* eslint-enable @typescript-eslint/no-namespace */

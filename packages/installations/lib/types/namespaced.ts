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
/**
 * @deprecated Use the exported types directly instead.
 * FirebaseInstallationsTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseInstallationsTypes {
  export interface Statics {
    SDK_VERSION: string;
  }

  /**
   * The Firebase Installations service is available for the default app or a given app.
   *
   * @deprecated Use the exported types directly instead. FirebaseInstallationsTypes namespace is kept for backwards compatibility.
   */
  export interface Module extends ReactNativeFirebase.FirebaseModule {
    /**
     * The current `FirebaseApp` instance for this Firebase service.
     *
     * @deprecated Use the exported types directly instead.
     */
    app: ReactNativeFirebase.FirebaseApp;

    /**
     * Creates a Firebase Installation if there isn't one for the app and returns the Installation ID.
     *
     * @deprecated Use `getId()` from the modular API instead.
     */
    getId(): Promise<string>;

    /**
     * Retrieves a valid installation auth token.
     *
     * @deprecated Use `getToken()` from the modular API instead.
     */
    getToken(forceRefresh?: boolean): Promise<string>;

    /**
     * Deletes the Firebase Installation and all associated data from the Firebase backend.
     *
     * @deprecated Use `deleteInstallations()` from the modular API instead.
     */
    delete(): Promise<void>;
  }

  export type InstallationsNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
    Module,
    Statics
  > & {
    firebase: ReactNativeFirebase.Module;
    app(name?: string): ReactNativeFirebase.FirebaseApp;
  };
}

declare const defaultExport: FirebaseInstallationsTypes.InstallationsNamespace;

export declare const firebase: ReactNativeFirebase.Module & {
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

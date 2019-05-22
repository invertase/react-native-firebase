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

import {
  ReactNativeFirebaseModule,
  ReactNativeFirebaseNamespace,
  ReactNativeFirebaseModuleAndStatics,
} from '@react-native-firebase/app-types';

/**
 * Firebase Database package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `database` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/database';
 *
 * // firebase.database().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `database` package:
 *
 * ```js
 * import database from '@react-native-firebase/database';
 *
 * // database().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/database';
 *
 * // firebase.database().X
 * ```
 *
 * @firebase database
 */
export namespace Database {
  export interface Statics {
    // firebase.database.* static props go here
  }

  /**
   * // TODO CHOOSE THIS ---------------------------------------
   *
   * The Firebase Database service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Database service for the default app:
   *
   * ```js
   * const defaultAppDatabase = firebase.database();
   * ```
   *
   * // TODO OR THIS -------------------------------------------
   *
   * The Firebase Database service is available for the default app or a given app.
   *
   * #### Example 1
   *
   * Get the database instance for the **default app**:
   *
   * ```js
   * const databaseForDefaultApp = firebase.database();
   * ```
   *
   * #### Example 2
   *
   * Get the database instance for a **secondary app**:
   *
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const databaseForOtherApp = firebase.database(otherApp);
   * ```
   *
   */
  export interface Module extends ReactNativeFirebaseModule {
    // firebase.database().* methods & props go here
  }
}

declare module '@react-native-firebase/database' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';
  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;
  export const firebase = FirebaseNamespaceExport;
  const DatabaseDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Database.Module,
    Database.Statics
  >;
  export default DatabaseDefaultExport;
}

declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    database: ReactNativeFirebaseModuleAndStatics<Database.Module, Database.Statics>;
  }

  interface FirebaseApp {
    database(): Database.Module;
  }
}

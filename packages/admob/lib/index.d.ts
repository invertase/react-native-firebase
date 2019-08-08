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
 * Firebase Admob package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `admob` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/admob';
 *
 * // firebase.admob().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `admob` package:
 *
 * ```js
 * import admob from '@react-native-firebase/admob';
 *
 * // admob().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/admob';
 *
 * // firebase.admob().X
 * ```
 *
 * @firebase admob
 */
export namespace Admob {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  export interface Statics {
    // firebase.admob.* static props go here
  }

  /**
   * // TODO CHOOSE THIS ---------------------------------------
   *
   * The Firebase Admob service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Admob service for the default app:
   *
   * ```js
   * const defaultAppAdmob = firebase.admob();
   * ```
   *
   * // TODO OR THIS -------------------------------------------
   *
   * The Firebase Admob service is available for the default app or a given app.
   *
   * #### Example 1
   *
   * Get the admob instance for the **default app**:
   *
   * ```js
   * const admobForDefaultApp = firebase.admob();
   * ```
   *
   * #### Example 2
   *
   * Get the admob instance for a **secondary app**:
   *˚
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const admobForOtherApp = firebase.admob(otherApp);
   * ```
   *
   */
  export class Module extends FirebaseModule {
    // firebase.admob().* methods & props go here
  }
}

declare module '@react-native-firebase/admob' {
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const module: FirebaseModuleWithStaticsAndApp<Admob.Module, Admob.Statics>;
  export default module;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      admob: FirebaseModuleWithStaticsAndApp<Admob.Module, Admob.Statics>;
    }
    interface FirebaseApp {
      admob(): Admob.Module;
    }
  }
}

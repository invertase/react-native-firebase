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
 * React Native Firebase Utilities package.
 *
 * #### Example 1
 *
 * Access the firebase export from the `utils` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/utils';
 *
 * // firebase.utils().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `utils` package:
 *
 * ```js
 * import utils from '@react-native-firebase/utils';
 *
 * // utils().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/utils';
 *
 * // firebase.utils().X
 * ```
 *
 * @firebase utils
 */
export namespace Utils {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  export interface Statics {}

  /**
   * The React Native Firebase Utils service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Utils service for the default app:
   *
   * ```js
   * const defaultAppUtils = firebase.utils();
   * ```
   */
  export class Module extends FirebaseModule {
    /**
     * Returns true if this app is running inside a Firebase Test Lab environment. Always returns false on iOS.
     *
     * @android
     */
    isRunningInTestLab: boolean;
  }
}

declare module '@react-native-firebase/utils' {
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const module: FirebaseModuleWithStatics<Utils.Module, Utils.Statics>;
  export default module;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;

    interface Module {
      /**
       * Utils provides a collection of utilities to aid in using Firebase
       * and related services inside React Native, e.g. Test Lab helpers
       * and Google Play Services version helpers.
       */
      utils: FirebaseModuleWithStatics<Utils.Module, Utils.Statics>;
    }

    interface FirebaseApp {
      utils(): Utils.Module;
    }
  }
}

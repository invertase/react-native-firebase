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
  export class Module extends ReactNativeFirebaseModule {
    /**
     * Returns true if this app is running inside a Firebase Test Lab environment. Always returns false on iOS.
     *
     * @android
     */
    isRunningInTestLab: boolean;
  }
}

declare module '@react-native-firebase/utils' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/utils';
   * firebase.utils().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const UtilsDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Utils.Module,
    Utils.Statics
  >;
  /**
   * @example
   * ```js
   * import utils from '@react-native-firebase/utils';
   * utils().X(...);
   * ```
   */
  export default UtilsDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Utils provides a collection of utilities to aid in using Firebase
     * and related services inside React Native, e.g. Test Lab helpers
     * and Google Play Services version helpers.
     */
    utils: ReactNativeFirebaseModuleAndStatics<
      Utils.Module,
      Utils.Statics
    >;
  }

  interface FirebaseApp {
    /**
     * Utils
     */
    utils(): Utils.Module;
  }
}

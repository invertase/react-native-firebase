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
 * Firebase ML Kit package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `mlKitLanguage` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/ml-natural-language';
 *
 * // firebase.mlKitLanguage().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `mlKitLanguage` package:
 *
 * ```js
 * import mlKitLanguage from '@react-native-firebase/ml-natural-language';
 *
 * // mlKitLanguage().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/ml-natural-language';
 *
 * // firebase.mlKitLanguage().X
 * ```
 *
 * @firebase mlKitLanguage
 */
export namespace MlKitLanguage {
  export interface Statics {}

  /**
   * The Firebase ML Kit service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the ML Kit service for the default app:
   *
   * ```js
   * const defaultAppMLKit = firebase.mlKitLanguage();
   * ```
   */
  export class Module extends ReactNativeFirebaseModule {

  }
}

declare module '@react-native-firebase/ml-natural-language' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/ml-natural-language';
   * firebase.mlKitLanguage().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const MlKitLanguageDefaultExport: ReactNativeFirebaseModuleAndStatics<
    MlKitLanguage.Module,
    MlKitLanguage.Statics
  >;
  /**
   * @example
   * ```js
   * import mlKitLanguage from '@react-native-firebase/ml-natural-language';
   * mlKitLanguage().X(...);
   * ```
   */
  export default MlKitLanguageDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * MlKitLanguage
     */
    mlKitLanguage: ReactNativeFirebaseModuleAndStatics<
      MlKitLanguage.Module,
      MlKitLanguage.Statics
    >;
  }

  interface FirebaseApp {
    /**
     * MlKitLanguage
     */
    mlKitLanguage(): MlKitLanguage.Module;
  }
}

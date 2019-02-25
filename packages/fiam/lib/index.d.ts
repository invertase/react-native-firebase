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
 * Fiam
 *
 * @firebase fiam
 */
export namespace Fiam {
  export interface Statics {}

  export interface Module extends ReactNativeFirebaseModule {

  }
}

declare module '@react-native-firebase/fiam' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/fiam';
   * firebase.fiam().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const FiamDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Fiam.Module,
    Fiam.Statics
  >;
  /**
   * @example
   * ```js
   * import fiam from '@react-native-firebase/fiam';
   * fiam().X(...);
   * ```
   */
  export default FiamDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Fiam
     */
    fiam: ReactNativeFirebaseModuleAndStatics<
      Fiam.Module,
      Fiam.Statics
    >;
  }

  interface FirebaseApp {
    /**
     * Fiam
     */
    fiam(): Fiam.Module;
  }
}

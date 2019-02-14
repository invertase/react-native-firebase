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
 * Firestore
 *
 * @firebase firestore
 */
export namespace Firestore {
  export interface Statics {}

  export interface Module extends ReactNativeFirebaseModule {

  }
}

declare module '@react-native-firebase/firestore' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/firestore';
   * firebase.firestore().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const FirestoreDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Firestore.Module,
    Firestore.Statics
  >;
  /**
   * @example
   * ```js
   * import firestore from '@react-native-firebase/firestore';
   * firestore().X(...);
   * ```
   */
  export default FirestoreDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Firestore
     */
    firestore: ReactNativeFirebaseModuleAndStatics<
      Firestore.Module,
      Firestore.Statics
    >;
  }

  interface FirebaseApp {
    /**
     * Firestore
     */
    firestore(): Firestore.Module;
  }
}

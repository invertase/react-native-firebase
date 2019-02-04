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
 * Perf
 *
 * @firebase perf
 */
export namespace Perf {
  export interface Statics {}

  export interface Module extends ReactNativeFirebaseModule {

  }
}

declare module '@react-native-firebase/perf' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/perf';
   * firebase.perf().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const PerfDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Perf.Module,
    Perf.Statics
  >;
  /**
   * @example
   * ```js
   * import perf from '@react-native-firebase/perf';
   * perf().X(...);
   * ```
   */
  export default PerfDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Perf integrates across Firebase features and provides
     * you with unlimited reporting for up to 500 distinct events
     * that you can define using the Firebase SDK. Perf reports
     * help you understand clearly how your users behave, which enables
     * you to make informed decisions regarding app marketing and
     * performance optimizations.
     */
    perf: ReactNativeFirebaseModuleAndStatics<
      Perf.Module,
      Perf.Statics
    >;
  }

  interface FirebaseApp {
    /**
     * Perf
     */
    perf(): Perf.Module;
  }
}

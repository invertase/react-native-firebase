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
 * _Template_
 *
 * @firebase _template_
 */
export namespace _Template_ {
  export interface Statics {}

  export interface Module extends ReactNativeFirebaseModule {

  }
}

declare module '@react-native-firebase/_template_' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/_template_';
   * firebase._template_().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const _Template_DefaultExport: ReactNativeFirebaseModuleAndStatics<
    _Template_.Module,
    _Template_.Statics
  >;
  /**
   * @example
   * ```js
   * import _template_ from '@react-native-firebase/_template_';
   * _template_().X(...);
   * ```
   */
  export default _Template_DefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * _Template_ integrates across Firebase features and provides
     * you with unlimited reporting for up to 500 distinct events
     * that you can define using the Firebase SDK. _Template_ reports
     * help you understand clearly how your users behave, which enables
     * you to make informed decisions regarding app marketing and
     * performance optimizations.
     */
    _template_: ReactNativeFirebaseModuleAndStatics<
      _Template_.Module,
      _Template_.Statics
    >;
  }

  interface FirebaseApp {
    /**
     * _Template_
     */
    _template_(): _Template_.Module;
  }
}

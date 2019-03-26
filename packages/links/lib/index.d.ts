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
 * Links
 *
 * @firebase links
 */
export namespace Links {
  export interface Statics {}

  export interface Module extends ReactNativeFirebaseModule {

  }
}

declare module '@react-native-firebase/links' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/links';
   * firebase.links().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const LinksDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Links.Module,
    Links.Statics
  >;
  /**
   * @example
   * ```js
   * import links from '@react-native-firebase/links';
   * links().X(...);
   * ```
   */
  export default LinksDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Links
     */
    links: ReactNativeFirebaseModuleAndStatics<
      Links.Module,
      Links.Statics
    >;
  }

  interface FirebaseApp {
    /**
     * Links
     */
    links(): Links.Module;
  }
}

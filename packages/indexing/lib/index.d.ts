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
  ReactNativeFirebaseModuleAndStatics,
  ReactNativeFirebaseNamespace,
} from '@react-native-firebase/app-types';

/**
 * Firebase Indexing package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `indexing` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/indexing';
 *
 * // firebase.indexing().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `indexing` package:
 *
 * ```js
 * import indexing from '@react-native-firebase/indexing';
 *
 * // indexing().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/indexing';
 *
 * // firebase.indexing().X
 * ```
 *
 * @firebase indexing
 */
export namespace Indexing {
  export interface Statics {}

  /**
   *
   * The Firebase Indexing service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Indexing service for the default app:
   *
   * ```js
   * const defaultAppIndexing = firebase.indexing();
   * ```
   */
  export class Module extends ReactNativeFirebaseModule {
    /**
     * If the application was launched via a deep link URL, the URL is returned, otherwise
     * value is `null`.
     */
    getInitialURL(): Promise<string | null>;

    /**
     * Listen to deep link URL events which the application handles. The URL is passed to the
     * provided listener function.
     *
     * Returns an unsubscribe function.
     *
     * @param listener Function called when a deep link URL is handled for this app.
     */
    onOpenURL(listener: Function): Function;
  }
}

declare module '@react-native-firebase/indexing' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';
  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;
  export const firebase = FirebaseNamespaceExport;
  const IndexingDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Indexing.Module,
    Indexing.Statics
  >;
  export default IndexingDefaultExport;
}

declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    indexing: ReactNativeFirebaseModuleAndStatics<Indexing.Module, Indexing.Statics>;
  }

  interface FirebaseApp {
    indexing(): Indexing.Module;
  }
}

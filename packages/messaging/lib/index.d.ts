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
 * Firebase Messaging package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `messaging` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/messaging';
 *
 * // firebase.messaging().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `messaging` package:
 *
 * ```js
 * import messaging from '@react-native-firebase/messaging';
 *
 * // messaging().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/messaging';
 *
 * // firebase.messaging().X
 * ```
 *
 * @firebase messaging
 */
export namespace Messaging {
  export interface Statics {
    // firebase.messaging.* static props go here
  }

  /**
   * // TODO CHOOSE THIS ---------------------------------------
   *
   * The Firebase Messaging service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Messaging service for the default app:
   *
   * ```js
   * const defaultAppMessaging = firebase.messaging();
   * ```
   *
   * // TODO OR THIS -------------------------------------------
   *
   * The Firebase Messaging service is available for the default app or a given app.
   *
   * #### Example 1
   *
   * Get the messaging instance for the **default app**:
   *
   * ```js
   * const messagingForDefaultApp = firebase.messaging();
   * ```
   *
   * #### Example 2
   *
   * Get the messaging instance for a **secondary app**:
   *˚
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const messagingForOtherApp = firebase.messaging(otherApp);
   * ```
   *
   */
  export class Module extends ReactNativeFirebaseModule {
    // firebase.messaging().* methods & props go here
  }
}

declare module '@react-native-firebase/messaging' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';
  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;
  export const firebase = FirebaseNamespaceExport;
  const MessagingDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Messaging.Module,
    Messaging.Statics
  >;
  export default MessagingDefaultExport;
}

declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    messaging: ReactNativeFirebaseModuleAndStatics<Messaging.Module, Messaging.Statics>;
  }

  interface FirebaseApp {
    messaging(): Messaging.Module;
  }
}

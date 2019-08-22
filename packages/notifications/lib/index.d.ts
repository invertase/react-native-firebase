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
 * Firebase Notifications package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `notifications` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/notifications';
 *
 * // firebase.notifications().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `notifications` package:
 *
 * ```js
 * import notifications from '@react-native-firebase/notifications';
 *
 * // notifications().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/notifications';
 *
 * // firebase.notifications().X
 * ```
 *
 * @firebase notifications
 */
export namespace Notifications {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  export interface Statics {
    // firebase.notifications.* static props go here
  }

  /**
   * // TODO CHOOSE THIS ---------------------------------------
   *
   * The Firebase Notifications service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Notifications service for the default app:
   *
   * ```js
   * const defaultAppNotifications = firebase.notifications();
   * ```
   *
   * // TODO OR THIS -------------------------------------------
   *
   * The Firebase Notifications service is available for the default app or a given app.
   *
   * #### Example 1
   *
   * Get the notifications instance for the **default app**:
   *
   * ```js
   * const notificationsForDefaultApp = firebase.notifications();
   * ```
   *
   * #### Example 2
   *
   * Get the notifications instance for a **secondary app**:
   *˚
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const notificationsForOtherApp = firebase.notifications(otherApp);
   * ```
   *
   */
  export class Module extends FirebaseModule {
    // firebase.notifications().* methods & props go here
  }
}

declare module '@react-native-firebase/notifications' {
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const module: FirebaseModuleWithStaticsAndApp<Notifications.Module, Notifications.Statics>;
  export default module;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      notifications: FirebaseModuleWithStaticsAndApp<Notifications.Module, Notifications.Statics>;
    }
    interface FirebaseApp {
      notifications(): Notifications.Module;
    }
  }
}

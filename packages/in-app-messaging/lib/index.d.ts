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
 * Firebase In-App Messaging package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `inAppMessaging` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/in-app-messaging';
 *
 * // firebase.inAppMessaging().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `in-app-messaging` package:
 *
 * ```js
 * import inAppMessaging from '@react-native-firebase/in-app-messaging';
 *
 * // inAppMessaging().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/in-app-messaging';
 *
 * // firebase.inAppMessaging().X
 * ```
 *
 * @firebase in-app-messaging
 */
export namespace FirebaseInAppMessaging {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  export interface Statics {}

  /**
   * The Firebase In-App Messaging service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the  In-App Messaging service for the default app:
   *
   * ```js
   * const defaultAppInAppMessaging = firebase.inAppMessaging();
   * ```
   */
  export class Module extends FirebaseModule {
    /**
     * Determines whether messages are suppressed or not.
     *
     * #### Example
     *
     * ```js
     * const isSuppressed = firebase.inAppMessaging().isMessagesDisplaySuppressed;
     * ```
     */
    isMessagesDisplaySuppressed: boolean;

    /**
     * Enable or disable suppression of Firebase In App Messaging messages.
     *
     * When enabled, no in app messages will be rendered until either you disable suppression, or the app restarts.
     * This state is not persisted between app restarts.
     *
     * #### Example
     *
     * ```js
     * // Suppress messages
     * await firebase.inAppMessaging().setMessagesDisplaySuppressed(true);
     * ```
     *
     * @param enabled Whether messages should be suppressed.
     */
    setMessagesDisplaySuppressed(enabled: boolean): Promise<null>;

    /**
     * Determines whether automatic data collection is enabled or not.
     *
     * #### Example
     *
     * ```js
     * const isDataCollectionEnabled = firebase.inAppMessaging().isAutomaticDataCollectionEnabled;
     * ```
     */
    isAutomaticDataCollectionEnabled: boolean;

    /**
     * Enable or disable automatic data collection for Firebase In-App Messaging.
     *
     * When enabled, generates a registration token on app startup if there is no valid one and generates a new token
     * when it is deleted (which prevents deleteInstanceId() from stopping the periodic sending of data).
     *
     * This setting is persisted across app restarts and overrides the setting specified in your manifest/plist file.
     *
     * #### Example
     *
     * ```js
     * // Disable data collection
     * firebase.inAppMessaging().setAutomaticDataCollectionEnabled(false);
     * ```
     *
     * @param enabled Whether automatic data collection is enabled.
     */
    setAutomaticDataCollectionEnabled(enabled: boolean): Promise<null>;
  }
}

declare module '@react-native-firebase/in-app-messaging' {
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const module: FirebaseModuleWithStatics<
    FirebaseInAppMessaging.Module,
    FirebaseInAppMessaging.Statics
  >;
  export default module;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;
    interface Module {
      inAppMessaging: FirebaseModuleWithStatics<
        FirebaseInAppMessaging.Module,
        FirebaseInAppMessaging.Statics
      >;
    }

    interface FirebaseApp {
      inAppMessaging(): FirebaseInAppMessaging.Module;
    }
  }
}

namespace ReactNativeFirebase {
  interface FirebaseJsonConfig {
    /**
     * Disable or enable auto collection & receiving of in-app messages and data collection.
     *
     * This is useful for opt-in-first data flows, for example when dealing with GDPR compliance.
     * This can be overridden in JavaScript.
     *
     * #### Example
     *
     * ```json
     * // <project-root>/firebase.json
     * {
     *   "react-native": {
     *     "in_app_messaging_auto_collection_enabled": false
     *   }
     * }
     * ```
     *
     * ```js
     * // Re-enable in-app messaging, e.g. once user has granted permission:
     * await firebase.inAppMessaging().setAutomaticDataCollectionEnabled(true);
     * ```
     */
    in_app_messaging_auto_collection_enabled: boolean;
  }
}

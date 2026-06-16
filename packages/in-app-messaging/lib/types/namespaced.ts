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

import type { ReactNativeFirebase } from '@react-native-firebase/app';

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
/**
 * @deprecated Use the exported types directly instead.
 * FirebaseInAppMessagingTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseInAppMessagingTypes {
  /**
   * @deprecated Use the exported types directly instead. FirebaseInAppMessagingTypes namespace is kept for backwards compatibility.
   */
  type FirebaseModule = ReactNativeFirebase.FirebaseModule;

  /**
   * @deprecated Use the default export statics instead.
   */
  export interface Statics {
    /** @deprecated Use the default export statics instead. */
    SDK_VERSION: string;
  }

  /**
   * @deprecated Use the exported `InAppMessaging` type instead.
   */
  export interface Module extends FirebaseModule {
    /**
     * @deprecated Use the exported `InAppMessaging` type instead.
     *
     * The current `FirebaseApp` instance for this Firebase service.
     */
    app: ReactNativeFirebase.FirebaseApp;

    /**
     * @deprecated Use the exported `InAppMessaging` type instead.
     *
     * Determines whether messages are suppressed or not.
     */
    isMessagesDisplaySuppressed: boolean;

    /**
     * @deprecated Use the exported `InAppMessaging` type instead.
     *
     * Determines whether automatic data collection is enabled or not.
     */
    isAutomaticDataCollectionEnabled: boolean;

    /**
     * @deprecated Use the exported `InAppMessaging` type instead.
     *
     * Enable or disable suppression of Firebase In App Messaging messages.
     */
    setMessagesDisplaySuppressed(enabled: boolean): Promise<null>;

    /**
     * @deprecated Use the exported `InAppMessaging` type instead.
     *
     * Enable or disable automatic data collection for Firebase In-App Messaging.
     */
    setAutomaticDataCollectionEnabled(enabled: boolean): Promise<null>;

    /**
     * @deprecated Use the exported `InAppMessaging` type instead.
     *
     * Trigger in-app messages programmatically.
     */
    triggerEvent(eventId: string): Promise<null>;
  }
}

declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    interface Module {
      inAppMessaging: FirebaseModuleWithStaticsAndApp<
        FirebaseInAppMessagingTypes.Module,
        FirebaseInAppMessagingTypes.Statics
      >;
    }

    interface FirebaseApp {
      inAppMessaging(): FirebaseInAppMessagingTypes.Module;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

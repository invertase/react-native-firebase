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
 * Firebase In-App Messaging helps you engage users who are actively using your app by sending
 * them targeted and contextual messages that nudge them to complete key in-app actions - like
 * beating a game level, buying an item, or subscribing to content.
 *
 * @firebase fiam
 */
export namespace Fiam {
  export interface Statics {}

  export interface Module extends ReactNativeFirebaseModule {
    /**
     * Determines whether messages are suppressed or not.
     */
    isMessagesDisplaySuppressed: boolean;

    /**
     * Enable or disable suppression of Firebase In App Messaging messages.
     *
     * When enabled, no in app messages will be rendered until either you disable suppression, or the app restarts.
     * This state is not persisted between app restarts.
     *
     * @param enabled Whether messages should be suppressed
     */
    setMessagesDisplaySuppressed(enabled: boolean): Promise<null>;

    /**
     * Determines whether automatic data collection is enabled or not.
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
     * @param enabled Whether automatic data collection is enabled
     */
    setAutomaticDataCollectionEnabled(enabled: boolean): Promise<null>;
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

  const FiamDefaultExport: ReactNativeFirebaseModuleAndStatics<Fiam.Module, Fiam.Statics>;
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
     * Firebase In-App Messaging helps you engage users who are actively using your app by sending
     * them targeted and contextual messages that nudge them to complete key in-app actions - like
     * beating a game level, buying an item, or subscribing to content.
     */
    fiam: ReactNativeFirebaseModuleAndStatics<Fiam.Module, Fiam.Statics>;
  }

  interface FirebaseApp {
    /**
     * Firebase In-App Messaging helps you engage users who are actively using your app by sending
     * them targeted and contextual messages that nudge them to complete key in-app actions - like
     * beating a game level, buying an item, or subscribing to content.
     */
    fiam(): Fiam.Module;
  }
}

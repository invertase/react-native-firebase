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

  export interface RemoteMessage {
    collapseKey: string;

    messageId: string;

    messageType: string;

    to: string;

    ttl: number;

    data: { [key: string]: string };
  }

  export interface RemoteMessageBuilder {
    setCollapseKey(collapseKey: string): RemoteMessageBuilder;

    setMessageId(messageId: string): RemoteMessageBuilder;

    setMessageType(messageType: string): RemoteMessageBuilder;

    setTo(to: string): RemoteMessageBuilder;

    setTtl(ttl: number): RemoteMessageBuilder;

    setData(data: { [key: string]: string }): RemoteMessageBuilder;
  }

  /**
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
   */
  export class Module extends ReactNativeFirebaseModule {
    newRemoteMessage(): RemoteMessageBuilder;

    get isAutoInitEnabled(): true;

    setAutoInitEnabled(enabled: boolean): Promise<void>;

    getToken(authorizedEntity: string, scope: string = 'FCM'): Promise<string>;

    deleteToken(authorizedEntity: string, scope: string = 'FCM'): Promise<void>;

    onMessage(listener: (message: RemoteMessage) => {}): Function;

    onTokenRefresh(listener: (token: string) => {}): Function;

    /**
     * @platform ios
     */
    requestPermission(): Promise<boolean>;

    /**
     * @platform ios
     */
    registerForRemoteNotifications(): Promise<void>;

    /**
     * @platform ios
     */
    isRegisteredForRemoteNotifications: boolean;

    /**
     * @platform ios
     */
    unregisterForRemoteNotifications(): Promise<void>;

    /**
     * @platform ios
     */
    getAPNSToken(): Promise<string>;

    hasPermission(): Promise<boolean>;

    // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#public-void-ondeletedmessages-
    onDeletedMessages(listener: Function): Function;

    // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#onMessageSent(java.lang.String)
    onMessageSent(listener: (messageId: string) => {}): Function;

    // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#onSendError(java.lang.String,%20java.lang.Exception)
    onSendError(listener: { messageId: string; error: Error }): Function;

    /**
     * @platform android
     */
    setBackgroundMessageHandler(handler: (message: RemoteMessage) => {});

    sendMessage(message: RemoteMessageBuilder): Promise<void>;

    subscribeToTopic(topic: string): Promise<void>;

    unsubscribeFromTopic(topic: string): Promise<void>;
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

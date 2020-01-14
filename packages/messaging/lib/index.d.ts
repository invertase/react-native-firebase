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
export namespace FirebaseMessagingTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;
  import NativeFirebaseError = ReactNativeFirebase.NativeFirebaseError;

  export interface Statics {
    // firebase.messaging.* static props go here
  }

  /**
   * The `RemoteMessage` interface describes an outgoing & incoming message from the remote FCM server.
   */
  export interface RemoteMessage {
    /**
     * The collapse key a message was sent with. Used to override existing messages with the same
     * key.
     */
    collapseKey?: string;

    /**
     * A unique ID assigned to every message.
     *
     * If not provided, a random unique ID is generated.
     */
    messageId?: string;

    /**
     * The message type of the message.
     */
    messageType?: string;

    /**
     * The address for the message.
     */
    to?: string;

    /**
     * The time to live for the message in seconds.
     *
     * Defaults to 3600.
     */
    ttl?: number;

    /**
     * Any additional data sent with the message.
     */
    data?: { [key: string]: string };
  }

  /**
   * An event that is received when a message fails to send.
   *
   * ### Example
   *
   * ```js
   * firebase.messaging().onSendError(event => {
   *   console.log(event.messageId);
   *   console.log(event.error);
   * });
   */
  export interface SendErrorEvent {
    /**
     * The id of the message that failed to send
     */
    messageId: string;

    /**
     * A native firebase error that indicates the failure reason.
     */
    error: NativeFirebaseError;
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
  export class Module extends FirebaseModule {
    /**
     * Returns whether messaging auto initialization is enabled or disabled for the device.
     *
     * #### Example
     *
     * ```js
     * const isAutoInitEnabled = firebase.messaging().isAutoInitEnabled;
     * ```
     */
    isAutoInitEnabled: boolean;

    /**
     * Sets whether auto initialization for messaging is enabled or disabled.
     *
     * Set this to false to allow for an 'opt-in-first' flow for your users. By default auto
     * initialization is enabled, which updates the device identifier and configuration data needed
     * for messaging to Firebase.
     *
     * To ensure first app opens have an initial value set, set the argument in the `firebase.json`
     * config.
     *
     * #### Example
     *
     * ```js
     * // Disable auto initialization
     * await firebase.messaging().setAutoInitEnabled(false);
     * ```
     *
     * @param enabled A boolean value to enable or disable auto initialization.
     */
    setAutoInitEnabled(enabled: boolean): Promise<void>;

    /**
     * Returns an FCM token for this device. Optionally you can specify a custom authorized entity
     * or scope to tailor tokens to your own use-case.
     *
     * It is recommended you call this method on app start and update your backend with the new token.
     *
     * On iOS you'll need to register for remote notifications before calling this method, you can do
     * this by calling `registerForRemoteNotifications` or `requestPermission` as part of your app
     * startup. If you have not registered and you call this method you will receive an 'unregistered'
     * error code.
     *
     * #### Example - Default token
     *
     * ```js
     * await firebase.messaging().registerForRemoteNotifications();
     * const fcmToken = await firebase.messaging().getToken();
     *
     * // Update backend (e.g. Firestore) with our scoped token for the user
     * const uid = firebase.auth().currentUser.uid;
     * await firebase.firestore().doc(`users/${uid}`)
     *   .update({
     *     fcmTokens: firebase.firestore.FieldValues.arrayUnion(fcmToken),
     *   });
     * ```
     *
     * #### Example - Scoped Token
     *
     * The below example creates a new token for a specific notification scope (in this case, ALARM).
     * Your server can specifically send messages to 'ALARM' tokens. By default, all notification scopes
     * will be received.
     *
     * ```js
     * // Get a token for 'ALARM' notifications
     * const alarmFcmToken = await firebase.messaging().getToken(
     *   firebase.app().options.messagingSenderId, // default to this app
     *   'ALARM', // defaults to 'FCM'
     * );
     *
     * // Update backend (e.g. Firestore) with our scoped token for the user
     * const uid = firebase.auth().currentUser.uid;
     * await firebase.firestore().doc(`users/${uid}`)
     *   .update({
     *     alarmFcmTokens: firebase.firestore.FieldValues.arrayUnion(alarmFcmToken),
     *   });
     * ```
     *
     * @param authorizedEntity The messaging sender ID. In most cases this will be the current default app.
     * @param scope The scope to assign a token, which the sever can use to target messages at.
     */
    getToken(authorizedEntity?: string, scope?: string = 'FCM'): Promise<string>;

    /**
     * Removes access to an FCM token previously authorized by it's scope. Messages sent by the server
     * to this token will fail.
     *
     * #### Example
     *
     * ```js
     * await firebase.messaging().deleteToken();
     * ```
     *
     * @param authorizedEntity The messaging sender ID. In most cases this will be the current default app.
     * @param scope The scope to assign when token will be deleted.
     */
    deleteToken(authorizedEntity?: string, scope?: string = 'FCM'): Promise<void>;

    /**
     * When any FCM payload is received, the listener callback is called with a `RemoteMessage`.
     *
     * Returns an unsubscribe function to stop listening for new messages.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.messaging().onMessage(async (remoteMessage) => {
     *   console.log('FCM Message Data:', remoteMessage.data);
     *
     *    // Update a users messages list using AsyncStorage
     *    const currentMessages = await AsyncStorage.getItem('messages');
     *    const messageArray = JSON.parse(currentMessages);
     *    messageArray.push(remoteMessage.data);
     *    await AsyncStorage.setItem('messages', JSON.stringify(messageArray));
     * });
     *
     * // Unsubscribe from further message events
     * unsubscribe();
     * ```
     *
     * > This subscriber method is only called when the app is active (in the foreground).
     *
     * @param listener Called with a `RemoteMessage` when a new FCM payload is received from the server.
     */
    onMessage(listener: (message: RemoteMessage) => any): () => void;

    /**
     * Called when a new registration token is generated for the device. For example, this event can happen when a
     * token expires or when the server invalidates the token.
     *
     * Your app should always subscribe to this event and update your backend to ensure your device will
     * receive new messages. The listener is only called when the app is active (in foreground), so ensure
     * you call `getToken()` on app open to handle any new tokens generated when the app was not active.
     *
     * Returns an unsubscribe function to stop listening for token refresh events.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.messaging().onTokenRefresh(async (fcmToken) => {
     *   console.log('New FCM Token:', fcmToken);
     *
     *   // Append the database with the users new FCM token (e.g. with Firestore)
     *   const uid = firebase.auth().currentUser.uid;
     *   await firebase.firestore().doc(`users/${uid}`)
     *     .update({
     *       fcmTokens: firebase.firestore.FieldValues.arrayUnion(fcmToken),
     *     });
     * });
     * ```
     *
     * > This subscriber method is only called when the app is active (in the foreground).
     *
     * @param listener Called with a FCM token when the token is refreshed.
     */
    onTokenRefresh(listener: (token: string) => any): () => void;

    /**
     * On iOS, messaging permission must be requested by the current application before messages can
     * be received or sent.
     *
     * On iOS < 12, a modal will be shown to the user requesting messaging permissions for the app.
     * Once handled, the promise will resolve with `true` if permission was granted.
     *
     * On iOS >= 12, the app will be granted [Provisional Authorization](http://iosbrain.com/blog/2018/07/05/new-in-ios-12-implementing-provisional-authorization-for-quiet-notifications-in-swift/),
     * and will resolve `true`. The user will be able to receive FCM payloads and Notifications immediately;
     * but notifications will be displayed silently. The user, through Notification Center, then has the option of upgrading your apps notifications to no longer be silent.
     *
     * > You can safely call this method on Android without platform checks. It's a no-op on Android and will promise resolve `true`.
     *
     * #### Example
     *
     * ```js
     * const permissionGranted = await firebase.messaging().requestPermission();
     * ```
     *
     * @ios
     */
    requestPermission(): Promise<boolean>;

    /**
     * On iOS, if your app wants to receive remote messages from FCM (via APNS), you must explicitly register
     * this request with APNS. For example if you want to display alerts, play sounds
     * or perform other user-facing actions (via the Notification library), you must call this method.
     *
     * > You can safely call this method on Android without platform checks. It's a no-op on Android and will promise resolve `void`.
     *
     * > You can safely call this method multiple times, if the app is already registered then this method resolves immediately.
     *
     * #### Example
     *
     * ```js
     * if (!firebase.messaging().isRegisteredForRemoteNotifications) {
     *   await firebase.messaging().registerForRemoteNotifications();
     * }
     * ```
     *
     * @ios
     */
    registerForRemoteNotifications(): Promise<void>;

    /**
     * Returns a boolean value whether the user has registered for remote notifications via
     * `registerForRemoteNotifications()`.
     *
     * > You can safely access this property on Android without platform checks. Android returns `true` only.
     *
     * #### Example
     *
     * ```js
     * const isRegisteredForRemoteNotifications = firebase.messaging().isRegisteredForRemoteNotifications;
     * ```
     *
     * @ios
     */
    isRegisteredForRemoteNotifications: boolean;

    /**
     * Unregisters the app from receiving remote notifications.
     *
     * > You can safely call this method on Android without platform checks. It's a no-op on Android and will promise resolve `void`.
     *
     * #### Example
     *
     * ```js
     * if (firebase.messaging().isRegisteredForRemoteNotifications) {
     *   await firebase.messaging().unregisterForRemoteNotifications();
     * }
     * ```
     *
     * @ios
     */
    unregisterForRemoteNotifications(): Promise<void>;

    /**
     * On iOS, it is possible to get the users APNS token. This may be required if you want to send messages to your
     * iOS devices without using the FCM service.
     *
     * > You can safely call this method on Android without platform checks. It's a no-op on Android and will promise resolve `null`.
     *
     * #### Example
     *
     * ```js
     * const apnsToken = await firebase.messaging().getAPNSToken();
     *
     * if (apnsToken) {
     *   console.log('User APNS Token:', apnsToken);
     * }
     * ```
     *
     * @ios
     */
    getAPNSToken(): Promise<string | null>;

    /**
     * Returns a boolean value as to whether the user has messaging permission for this app.
     *
     * #### Example
     *
     * ```js
     * const hasPermission = await firebase.messaging().hasPermission();
     * ```
     */
    hasPermission(): Promise<boolean>;

    /**
     * Called when the FCM server deletes pending messages. This may be due to:
     *
     * 1. Too many messages stored on the FCM server. This can occur when an app's servers send a bunch
     * of non-collapsible messages to FCM servers while the device is offline.
     *
     * 2. The device hasn't connected in a long time and the app server has recently (within the last
     * 4 weeks) sent a message to the app on that device.
     *
     * It is recommended that the app do a full sync with the server after receiving this call (e.g.
     * requesting all user messages from the database).
     *
     * Returns an unsubscribe function to stop listening for deleted messages.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.messaging().onDeletedMessages(() => {
     *   // Perform a full app re-sync
     * });
     *
     * // Unsubscribe from deleted messages events
     * unsubscribe();
     * ```
     *
     * @param listener Called when the FCM deletes pending messages.
     */
    onDeletedMessages(listener: () => void): () => void;

    /**
     * When sending a `RemoteMessage`, this listener is called when the message has been sent to FCM.
     *
     * Returns an unsubscribe function to stop listening for sent messages.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.firestore().onMessageSent((messageId) => {
     *   console.log('Message has been sent to the FCM server', messageId);
     * });
     *
     * // Unsubscribe from message sent events
     * unsubscribe();
     * ```
     *
     * @param listener Called when the FCM sends the remote message to FCM.
     */
    onMessageSent(listener: (messageId: string) => any): () => void;

    /**
     * When sending a `RemoteMessage`, this listener is called when an error is thrown and the
     * message could not be sent.
     *
     * Returns an unsubscribe function to stop listening for sent errors.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.firestore().onSendError(({ messageId, error }) => {
     *   console.log('An error occurred when sending a message to FCM', messageId, error);
     * });
     *
     * // Unsubscribe from message sent error events
     * unsubscribe();
     * ```
     *
     * @param listener
     */
    onSendError(listener: (evt: SendErrorEvent) => any): () => void;

    /**
     * On Android, set a message handler function which is called when the app is in the background
     * or terminated. A headless task is created, allowing you to access the React Native environment
     * to perform tasks such as updating local storage, or sending a network request.
     *
     * This method must be called **outside** of your application lifecycle, e.g. alongside your
     * `AppRegistry.registerComponent()` method call at the the entry point of your application code.
     *
     * > You can safely call this method on iOS without platform checks. It's a no-op on iOS.
     *
     * #### Example
     *
     * ```js
     * firebase.messaging().setBackgroundMessageHandler(async (remoteMessage) => {
     *    // Update a users messages list using AsyncStorage
     *    const currentMessages = await AsyncStorage.getItem('messages');
     *    const messageArray = JSON.parse(currentMessages);
     *    messageArray.push(remoteMessage.data);
     *    await AsyncStorage.setItem('messages', JSON.stringify(messageArray));
     * });
     * ```
     *
     * @android
     */
    setBackgroundMessageHandler(handler: (message: RemoteMessage) => any);

    /**
     * Send a new `RemoteMessage` to the FCM server.
     *
     * The promise resolves when the message has been added to the internal queue. Use `onMessageSent()`
     * and `onSendError()` to determine when the message has been sent to the server.
     *
     * #### Example
     *
     * ```js
     * await firebase.firestore().sendMessage({
     *   data: {
     *     loggedIn: Date.now(),
     *     uid: firebase.auth().currentUser.uid,
     *   }
     * });
     * ```
     *
     * @param message A `RemoteMessage` interface.
     */
    sendMessage(message: RemoteMessage): Promise<void>;

    /**
     * Apps can subscribe to a topic, which allows the FCM server to send targeted messages to only those
     * devices subscribed to that topic.
     *
     * #### Example
     *
     * ```js
     * await firebase.messaging().subscribeToTopic('news');
     * ```
     *
     * @param topic The topic name.
     */
    subscribeToTopic(topic: string): Promise<void>;

    /**
     * Unsubscribe the device from a topic.
     *
     * #### Example
     *
     * ```js
     * await firebase.messaging().unsubscribeFromTopic('news');
     * ```
     *
     * @param topic The topic name.
     */
    unsubscribeFromTopic(topic: string): Promise<void>;
  }
}

declare module '@react-native-firebase/messaging' {
  // tslint:disable-next-line:no-duplicate-imports required otherwise doesn't work
  import { ReactNativeFirebase } from '@react-native-firebase/app';
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const defaultExport: FirebaseModuleWithStatics<
    FirebaseMessagingTypes.Module,
    FirebaseMessagingTypes.Statics
  >;
  export default defaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;
    interface Module {
      messaging: FirebaseModuleWithStatics<
        FirebaseMessagingTypes.Module,
        FirebaseMessagingTypes.Statics
      >;
    }

    interface FirebaseApp {
      messaging(): FirebaseMessagingTypes.Module;
    }
  }
}

namespace ReactNativeFirebase {
  interface FirebaseJsonConfig {
    messaging_auto_init_enabled: boolean;
    messaging_android_headless_task_timeout: number;
  }
}

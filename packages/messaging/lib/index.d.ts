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
    AuthorizationStatus: typeof AuthorizationStatus;
    NotificationAndroidPriority: typeof NotificationAndroidPriority;
    NotificationAndroidVisibility: typeof NotificationAndroidVisibility;
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
     * The topic name or message identifier.
     */
    from?: string;
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
     * The time the message was sent, in milliseconds since the start of unix epoch
     */
    sentTime?: number;

    /**
     * Any additional data sent with the message.
     */
    data?: { [key: string]: string };

    /**
     * Additional NotificationPayload data sent with the message
     */
    notification?: NotificationPayload;

    /**
     * Whether the iOS APNs message was configured as a background update notification.
     *
     * @platform ios iOS
     */
    contentAvailable?: boolean;

    /**
     * Whether the iOS APNs `mutable-content` property on the message was set
     * allowing the app to modify the notification via app extensions.
     *
     * @platform ios iOS
     */
    mutableContent?: boolean;

    /**
     * The iOS category this notification is assigned to.
     *
     * @platform ios iOS
     */
    category?: string;

    /**
     * An iOS app specific identifier used for notification grouping.
    threadId?: string;
    */
    threadId?: string;

    /**
     * Options for features provided by the FCM SDK for Web.
     */
    fcmOptions: FcmOptions;
  }

  /**
   * Options for features provided by the FCM SDK for Web.
   */
  export interface FcmOptions {
    /**
     * The link to open when the user clicks on the notification.
     */
    link?: string;

    /**
     * The label associated with the message's analytics data.
     */
    analyticsLabel?: string;
  }

  /**
   * Options for `getToken()` and `deleteToken()`
   */
  export interface NativeTokenOptions {
    /**
     * The app name of the FirebaseApp instance.
     *
     * @platform android Android
     */
    appName?: string;

    /**
     * The senderID for a particular Firebase project.
     *
     * @platform ios iOS
     */
    senderId?: string;
  }

  /**
   * Options for `getToken()`
   */
  export interface GetTokenOptions {
    /**
     * The VAPID key used to authenticate the push subscribers
     *  to receive push messages only from sending servers
     * that hold the corresponding private key.
     *
     * @platform web
     */
    vapidKey?: string;

    /**
     * The service worker registration for receiving push messaging.
     * If the registration is not provided explicitly, you need to
     * have a firebase-messaging-sw.js at your root location.
     *
     * @platform web
     */
    serviceWorkerRegistration?: ServiceWorkerRegistration;
  }

  /**
   * NotificationPayload is an alias for Notification. This is to keep it the same as
   * Firebase Web JS SDK v9 and to make it backwards compatible.
   */
  type NotificationPayload = Notification;

  export interface Notification {
    /**
     * The notification title.
     */
    title?: string;

    /**
     * The native localization key for the notification title.
     */
    titleLocKey?: string;

    /**
     * Any arguments that should be formatted into the resource specified by titleLocKey.
     */
    titleLocArgs?: string[];

    /**
     * The notification body content.
     */
    body?: string;

    /**
     * Web only. The URL to use for the notification's icon. If you don't send this key in the request,
     * FCM displays the launcher icon specified in your app manifest.
     */
    icon?: string;

    /**
     * Web only. The URL of an image that is downloaded on the device and displayed in the notification.
     */
    image?: string;

    /**
     * Web only. The notification's title.
     */
    title?: string;

    /**
     * The native localization key for the notification body content.
     */
    bodyLocKey?: string;

    /**
     * Any arguments that should be formatted into the resource specified by bodyLocKey.
     */
    bodyLocArgs?: string[];

    ios?: {
      /**
       * The notification's subtitle.
       */
      subtitle?: string;

      /**
       * The native localization key for the notification's subtitle.
       */
      subtitleLocKey?: string;

      /**
       * Any arguments that should be formatted into the resource specified by subtitleLocKey.
       */
      subtitleLocArgs?: string[];

      /**
       * The value of the badge on the home screen app icon.
       * If not specified, the badge is not changed.
       * If set to 0, the badge has been removed.
       */
      badge?: string;

      /**
       * The sound played when the notification was delivered on the device (if permissions permit).
       */
      sound?: string | NotificationIOSCriticalSound;
    };

    /**
     * Additional Android specific properties set on the notification.
     */
    android?: {
      /**
       * The sound played when the notification was delivered on the device (channel settings permitted).
       *
       * Set as "default" if the default device notification sound was used.
       */
      sound?: string;

      /**
       * The channel ID set on the notification. If not set, the notification uses the default
       * "Miscellaneous" channel set by FCM.
       */
      channelId?: string;

      /**
       * The custom color used to tint the notification content.
       */
      color?: string;

      /**
       * The custom small icon used to display on the notification. If not set, uses the default
       * application icon defined in the AndroidManifest file.
       */
      smallIcon?: string;

      /**
       * The custom image was provided and displayed in the notification body.
       */
      imageUrl?: string;

      /**
       * Deep link URL provided to the notification.
       */
      link?: string;

      /**
       * The current unread notification count for this application, managed by the device.
       */
      count?: number;

      /**
       * Name of the click action set on the notification.
       */
      clickAction?: string;

      /**
       * The notification priority.
       *
       * Note; on devices which have channel support (Android 8.0 (API level 26) +),
       * this value will be ignored. Instead, the channel "importance" level is used.
       */
      priority?:
        | NotificationAndroidPriority.PRIORITY_MIN
        | NotificationAndroidPriority.PRIORITY_LOW
        | NotificationAndroidPriority.PRIORITY_DEFAULT
        | NotificationAndroidPriority.PRIORITY_HIGH
        | NotificationAndroidPriority.PRIORITY_MAX;

      /**
       * Ticker text set on the notification.
       *
       * Ticker text is used for devices with accessibility enabled (e.g. to read out the message).
       */
      ticker?: string;

      /**
       * The visibility of a notification. This value determines how the notification is shown on the users
       * devices (e.g. on the lock-screen).
       */
      visibility?:
        | NotificationAndroidVisibility.VISIBILITY_SECRET
        | NotificationAndroidVisibility.VISIBILITY_PRIVATE
        | NotificationAndroidVisibility.VISIBILITY_PUBLIC;
    };
  }

  /**
   * Represents a critical sound configuration that can be included in the
   * `aps` dictionary of an APNs payload.
   */
  export interface NotificationIOSCriticalSound {
    /**
     * The critical alert flag. Set to `true` to enable the critical alert.
     */
    critical?: boolean;

    /**
     * The name of a sound file in the app's main bundle or in the `Library/Sounds`
     * folder of the app's container directory. Specify the string "default" to play
     * the system sound.
     */
    name: string;

    /**
     * The volume for the critical alert's sound. Must be a value between 0.0
     * (silent) and 1.0 (full volume).
     */
    volume?: number;
  }

  /**
   * The enum representing a notification priority.
   *
   * Note; on devices which have channel support (Android 8.0 (API level 26) +),
   * this value will be ignored. Instead, the channel "importance" level is used.
   *
   * Example:
   *
   * ```js
   * firebase.messaging.NotificationAndroidPriority.PRIORITY_MIN;
   * ```
   */
  export enum NotificationAndroidPriority {
    /**
     The application small icon will not show up in the status bar, or alert the user. The notification
     will be in a collapsed state in the notification shade and placed at the bottom of the list.
     */
    PRIORITY_MIN = -2,

    /**
     * The application small icon will show in the device status bar, however the notification will
     * not alert the user (no sound or vibration). The notification will show in it's expanded state
     * when the notification shade is pulled down.
     */
    PRIORITY_LOW = -1,

    /**
     * When a notification is received, the device smallIcon will appear in the notification shade.
     * When the user pulls down the notification shade, the content of the notification will be shown
     * in it's expanded state.
     */
    PRIORITY_DEFAULT = 0,

    /**
     * Notifications will appear on-top of applications, allowing direct interaction without pulling
     * own the notification shade. This level is used for urgent notifications, such as
     * incoming phone calls, messages etc, which require immediate attention.
     */
    PRIORITY_HIGH = 1,

    /**
     * The priority highest level a notification can be set at.
     */
    PRIORITY_MAX = 2,
  }

  /**
   * The enum representing the visibility of a notification.
   *
   * Example:
   *
   * ```js
   * firebase.messaging.NotificationAndroidVisibility.VISIBILITY_SECRET;
   * ```
   */
  export enum NotificationAndroidVisibility {
    /**
     * Do not reveal any part of this notification on a secure lock-screen.
     */
    VISIBILITY_SECRET = -1,

    /**
     * Show this notification on all lock-screens, but conceal sensitive or private information on secure lock-screens.
     */
    VISIBILITY_PRIVATE = 0,

    /**
     * Show this notification in its entirety on all lock-screens.
     */
    VISIBILITY_PUBLIC = 1,
  }

  /**
   * An interface representing all the available permissions that can be requested by your app via
   * the `requestPermission` API.
   */
  export interface IOSPermissions {
    /**
     * Request permission to display alerts.
     *
     * Defaults to true.
     */
    alert?: boolean;

    /**
     * Request permission for Siri to automatically read out notification messages over AirPods.
     *
     * Defaults to false.
     *
     * @platform ios iOS >= 13
     */
    announcement?: boolean;

    /**
     * Request permission to update the application badge.
     *
     * Defaults to true.
     */
    badge?: boolean;

    /**
     * Request permission for critical alerts.
     *
     * Defaults to false.
     */
    criticalAlert?: boolean;

    /**
     * Request permission to display notifications in a CarPlay environment.
     *
     * Defaults to true.
     */
    carPlay?: boolean;

    /**
     * Request permission to provisionally create non-interrupting notifications.
     *
     * Defaults to false.
     *
     * @platform ios iOS >= 12
     */
    provisional?: boolean;

    /**
     * Request permission to play sounds.
     *
     * Defaults to true.
     */
    sound?: boolean;

    /**
     * Request permission to display a button for in-app notification settings.
     *
     * Default to false
     *
     * @platform ios iOS >= 12
     */
    providesAppNotificationSettings?: boolean;
  }

  /**
   * An enum representing the notification authorization status for this app on the device.
   *
   * Value is truthy if authorized, compare against an exact status (e.g. iOS PROVISIONAL) for a more
   * granular status.
   *
   * Example:
   *
   * ```js
   * firebase.messaging.AuthorizationStatus.NOT_DETERMINED;
   * ```
   */
  export enum AuthorizationStatus {
    /**
     * The app user has not yet chosen whether to allow the application to create notifications. Usually
     * this status is returned prior to the first call of `requestPermission`.
     *
     * @platform ios iOS
     */
    NOT_DETERMINED = -1,

    /**
     * The app is not authorized to create notifications.
     */
    DENIED = 0,

    /**
     * The app is authorized to create notifications.
     */
    AUTHORIZED = 1,

    /**
     * The app is currently authorized to post non-interrupting user notifications
     * @platform ios iOS >= 12
     */
    PROVISIONAL = 2,

    /**
     * The app is authorized to create notifications for a limited amount of time.
     * Used in App Clips.
     * @platform ios iOS >= 14
     */
    EPHEMERAL = 3,
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
     * When a notification from FCM has triggered the application to open from a quit state,
     * this method will return a `RemoteMessage` containing the notification data, or `null` if
     * the app was opened via another method.
     *
     * See `onNotificationOpenedApp` to subscribe to when the notification is opened when the app
     * is in a background state.
     *
     * Beware of this [issue](https://github.com/invertase/react-native-firebase/issues/3469#issuecomment-660121376) when integrating with splash screen modules. If you are using
     * `react-native-splash-screen` we strongly recommend you migrate to `react-native-bootsplash`
     * which is actively maintained and avoids these issues
     */
    getInitialNotification(): Promise<RemoteMessage | null>;

    /**
     * When the app is opened from iOS notifications settings from a quit state,
     * this method will return `true` or `false` if the app was opened via another method.
     *
     * See `setOpenSettingsForNotificationsHandler` to subscribe to when the notificiation is opened when the app
     * is in background state.
     *
     * @ios iOS >= 12
     */
    getDidOpenSettingsForNotification(): Promise<boolean>;

    /**
     * Returns an FCM token for this device. Optionally you can specify a custom options to your own use-case.
     *
     * It is recommended you call this method on app start and update your backend with the new token.
     *
     * On iOS you'll need to register for remote notifications before calling this method, you can do
     * this by calling `registerDeviceForRemoteMessages` or `requestPermission` as part of your app
     * startup. If you have not registered and you call this method you will receive an 'unregistered'
     * error code.
     *
     * #### Example - Default token
     *
     * ```js
     * await firebase.messaging().registerDeviceForRemoteMessages();
     * const fcmToken = await firebase.messaging().getToken();
     *
     * // Update backend (e.g. Firestore) with our token for the user
     * const uid = firebase.auth().currentUser.uid;
     * await firebase.firestore().doc(`users/${uid}`)
     *   .update({
     *     fcmTokens: firebase.firestore.FieldValues.arrayUnion(fcmToken),
     *   });
     * ```
     * @param options Options composite type with all members of `GetTokenOptions` and `NativeTokenOptions`
     */
    getToken(options?: GetTokenOptions & NativeTokenOptions): Promise<string>;

    /**
     * Returns whether the root view is headless or not
     * i.e true if the app was launched in the background (for example, by data-only cloud message)
     *
     * More info: https://rnfirebase.io/messaging/usage#background-application-state
     * @platform ios iOS
     */
    getIsHeadless(): Promise<boolean>;

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
     * @param options Options to override senderId (iOS) and appName (android)
     */
    deleteToken(options?: NativeTokenOptions): Promise<void>;

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
     * When the user presses a notification displayed via FCM, this listener will be called if the app
     * has opened from a background state.
     *
     * See `getInitialNotification` to see how to watch for when a notification opens the app from a
     * quit state.
     *
     * Beware of this [issue](https://github.com/invertase/react-native-firebase/issues/3469#issuecomment-660121376) when integrating with splash screen modules. If you are using
     * `react-native-splash-screen` we strongly recommend you migrate to `react-native-bootsplash`
     * which is actively maintained and avoids these issues
     *
     * @param listener Called with a `RemoteMessage` when a notification press opens the application.
     */
    onNotificationOpenedApp(listener: (message: RemoteMessage) => any): () => void;

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
     * Once handled, the promise will resolve with `AuthorizationStatus.AUTHORIZED` if permission was granted.
     *
     * On iOS >= 12, the app will be granted [Provisional Authorization](http://iosbrain.com/blog/2018/07/05/new-in-ios-12-implementing-provisional-authorization-for-quiet-notifications-in-swift/),
     * and will resolve `AuthorizationStatus.AUTHORIZED`. The user will be able to receive FCM payloads and Notifications immediately;
     * but notifications will be displayed silently. The user, through Notification Center, then has the option of upgrading your apps notifications to no longer be silent.
     *
     * > You can safely call this method on Android without platform checks. It's a no-op on Android and will promise resolve `AuthorizationStatus.AUTHORIZED`.
     *
     * #### Example
     *
     * ```js
     * const authorizationStatus = await firebase.messaging().requestPermission();
     * ```
     *
     * @ios
     */
    requestPermission(permissions?: IOSPermissions): Promise<AuthorizationStatus>;
    /**
     * On iOS, if your app wants to receive remote messages from FCM (via APNs), you must explicitly register
     * with APNs if auto-registration has been disabled.
     *
     * > You can safely call this method on Android without platform checks. It's a no-op on Android and will promise resolve `void`.
     *
     * > You can safely call this method multiple times, if the app is already registered then this method resolves immediately.
     *
     * #### Example
     *
     * ```js
     * if (!firebase.messaging().isDeviceRegisteredForRemoteMessages) {
     *   await firebase.messaging().registerDeviceForRemoteMessages();
     * }
     * ```
     */
    registerDeviceForRemoteMessages(): Promise<void>;
    /**
     * Returns a boolean value whether the user has registered for remote notifications via
     * `registerDeviceForRemoteMessages()`.
     *
     * > You can safely access this property on Android without platform checks. Android returns `true` only.
     *
     * #### Example
     *
     * ```js
     * const isDeviceRegisteredForRemoteMessages = firebase.messaging().isDeviceRegisteredForRemoteMessages;
     * ```
     *
     * @platform ios
     */
    isDeviceRegisteredForRemoteMessages: boolean;
    /**
     * Unregisters the app from receiving remote notifications.
     *
     * > You can safely call this method on Android without platform checks. It's a no-op on Android and will promise resolve `void`.
     *
     * #### Example
     *
     * ```js
     * if (firebase.messaging().isDeviceRegisteredForRemoteMessages) {
     *   await firebase.messaging().unregisterDeviceForRemoteMessages();
     * }
     * ```
     *
     * @platform ios
     */
    unregisterDeviceForRemoteMessages(): Promise<void>;

    /**
     * On iOS, it is possible to get the users APNs token. This may be required if you want to send messages to your
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
     *   console.log('User APNs Token:', apnsToken);
     * }
     * ```
     *
     * @platform ios
     */
    getAPNSToken(): Promise<string | null>;

    /**
     * On iOS, This method is used to set the APNs Token received by the application delegate.
     * Note that the token is expected to be a hexadecimal string, as it is an NSData type in
     * the underlying native firebase SDK, and raw data may only be passed as a string if it is
     * hex encoded. Calling code is responsible for correct encoding, you should verify by comparing
     * the results of `getAPNSToken()` with your token parameter to make sure they are equivalent
     *
     * Messaging uses method swizzling to ensure that the APNs token is set automatically.
     * However, if you have disabled swizzling by setting FirebaseAppDelegateProxyEnabled to NO
     * in your app’s Info.plist, you should manually set the APNs token in your application
     * delegate’s application(_:didRegisterForRemoteNotificationsWithDeviceToken:) method.
     *
     * If you would like to set the type of the APNs token, rather than relying on automatic
     * detection, provide a type of either 'prod', 'sandbox'. Omitting the type parameter
     * or specifying 'unknown' will rely on automatic type detection based on provisioning profile.
     *
     * At a native level you may also call objective-c `[FIRMessaging setAPNSToken];` as needed
     *
     * > You can safely call this method on Android without platform checks. It's a no-op on Android and will promise resolve `null`.
     *
     * #### Example
     *
     * ```js
     * let myAPNSToken = someOthermodule.someWayToGetAPNSToken();
     * await firebase.messaging().setAPNSToken(myAPNSToken);
     * ```
     *
     * @param token a hexadecimal string representing your APNS token
     * @param type optional string specifying 'prod', 'sandbox' or 'unknown' token type
     * @platform ios
     */
    setAPNSToken(token: string, type?: string): Promise<void>;

    /**
     * Returns a `AuthorizationStatus` as to whether the user has messaging permission for this app.
     *
     * #### Example
     *
     * ```js
     * const authStatus = await firebase.messaging().hasPermission();
     * if (authStatus === firebase.messaging.AuthorizationStatus.AUTHORIZED) {
     *   // yay
     * }
     *
     * ```
     */
    hasPermission(): Promise<AuthorizationStatus>;

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
     * NOTE: Android only
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
     * const unsubscribe = firebase.messaging().onMessageSent((messageId) => {
     *   console.log('Message has been sent to the FCM server', messageId);
     * });
     *
     * // Unsubscribe from message sent events
     * unsubscribe();
     * ```
     *
     * NOTE: Android only
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
     * const unsubscribe = firebase.messaging().onSendError(({ messageId, error }) => {
     *   console.log('An error occurred when sending a message to FCM', messageId, error);
     * });
     *
     * // Unsubscribe from message sent error events
     * unsubscribe();
     * ```
     *
     * NOTE: Android only
     *
     * @param listener
     */
    onSendError(listener: (evt: SendErrorEvent) => any): () => void;

    /**
     * Set a message handler function which is called when the app is in the background
     * or terminated. In Android, a headless task is created, allowing you to access the React Native environment
     * to perform tasks such as updating local storage, or sending a network request.
     *
     * This method must be called **outside** of your application lifecycle, e.g. alongside your
     * `AppRegistry.registerComponent()` method call at the the entry point of your application code.
     *
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
     */
    setBackgroundMessageHandler(handler: (message: RemoteMessage) => Promise<any>): void;

    /**
     * Set a handler function which is called when the `${App Name} notifications settings`
     * link in iOS settings is clicked.
     *
     * This method must be called **outside** of your application lifecycle, e.g. alongside your
     * `AppRegistry.registerComponent()` method call at the the entry point of your application code.
     *
     * @ios iOS >= 12
     */
    setOpenSettingsForNotificationsHandler(handler: (message: RemoteMessage) => any): void;

    /**
     * Send a new `RemoteMessage` to the FCM server.
     *
     * The promise resolves when the message has been added to the internal queue. Use `onMessageSent()`
     * and `onSendError()` to determine when the message has been sent to the server.
     *
     * #### Example
     *
     * ```js
     * await firebase.messaging().sendMessage({
     *   data: {
     *     loggedIn: Date.now(),
     *     uid: firebase.auth().currentUser.uid,
     *   }
     * });
     * ```
     *
     * NOTE: Android only
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

    /**
     * Sets whether message delivery metrics are exported to BigQuery is enabled or disabled.
     *
     * The value is false by default. Set this to true to allow exporting of message delivery metrics to BigQuery.
     *
     *
     * #### Example
     *
     * ```js
     * // Enable exports of message delivery metrics to BigQuery
     * await firebase.messaging().setDeliveryMetricsExportToBigQuery(true);
     * ```
     *
     * @param enabled A boolean value to enable or disable exporting of message delivery metrics to BigQuery.
     */
    setDeliveryMetricsExportToBigQuery(enabled: boolean): Promise<void>;
    /**
     * Checks if all required APIs exist in the browser.
     *
     * @web
     */
    isSupported(): Promise<boolean>;

    /**
     * Enables or disables Firebase Cloud Messaging message delivery metrics export to BigQuery. By
     * default, message delivery metrics are not exported to BigQuery. Use this method to enable or
     * disable the export at runtime.
     *
     * @web
     */
    experimentalSetDeliveryMetricsExportedToBigQueryEnabled(): void;
  }
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStatics<
  FirebaseMessagingTypes.Module,
  FirebaseMessagingTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  messaging: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { messaging(): FirebaseMessagingTypes.Module };
};

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

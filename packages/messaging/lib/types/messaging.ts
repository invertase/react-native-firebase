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
import {
  AuthorizationStatus as AuthorizationStatusConst,
  NotificationAndroidPriority as NotificationAndroidPriorityConst,
  NotificationAndroidVisibility as NotificationAndroidVisibilityConst,
} from '../statics';

// ============ Types ============

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
  data?: { [key: string]: string | object };

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
   */
  threadId?: string;

  /**
   * Options for features provided by the FCM SDK for Web.
   */
  fcmOptions: FcmOptions;

  /**
   * Priority - android-specific, undefined on non-android platforms, default PRIORITY_UNKNOWN
   */
  priority?: MessagePriority;

  /**
   * Original priority - android-specific, undefined on non-android platforms, default PRIORITY_UNKNOWN
   */
  originalPriority?: MessagePriority;
}

/**
 * Represents the priority of a RemoteMessage
 *
 * Note: this is an android-specific property of RemoteMessages
 */
export enum MessagePriority {
  /**
   * Unknown priority, this will be returned as the default on non-android platforms
   */
  PRIORITY_UNKNOWN = 0,

  /**
   * High priority - Activities may start foreground services if they receive high priority messages
   */
  PRIORITY_HIGH = 1,

  /**
   * Normal priority - Activities have restrictions and may only perform unobtrusive actions on receipt
   */
  PRIORITY_NORMAL = 2,
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
  serviceWorkerRegistration?: any; // ServiceWorkerRegistration is a web API type
}

/**
 * NotificationPayload is an alias for Notification. This is to keep it the same as
 * Firebase Web JS SDK v9 and to make it backwards compatible.
 */
type NotificationPayload = Notification;

export interface Notification {
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
    priority?: NotificationAndroidPriority;

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
    visibility?: NotificationAndroidVisibility;
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
 * The type representing a notification priority.
 *
 * Note; on devices which have channel support (Android 8.0 (API level 26) +),
 * this value will be ignored. Instead, the channel "importance" level is used.
 */
export type NotificationAndroidPriority =
  | -2 // PRIORITY_MIN - The application small icon will not show up in the status bar, or alert the user. The notification will be in a collapsed state in the notification shade and placed at the bottom of the list.
  | -1 // PRIORITY_LOW - The application small icon will show in the device status bar, however the notification will not alert the user (no sound or vibration). The notification will show in it's expanded state when the notification shade is pulled down.
  | 0 // PRIORITY_DEFAULT - When a notification is received, the device smallIcon will appear in the notification shade. When the user pulls down the notification shade, the content of the notification will be shown in it's expanded state.
  | 1 // PRIORITY_HIGH - Notifications will appear on-top of applications, allowing direct interaction without pulling own the notification shade. This level is used for urgent notifications, such as incoming phone calls, messages etc, which require immediate attention.
  | 2; // PRIORITY_MAX - The priority highest level a notification can be set at.

/**
 * The type representing the visibility of a notification.
 */
export type NotificationAndroidVisibility =
  | -1 // VISIBILITY_SECRET - Do not reveal any part of this notification on a secure lock-screen.
  | 0 // VISIBILITY_PRIVATE - Show this notification on all lock-screens, but conceal sensitive or private information on secure lock-screens.
  | 1; // VISIBILITY_PUBLIC - Show this notification in its entirety on all lock-screens.

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
 * A type representing the notification authorization status for this app on the device.
 *
 * Value is truthy if authorized, compare against an exact status (e.g. iOS PROVISIONAL) for a more
 * granular status.
 */
export type AuthorizationStatus =
  | -1 // NOT_DETERMINED - The app user has not yet chosen whether to allow the application to create notifications. Usually this status is returned prior to the first call of `requestPermission`. @platform ios iOS
  | 0 // DENIED - The app is not authorized to create notifications.
  | 1 // AUTHORIZED - The app is authorized to create notifications.
  | 2 // PROVISIONAL - The app is currently authorized to post non-interrupting user notifications @platform ios iOS >= 12
  | 3; // EPHEMERAL - The app is authorized to create notifications for a limited amount of time. Used in App Clips. @platform ios iOS >= 14

/**
 * An event that is received when a message fails to send.
 */
export interface SendErrorEvent {
  /**
   * The id of the message that failed to send
   */
  messageId: string;

  /**
   * A native firebase error that indicates the failure reason.
   */
  error: ReactNativeFirebase.NativeFirebaseError;
}

// ============ Module Interface ============

/**
 * The Firebase Messaging service interface.
 *
 * > This module is available for the default app only.
 */
export interface Messaging extends ReactNativeFirebase.FirebaseModule {
  /** The FirebaseApp this module is associated with */
  app: ReactNativeFirebase.FirebaseApp;

  /**
   * Returns whether messaging auto initialization is enabled or disabled for the device.
   */
  isAutoInitEnabled: boolean;

  /**
   * Sets whether auto initialization for messaging is enabled or disabled.
   *
   * @param enabled A boolean value to enable or disable auto initialization.
   */
  setAutoInitEnabled(enabled: boolean): Promise<void>;

  /**
   * When a notification from FCM has triggered the application to open from a quit state,
   * this method will return a `RemoteMessage` containing the notification data, or `null` if
   * the app was opened via another method.
   */
  getInitialNotification(): Promise<RemoteMessage | null>;

  /**
   * When the app is opened from iOS notifications settings from a quit state,
   * this method will return `true` or `false` if the app was opened via another method.
   *
   * @ios iOS >= 12
   */
  getDidOpenSettingsForNotification(): Promise<boolean>;

  /**
   * Returns whether the root view is headless or not
   * i.e true if the app was launched in the background (for example, by data-only cloud message)
   *
   * @platform ios iOS
   */
  getIsHeadless(): Promise<boolean>;

  /**
   * Returns an FCM token for this device. Optionally you can specify a custom options to your own use-case.
   *
   * @param options Options composite type with all members of `GetTokenOptions` and `NativeTokenOptions`
   */
  getToken(options?: GetTokenOptions & NativeTokenOptions): Promise<string>;

  /**
   * Removes access to an FCM token previously authorized by it's scope. Messages sent by the server
   * to this token will fail.
   *
   * @param options Options to override senderId (iOS) and appName (android)
   */
  deleteToken(options?: NativeTokenOptions): Promise<void>;

  /**
   * When any FCM payload is received, the listener callback is called with a `RemoteMessage`.
   *
   * Returns an unsubscribe function to stop listening for new messages.
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
   * @param listener Called with a `RemoteMessage` when a notification press opens the application.
   */
  onNotificationOpenedApp(listener: (message: RemoteMessage) => any): () => void;

  /**
   * Called when a new registration token is generated for the device. For example, this event can happen when a
   * token expires or when the server invalidates the token.
   *
   * Returns an unsubscribe function to stop listening for token refresh events.
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
   * > You can safely call this method on Android without platform checks. It's a no-op on Android and will promise resolve `AuthorizationStatus.AUTHORIZED`.
   *
   * @ios
   */
  requestPermission(permissions?: IOSPermissions): Promise<AuthorizationStatus>;

  /**
   * On iOS, if your app wants to receive remote messages from FCM (via APNs), you must explicitly register
   * with APNs if auto-registration has been disabled.
   *
   * > You can safely call this method on Android without platform checks. It's a no-op on Android and will promise resolve `void`.
   */
  registerDeviceForRemoteMessages(): Promise<void>;

  /**
   * Returns a boolean value whether the user has registered for remote notifications via
   * `registerDeviceForRemoteMessages()`.
   *
   * > You can safely access this property on Android without platform checks. Android returns `true` only.
   *
   * @platform ios
   */
  isDeviceRegisteredForRemoteMessages: boolean;

  /**
   * Returns whether remote notification delegation to Google Play Services is enabled or disabled.
   *
   * > You can safely access this property on iOS without platform checks. iOS returns `false` only.
   */
  isNotificationDelegationEnabled: boolean;

  /**
   * Returns whether message delivery metrics are exported to BigQuery.
   */
  isDeliveryMetricsExportToBigQueryEnabled: boolean;

  /**
   * Unregisters the app from receiving remote notifications.
   *
   * > You can safely call this method on Android without platform checks. It's a no-op on Android and will promise resolve `void`.
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
   * @platform ios
   */
  getAPNSToken(): Promise<string | null>;

  /**
   * On iOS, This method is used to set the APNs Token received by the application delegate.
   *
   * > You can safely call this method on Android without platform checks. It's a no-op on Android and will promise resolve `null`.
   *
   * @param token a hexadecimal string representing your APNS token
   * @param type optional string specifying 'prod', 'sandbox' or 'unknown' token type
   * @platform ios
   */
  setAPNSToken(token: string, type?: string): Promise<void>;

  /**
   * Returns a `AuthorizationStatus` as to whether the user has messaging permission for this app.
   */
  hasPermission(): Promise<AuthorizationStatus>;

  /**
   * Called when the FCM server deletes pending messages.
   *
   * Returns an unsubscribe function to stop listening for deleted messages.
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
   * NOTE: Android only
   *
   * @param listener
   */
  onSendError(listener: (evt: SendErrorEvent) => any): () => void;

  /**
   * Set a message handler function which is called when the app is in the background
   * or terminated.
   *
   * @param handler called with an argument of type messaging.RemoteMessage that must be async and return a Promise
   */
  setBackgroundMessageHandler(handler: (message: RemoteMessage) => Promise<any>): void;

  /**
   * Set a handler function which is called when the `${App Name} notifications settings`
   * link in iOS settings is clicked.
   *
   * @ios iOS >= 12
   */
  setOpenSettingsForNotificationsHandler(handler: (message: RemoteMessage) => any): void;

  /**
   * Send a new `RemoteMessage` to the FCM server.
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
   * @param topic The topic name.
   */
  subscribeToTopic(topic: string): Promise<void>;

  /**
   * Unsubscribe the device from a topic.
   *
   * @param topic The topic name.
   */
  unsubscribeFromTopic(topic: string): Promise<void>;

  /**
   * Sets whether message delivery metrics are exported to BigQuery is enabled or disabled.
   *
   * @param enabled A boolean value to enable or disable exporting of message delivery metrics to BigQuery.
   */
  setDeliveryMetricsExportToBigQuery(enabled: boolean): Promise<void>;

  /**
   * Sets whether remote notification delegation to Google Play Services is enabled or disabled.
   *
   * @param enabled A boolean value to enable or disable remote notification delegation to Google Play Services.
   */
  setNotificationDelegationEnabled(enabled: boolean): Promise<void>;

  /**
   * Checks if all required APIs exist in the browser.
   *
   * @web
   */
  isSupported(): Promise<boolean>;
}

// ============ Statics Interface ============

/**
 * Static properties available on firebase.messaging
 */

export interface Statics {
  SDK_VERSION: string;
  AuthorizationStatus: typeof AuthorizationStatusConst;
  NotificationAndroidPriority: typeof NotificationAndroidPriorityConst;
  NotificationAndroidVisibility: typeof NotificationAndroidVisibilityConst;
}

// ============ Module Augmentation ============
/* eslint-disable @typescript-eslint/no-namespace */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    interface Module {
      messaging: FirebaseModuleWithStaticsAndApp<Messaging, Statics>;
    }
    interface FirebaseApp {
      messaging(): Messaging;
    }
  }
}

// ============ Backwards Compatibility Namespace ============

/* eslint-disable @typescript-eslint/no-namespace */
type _Messaging = Messaging;
type _MessagingStatics = Statics;
type _RemoteMessage = RemoteMessage;
type _MessagePriority = MessagePriority;
type _FcmOptions = FcmOptions;
type _NativeTokenOptions = NativeTokenOptions;
type _GetTokenOptions = GetTokenOptions;
type _Notification = Notification;
type _NotificationPayload = NotificationPayload;
type _NotificationIOSCriticalSound = NotificationIOSCriticalSound;
type _NotificationAndroidPriority = NotificationAndroidPriority;
type _NotificationAndroidVisibility = NotificationAndroidVisibility;
type _IOSPermissions = IOSPermissions;
type _AuthorizationStatus = AuthorizationStatus;
type _SendErrorEvent = SendErrorEvent;

export namespace FirebaseMessagingTypes {
  export type Module = _Messaging;
  export type Statics = _MessagingStatics;
  export type RemoteMessage = _RemoteMessage;
  export type MessagePriority = _MessagePriority;
  export type FcmOptions = _FcmOptions;
  export type NativeTokenOptions = _NativeTokenOptions;
  export type GetTokenOptions = _GetTokenOptions;
  export type Notification = _Notification;
  export type NotificationPayload = _NotificationPayload;
  export type NotificationIOSCriticalSound = _NotificationIOSCriticalSound;
  export type NotificationAndroidPriority = _NotificationAndroidPriority;
  export type NotificationAndroidVisibility = _NotificationAndroidVisibility;
  export type IOSPermissions = _IOSPermissions;
  export type AuthorizationStatus = _AuthorizationStatus;
  export type SendErrorEvent = _SendErrorEvent;
}
/* eslint-enable @typescript-eslint/no-namespace */

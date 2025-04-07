import { FirebaseMessagingTypes } from '..';
import { ReactNativeFirebase } from '@react-native-firebase/app';

import Messaging = FirebaseMessagingTypes.Module;
import FirebaseApp = ReactNativeFirebase.FirebaseApp;

export const AuthorizationStatus = FirebaseMessagingTypes.AuthorizationStatus;
export const NotificationAndroidPriority = FirebaseMessagingTypes.NotificationAndroidPriority;
export const NotificationAndroidVisibility = FirebaseMessagingTypes.NotificationAndroidVisibility;

/**
 * Returns a Messaging instance for the given app.
 * @param app - The Firebase app instance. Optional.
 * @returns A Messaging instance.
 */
export function getMessaging(app?: FirebaseApp): Messaging;

/**
 * Removes access to an FCM token previously authorized by its scope.
 * Messages sent by the server to this token will fail.
 * @param messaging - Messaging instance.
 * @param tokenOptions - Options to override senderId (iOS) and projectId (Android).
 * @returns A promise that resolves when the token is deleted.
 */
export function deleteToken(
  messaging: Messaging,
  tokenOptions?: FirebaseMessagingTypes.NativeTokenOptions,
): Promise<void>;

/**
 * Returns an FCM token for this device. Optionally, you can specify custom options for your own use case.
 * @param messaging - Messaging instance.
 * @param options - Options to override senderId (iOS) and appName.
 * @returns A promise that resolves with the FCM token.
 */
export function getToken(
  messaging: Messaging,
  options?: FirebaseMessagingTypes.GetTokenOptions & FirebaseMessagingTypes.NativeTokenOptions,
): Promise<string>;

/**
 * When any FCM payload is received, the listener callback is called with a `RemoteMessage`.
 * This subscriber method is only called when the app is active (in the foreground).
 * @param messaging - Messaging instance.
 * @param listener - Called with a `RemoteMessage` when a new FCM payload is received from the server.
 * @returns A function to unsubscribe from the message listener.
 */
export function onMessage(
  messaging: Messaging,
  listener: (message: FirebaseMessagingTypes.RemoteMessage) => any,
): () => void;

/**
 * When the user presses a notification displayed via FCM, this listener will be called if the app
 * has opened from a background state.
 * @param messaging - Messaging instance.
 * @param listener - Called with a `RemoteMessage` when a notification press opens the application.
 * @returns A function to unsubscribe from the notification opened listener.
 */
export function onNotificationOpenedApp(
  messaging: Messaging,
  listener: (message: FirebaseMessagingTypes.RemoteMessage) => any,
): () => void;

/**
 * Called when a new registration token is generated for the device. This event can happen when a
 * token expires or when the server invalidates the token.
 * This subscriber method is only called when the app is active (in the foreground).
 * @param messaging - Messaging instance.
 * @param listener - Called with an FCM token when the token is refreshed.
 * @returns A function to unsubscribe from the token refresh listener.
 */
export function onTokenRefresh(messaging: Messaging, listener: (token: string) => any): () => void;

/**
 * On iOS, messaging permission must be requested by the current application before messages can
 * be received or sent.
 * @param messaging - Messaging instance.
 * @param iosPermissions - All the available permissions for iOS that can be requested.
 * @returns A promise that resolves with the authorization status.
 */
export function requestPermission(
  messaging: Messaging,
  iosPermissions?: FirebaseMessagingTypes.IOSPermissions,
): Promise<FirebaseMessagingTypes.AuthorizationStatus>;

/**
 * Returns whether messaging auto initialization is enabled or disabled for the device.
 * @param messaging - Messaging instance.
 * @returns A boolean indicating whether auto initialization is enabled.
 */
export function isAutoInitEnabled(messaging: Messaging): boolean;

/**
 * Sets whether messaging auto initialization is enabled or disabled for the device.
 * @param messaging - Messaging instance.
 * @param enabled - A boolean value to enable or disable auto initialization.
 * @returns A promise that resolves when the setting is updated.
 */
export function setAutoInitEnabled(messaging: Messaging, enabled: boolean): Promise<void>;

/**
 * Sets whether remote notification delegation to Google Play Services is enabled or disabled.
 *
 * The value is false by default. Set this to true to allow remote notification delegation.
 *
 * Warning: this will disable notification handlers on Android, and on iOS it has no effect
 *
 * @param messaging - Messaging instance.
 * @param enabled A boolean value to enable or disable remote notification delegation to Google Play Services.
 */
export function setNotificationDelegationEnabled(
  messaging: Messaging,
  enabled: boolean,
): Promise<void>;

/**
 * Gets whether remote notification delegation to Google Play Services is enabled or disabled.
 *
 * @param messaging - Messaging instance.
 * @returns enabled A boolean value indicatign if remote notification delegation to Google Play Services is enabled.
 */
export function istNotificationDelegationEnabled(messaging: Messaging): Promise<boolean>;

/**
 * When a notification from FCM has triggered the application to open from a quit state,
 * this method will return a `RemoteMessage` containing the notification data, or `null` if
 * the app was opened via another method.
 * @param messaging - Messaging instance.
 * @returns A promise that resolves with the initial notification or null.
 */
export function getInitialNotification(
  messaging: Messaging,
): Promise<FirebaseMessagingTypes.RemoteMessage | null>;

/**
 * When the app is opened from iOS notifications settings from a quit state,
 * this method will return `true` or `false` if the app was opened via another method.
 * @param messaging - Messaging instance.
 * @returns A promise that resolves with a boolean indicating if the app was opened from settings.
 */
export function getDidOpenSettingsForNotification(messaging: Messaging): Promise<boolean>;

/**
 * Returns whether the root view is headless or not
 * i.e. true if the app was launched in the background (for example, by data-only cloud message).
 * @param messaging - Messaging instance.
 * @returns A promise that resolves with a boolean indicating if the app is headless.
 */
export function getIsHeadless(messaging: Messaging): Promise<boolean>;

/**
 * On iOS, if your app wants to receive remote messages from FCM (via APNs), you must explicitly register
 * with APNs if auto-registration has been disabled.
 * @param messaging - Messaging instance.
 * @returns A promise that resolves when the device is registered.
 */
export function registerDeviceForRemoteMessages(messaging: Messaging): Promise<void>;

/**
 * Returns a boolean value whether the user has registered for remote notifications via
 * `registerDeviceForRemoteMessages()`. For iOS. Android always returns `true`.
 * @param messaging - Messaging instance.
 * @returns A boolean indicating if the device is registered for remote messages.
 */
export function isDeviceRegisteredForRemoteMessages(messaging: Messaging): boolean;

/**
 * Unregisters the app from receiving remote notifications.
 * @param messaging - Messaging instance.
 * @returns A promise that resolves when the device is unregistered.
 */
export function unregisterDeviceForRemoteMessages(messaging: Messaging): Promise<void>;

/**
 * On iOS, it is possible to get the users APNs token. This may be required if you want to send messages to your
 * iOS devices without using the FCM service.
 * @param messaging - Messaging instance.
 * @returns A promise that resolves with the APNs token or null.
 */
export function getAPNSToken(messaging: Messaging): Promise<string | null>;

/**
 * On iOS, This method is used to set the APNs Token received by the application delegate.
 * Note that the token is expected to be a hexadecimal string, as it is an NSData type in
 * the underlying native firebase SDK, and raw data may only be passed as a string if it is
 * hex encoded. Calling code is responsible for correct encoding, you should verify by comparing
 * the results of `getAPNSToken()` with your token parameter to make sure they are equivalent.
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
 * At a native level you may also call objective-c `[FIRMessaging setAPNSToken];` as needed.
 *
 * @param messaging - Messaging instance.
 * @param token - A hexadecimal string representing your APNs token.
 * @param type - Optional. A string specifying 'prod', 'sandbox' or 'unknown' token type.
 * @returns A promise that resolves when the APNs token is set.
 */
export function setAPNSToken(messaging: Messaging, token: string, type?: string): Promise<void>;

/**
 * Returns a `AuthorizationStatus` as to whether the user has messaging permission for this app.
 * @param messaging - Messaging instance.
 * @returns A promise that resolves with the authorization status.
 */
export function hasPermission(
  messaging: Messaging,
): Promise<FirebaseMessagingTypes.AuthorizationStatus>;

/**
 * Called when the FCM server deletes pending messages.
 * @param messaging - Messaging instance.
 * @param listener - Called when the FCM deletes pending messages.
 * @returns A function to unsubscribe from the deleted messages listener.
 */
export function onDeletedMessages(messaging: Messaging, listener: () => void): () => void;

/**
 * When sending a `RemoteMessage`, this listener is called when the message has been sent to FCM.
 * @param messaging - Messaging instance.
 * @param listener - Called when the FCM sends the remote message to FCM.
 * @returns A function to unsubscribe from the message sent listener.
 */
export function onMessageSent(
  messaging: Messaging,
  listener: (messageId: string) => any,
): () => void;

/**
 * When sending a `RemoteMessage`, this listener is called when an error is thrown and the
 * message could not be sent.
 * @param messaging - Messaging instance.
 * @param listener - Called when the FCM sends the remote message to FCM.
 * @returns A function to unsubscribe from the send error listener.
 */
export function onSendError(
  messaging: Messaging,
  listener: (evt: FirebaseMessagingTypes.SendErrorEvent) => any,
): () => void;

/**
 * Set a message handler function which is called when the app is in the background
 * or terminated. In Android, a headless task is created, allowing you to access the React Native environment
 * to perform tasks such as updating local storage, or sending a network request.
 * @param messaging - Messaging instance.
 * @param handler - Called when a message is sent and the application is in a background or terminated state.
 * @returns {void}
 */
export function setBackgroundMessageHandler(
  messaging: Messaging,
  handler: (message: FirebaseMessagingTypes.RemoteMessage) => Promise<any>,
): void;

/**
 * Set a handler function which is called when the `${App Name} notifications settings`
 * link in iOS settings is clicked.
 * @param messaging - Messaging instance.
 * @param handler - Called when link in iOS settings is clicked.
 * @returns {void}
 */
export function setOpenSettingsForNotificationsHandler(
  messaging: Messaging,
  handler: (message: FirebaseMessagingTypes.RemoteMessage) => any,
): void;

/**
 * Send a new `RemoteMessage` to the FCM server.
 * @param messaging - Messaging instance.
 * @param message - A `RemoteMessage` interface.
 * @returns A promise that resolves when the message is sent.
 */
export function sendMessage(
  messaging: Messaging,
  message: FirebaseMessagingTypes.RemoteMessage,
): Promise<void>;

/**
 * Apps can subscribe to a topic, which allows the FCM server to send targeted messages to only those
 * devices subscribed to that topic.
 * @param messaging - Messaging instance.
 * @param topic - The topic name.
 * @returns A promise that resolves when the subscription is complete.
 */
export function subscribeToTopic(messaging: Messaging, topic: string): Promise<void>;

/**
 * Unsubscribe the device from a topic.
 * @param messaging - Messaging instance.
 * @param topic - The topic name.
 * @returns A promise that resolves when the unsubscription is complete.
 */
export function unsubscribeFromTopic(messaging: Messaging, topic: string): Promise<void>;

/**
 * Returns a boolean whether message delivery metrics are exported to BigQuery.
 * @param messaging - Messaging instance.
 * @returns A boolean indicating if message delivery metrics are exported to BigQuery.
 */
export function isDeliveryMetricsExportToBigQueryEnabled(messaging: Messaging): boolean;

/**
 * Checks if all required APIs exist in the browser.
 * @param messaging - Messaging instance.
 * @returns A boolean indicating if the APIs are supported.
 */
export function isSupported(messaging: Messaging): boolean;

/**
 * Sets whether message delivery metrics are exported to BigQuery is enabled or disabled.
 * The value is false by default. Set this to true to allow exporting of message delivery metrics to BigQuery.
 * @param messaging - Messaging instance.
 * @param enabled - A boolean value to enable or disable exporting of message delivery metrics to BigQuery.
 * @returns A promise that resolves when the setting is updated.
 */
export function experimentalSetDeliveryMetricsExportedToBigQueryEnabled(
  messaging: Messaging,
  enabled: boolean,
): Promise<void>;

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

import { getApp } from '@react-native-firebase/app';
import { withModularFlag } from '@react-native-firebase/app/dist/module/common';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type {
  Messaging,
  RemoteMessage,
  NativeTokenOptions,
  GetTokenOptions,
  IOSPermissions,
  AuthorizationStatus,
  SendErrorEvent,
} from './types/messaging';
import type { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Returns a Messaging instance for the given app.
 * @param app - FirebaseApp. Optional.
 * @returns Messaging instance
 */
export function getMessaging(app?: ReactNativeFirebase.FirebaseApp): Messaging {
  if (app) {
    return getApp(app.name).messaging();
  }

  return getApp().messaging();
}

/**
 * Removes access to an FCM token previously authorized by its scope.
 * Messages sent by the server to this token will fail.
 * @param messaging - Messaging instance.
 * @param tokenOptions - Options to override senderId (iOS) and projectId (Android).
 * @returns Promise that resolves when the token is deleted.
 */
export function deleteToken(
  messaging: Messaging,
  tokenOptions?: NativeTokenOptions,
): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.deleteToken.call(messaging, tokenOptions, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns an FCM token for this device. Optionally, you can specify custom options for your own use case.
 * @param messaging - Messaging instance.
 * @param options - Options to override senderId (iOS) and appName.
 * @returns Promise that resolves with the FCM token.
 */
export function getToken(
  messaging: Messaging,
  options?: GetTokenOptions & NativeTokenOptions,
): Promise<string> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.getToken.call(messaging, options, MODULAR_DEPRECATION_ARG);
}

/**
 * When any FCM payload is received, the listener callback is called with a `RemoteMessage`.
 * > This subscriber method is only called when the app is active (in the foreground).
 * @param messaging - Messaging instance.
 * @param listener - Called with a `RemoteMessage` when a new FCM payload is received from the server.
 * @returns Function to unsubscribe from the message listener.
 */
export function onMessage(
  messaging: Messaging,
  listener: (message: RemoteMessage) => any,
): () => void {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.onMessage.call(messaging, listener, MODULAR_DEPRECATION_ARG);
}

/**
 * When the user presses a notification displayed via FCM, this listener will be called if the app
 * has opened from a background state.
 * @param messaging - Messaging instance.
 * @param listener - Called with a `RemoteMessage` when a notification press opens the application.
 * @returns Function to unsubscribe from the notification opened listener.
 */
export function onNotificationOpenedApp(
  messaging: Messaging,
  listener: (message: RemoteMessage) => any,
): () => void {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.onNotificationOpenedApp.call(messaging, listener, MODULAR_DEPRECATION_ARG);
}

/**
 * Called when a new registration token is generated for the device. For example, this event can happen when a
 * token expires or when the server invalidates the token.
 * > This subscriber method is only called when the app is active (in the foreground).
 * @param messaging - Messaging instance.
 * @param listener - Called with a FCM token when the token is refreshed.
 * @returns Function to unsubscribe from the token refresh listener.
 */
export function onTokenRefresh(messaging: Messaging, listener: (token: string) => any): () => void {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.onTokenRefresh.call(messaging, listener, MODULAR_DEPRECATION_ARG);
}

/**
 * On iOS, messaging permission must be requested by the current application before messages can
 * be received or sent.
 * @param messaging - Messaging instance.
 * @param iosPermissions - All the available permissions for iOS that can be requested.
 * @returns Promise that resolves with the authorization status.
 */
export function requestPermission(
  messaging: Messaging,
  iosPermissions?: IOSPermissions,
): Promise<AuthorizationStatus> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.requestPermission.call(messaging, iosPermissions, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns whether messaging auto initialization is enabled or disabled for the device.
 * @param messaging - Messaging instance.
 * @returns Boolean indicating whether auto initialization is enabled.
 */
export function isAutoInitEnabled(messaging: Messaging): boolean {
  return withModularFlag(() => messaging.isAutoInitEnabled);
}

/**
 * Sets whether messaging auto initialization is enabled or disabled for the device.
 * @param messaging - Messaging instance.
 * @param enabled - A boolean value to enable or disable auto initialization.
 * @returns Promise that resolves when the setting is updated.
 */
export function setAutoInitEnabled(messaging: Messaging, enabled: boolean): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.setAutoInitEnabled.call(messaging, enabled, MODULAR_DEPRECATION_ARG);
}

/**
 * When a notification from FCM has triggered the application to open from a quit state,
 * this method will return a `RemoteMessage` containing the notification data, or `null` if
 * the app was opened via another method.
 * @param messaging - Messaging instance.
 * @returns Promise that resolves with the initial notification or null.
 */
export function getInitialNotification(messaging: Messaging): Promise<RemoteMessage | null> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.getInitialNotification.call(messaging, MODULAR_DEPRECATION_ARG);
}

/**
 * When the app is opened from iOS notifications settings from a quit state,
 * this method will return `true` or `false` if the app was opened via another method.
 * @param messaging - Messaging instance.
 * @returns Promise that resolves with a boolean indicating if the app was opened from settings.
 */
export function getDidOpenSettingsForNotification(messaging: Messaging): Promise<boolean> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.getDidOpenSettingsForNotification.call(messaging, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns whether the root view is headless or not
 * i.e true if the app was launched in the background (for example, by data-only cloud message)
 * @param messaging - Messaging instance.
 * @returns Promise that resolves with a boolean indicating if the app is headless.
 */
export function getIsHeadless(messaging: Messaging): Promise<boolean> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.getIsHeadless.call(messaging, MODULAR_DEPRECATION_ARG);
}

/**
 * On iOS, if your app wants to receive remote messages from FCM (via APNs), you must explicitly register
 * with APNs if auto-registration has been disabled.
 * @param messaging - Messaging instance.
 * @returns Promise that resolves when the device is registered.
 */
export function registerDeviceForRemoteMessages(messaging: Messaging): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.registerDeviceForRemoteMessages.call(messaging, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a boolean value whether the user has registered for remote notifications via
 * `registerDeviceForRemoteMessages()`. For iOS. Android always returns `true`.
 * @param messaging - Messaging instance.
 * @returns Boolean indicating if the device is registered for remote messages.
 */
export function isDeviceRegisteredForRemoteMessages(messaging: Messaging): boolean {
  return withModularFlag(() => messaging.isDeviceRegisteredForRemoteMessages);
}

/**
 * Unregisters the app from receiving remote notifications.
 * @param messaging - Messaging instance.
 * @returns Promise that resolves when the device is unregistered.
 */
export function unregisterDeviceForRemoteMessages(messaging: Messaging): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.unregisterDeviceForRemoteMessages.call(messaging, MODULAR_DEPRECATION_ARG);
}

/**
 * On iOS, it is possible to get the users APNs token. This may be required if you want to send messages to your
 * iOS devices without using the FCM service.
 * @param messaging - Messaging instance.
 * @returns Promise that resolves with the APNs token or null.
 */
export function getAPNSToken(messaging: Messaging): Promise<string | null> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.getAPNSToken.call(messaging, MODULAR_DEPRECATION_ARG);
}

/**
 * On iOS, This method is used to set the APNs Token received by the application delegate.
 * Note that the token is expected to be a hexadecimal string, as it is an NSData type in
 * the underlying native firebase SDK, and raw data may only be passed as a string if it is
 * hex encoded. Calling code is responsible for correct encoding, you should verify by comparing
 * the results of `getAPNSToken()` with your token parameter to make sure they are equivalent.
 *
 * Messaging uses method swizzling to ensure that the APNs token is set automatically.
 * However, if you have disabled swizzling by setting FirebaseAppDelegateProxyEnabled to NO
 * in your app's Info.plist, you should manually set the APNs token in your application
 * delegate's application(_:didRegisterForRemoteNotificationsWithDeviceToken:) method.
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
 * @returns Promise that resolves when the APNs token is set.
 */
export function setAPNSToken(messaging: Messaging, token: string, type?: string): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.setAPNSToken.call(messaging, token, type, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a `AuthorizationStatus` as to whether the user has messaging permission for this app.
 * @param messaging - Messaging instance.
 * @returns Promise that resolves with the authorization status.
 */
export function hasPermission(messaging: Messaging): Promise<AuthorizationStatus> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.hasPermission.call(messaging, MODULAR_DEPRECATION_ARG);
}

/**
 * Called when the FCM server deletes pending messages.
 * @param messaging - Messaging instance.
 * @param listener - Called when the FCM deletes pending messages.
 * @returns Function to unsubscribe from the deleted messages listener.
 */
export function onDeletedMessages(messaging: Messaging, listener: () => void): () => void {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.onDeletedMessages.call(messaging, listener, MODULAR_DEPRECATION_ARG);
}

/**
 * When sending a `RemoteMessage`, this listener is called when the message has been sent to FCM.
 * @param messaging - Messaging instance.
 * @param listener - Called when the FCM sends the remote message to FCM.
 * @returns Function to unsubscribe from the message sent listener.
 */
export function onMessageSent(
  messaging: Messaging,
  listener: (messageId: string) => any,
): () => void {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.onMessageSent.call(messaging, listener, MODULAR_DEPRECATION_ARG);
}

/**
 * When sending a `RemoteMessage`, this listener is called when an error is thrown and the
 * message could not be sent.
 * @param messaging - Messaging instance.
 * @param listener - Called when the FCM sends the remote message to FCM.
 * @returns Function to unsubscribe from the send error listener.
 */
export function onSendError(
  messaging: Messaging,
  listener: (evt: SendErrorEvent) => any,
): () => void {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.onSendError.call(messaging, listener, MODULAR_DEPRECATION_ARG);
}

/**
 * Set a message handler function which is called when the app is in the background
 * or terminated. In Android, a headless task is created, allowing you to access the React Native environment
 * to perform tasks such as updating local storage, or sending a network request.
 * @param messaging - Messaging instance.
 * @param handler - Called when a message is sent and the application is in a background or terminated state.
 * @returns void
 */
export function setBackgroundMessageHandler(
  messaging: Messaging,
  handler: (message: RemoteMessage) => Promise<any>,
): void {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.setBackgroundMessageHandler.call(messaging, handler, MODULAR_DEPRECATION_ARG);
}

/**
 * Set a handler function which is called when the `${App Name} notifications settings`
 * link in iOS settings is clicked.
 * @param messaging - Messaging instance.
 * @param handler - Called when link in iOS settings is clicked.
 * @returns void
 */
export function setOpenSettingsForNotificationsHandler(
  messaging: Messaging,
  handler: (message: RemoteMessage) => any,
): void {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return (messaging.setOpenSettingsForNotificationsHandler as any).call(
    messaging,
    handler,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Send a new `RemoteMessage` to the FCM server.
 * @param messaging - Messaging instance.
 * @param message - A `RemoteMessage` interface.
 * @returns Promise that resolves when the message is sent.
 */
export function sendMessage(messaging: Messaging, message: RemoteMessage): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.sendMessage.call(messaging, message, MODULAR_DEPRECATION_ARG);
}

/**
 * Apps can subscribe to a topic, which allows the FCM server to send targeted messages to only those
 * devices subscribed to that topic.
 * @param messaging - Messaging instance.
 * @param topic - The topic name.
 * @returns Promise that resolves when the subscription is complete.
 */
export function subscribeToTopic(messaging: Messaging, topic: string): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.subscribeToTopic.call(messaging, topic, MODULAR_DEPRECATION_ARG);
}

/**
 * Unsubscribe the device from a topic.
 * @param messaging - Messaging instance.
 * @param topic - The topic name.
 * @returns Promise that resolves when the unsubscription is complete.
 */
export function unsubscribeFromTopic(messaging: Messaging, topic: string): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.unsubscribeFromTopic.call(messaging, topic, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a boolean whether message delivery metrics are exported to BigQuery.
 * @param messaging - Messaging instance.
 * @returns Boolean indicating if message delivery metrics are exported to BigQuery.
 */
export function isDeliveryMetricsExportToBigQueryEnabled(messaging: Messaging): boolean {
  return withModularFlag(() => messaging.isDeliveryMetricsExportToBigQueryEnabled);
}

/**
 * Returns a boolean whether message delegation is enabled. Android only,
 * always returns false on iOS
 * @param messaging - Messaging instance.
 * @returns Boolean indicating if notification delegation is enabled.
 */
export function isNotificationDelegationEnabled(messaging: Messaging): boolean {
  return withModularFlag(() => messaging.isNotificationDelegationEnabled);
}

/**
 * Sets whether message notification delegation is enabled or disabled.
 * The value is false by default. Set this to true to allow delegation of notification to Google Play Services.
 * Note if true message handlers will not function on Android, and it has no effect on iOS
 * @param messaging - Messaging instance.
 * @param enabled - A boolean value to enable or disable delegation of messages to Google Play Services.
 * @returns Promise that resolves when the setting is updated.
 */
export function setNotificationDelegationEnabled(
  messaging: Messaging,
  enabled: boolean,
): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return (messaging.setNotificationDelegationEnabled as any).call(
    messaging,
    enabled,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Checks if all required APIs exist in the browser.
 * @param messaging - Messaging instance.
 * @returns Promise that resolves with a boolean indicating if the APIs are supported.
 */
export function isSupported(messaging: Messaging): Promise<boolean> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return messaging.isSupported.call(messaging, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets whether message delivery metrics are exported to BigQuery is enabled or disabled.
 * The value is false by default. Set this to true to allow exporting of message delivery metrics to BigQuery.
 * @param messaging - Messaging instance.
 * @param enabled - A boolean value to enable or disable exporting of message delivery metrics to BigQuery.
 * @returns Promise that resolves when the setting is updated.
 */
export function experimentalSetDeliveryMetricsExportedToBigQueryEnabled(
  messaging: Messaging,
  enabled: boolean,
): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is used internally
  return (messaging.setDeliveryMetricsExportToBigQuery as any).call(
    messaging,
    enabled,
    MODULAR_DEPRECATION_ARG,
  );
}

export {
  AuthorizationStatus,
  NotificationAndroidPriority,
  NotificationAndroidVisibility,
} from './statics';

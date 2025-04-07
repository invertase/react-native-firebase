import { getApp } from '@react-native-firebase/app';

/**
 * @typedef {import('..').FirebaseMessagingTypes} FirebaseMessagingTypes
 * @typedef {import('..').FirebaseMessagingTypes.Module} Messaging
 * @typedef {import('..').FirebaseMessagingTypes.RemoteMessage} RemoteMessage
 * @typedef {import('..').FirebaseMessagingTypes.NativeTokenOptions} NativeTokenOptions
 * @typedef {import('..').FirebaseMessagingTypes.GetTokenOptions} GetTokenOptions
 * @typedef {import('..').FirebaseMessagingTypes.IOSPermissions} IOSPermissions
 * @typedef {import('..').FirebaseMessagingTypes.AuthorizationStatus} AuthorizationStatus
 * @typedef {import('..').FirebaseMessagingTypes.SendErrorEvent} SendErrorEvent
 * @typedef {import('@firebase/app').FirebaseApp} FirebaseApp
 */

/**
 * Returns a Messaging instance for the given app.
 * @param {FirebaseApp} [app] - FirebaseApp. Optional.
 * @returns {Messaging}
 */
export function getMessaging(app) {
  if (app) {
    return getApp(app.name).messaging();
  }

  return getApp().messaging();
}

/**
 * Removes access to an FCM token previously authorized by its scope.
 * Messages sent by the server to this token will fail.
 * @param {Messaging} messaging - Messaging instance.
 * @param {NativeTokenOptions} [tokenOptions] - Options to override senderId (iOS) and projectId (Android).
 * @returns {Promise<void>}
 */
export function deleteToken(messaging, tokenOptions) {
  if (tokenOptions != null) {
    return messaging.deleteToken();
  }

  return messaging.deleteToken(tokenOptions);
}

/**
 * Returns an FCM token for this device. Optionally, you can specify custom options for your own use case.
 * @param {Messaging} messaging - Messaging instance.
 * @param {GetTokenOptions & NativeTokenOptions} [options] - Options to override senderId (iOS) and appName.
 * @returns {Promise<string>}
 */
export function getToken(messaging, options) {
  if (options != null) {
    return messaging.getToken();
  }

  return messaging.getToken(options);
}

/**
 * When any FCM payload is received, the listener callback is called with a `RemoteMessage`.
 * > This subscriber method is only called when the app is active (in the foreground).
 * @param {Messaging} messaging - Messaging instance.
 * @param {(message: RemoteMessage) => any} listener - Called with a `RemoteMessage` when a new FCM payload is received from the server.
 * @returns {() => void}
 */
export function onMessage(messaging, listener) {
  return messaging.onMessage(listener);
}

/**
 * When the user presses a notification displayed via FCM, this listener will be called if the app
 * has opened from a background state.
 * @param {Messaging} messaging - Messaging instance.
 * @param {(message: RemoteMessage) => any} listener - Called with a `RemoteMessage` when a notification press opens the application.
 * @returns {() => void}
 */
export function onNotificationOpenedApp(messaging, listener) {
  return messaging.onNotificationOpenedApp(listener);
}

/**
 * Called when a new registration token is generated for the device. For example, this event can happen when a
 * token expires or when the server invalidates the token.
 * > This subscriber method is only called when the app is active (in the foreground).
 * @param {Messaging} messaging - Messaging instance.
 * @param {(token: string) => any} listener - Called with a FCM token when the token is refreshed.
 * @returns {() => void}
 */
export function onTokenRefresh(messaging, listener) {
  return messaging.onTokenRefresh(listener);
}

/**
 * On iOS, messaging permission must be requested by the current application before messages can
 * be received or sent.
 * @param {Messaging} messaging - Messaging instance.
 * @param {IOSPermissions} [iosPermissions] - All the available permissions for iOS that can be requested.
 * @returns {Promise<AuthorizationStatus>}
 */
export function requestPermission(messaging, iosPermissions) {
  return messaging.requestPermission(iosPermissions);
}

/**
 * Returns whether messaging auto initialization is enabled or disabled for the device.
 * @param {Messaging} messaging - Messaging instance.
 * @returns {boolean}
 */
export function isAutoInitEnabled(messaging) {
  return messaging.isAutoInitEnabled;
}

/**
 * Sets whether messaging auto initialization is enabled or disabled for the device.
 * @param {Messaging} messaging - Messaging instance.
 * @param {boolean} enabled - A boolean value to enable or disable auto initialization.
 * @returns {Promise<void>}
 */
export function setAutoInitEnabled(messaging, enabled) {
  return messaging.setAutoInitEnabled(enabled);
}

/**
 * When a notification from FCM has triggered the application to open from a quit state,
 * this method will return a `RemoteMessage` containing the notification data, or `null` if
 * the app was opened via another method.
 * @param {Messaging} messaging - Messaging instance.
 * @returns {Promise<RemoteMessage | null>}
 */
export function getInitialNotification(messaging) {
  return messaging.getInitialNotification();
}

/**
 * When the app is opened from iOS notifications settings from a quit state,
 * this method will return `true` or `false` if the app was opened via another method.
 * @param {Messaging} messaging - Messaging instance.
 * @returns {Promise<boolean>}
 */
export function getDidOpenSettingsForNotification(messaging) {
  return messaging.getDidOpenSettingsForNotification();
}

/**
 * Returns whether the root view is headless or not
 * i.e true if the app was launched in the background (for example, by data-only cloud message)
 * @param {Messaging} messaging - Messaging instance.
 * @returns {Promise<boolean>}
 */
export function getIsHeadless(messaging) {
  return messaging.getIsHeadless();
}

/**
 * On iOS, if your app wants to receive remote messages from FCM (via APNs), you must explicitly register
 * with APNs if auto-registration has been disabled.
 * @param {Messaging} messaging - Messaging instance.
 * @returns {Promise<void>}
 */
export function registerDeviceForRemoteMessages(messaging) {
  return messaging.registerDeviceForRemoteMessages();
}

/**
 * Returns a boolean value whether the user has registered for remote notifications via
 * `registerDeviceForRemoteMessages()`. For iOS. Android always returns `true`.
 * @param {Messaging} messaging - Messaging instance.
 * @returns {boolean}
 */
export function isDeviceRegisteredForRemoteMessages(messaging) {
  return messaging.isDeviceRegisteredForRemoteMessages;
}

/**
 * Unregisters the app from receiving remote notifications.
 * @param {Messaging} messaging - Messaging instance.
 * @returns {Promise<void>}
 */
export function unregisterDeviceForRemoteMessages(messaging) {
  return messaging.unregisterDeviceForRemoteMessages();
}

/**
 * On iOS, it is possible to get the users APNs token. This may be required if you want to send messages to your
 * iOS devices without using the FCM service.
 * @param {Messaging} messaging - Messaging instance.
 * @returns {Promise<string | null>}
 */
export function getAPNSToken(messaging) {
  return messaging.getAPNSToken();
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
 * in your app’s Info.plist, you should manually set the APNs token in your application
 * delegate’s application(_:didRegisterForRemoteNotificationsWithDeviceToken:) method.
 *
 * If you would like to set the type of the APNs token, rather than relying on automatic
 * detection, provide a type of either 'prod', 'sandbox'. Omitting the type parameter
 * or specifying 'unknown' will rely on automatic type detection based on provisioning profile.
 *
 * At a native level you may also call objective-c `[FIRMessaging setAPNSToken];` as needed.
 *
 * @param {Messaging} messaging - Messaging instance.
 * @param {string} token - A hexadecimal string representing your APNs token.
 * @param {string} [type] - Optional. A string specifying 'prod', 'sandbox' or 'unknown' token type.
 * @returns {Promise<void>}
 */
export function setAPNSToken(messaging, token, type) {
  return messaging.setAPNSToken(token, type);
}

/**
 * Returns a `AuthorizationStatus` as to whether the user has messaging permission for this app.
 * @param {Messaging} messaging - Messaging instance.
 * @returns {Promise<AuthorizationStatus>}
 */
export function hasPermission(messaging) {
  return messaging.hasPermission();
}

/**
 * Called when the FCM server deletes pending messages.
 * @param {Messaging} messaging - Messaging instance.
 * @param {() => void} listener - Called when the FCM deletes pending messages.
 * @returns {() => void}
 */
export function onDeletedMessages(messaging, listener) {
  return messaging.onDeletedMessages(listener);
}

/**
 * When sending a `RemoteMessage`, this listener is called when the message has been sent to FCM.
 * @param {Messaging} messaging - Messaging instance.
 * @param {(messageId: string) => any} listener - Called when the FCM sends the remote message to FCM.
 * @returns {() => void}
 */
export function onMessageSent(messaging, listener) {
  return messaging.onMessageSent(listener);
}

/**
 * When sending a `RemoteMessage`, this listener is called when the message has been sent to FCM.
 * @param {Messaging} messaging - Messaging instance.
 * @param {(evt: SendErrorEvent) => any} listener - Called when the FCM sends the remote message to FCM.
 * @returns {() => void}
 */
export function onSendError(messaging, listener) {
  return messaging.onSendError(listener);
}

/**
 * Set a message handler function which is called when the app is in the background
 * or terminated. In Android, a headless task is created, allowing you to access the React Native environment
 * to perform tasks such as updating local storage, or sending a network request.
 * @param {Messaging} messaging - Messaging instance.
 * @param {(message: RemoteMessage) => Promise<any>} handler - Called when a message is sent and the application is in a background or terminated state.
 * @returns {void}
 */
export function setBackgroundMessageHandler(messaging, handler) {
  return messaging.setBackgroundMessageHandler(handler);
}

/**
 * Set a handler function which is called when the `${App Name} notifications settings`
 * link in iOS settings is clicked.
 * @param {Messaging} messaging - Messaging instance.
 * @param {(message: RemoteMessage) => any} handler - Called when link in iOS settings is clicked.
 * @returns {void}
 */
export function setOpenSettingsForNotificationsHandler(messaging, handler) {
  return messaging.setOpenSettingsForNotificationsHandler(handler);
}

/**
 * Send a new `RemoteMessage` to the FCM server.
 * @param {Messaging} messaging - Messaging instance.
 * @param {RemoteMessage} message - A `RemoteMessage` interface.
 * @returns {Promise<void>}
 */
export function sendMessage(messaging, message) {
  return messaging.sendMessage(message);
}

/**
 * Apps can subscribe to a topic, which allows the FCM server to send targeted messages to only those
 * devices subscribed to that topic.
 * @param {Messaging} messaging - Messaging instance.
 * @param {string} topic - The topic name.
 * @returns {Promise<void>}
 */
export function subscribeToTopic(messaging, topic) {
  return messaging.subscribeToTopic(topic);
}

/**
 * Unsubscribe the device from a topic.
 * @param {Messaging} messaging - Messaging instance.
 * @param {string} topic - The topic name.
 * @returns {Promise<void>}
 */
export function unsubscribeFromTopic(messaging, topic) {
  return messaging.unsubscribeFromTopic(topic);
}

/**
 * Returns a boolean whether message delivery metrics are exported to BigQuery.
 * @param {Messaging} messaging - Messaging instance.
 * @returns {boolean}
 */
export function isDeliveryMetricsExportToBigQueryEnabled(messaging) {
  return messaging.isDeliveryMetricsExportToBigQueryEnabled;
}

/**
 * Returns a boolean whether message delegation is enabled. Android only,
 * always returns false on iOS
 * @param {Messaging} messaging - Messaging instance.
 * @returns {boolean}
 */
export function isNotificationDelegationEnabled(messaging) {
  return messaging.isNotificationDelegationEnabled;
}

/**
 * Sets whether message notification delegation is enabled or disabled.
 * The value is false by default. Set this to true to allow delegation of notification to Google Play Services.
 * Note if true message handlers will not function on Android, and it has no effect on iOS
 * @param {Messaging} messaging - Messaging instance.
 * @param {boolean} enabled - A boolean value to enable or disable delegation of messages to Google Play Services.
 * @returns {Promise<void>}
 */
export function setNotificationDelegationEnabled(messaging, enabled) {
  return messaging.setNotificationDelegationEnabled(enabled);
}

/**
 * Checks if all required APIs exist in the browser.
 * @param {Messaging} messaging - Messaging instance.
 * @returns {boolean}
 */
export function isSupported(messaging) {
  return messaging.isSupported();
}

/**
 * Sets whether message delivery metrics are exported to BigQuery is enabled or disabled.
 * The value is false by default. Set this to true to allow exporting of message delivery metrics to BigQuery.
 * @param {Messaging} messaging - Messaging instance.
 * @param {boolean} enabled - A boolean value to enable or disable exporting of message delivery metrics to BigQuery.
 * @returns {Promise<void>}
 */
export function experimentalSetDeliveryMetricsExportedToBigQueryEnabled(messaging, enabled) {
  return messaging.setDeliveryMetricsExportToBigQuery(enabled);
}

export {
  AuthorizationStatus,
  NotificationAndroidPriority,
  NotificationAndroidVisibility,
} from '../statics';

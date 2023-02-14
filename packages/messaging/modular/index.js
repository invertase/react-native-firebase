import { firebase } from '..';

/**
 * Returns a Messaging instance for the given app.
 * @param app - FirebaseApp. Optional.
 * @returns {Messaging}
 */
export function getMessaging(app) {
  if (app) {
    return firebase.app(app.name).messaging();
  }

  return firebase.app().messaging();
}

/**
 * Removes access to an FCM token previously authorized by it's scope.
 * Messages sent by the server to this token will fail.
 * @param messaging Messaging instance.
 * @param tokenOptions Options to override senderId (iOS) and projectId (Android).
 * @returns {Promise<void>}
 */
export function deleteToken(messaging, tokenOptions) {
  if (tokenOptions != null) {
    return messaging.deleteToken();
  }

  return messaging.deleteToken(tokenOptions);
}

/**
 * Returns an FCM token for this device. Optionally you can specify a custom options to your own use-case.
 * @param messaging Messaging instance.
 * @param options Options to override senderId (iOS) and appName
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
 * @param messaging Messaging instance.
 * @param listener Called with a `RemoteMessage` when a new FCM payload is received from the server.
 * @returns {Function}
 */
export function onMessage(messaging, nextOrObserver) {
  return messaging.onMessage(nextOrObserver);
}

/**
 * When the user presses a notification displayed via FCM, this listener will be called if the app
 * has opened from a background state.
 * @param messaging Messaging instance.
 * @param listener Called with a `RemoteMessage` when a notification press opens the application.
 * @returns {Function}
 */
export function onNotificationOpenedApp(messaging, listener) {
  return messaging.onNotificationOpenedApp(listener);
}

/**
 * Called when a new registration token is generated for the device. For example, this event can happen when a
 * token expires or when the server invalidates the token.
 * > This subscriber method is only called when the app is active (in the foreground).
 * @param messaging Messaging instance.
 * @param listener Called with a FCM token when the token is refreshed.
 * @returns {Function}
 */
export function onTokenRefresh(messaging, listener) {
  return messaging.onTokenRefresh(listener);
}

/**
 * On iOS, messaging permission must be requested by the current application before messages can
 * be received or sent.
 * @param messaging Messaging instance.
 * @param iosPermissions All the available permissions for iOS that can be requested
 * @returns {Promise<AuthorizationStatus>}
 */
export function requestPermission(messaging, iosPermissions) {
  return messaging.requestPermission(iosPermissions);
}

/**
 * Returns whether messaging auto initialization is enabled or disabled for the device.
 * @param messaging Messaging instance.
 * @returns {boolean}
 */
export function isAutoInitEnabled(messaging) {
  return messaging.isAutoInitEnabled;
}

/**
 * Returns whether messaging auto initialization is enabled or disabled for the device.
 * @param messaging Messaging instance.
 * @param enabled A boolean value to enable or disable auto initialization.
 * @returns {Promise<boolean>}
 */
export function setAutoInitEnabled(messaging, enabled) {
  return messaging.setAutoInitEnabled(enabled);
}

/**
 * When a notification from FCM has triggered the application to open from a quit state,
 * this method will return a `RemoteMessage` containing the notification data, or `null` if
 * the app was opened via another method.
 * @param messaging Messaging instance.
 * @returns {Promise<RemoteMessage | null>}
 */
export function getInitialNotification(messaging) {
  return messaging.getInitialNotification();
}

/**
 * When the app is opened from iOS notifications settings from a quit state,
 * this method will return `true` or `false` if the app was opened via another method.
 * @param messaging Messaging instance.
 * @returns {Promise<boolean>}
 */
export function getDidOpenSettingsForNotification(messaging) {
  return messaging.getDidOpenSettingsForNotification();
}

/**
 * Returns whether the root view is headless or not
 * i.e true if the app was launched in the background (for example, by data-only cloud message)
 * @param messaging Messaging instance.
 * @returns {Promise<boolean>}
 */
export function getIsHeadless(messaging) {
  return messaging.getIsHeadless();
}

/**
 * On iOS, if your app wants to receive remote messages from FCM (via APNs), you must explicitly register
 * with APNs if auto-registration has been disabled.
 * @param messaging Messaging instance.
 * @returns {Promise<void>}
 */
export function registerDeviceForRemoteMessages(messaging) {
  return messaging.registerDeviceForRemoteMessages();
}

/**
 * Returns a boolean value whether the user has registered for remote notifications via
 * `registerDeviceForRemoteMessages()`. For iOS. Android always returns `true`
 * @param messaging Messaging instance.
 * @returns {boolean}
 */
export function isDeviceRegisteredForRemoteMessages(messaging) {
  return messaging.isDeviceRegisteredForRemoteMessages;
}

/**
 * Unregisters the app from receiving remote notifications.
 * @param messaging Messaging instance.
 * @returns {Promise<void>}
 */
export function unregisterDeviceForRemoteMessages(messaging) {
  return messaging.unregisterDeviceForRemoteMessages();
}

/**
 * On iOS, it is possible to get the users APNs token. This may be required if you want to send messages to your
 * iOS devices without using the FCM service.
 * @param messaging Messaging instance.
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
 * @param messaging Messaging instance.
 * @param {string} token a hexadecimal string representing your APNS token
 * @param {string?} type specifying 'prod', 'sandbox' or 'unknown' token type
 * @returns {Promise<void>}
 */
export function setAPNSToken(messaging, token, type) {
  return messaging.setAPNSToken(token, type);
}

/**
 * Returns a `AuthorizationStatus` as to whether the user has messaging permission for this app.
 * @param messaging Messaging instance.
 * @returns {Promise<AuthorizationStatus>}
 */
export function hasPermission(messaging) {
  return messaging.hasPermission();
}

/**
 * Called when the FCM server deletes pending messages.
 * @param messaging Messaging instance.
 * @param listener Called when the FCM deletes pending messages.
 * @returns {Function}
 */
export function onDeletedMessages(messaging, listener) {
  return messaging.onDeletedMessages(listener);
}

/**
 * When sending a `RemoteMessage`, this listener is called when the message has been sent to FCM.
 * @param messaging Messaging instance.
 * @param listener Called when the FCM sends the remote message to FCM.
 * @returns {Function}
 */
export function onMessageSent(messaging, listener) {
  return messaging.onMessageSent(listener);
}

/**
 * When sending a `RemoteMessage`, this listener is called when the message has been sent to FCM.
 * @param messaging Messaging instance.
 * @param listener Called when the FCM sends the remote message to FCM.
 * @returns {Function}
 */
export function onSendError(messaging, listener) {
  return messaging.onSendError(listener);
}

/**
 * Set a message handler function which is called when the app is in the background
 * or terminated. In Android, a headless task is created, allowing you to access the React Native environment
 * to perform tasks such as updating local storage, or sending a network request.
 * @param messaging Messaging instance.
 * @param handler Called when a message is sent and the application is in a background or terminated state.
 * @returns {void}
 */
export function setBackgroundMessageHandler(messaging, handler) {
  return messaging.setBackgroundMessageHandler(handler);
}

/**
 * Set a handler function which is called when the `${App Name} notifications settings`
 * link in iOS settings is clicked.
 * @param messaging Messaging instance.
 * @param handler Called when link in iOS settings is clicked
 * @returns {void}
 */
export function setOpenSettingsForNotificationsHandler(messaging, handler) {
  return messaging.setOpenSettingsForNotificationsHandler(handler);
}

/**
 * Send a new `RemoteMessage` to the FCM server.
 * @param messaging Messaging instance.
 * @param message A `RemoteMessage` interface.
 * @returns {Promise<void>}
 */
export function sendMessage(messaging, message) {
  return messaging.sendMessage(message);
}

/**
 * Apps can subscribe to a topic, which allows the FCM server to send targeted messages to only those
 * devices subscribed to that topic.
 * @param messaging Messaging instance.
 * @param topic The topic name.
 * @returns {Promise<void>}
 */
export function subscribeToTopic(messaging, topic) {
  return messaging.subscribeToTopic(topic);
}

/**
 * Unsubscribe the device from a topic.
 * @param messaging Messaging instance.
 * @param topic The topic name.
 * @returns {Promise<void>}
 */
export function unsubscribeFromTopic(messaging, topic) {
  return messaging.unsubscribeFromTopic(topic);
}

/**
 * Returns a boolean whether message delivery metrics are exported to BigQuery.
 * @param messaging Messaging instance.
 * @returns {boolean}
 */
export function isDeliveryMetricsExportToBigQueryEnabled(messaging) {
  return messaging.isDeliveryMetricsExportToBigQueryEnabled;
}

/**
 * Checks if all required APIs exist in the browser.
 * @param messaging Messaging instance.
 * @returns {boolean}
 */
export function isSupported(messaging) {
  return messaging.isSupported();
}

/**
 * Sets whether message delivery metrics are exported to BigQuery is enabled or disabled.
 * The value is false by default. Set this to true to allow exporting of message delivery metrics to BigQuery.
 * @param messaging Messaging instance.
 * @param enabled A boolean value to enable or disable exporting of message delivery metrics to BigQuery.
 * @returns {Promise<void>}
 */
export function experimentalSetDeliveryMetricsExportedToBigQueryEnabled(messaging, enable) {
  return messaging.setDeliveryMetricsExportToBigQuery(enable);
}

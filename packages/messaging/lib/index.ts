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
  hasOwnProperty,
  isAndroid,
  isBoolean,
  isFunction,
  isIOS,
  isObject,
  isString,
  isUndefined,
} from '@react-native-firebase/app/dist/module/common';
import {
  FirebaseModule,
  getOrCreateModularInstance,
} from '@react-native-firebase/app/dist/module/internal';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import { getReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import { UTILS_NATIVE_MODULE } from '@react-native-firebase/app/dist/module/internal/constants';
import './types/internal';
import type { FirebaseApp } from '@react-native-firebase/app';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import { AppRegistry } from 'react-native';
import remoteMessageOptions from './remoteMessageOptions';
import {
  AuthorizationStatus,
  NotificationAndroidPriority,
  NotificationAndroidVisibility,
} from './statics';
import type {
  Messaging,
  RemoteMessage,
  IOSPermissions,
  AuthorizationStatus as AuthorizationStatusType,
  NativeTokenOptions,
  GetTokenOptions,
  SendErrorEvent,
} from './types/messaging';
import { version } from './version';

const nativeModuleName = 'NativeRNFBTurboMessaging';

let backgroundMessageHandler: ((remoteMessage: RemoteMessage) => Promise<any>) | undefined;
let openSettingsForNotificationHandler: ((remoteMessage: RemoteMessage) => any) | undefined;

class FirebaseMessagingModule extends FirebaseModule<typeof nativeModuleName> implements Messaging {
  _isAutoInitEnabled: boolean;
  _isDeliveryMetricsExportToBigQueryEnabled: boolean;
  _isRegisteredForRemoteNotifications: boolean;
  _isNotificationDelegationEnabled: boolean;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    customUrlOrRegion?: string | null,
  ) {
    super(app, config, customUrlOrRegion);
    this._isAutoInitEnabled =
      this.native.isAutoInitEnabled != null ? this.native.isAutoInitEnabled : true;
    this._isDeliveryMetricsExportToBigQueryEnabled =
      this.native.isDeliveryMetricsExportToBigQueryEnabled != null
        ? this.native.isDeliveryMetricsExportToBigQueryEnabled
        : false;
    this._isRegisteredForRemoteNotifications =
      this.native.isRegisteredForRemoteNotifications != null
        ? this.native.isRegisteredForRemoteNotifications
        : true;
    this._isNotificationDelegationEnabled =
      this.native.getConstants?.()?.isNotificationDelegationEnabled ?? false;

    AppRegistry.registerHeadlessTask('ReactNativeFirebaseMessagingHeadlessTask', () => {
      if (!backgroundMessageHandler) {
        // eslint-disable-next-line no-console
        console.warn(
          'No background message handler has been set. Set a handler via the "setBackgroundMessageHandler" method.',
        );
        return () => Promise.resolve();
      }
      return (remoteMessage: RemoteMessage) => backgroundMessageHandler!(remoteMessage);
    });

    if (isIOS) {
      this.emitter.addListener(
        'messaging_message_received_background',
        (remoteMessage: RemoteMessage) => {
          if (!backgroundMessageHandler) {
            // eslint-disable-next-line no-console
            console.warn(
              'No background message handler has been set. Set a handler via the "setBackgroundMessageHandler" method.',
            );
            return Promise.resolve();
          }

          const handlerPromise = Promise.resolve(backgroundMessageHandler(remoteMessage));
          handlerPromise.finally(() => {
            this.native.completeNotificationProcessing();
          });

          return handlerPromise;
        },
      );

      this.emitter.addListener(
        'messaging_settings_for_notification_opened',
        (remoteMessage: RemoteMessage) => {
          if (!openSettingsForNotificationHandler) {
            // eslint-disable-next-line no-console
            console.warn(
              'No handler for notification settings link has been set. Set a handler via the "setOpenSettingsForNotificationsHandler" method',
            );

            return Promise.resolve();
          }

          return openSettingsForNotificationHandler(remoteMessage);
        },
      );
    }
  }

  get isAutoInitEnabled(): boolean {
    return this._isAutoInitEnabled;
  }

  /**
   * @ios
   */
  get isDeviceRegisteredForRemoteMessages(): boolean {
    if (isAndroid) {
      return true;
    }

    return this._isRegisteredForRemoteNotifications;
  }

  get isNotificationDelegationEnabled(): boolean {
    return this._isNotificationDelegationEnabled;
  }

  get isDeliveryMetricsExportToBigQueryEnabled(): boolean {
    return this._isDeliveryMetricsExportToBigQueryEnabled;
  }

  setAutoInitEnabled(enabled: boolean): Promise<void> {
    if (!isBoolean(enabled)) {
      throw new Error("getMessaging().setAutoInitEnabled(*) 'enabled' expected a boolean value.");
    }

    this._isAutoInitEnabled = enabled;
    return this.native.setAutoInitEnabled(enabled);
  }

  getInitialNotification(): Promise<RemoteMessage | null> {
    return this.native.getInitialNotification().then((value: RemoteMessage | null) => {
      if (value) {
        return value;
      }
      return null;
    });
  }

  getDidOpenSettingsForNotification(): Promise<boolean> {
    if (!isIOS) return Promise.resolve(false);
    return this.native.getDidOpenSettingsForNotification().then((value: boolean) => value);
  }

  getIsHeadless(): Promise<boolean> {
    return this.native.getIsHeadless();
  }

  getToken(options?: { appName?: string; senderId?: string }): Promise<string> {
    if (!isUndefined(options?.appName) && !isString(options?.appName)) {
      throw new Error("getMessaging().getToken(*) 'appName' expected a string.");
    }

    if (!isUndefined(options?.senderId) && !isString(options?.senderId)) {
      throw new Error("getMessaging().getToken(*) 'senderId' expected a string.");
    }

    const appName = options?.appName || this.app.name;
    const senderId = options?.senderId || this.app.options.messagingSenderId;

    return this.native.getToken(appName, senderId || '');
  }

  deleteToken(options?: { appName?: string; senderId?: string }): Promise<void> {
    if (!isUndefined(options?.appName) && !isString(options?.appName)) {
      throw new Error("getMessaging().deleteToken(*) 'appName' expected a string.");
    }

    if (!isUndefined(options?.senderId) && !isString(options?.senderId)) {
      throw new Error("getMessaging().deleteToken(*) 'senderId' expected a string.");
    }

    const appName = options?.appName || this.app.name;
    const senderId = options?.senderId || this.app.options.messagingSenderId;

    return this.native.deleteToken(appName, senderId || '');
  }

  onMessage(listener: (message: RemoteMessage) => any): () => void {
    if (!isFunction(listener)) {
      throw new Error("getMessaging().onMessage(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener('messaging_message_received', listener);
    return () => subscription.remove();
  }

  onNotificationOpenedApp(listener: (message: RemoteMessage) => any): () => void {
    if (!isFunction(listener)) {
      throw new Error("getMessaging().onNotificationOpenedApp(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener('messaging_notification_opened', listener);
    return () => subscription.remove();
  }

  onTokenRefresh(listener: (token: string) => any): () => void {
    if (!isFunction(listener)) {
      throw new Error("getMessaging().onTokenRefresh(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener(
      'messaging_token_refresh',
      (event: { token: string }) => {
        const { token } = event;
        listener(token);
      },
    );
    return () => subscription.remove();
  }

  /**
   * @platform ios
   * @deprecated Use {@link https://github.com/zoontek/react-native-permissions react-native-permissions} or
   * {@link https://docs.expo.dev/versions/latest/sdk/notifications/ expo-notifications} for notification permission
   * requests instead. These APIs will be removed in a future major release.
   * See {@link https://github.com/invertase/react-native-firebase/issues/6283 #6283}.
   */
  requestPermission(permissions?: IOSPermissions): Promise<AuthorizationStatusType> {
    if (isAndroid) {
      return Promise.resolve(AuthorizationStatus.AUTHORIZED);
    }

    const defaultPermissions: IOSPermissions = {
      alert: true,
      announcement: false,
      badge: true,
      carPlay: true,
      provisional: false,
      sound: true,
      criticalAlert: false,
      providesAppNotificationSettings: false,
    };

    if (!permissions) {
      return this.native.requestPermission(defaultPermissions) as Promise<AuthorizationStatusType>;
    }

    if (!isObject(permissions)) {
      throw new Error('getMessaging().requestPermission(*) expected an object value.');
    }

    Object.entries(permissions).forEach(([key, value]) => {
      if (!hasOwnProperty(defaultPermissions, key)) {
        throw new Error(
          `getMessaging().requestPermission(*) unexpected key "${key}" provided to permissions object.`,
        );
      }

      if (!isBoolean(value)) {
        throw new Error(
          `getMessaging().requestPermission(*) the permission "${key}" expected a boolean value.`,
        );
      }

      (defaultPermissions as Record<string, boolean>)[key] = value;
    });

    return this.native.requestPermission(defaultPermissions) as Promise<AuthorizationStatusType>;
  }

  registerDeviceForRemoteMessages(): Promise<void> {
    if (isAndroid) {
      return Promise.resolve();
    }

    const autoRegister = this.firebaseJson['messaging_ios_auto_register_for_remote_messages'];
    if (autoRegister === undefined || autoRegister === true) {
      // eslint-disable-next-line no-console
      console.warn(
        `Usage of "registerDeviceForRemoteMessages()" is not required. You only need to register if auto-registration is disabled in your 'firebase.json' configuration file via the 'messaging_ios_auto_register_for_remote_messages' property.`,
      );
    }

    this._isRegisteredForRemoteNotifications = true;
    return this.native.registerForRemoteNotifications();
  }

  /**
   * @platform ios
   */
  unregisterDeviceForRemoteMessages(): Promise<void> {
    if (isAndroid) {
      return Promise.resolve();
    }
    this._isRegisteredForRemoteNotifications = false;
    return this.native.unregisterForRemoteNotifications();
  }

  /**
   * @platform ios
   */
  getAPNSToken(): Promise<string | null> {
    if (isAndroid) {
      return Promise.resolve(null);
    }
    return this.native.getAPNSToken();
  }

  /**
   * @platform ios
   */
  setAPNSToken(token: string, type?: string): Promise<void> {
    if (isUndefined(token) || !isString(token)) {
      throw new Error("getMessaging().setAPNSToken(*) 'token' expected a string value.");
    }

    if (!isUndefined(type) && (!isString(type) || !['prod', 'sandbox', 'unknown'].includes(type))) {
      throw new Error(
        "getMessaging().setAPNSToken(*) 'type' expected one of 'prod', 'sandbox', or 'unknown'.",
      );
    }

    if (isAndroid) {
      return Promise.resolve();
    }

    return this.native.setAPNSToken(token, type);
  }

  /**
   * @deprecated Use {@link https://github.com/zoontek/react-native-permissions react-native-permissions} or
   * {@link https://docs.expo.dev/versions/latest/sdk/notifications/ expo-notifications} for notification permission
   * requests instead. These APIs will be removed in a future major release.
   * See {@link https://github.com/invertase/react-native-firebase/issues/6283 #6283}.
   */
  hasPermission(): Promise<AuthorizationStatusType> {
    return this.native.hasPermission() as Promise<AuthorizationStatusType>;
  }

  onDeletedMessages(listener: () => void): () => void {
    if (!isFunction(listener)) {
      throw new Error("getMessaging().onDeletedMessages(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener('messaging_message_deleted', listener);
    return () => subscription.remove();
  }

  onMessageSent(listener: (messageId: string) => any): () => void {
    if (!isFunction(listener)) {
      throw new Error("getMessaging().onMessageSent(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener('messaging_message_sent', listener);
    return () => {
      subscription.remove();
    };
  }

  onSendError(
    listener: (evt: { messageId: string; error: ReactNativeFirebase.NativeFirebaseError }) => any,
  ): () => void {
    if (!isFunction(listener)) {
      throw new Error("getMessaging().onSendError(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener('messaging_message_send_error', listener);
    return () => subscription.remove();
  }

  setBackgroundMessageHandler(handler: (message: RemoteMessage) => Promise<any>): void {
    if (!isFunction(handler)) {
      throw new Error(
        "getMessaging().setBackgroundMessageHandler(*) 'handler' expected a function.",
      );
    }

    backgroundMessageHandler = handler;
    if (isIOS) {
      this.native.signalBackgroundMessageHandlerSet();
    }
  }

  setOpenSettingsForNotificationsHandler(handler: (message: RemoteMessage) => any): void {
    if (!isIOS) {
      return;
    }

    if (!isFunction(handler)) {
      throw new Error(
        "getMessaging().setOpenSettingsForNotificationsHandler(*) 'handler' expected a function.",
      );
    }

    openSettingsForNotificationHandler = handler;
  }

  sendMessage(remoteMessage: RemoteMessage): Promise<void> {
    if (isIOS) {
      throw new Error(`getMessaging().sendMessage() is only supported on Android devices.`);
    }
    let options;
    try {
      const senderId = this.app.options.messagingSenderId;
      if (!senderId) {
        throw new Error("'messagingSenderId' is required in Firebase app options.");
      }
      options = remoteMessageOptions(senderId, remoteMessage);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      throw new Error(`getMessaging().sendMessage(*) ${message}.`);
    }

    return this.native.sendMessage(options as unknown as Record<string, unknown>);
  }

  subscribeToTopic(topic: string): Promise<void> {
    if (!isString(topic)) {
      throw new Error("getMessaging().subscribeToTopic(*) 'topic' expected a string value.");
    }

    if (topic.indexOf('/') > -1) {
      throw new Error('getMessaging().subscribeToTopic(*) \'topic\' must not include "/".');
    }

    return this.native.subscribeToTopic(topic);
  }

  unsubscribeFromTopic(topic: string): Promise<void> {
    if (!isString(topic)) {
      throw new Error("getMessaging().unsubscribeFromTopic(*) 'topic' expected a string value.");
    }

    if (topic.indexOf('/') > -1) {
      throw new Error('getMessaging().unsubscribeFromTopic(*) \'topic\' must not include "/".');
    }

    return this.native.unsubscribeFromTopic(topic);
  }

  setDeliveryMetricsExportToBigQuery(enabled: boolean): Promise<void> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "getMessaging().setDeliveryMetricsExportToBigQuery(*) 'enabled' expected a boolean value.",
      );
    }

    this._isDeliveryMetricsExportToBigQueryEnabled = enabled;
    return this.native.setDeliveryMetricsExportToBigQuery(enabled);
  }

  setNotificationDelegationEnabled(enabled: boolean): Promise<void> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "getMessaging().setNotificationDelegationEnabled(*) 'enabled' expected a boolean value.",
      );
    }

    this._isNotificationDelegationEnabled = enabled;
    if (isIOS) {
      return Promise.resolve();
    }

    return this.native.setNotificationDelegationEnabled(enabled);
  }

  async isSupported(): Promise<boolean> {
    if (isAndroid) {
      // NewArch-AD-18 E6: cross-package Play Services availability via utils host.
      const utilsNativeModule = getReactNativeModule(UTILS_NATIVE_MODULE);
      if (!utilsNativeModule) {
        return false;
      }
      const androidGetPlayServicesStatus = utilsNativeModule.androidGetPlayServicesStatus as
        | (() => Promise<{ isAvailable?: boolean }>)
        | undefined;
      if (typeof androidGetPlayServicesStatus !== 'function') {
        return false;
      }
      const playServicesAvailability = await androidGetPlayServicesStatus();
      return playServicesAvailability?.isAvailable ?? false;
    }
    return true;
  }
}

const config: ModuleConfig = {
  namespace: 'messaging',
  nativeModuleName,
  nativeEvents: [
    'messaging_token_refresh',
    'messaging_message_sent',
    'messaging_message_deleted',
    'messaging_message_received',
    'messaging_message_send_error',
    'messaging_notification_opened',
    ...(isIOS
      ? ['messaging_message_received_background', 'messaging_settings_for_notification_opened']
      : []),
  ],
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  turboModule: true,
};

export const SDK_VERSION = version;

export { AuthorizationStatus, NotificationAndroidPriority, NotificationAndroidVisibility };

/**
 * Returns the {@link Messaging} instance for the default or given {@link FirebaseApp}.
 *
 * @param app - The Firebase `FirebaseApp` to use. When omitted, the default app is used.
 * @returns The Messaging service instance for that app.
 */
export function getMessaging(app?: FirebaseApp): Messaging {
  return getOrCreateModularInstance(FirebaseMessagingModule, config, app) as unknown as Messaging;
}

/**
 * Removes access to an FCM token previously authorized by its scope.
 */
export function deleteToken(
  messaging: Messaging,
  tokenOptions?: NativeTokenOptions,
): Promise<void> {
  return messaging.deleteToken(tokenOptions);
}

/**
 * Returns an FCM token for this device.
 */
export function getToken(
  messaging: Messaging,
  options?: GetTokenOptions & NativeTokenOptions,
): Promise<string> {
  return messaging.getToken(options);
}

/**
 * When any FCM payload is received, the listener callback is called with a `RemoteMessage`.
 */
export function onMessage(
  messaging: Messaging,
  listener: (message: RemoteMessage) => any,
): () => void {
  return messaging.onMessage(listener);
}

/**
 * When the user presses a notification displayed via FCM, this listener will be called if the app
 * has opened from a background state.
 */
export function onNotificationOpenedApp(
  messaging: Messaging,
  listener: (message: RemoteMessage) => any,
): () => void {
  return messaging.onNotificationOpenedApp(listener);
}

/**
 * Called when a new registration token is generated for the device.
 */
export function onTokenRefresh(messaging: Messaging, listener: (token: string) => any): () => void {
  return messaging.onTokenRefresh(listener);
}

/**
 * On iOS, messaging permission must be requested by the current application before messages can
 * be received or sent.
 *
 * @deprecated Use {@link https://github.com/zoontek/react-native-permissions react-native-permissions} or
 * {@link https://docs.expo.dev/versions/latest/sdk/notifications/ expo-notifications} for notification permission
 * requests instead. These APIs will be removed in a future major release.
 * See {@link https://github.com/invertase/react-native-firebase/issues/6283 #6283}.
 */
export function requestPermission(
  messaging: Messaging,
  iosPermissions?: IOSPermissions,
): Promise<AuthorizationStatusType> {
  return messaging.requestPermission(iosPermissions);
}

/**
 * Returns whether messaging auto initialization is enabled or disabled for the device.
 */
export function isAutoInitEnabled(messaging: Messaging): boolean {
  return messaging.isAutoInitEnabled;
}

/**
 * Sets whether messaging auto initialization is enabled or disabled for the device.
 */
export function setAutoInitEnabled(messaging: Messaging, enabled: boolean): Promise<void> {
  return messaging.setAutoInitEnabled(enabled);
}

/**
 * When a notification from FCM has triggered the application to open from a quit state,
 * this method will return a `RemoteMessage` containing the notification data, or `null`.
 */
export function getInitialNotification(messaging: Messaging): Promise<RemoteMessage | null> {
  return messaging.getInitialNotification();
}

/**
 * When the app is opened from iOS notifications settings from a quit state,
 * this method will return `true` or `false` if the app was opened via another method.
 */
export function getDidOpenSettingsForNotification(messaging: Messaging): Promise<boolean> {
  return messaging.getDidOpenSettingsForNotification();
}

/**
 * Returns whether the root view is headless or not.
 */
export function getIsHeadless(messaging: Messaging): Promise<boolean> {
  return messaging.getIsHeadless();
}

/**
 * On iOS, if your app wants to receive remote messages from FCM (via APNs), you must explicitly register
 * with APNs if auto-registration has been disabled.
 */
export function registerDeviceForRemoteMessages(messaging: Messaging): Promise<void> {
  return messaging.registerDeviceForRemoteMessages();
}

/**
 * Returns a boolean value whether the user has registered for remote notifications via
 * `registerDeviceForRemoteMessages()`.
 */
export function isDeviceRegisteredForRemoteMessages(messaging: Messaging): boolean {
  return messaging.isDeviceRegisteredForRemoteMessages;
}

/**
 * Unregisters the app from receiving remote notifications.
 */
export function unregisterDeviceForRemoteMessages(messaging: Messaging): Promise<void> {
  return messaging.unregisterDeviceForRemoteMessages();
}

/**
 * On iOS, it is possible to get the users APNs token.
 */
export function getAPNSToken(messaging: Messaging): Promise<string | null> {
  return messaging.getAPNSToken();
}

/**
 * On iOS, sets the APNs Token received by the application delegate.
 */
export function setAPNSToken(messaging: Messaging, token: string, type?: string): Promise<void> {
  return messaging.setAPNSToken(token, type);
}

/**
 * Returns a `AuthorizationStatus` as to whether the user has messaging permission for this app.
 *
 * @deprecated Use {@link https://github.com/zoontek/react-native-permissions react-native-permissions} or
 * {@link https://docs.expo.dev/versions/latest/sdk/notifications/ expo-notifications} for notification permission
 * requests instead. These APIs will be removed in a future major release.
 * See {@link https://github.com/invertase/react-native-firebase/issues/6283 #6283}.
 */
export function hasPermission(messaging: Messaging): Promise<AuthorizationStatusType> {
  return messaging.hasPermission();
}

/**
 * Called when the FCM server deletes pending messages.
 */
export function onDeletedMessages(messaging: Messaging, listener: () => void): () => void {
  return messaging.onDeletedMessages(listener);
}

/**
 * When sending a `RemoteMessage`, this listener is called when the message has been sent to FCM.
 */
export function onMessageSent(
  messaging: Messaging,
  listener: (messageId: string) => any,
): () => void {
  return messaging.onMessageSent(listener);
}

/**
 * When sending a `RemoteMessage`, this listener is called when an error is thrown and the
 * message could not be sent.
 */
export function onSendError(
  messaging: Messaging,
  listener: (evt: SendErrorEvent) => any,
): () => void {
  return messaging.onSendError(listener);
}

/**
 * Set a message handler function which is called when the app is in the background or terminated.
 */
export function setBackgroundMessageHandler(
  messaging: Messaging,
  handler: (message: RemoteMessage) => Promise<any>,
): void {
  return messaging.setBackgroundMessageHandler(handler);
}

/**
 * Set a handler function which is called when the `${App Name} notifications settings`
 * link in iOS settings is clicked.
 */
export function setOpenSettingsForNotificationsHandler(
  messaging: Messaging,
  handler: (message: RemoteMessage) => any,
): void {
  return messaging.setOpenSettingsForNotificationsHandler(handler);
}

/**
 * Send a new `RemoteMessage` to the FCM server.
 */
export function sendMessage(messaging: Messaging, message: RemoteMessage): Promise<void> {
  return messaging.sendMessage(message);
}

/**
 * Apps can subscribe to a topic, which allows the FCM server to send targeted messages to only those
 * devices subscribed to that topic.
 */
export function subscribeToTopic(messaging: Messaging, topic: string): Promise<void> {
  return messaging.subscribeToTopic(topic);
}

/**
 * Unsubscribe the device from a topic.
 */
export function unsubscribeFromTopic(messaging: Messaging, topic: string): Promise<void> {
  return messaging.unsubscribeFromTopic(topic);
}

/**
 * Returns a boolean whether message delivery metrics are exported to BigQuery.
 */
export function isDeliveryMetricsExportToBigQueryEnabled(messaging: Messaging): boolean {
  return messaging.isDeliveryMetricsExportToBigQueryEnabled;
}

/**
 * Returns a boolean whether message delegation is enabled. Android only, always returns false on iOS.
 */
export function isNotificationDelegationEnabled(messaging: Messaging): boolean {
  return messaging.isNotificationDelegationEnabled;
}

/**
 * Sets whether message notification delegation is enabled or disabled.
 */
export function setNotificationDelegationEnabled(
  messaging: Messaging,
  enabled: boolean,
): Promise<void> {
  return messaging.setNotificationDelegationEnabled(enabled);
}

/**
 * Checks if all required APIs exist in the browser.
 */
export function isSupported(messaging: Messaging): Promise<boolean> {
  return messaging.isSupported();
}

/**
 * Sets whether message delivery metrics are exported to BigQuery is enabled or disabled.
 */
export function experimentalSetDeliveryMetricsExportedToBigQueryEnabled(
  messaging: Messaging,
  enabled: boolean,
): Promise<void> {
  return messaging.setDeliveryMetricsExportToBigQuery(enabled);
}

export type {
  Messaging,
  RemoteMessage,
  MessagePriority,
  FcmOptions,
  NativeTokenOptions,
  GetTokenOptions,
  Notification,
  NotificationIOSCriticalSound,
  IOSPermissions,
  SendErrorEvent,
} from './types/messaging';

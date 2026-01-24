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
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/dist/module/internal';
import { AppRegistry } from 'react-native';
import remoteMessageOptions from './remoteMessageOptions';
import { version } from './version';
import {
  AuthorizationStatus,
  NotificationAndroidPriority,
  NotificationAndroidVisibility,
} from './statics';
import type {
  Messaging,
  Statics,
  RemoteMessage,
  IOSPermissions,
  AuthorizationStatus as AuthorizationStatusType,
} from './types/messaging';
import type { ReactNativeFirebase } from '@react-native-firebase/app';

const statics: Partial<Statics> = {
  AuthorizationStatus,
  NotificationAndroidPriority,
  NotificationAndroidVisibility,
};
const namespace = 'messaging';

const nativeModuleName = 'RNFBMessagingModule';

let backgroundMessageHandler: ((remoteMessage: RemoteMessage) => Promise<any>) | undefined;
let openSettingsForNotificationHandler: ((remoteMessage: RemoteMessage) => any) | undefined;
let playServicesAvailability: any;

class FirebaseMessagingModule extends FirebaseModule implements Messaging {
  _isAutoInitEnabled: boolean;
  _isDeliveryMetricsExportToBigQueryEnabled: boolean;
  _isRegisteredForRemoteNotifications: boolean;
  _isNotificationDelegationEnabled: boolean;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: any,
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
      this.native.isNotificationDelegationEnabled != null
        ? this.native.isNotificationDelegationEnabled
        : false;

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

          // Ensure the handler is a promise
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
      throw new Error(
        "firebase.messaging().setAutoInitEnabled(*) 'enabled' expected a boolean value.",
      );
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
      throw new Error("firebase.messaging().getToken(*) 'appName' expected a string.");
    }

    if (!isUndefined(options?.senderId) && !isString(options?.senderId)) {
      throw new Error("firebase.messaging().getToken(*) 'senderId' expected a string.");
    }

    const appName = options?.appName || this.app.name;
    const senderId = options?.senderId || this.app.options.messagingSenderId;

    return this.native.getToken(appName, senderId);
  }

  deleteToken(options?: { appName?: string; senderId?: string }): Promise<void> {
    if (!isUndefined(options?.appName) && !isString(options?.appName)) {
      throw new Error("firebase.messaging().deleteToken(*) 'appName' expected a string.");
    }

    if (!isUndefined(options?.senderId) && !isString(options?.senderId)) {
      throw new Error("firebase.messaging().deleteToken(*) 'senderId' expected a string.");
    }

    const appName = options?.appName || this.app.name;
    const senderId = options?.senderId || this.app.options.messagingSenderId;

    return this.native.deleteToken(appName, senderId);
  }

  onMessage(listener: (message: RemoteMessage) => any): () => void {
    if (!isFunction(listener)) {
      throw new Error("firebase.messaging().onMessage(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener('messaging_message_received', listener);
    return () => subscription.remove();
  }

  onNotificationOpenedApp(listener: (message: RemoteMessage) => any): () => void {
    if (!isFunction(listener)) {
      throw new Error(
        "firebase.messaging().onNotificationOpenedApp(*) 'listener' expected a function.",
      );
    }

    const subscription = this.emitter.addListener('messaging_notification_opened', listener);
    return () => subscription.remove();
  }

  onTokenRefresh(listener: (token: string) => any): () => void {
    if (!isFunction(listener)) {
      throw new Error("firebase.messaging().onTokenRefresh(*) 'listener' expected a function.");
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
      return this.native.requestPermission(defaultPermissions);
    }

    if (!isObject(permissions)) {
      throw new Error('firebase.messaging().requestPermission(*) expected an object value.');
    }

    Object.entries(permissions).forEach(([key, value]) => {
      if (!hasOwnProperty(defaultPermissions, key)) {
        throw new Error(
          `firebase.messaging().requestPermission(*) unexpected key "${key}" provided to permissions object.`,
        );
      }

      if (!isBoolean(value)) {
        throw new Error(
          `firebase.messaging().requestPermission(*) the permission "${key}" expected a boolean value.`,
        );
      }

      (defaultPermissions as any)[key] = value;
    });

    return this.native.requestPermission(defaultPermissions);
  }

  registerDeviceForRemoteMessages(): Promise<void> {
    if (isAndroid) {
      return Promise.resolve();
    }

    const autoRegister = this.firebaseJson['messaging_ios_auto_register_for_remote_messages'];
    if (autoRegister === undefined || autoRegister === true) {
      // eslint-disable-next-line no-console
      console.warn(
        `Usage of "messaging().registerDeviceForRemoteMessages()" is not required. You only need to register if auto-registration is disabled in your 'firebase.json' configuration file via the 'messaging_ios_auto_register_for_remote_messages' property.`,
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
      throw new Error("firebase.messaging().setAPNSToken(*) 'token' expected a string value.");
    }

    if (!isUndefined(type) && (!isString(type) || !['prod', 'sandbox', 'unknown'].includes(type))) {
      throw new Error(
        "firebase.messaging().setAPNSToken(*) 'type' expected one of 'prod', 'sandbox', or 'unknown'.",
      );
    }

    if (isAndroid) {
      return Promise.resolve();
    }

    return this.native.setAPNSToken(token, type);
  }

  hasPermission(): Promise<AuthorizationStatusType> {
    return this.native.hasPermission();
  }

  // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#public-void-ondeletedmessages-
  onDeletedMessages(listener: () => void): () => void {
    if (!isFunction(listener)) {
      throw new Error("firebase.messaging().onDeletedMessages(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener('messaging_message_deleted', listener);
    return () => subscription.remove();
  }

  // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#onMessageSent(java.lang.String)
  onMessageSent(listener: (messageId: string) => any): () => void {
    if (!isFunction(listener)) {
      throw new Error("firebase.messaging().onMessageSent(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener('messaging_message_sent', listener);
    return () => {
      subscription.remove();
    };
  }

  // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#onSendError(java.lang.String,%20java.lang.Exception)
  onSendError(
    listener: (evt: { messageId: string; error: ReactNativeFirebase.NativeFirebaseError }) => any,
  ): () => void {
    if (!isFunction(listener)) {
      throw new Error("firebase.messaging().onSendError(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener('messaging_message_send_error', listener);
    return () => subscription.remove();
  }

  /**
   * Set a handler that will be called when a message is received while the app is in the background.
   * Should be called before the app is registered in `AppRegistry`, for example in `index.js`.
   * An app is considered to be in the background if no active window is displayed.
   * @param handler called with an argument of type messaging.RemoteMessage that must be async and return a Promise
   */
  setBackgroundMessageHandler(handler: (message: RemoteMessage) => Promise<any>): void {
    if (!isFunction(handler)) {
      throw new Error(
        "firebase.messaging().setBackgroundMessageHandler(*) 'handler' expected a function.",
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
        "firebase.messaging().setOpenSettingsForNotificationsHandler(*) 'handler' expected a function.",
      );
    }

    openSettingsForNotificationHandler = handler;
  }

  sendMessage(remoteMessage: RemoteMessage): Promise<void> {
    if (isIOS) {
      throw new Error(`firebase.messaging().sendMessage() is only supported on Android devices.`);
    }
    let options;
    try {
      const senderId = this.app.options.messagingSenderId;
      if (!senderId) {
        throw new Error("'messagingSenderId' is required in Firebase app options.");
      }
      options = remoteMessageOptions(senderId, remoteMessage);
    } catch (e: any) {
      throw new Error(`firebase.messaging().sendMessage(*) ${e.message}.`);
    }

    return this.native.sendMessage(options);
  }

  subscribeToTopic(topic: string): Promise<void> {
    if (!isString(topic)) {
      throw new Error("firebase.messaging().subscribeToTopic(*) 'topic' expected a string value.");
    }

    if (topic.indexOf('/') > -1) {
      throw new Error('firebase.messaging().subscribeToTopic(*) \'topic\' must not include "/".');
    }

    return this.native.subscribeToTopic(topic);
  }

  unsubscribeFromTopic(topic: string): Promise<void> {
    if (!isString(topic)) {
      throw new Error(
        "firebase.messaging().unsubscribeFromTopic(*) 'topic' expected a string value.",
      );
    }

    if (topic.indexOf('/') > -1) {
      throw new Error(
        'firebase.messaging().unsubscribeFromTopic(*) \'topic\' must not include "/".',
      );
    }

    return this.native.unsubscribeFromTopic(topic);
  }

  /**
   * unsupported
   */

  useServiceWorker(): void {
    // eslint-disable-next-line no-console
    console.warn(
      'firebase.messaging().useServiceWorker() is not supported on react-native-firebase.',
    );
  }

  usePublicVapidKey(): void {
    // eslint-disable-next-line no-console
    console.warn(
      'firebase.messaging().usePublicVapidKey() is not supported on react-native-firebase.',
    );
  }

  setDeliveryMetricsExportToBigQuery(enabled: boolean): Promise<void> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.messaging().setDeliveryMetricsExportToBigQuery(*) 'enabled' expected a boolean value.",
      );
    }

    this._isDeliveryMetricsExportToBigQueryEnabled = enabled;
    return this.native.setDeliveryMetricsExportToBigQuery(enabled);
  }

  setNotificationDelegationEnabled(enabled: boolean): Promise<void> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.messaging().setNotificationDelegationEnabled(*) 'enabled' expected a boolean value.",
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
      const firebase = getFirebaseRoot();
      const app = this.app;
      // @ts-ignore - secret "app" argument to avoid deprecation warning when getApp() is called under the hood
      playServicesAvailability = firebase.utils(app).playServicesAvailability;
      return playServicesAvailability.isAvailable;
    }
    // Always return "true" for iOS. Web will be implemented when it is supported
    return true;
  }
}

// import { SDK_VERSION } from '@react-native-firebase/messaging';
export const SDK_VERSION = version;

// import messaging from '@react-native-firebase/messaging';
// messaging().X(...);
const messagingNamespace = createModuleNamespace({
  statics,
  version,
  namespace,
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
  ModuleClass: FirebaseMessagingModule,
});

type MessagingNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  Messaging,
  Statics
> & {
  messaging: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<Messaging, Statics>;
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

export default messagingNamespace as unknown as MessagingNamespace;

// import messaging, { firebase } from '@react-native-firebase/messaging';
// messaging().X(...);
// firebase.messaging().X(...);
export const firebase =
  getFirebaseRoot() as unknown as ReactNativeFirebase.FirebaseNamespacedExport<
    'messaging',
    Messaging,
    Statics,
    false
  >;

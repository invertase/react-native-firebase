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
} from '@react-native-firebase/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import { AppRegistry } from 'react-native';
import remoteMessageOptions from './remoteMessageOptions';
import version from './version';

const statics = {
  AuthorizationStatus: {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
  NotificationAndroidPriority: {
    PRIORITY_MIN: -2,
    PRIORITY_LOW: -1,
    PRIORITY_DEFAULT: 0,
    PRIORITY_HIGH: 1,
    PRIORITY_MAX: 2,
  },
  NotificationAndroidVisibility: {
    VISIBILITY_SECRET: -1,
    VISIBILITY_PRIVATE: 0,
    VISIBILITY_PUBLIC: 1,
  },
};

const namespace = 'messaging';

const nativeModuleName = 'RNFBMessagingModule';

let backgroundMessageHandler;
let openSettingsForNotificationHandler;

class FirebaseMessagingModule extends FirebaseModule {
  constructor(...args) {
    super(...args);
    this._isAutoInitEnabled =
      this.native.isAutoInitEnabled != null ? this.native.isAutoInitEnabled : true;
    this._isRegisteredForRemoteNotifications =
      this.native.isRegisteredForRemoteNotifications != null
        ? this.native.isRegisteredForRemoteNotifications
        : true;

    AppRegistry.registerHeadlessTask('ReactNativeFirebaseMessagingHeadlessTask', () => {
      if (!backgroundMessageHandler) {
        // eslint-disable-next-line no-console
        console.warn(
          'No background message handler has been set. Set a handler via the "setBackgroundMessageHandler" method.',
        );
        return () => Promise.resolve();
      }
      return remoteMessage => backgroundMessageHandler(remoteMessage);
    });

    if (isIOS) {
      this.emitter.addListener('messaging_message_received_background', remoteMessage => {
        if (!backgroundMessageHandler) {
          // eslint-disable-next-line no-console
          console.warn(
            'No background message handler has been set. Set a handler via the "setBackgroundMessageHandler" method.',
          );
          return Promise.resolve();
        }

        return backgroundMessageHandler(remoteMessage);
      });

      this.emitter.addListener('messaging_settings_for_notification_opened', remoteMessage => {
        if (!openSettingsForNotificationHandler) {
          // eslint-disable-next-line no-console
          console.warn(
            'No handler for notification settings link has been set. Set a handler via the "setOpenSettingsForNotificationsHandler" method',
          );

          return Promise.resolve();
        }

        return openSettingsForNotificationHandler(remoteMessage);
      });
    }
  }

  get isAutoInitEnabled() {
    return this._isAutoInitEnabled;
  }

  /**
   * @ios
   */
  get isDeviceRegisteredForRemoteMessages() {
    if (isAndroid) {
      return true;
    }

    return this._isRegisteredForRemoteNotifications;
  }

  setAutoInitEnabled(enabled) {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.messaging().setAutoInitEnabled(*) 'enabled' expected a boolean value.",
      );
    }

    this._isAutoInitEnabled = enabled;
    return this.native.setAutoInitEnabled(enabled);
  }

  getInitialNotification() {
    return this.native.getInitialNotification().then(value => {
      if (value) {
        return value;
      }
      return null;
    });
  }

  getDidOpenSettingsForNotification() {
    if (!isIOS) return Promise.resolve(false);
    return this.native.getDidOpenSettingsForNotification().then(value => value);
  }

  getIsHeadless() {
    return this.native.getIsHeadless();
  }

  getToken({ appName, senderId } = {}) {
    if (!isUndefined(appName) && !isString(appName)) {
      throw new Error("firebase.messaging().getToken(*) 'projectId' expected a string.");
    }

    if (!isUndefined(senderId) && !isString(senderId)) {
      throw new Error("firebase.messaging().getToken(*) 'senderId' expected a string.");
    }

    return this.native.getToken(
      appName || this.app.name,
      senderId || this.app.options.messagingSenderId,
    );
  }

  deleteToken({ appName, senderId } = {}) {
    if (!isUndefined(appName) && !isString(appName)) {
      throw new Error("firebase.messaging().deleteToken(*) 'projectId' expected a string.");
    }

    if (!isUndefined(senderId) && !isString(senderId)) {
      throw new Error("firebase.messaging().deleteToken(*) 'senderId' expected a string.");
    }

    return this.native.deleteToken(
      appName || this.app.name,
      senderId || this.app.options.messagingSenderId,
    );
  }

  onMessage(listener) {
    if (!isFunction(listener)) {
      throw new Error("firebase.messaging().onMessage(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener('messaging_message_received', listener);
    return () => subscription.remove();
  }

  onNotificationOpenedApp(listener) {
    if (!isFunction(listener)) {
      throw new Error(
        "firebase.messaging().onNotificationOpenedApp(*) 'listener' expected a function.",
      );
    }

    const subscription = this.emitter.addListener('messaging_notification_opened', listener);
    return () => subscription.remove();
  }

  onTokenRefresh(listener) {
    if (!isFunction(listener)) {
      throw new Error("firebase.messaging().onTokenRefresh(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener('messaging_token_refresh', event => {
      const { token } = event;
      listener(token);
    });
    return () => subscription.remove();
  }

  /**
   * @platform ios
   */
  requestPermission(permissions) {
    if (isAndroid) {
      return Promise.resolve(1);
    }

    const defaultPermissions = {
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

      defaultPermissions[key] = value;
    });

    return this.native.requestPermission(defaultPermissions);
  }

  registerDeviceForRemoteMessages() {
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
  unregisterDeviceForRemoteMessages() {
    if (isAndroid) {
      return Promise.resolve();
    }
    this._isRegisteredForRemoteNotifications = false;
    return this.native.unregisterForRemoteNotifications();
  }

  /**
   * @platform ios
   */
  getAPNSToken() {
    if (isAndroid) {
      return Promise.resolve(null);
    }
    return this.native.getAPNSToken();
  }

  hasPermission() {
    return this.native.hasPermission();
  }

  // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#public-void-ondeletedmessages-
  onDeletedMessages(listener) {
    if (!isFunction(listener)) {
      throw new Error("firebase.messaging().onDeletedMessages(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener('messaging_message_deleted', listener);
    return () => subscription.remove();
  }

  // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#onMessageSent(java.lang.String)
  onMessageSent(listener) {
    if (!isFunction(listener)) {
      throw new Error("firebase.messaging().onMessageSent(*) 'listener' expected a function.");
    }

    const subscription = this.emitter.addListener('messaging_message_sent', listener);
    return () => {
      subscription.remove();
    };
  }

  // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#onSendError(java.lang.String,%20java.lang.Exception)
  onSendError(listener) {
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
  setBackgroundMessageHandler(handler) {
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

  setOpenSettingsForNotificationsHandler(handler) {
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

  sendMessage(remoteMessage) {
    if (isIOS) {
      throw new Error(`firebase.messaging().sendMessage() is only supported on Android devices.`);
    }
    let options;
    try {
      options = remoteMessageOptions(this.app.options.messagingSenderId, remoteMessage);
    } catch (e) {
      throw new Error(`firebase.messaging().sendMessage(*) ${e.message}.`);
    }

    return this.native.sendMessage(options);
  }

  subscribeToTopic(topic) {
    if (!isString(topic)) {
      throw new Error("firebase.messaging().subscribeToTopic(*) 'topic' expected a string value.");
    }

    if (topic.indexOf('/') > -1) {
      throw new Error('firebase.messaging().subscribeToTopic(*) \'topic\' must not include "/".');
    }

    return this.native.subscribeToTopic(topic);
  }

  unsubscribeFromTopic(topic) {
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

  useServiceWorker() {
    // eslint-disable-next-line no-console
    console.warn(
      'firebase.messaging().useServiceWorker() is not supported on react-native-firebase.',
    );
  }

  usePublicVapidKey() {
    // eslint-disable-next-line no-console
    console.warn(
      'firebase.messaging().usePublicVapidKey() is not supported on react-native-firebase.',
    );
  }
}

// import { SDK_VERSION } from '@react-native-firebase/messaging';
export const SDK_VERSION = version;

// import messaging from '@react-native-firebase/messaging';
// messaging().X(...);
export default createModuleNamespace({
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

// import messaging, { firebase } from '@react-native-firebase/messaging';
// messaging().X(...);
// firebase.messaging().X(...);
export const firebase = getFirebaseRoot();

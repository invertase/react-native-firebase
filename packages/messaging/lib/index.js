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
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import { isIOS, isAndroid } from '@react-native-firebase/common';

import { AppRegistry } from 'react-native';

import version from './version';
import RemoteMessageBuilder from './RemoteMessageBuilder';

const statics = {};

const namespace = 'messaging';

const nativeModuleName = 'RNFBMessagingModule';

class FirebaseMessagingModule extends FirebaseModule {
  constructor(...args) {
    super(...args);
    this._isAutoInitEnabled = this.native.isAutoInitEnabled || true;
    this._isRegisteredForRemoteNotifcations = this.native.isRegisteredForRemoteNotifcations || true;
  }

  get isAutoInitEnabled() {
    return this._isAutoInitEnabled;
  }

  newRemoteMessage() {
    return new RemoteMessageBuilder(this.app.options.messagingSenderId);
  }

  setAutoInitEnabled(enabled) {
    this._isAutoInitEnabled = enabled;
    return this.native.setAutoInitEnabled(enabled);
  }

  getToken(authorizedEntity, scope) {
    // todo validate arg 0, string, optional
    // todo validate arg 1, string, optional
    return this.native.getToken(
      authorizedEntity || this.app.options.messagingSenderId,
      scope || 'FCM',
    );
  }

  deleteToken(authorizedEntity, scope) {
    // todo validate arg 0, string, optional
    // todo validate arg 1, string, optional
    return this.native.deleteToken(
      authorizedEntity || this.app.options.messagingSenderId,
      scope || 'FCM',
    );
  }

  onMessage(nextOnly) {
    // todo validate arg, function
    const subscription = this.emitter.addListener('messaging_message_received', nextOnly);
    return () => {
      subscription.remove();
    };
  }

  onTokenRefresh(nextOnly) {
    // todo validate arg, function
    const subscription = this.emitter.addListener('messaging_token_refresh', nextOnly);
    return () => {
      subscription.remove();
    };
  }

  /**
   * @platform ios
   */
  requestPermission() {
    if (isAndroid) return Promise.resolve(true);
    return this.native.requestPermission();
  }

  /**
   * @platform ios
   */
  registerForRemoteNotifications() {
    if (isAndroid) return Promise.resolve();
    this._isRegisteredForRemoteNotifcations = true;
    return this.native.registerForRemoteNotifications();
  }

  /**
   * @platform ios
   */
  get isRegisteredForRemoteNotifications() {
    if (isAndroid) return true;
    return this._isRegisteredForRemoteNotifcations;
  }

  /**
   * @platform ios
   */
  unregisterForRemoteNotifications() {
    if (isAndroid) return Promise.resolve();
    this._isRegisteredForRemoteNotifcations = false;
    return this.native.unregisterForRemoteNotifications();
  }

  /**
   * @platform ios
   */
  getAPNSToken() {
    if (isAndroid) return Promise.resolve(null);
    return this.native.getAPNSToken();
  }

  hasPermission() {
    return this.native.hasPermission();
  }

  // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#public-void-ondeletedmessages-
  onDeletedMessages(nextOnly) {
    // todo validate arg, function
    const subscription = this.emitter.addListener('messaging_message_deleted', nextOnly);
    return () => {
      subscription.remove();
    };
  }

  // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#onMessageSent(java.lang.String)
  onMessageSent(nextOnly) {
    // todo validate arg, function
    const subscription = this.emitter.addListener('messaging_message_sent', nextOnly);
    return () => {
      subscription.remove();
    };
  }

  // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#onSendError(java.lang.String,%20java.lang.Exception)
  onSendError(nextOnly) {
    // todo validate arg, function
    const subscription = this.emitter.addListener('messaging_message_send_error', nextOnly);
    return () => {
      subscription.remove();
    };
  }

  /**
   * @platform android
   */
  setBackgroundMessageHandler(handler) {
    if (isIOS) return;
    // todo validate arg, function
    AppRegistry.registerHeadlessTask('ReactNativeFirebaseMessagingHeadlessTask', () => handler);
  }

  sendMessage(remoteMessage) {
    // todo validate arg instance of MessagingRemoteMessaging
    return this.native.sendMessage(remoteMessage.build());
  }

  subscribeToTopic(topic) {
    // todo validate arg, string, no /
    return this.native.subscribeToTopic(topic);
  }

  unsubscribeFromTopic(topic) {
    // todo validate arg, string, no /
    return this.native.unsubscribeFromTopic(topic);
  }

  /**
   * unsupported
   */

  useServiceWorker() {
    // todo unsupported warning
  }

  usePublicVapidKey() {
    // todo unsupported warning
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
  ],
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseMessagingModule,
});

// import messaging, { firebase } from '@react-native-firebase/messaging';
// messaging().X(...);
// firebase.messaging().X(...);
export const firebase = getFirebaseRoot();

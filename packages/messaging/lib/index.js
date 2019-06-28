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

import version from './version';

const statics = {};

const namespace = 'messaging';

const nativeModuleName = 'RNFBMessagingModule';

class FirebaseMessagingModule extends FirebaseModule {
  /**
   * Web SDK
   */

  getToken(authorizedEntity, scope) {
    return this.native.getToken(
      authorizedEntity || this.app.options.messagingSenderId,
      scope || 'FCM',
    );
  }

  deleteToken(authorizedEntity, scope) {
    return this.native.deleteToken(
      authorizedEntity || this.app.options.messagingSenderId,
      scope || 'FCM',
    );
  }

  onMessage(nextOrObserver) {
    // todo
  }

  onTokenRefresh() {
    // todo
  }

  requestPermission() {
    return this.native.requestPermission();
  }

  /**
   * Additional methods
   */

  hasPermission() {
    return this.native.hasPermission();
  }

  /**
   * Native SDK
   */

  // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#public-void-ondeletedmessages-
  onDeletedMessages() {
    // todo
  }

  // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#onMessageSent(java.lang.String)
  onMessageSent() {
    // todo
  }

  // https://firebase.google.com/docs/reference/android/com/google/firebase/messaging/FirebaseMessagingService.html#onSendError(java.lang.String,%20java.lang.Exception)
  onSendError() {
    // todo
  }

  /**
   * unsupported
   */

  setBackgroundMessageHandler() {
    // todo unsupported warning
  }

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

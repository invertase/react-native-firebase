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
  generateFirestoreId,
  hasOwnProperty,
  isObject,
  isString,
} from '@react-native-firebase/app/lib/common';

import validateAndroidNotification from './validateAndroidNotification';
import validateiOSNotification from './validateiOSNotification';

export default function validateNotification(notification) {
  if (!isObject(notification)) {
    throw new Error("'notification' expected an object value.");
  }

  // Required
  if (!hasOwnProperty(notification, 'body') || !isString(notification.body) || !notification.body) {
    throw new Error("'notification.body' expected a string value containing notification text.");
  }

  // Defaults
  const out = {
    notificationId: '',
    title: '',
    subtitle: '',
    body: notification.body,
    data: {},
    ios: {},
    android: {},
    sound: 'default',
  };

  /**
   * notificationId
   */
  if (hasOwnProperty(notification, 'notificationId')) {
    if (!isString(notification.notificationId) || !notification.notificationId) {
      throw new Error(
        "'notification.notificationId' invalid notification ID, expected a unique string value.",
      );
    }

    out.notificationId = notification.notificationId;
  } else {
    out.notificationId = generateFirestoreId();
  }

  /**
   * title
   */
  if (hasOwnProperty(notification, 'title')) {
    if (!isString(notification.title)) {
      throw new Error("'notification.title' expected a string value.");
    }

    out.title = notification.title;
  }

  /**
   * subtitle
   */
  if (hasOwnProperty(notification, 'subtitle')) {
    if (!isString(notification.subtitle)) {
      throw new Error("'notification.subtitle' expected a string value.");
    }

    out.subtitle = notification.subtitle;
  }

  /**
   * data
   */
  if (hasOwnProperty(notification, 'data')) {
    if (!isObject(notification.data)) {
      throw new Error("'notification.data' expected an object value containing key/value pairs.");
    }

    const entries = Object.entries(notification.data);

    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      if (!isString(value)) {
        throw new Error(
          `'notification.data' value for key "${key}" is invalid, expected a string value.`,
        );
      }
    }

    out.data = notification.data;
  }

  if (hasOwnProperty(notification, 'sound')) {
    if (!isString(notification.sound)) {
      throw new Error("'notification.sound' expected a string value.");
    }

    out.sound = notification.sound;
  }

  /**
   * android
   */
  out.android = validateAndroidNotification(notification.android);

  /**
   * ios
   */
  if (hasOwnProperty(notification, 'ios')) {
    out.ios = validateiOSNotification(notification.ios);
  }

  return out;
}

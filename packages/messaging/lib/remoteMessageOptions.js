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
  isInteger,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from '@react-native-firebase/app/lib/common';

export default function remoteMessageOptions(messagingSenderId, remoteMessage) {
  const out = {};

  if (isUndefined(remoteMessage) || !isObject(remoteMessage)) {
    throw new Error("'remoteMessage' expected an object value");
  }

  if (!remoteMessage.to) {
    out.to = `${messagingSenderId}@fcm.googleapis.com`;
  } else if (!isString(remoteMessage.to)) {
    throw new Error("'remoteMessage.to' expected a string value");
  } else {
    out.to = remoteMessage.to;
  }

  if (!remoteMessage.messageId) {
    out.messageId = generateFirestoreId();
  } else if (!isString(remoteMessage.messageId)) {
    throw new Error("'remoteMessage.messageId' expected a string value");
  } else {
    out.messageId = remoteMessage.messageId;
  }

  if (!hasOwnProperty(remoteMessage, 'ttl')) {
    out.ttl = 3600;
  } else {
    if (!isNumber(remoteMessage.ttl)) {
      throw new Error("'remoteMessage.ttl' expected a number value");
    }
    if (remoteMessage.ttl < 0 || !isInteger(remoteMessage.ttl)) {
      throw new Error("'remoteMessage.ttl' expected a positive integer value");
    }
    out.ttl = remoteMessage.ttl;
  }

  if (!remoteMessage.data) {
    out.data = {};
  } else if (!isObject(remoteMessage.data)) {
    throw new Error("'remoteMessage.data' expected an object value");
  } else {
    // Serialize all objects to strings
    out.data = {};
    for (let key in remoteMessage.data) {
      if (remoteMessage.data.hasOwnProperty(key)) {
        if (
          typeof remoteMessage.data[key] === 'object' &&
          !Array.isArray(remoteMessage.data[key]) &&
          remoteMessage.data[key] !== null
        ) {
          out.data[key] = JSON.stringify(remoteMessage.data[key]);
        } else {
          out.data[key] = remoteMessage.data[key];
        }
      }
    }
  }

  if (remoteMessage.collapseKey) {
    if (!isString(remoteMessage.collapseKey)) {
      throw new Error("'remoteMessage.collapseKey' expected a string value");
    }
    out.collapseKey = remoteMessage.collapseKey;
  }

  if (remoteMessage.messageType) {
    if (!isString(remoteMessage.messageType)) {
      throw new Error("'remoteMessage.messageType' expected a string value");
    }
    out.messageType = remoteMessage.messageType;
  }

  return out;
}

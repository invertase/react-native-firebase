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
  isBoolean,
  isNumber,
  isObject,
  isString,
} from '@react-native-firebase/app/lib/common';

export default function validateTextMessage(textMessage) {
  if (!isObject(textMessage)) {
    throw new Error("'textMessage' expected an object value");
  }

  const out = {
    timestamp: Date.now(),
    isLocalUser: true,
  };

  if (!isString(textMessage.text)) {
    throw new Error("'textMessage.text' expected a string value");
  }

  if (textMessage.text.length === 0) {
    throw new Error("'textMessage.text' expected string value to not be empty");
  }

  out.text = textMessage.text;

  if (hasOwnProperty(textMessage, 'timestamp')) {
    if (!isNumber(textMessage.timestamp)) {
      throw new Error("'textMessage.timestamp' expected number value (milliseconds)");
    }

    out.timestamp = textMessage.timestamp;
  }

  if (hasOwnProperty(textMessage, 'isLocalUser')) {
    if (!isBoolean(textMessage.isLocalUser)) {
      throw new Error("'textMessage.isLocalUser' expected boolean value");
    }

    out.isLocalUser = textMessage.isLocalUser;
  }

  if (out.isLocalUser && hasOwnProperty(textMessage, 'userId')) {
    throw new Error(
      "'textMessage.userId' expected 'textMessage.isLocalUser' to be false when setting a user ID.",
    );
  } else if (!out.isLocalUser && !hasOwnProperty(textMessage, 'userId')) {
    throw new Error("'textMessage.userId' expected a string value");
  } else if (!out.isLocalUser && hasOwnProperty(textMessage, 'userId')) {
    if (!isString(textMessage.userId)) {
      throw new Error("'textMessage.userId' expected a string value");
    }

    if (textMessage.userId.length === 0) {
      throw new Error("'textMessage.userId' expected string value to not be empty");
    }

    out.userId = textMessage.userId;
  }

  return out;
}

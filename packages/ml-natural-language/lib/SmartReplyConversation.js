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

import { isNumber, isString, isUndefined } from '@react-native-firebase/common';

export default class SmartReplyConversation {
  constructor(nativeModule, messageHistoryLimit = 30) {
    this.messages = [];
    this.native = nativeModule;
    this.messageHistoryLimit = messageHistoryLimit;
  }

  addLocalUserMessage(text, timestamp) {
    if (!isString(text)) {
      throw new Error(
        "firebase.mlKitLanguage.SmartReplyConversation.addRemoteUserMessage(*, _, _) 'text' must be a string value.",
      );
    }

    if (!isUndefined(timestamp) && !isNumber(timestamp)) {
      throw new Error(
        "firebase.mlKitLanguage.SmartReplyConversation.addRemoteUserMessage(_, *, _) 'timestamp' must be a number value.",
      );
    }

    this.messages.push({ text, timestamp: timestamp || Date.now() });
    if (this.messages.length > this.messageHistoryLimit) {
      this.messages = this.messages.slice(-this.messageHistoryLimit);
    }
  }

  addRemoteUserMessage(text, timestamp, remoteUserId) {
    if (!isString(text)) {
      throw new Error(
        "firebase.mlKitLanguage.SmartReplyConversation.addRemoteUserMessage(*, _, _) 'text' must be a string value.",
      );
    }

    if (!isNumber(timestamp)) {
      throw new Error(
        "firebase.mlKitLanguage.SmartReplyConversation.addRemoteUserMessage(_, *, _) 'timestamp' must be a number value.",
      );
    }

    if (!isString(remoteUserId)) {
      throw new Error(
        "firebase.mlKitLanguage.SmartReplyConversation.addRemoteUserMessage(_, _, *) 'remoteUserId' must be a string value.",
      );
    }

    this.messages.push({ text, timestamp: timestamp || Date.now(), remoteUserId });
    if (this.messages.length > this.messageHistoryLimit) {
      this.messages = this.messages.slice(-this.messageHistoryLimit);
    }
  }

  getSuggestedReplies() {
    if (!this.messages.length) {
      return Promise.resolve([]);
    }
    return this.native.getSuggestedReplies([...this.messages]);
  }

  clearMessages() {
    this.messages = [];
  }
}

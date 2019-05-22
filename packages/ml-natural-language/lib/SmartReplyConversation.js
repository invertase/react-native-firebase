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

export default class SmartReplyConversation {
  constructor(nativeModule, messageHistoryLimit = 20) {
    this.messages = [];
    this.native = nativeModule;
    this.messageHistoryLimit = messageHistoryLimit;
  }

  addLocalUserMessage(message, timestamp) {
    this.messages.push([message, timestamp || Date.now()]);
    if (this.messages.length > this.messageHistoryLimit) {
      this.messages = this.messages.slice(-this.messageHistoryLimit);
    }
  }

  addRemoteUserMessage(message, timestamp, remoteUserId) {
    this.messages.push([message, timestamp || Date.now(), remoteUserId]);
    if (this.messages.length > this.messageHistoryLimit) {
      this.messages = this.messages.slice(-this.messageHistoryLimit);
    }
  }

  getSuggestedReplies() {
    return this.native.getSuggestedReplies(this.messages);
  }

  clearMessages() {
    this.messages = [];
  }
}

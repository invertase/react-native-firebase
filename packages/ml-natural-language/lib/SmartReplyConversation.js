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

let id = 0;

export default class SmartReplyConversation {
  constructor(nativeModule, messageLimit) {
    this.id = id++;
    this.messages = [];
    this.native = nativeModule;
    this.messageLimit = messageLimit || 10;
  }

  addLocalUserMessage(message, timestamp) {
    this.messages.push([message, timestamp || Date.now()]);
  }

  addRemoteUserMessage(message, timestamp, remoteUserId) {
    this.messages.push([message, timestamp || Date.now(), remoteUserId]);
  }

  getSuggestedReplies() {
    return this.native.getSuggestedReplies(this.id, this.messages);
  }

  reset() {
    this.messages = [];
  }
}

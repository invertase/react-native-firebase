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
  constructor(nativeModule) {
    this.id = id++;
    this.native = nativeModule;
  }

  addLocalUserMessage(message, timestamp = Date.now()) {
    return this.native.addLocalUserMessage(this.id, message, timestamp);
  }

  addRemoteUserMessage(message, timestamp = Date.now(), remoteUserId) {
    return this.native.addRemoteUserMessage(this.id, message, timestamp, remoteUserId);
  }

  getSuggestedReplies() {
    return this.native.getSuggestedReplies(this.id);
  }

  destroy() {
    return this.native.destroyConversation(this.id);
  }

  clear() {
    return this.native.clearMessages(this.id);
  }
}

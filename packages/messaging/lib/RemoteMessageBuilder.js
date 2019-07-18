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

import { generateFirestoreId } from '@react-native-firebase/common';
import MutatableParams from '@react-native-firebase/common/lib/MutatableParams';

export default class RemoteMessageBuilder extends MutatableParams {
  constructor(messagingSenderId) {
    super();
    this.set('data', {});
    this.set('ttl', 3600);
    this.set('messageId', generateFirestoreId());

    if (messagingSenderId) {
      this.set('to', `${messagingSenderId}@fcm.googleapis.com`);
    }
  }

  setCollapseKey(collapseKey) {
    // todo validate arg -> string
    return this.set('collapseKey', collapseKey);
  }

  setMessageId(messageId) {
    // todo validate arg -> string
    return this.set('messageId', messageId);
  }

  setMessageType(messageType) {
    // todo validate arg -> string
    return this.set('messageType', messageType);
  }

  setTo(to) {
    // todo validate arg -> non empty string
    return this.set('to', to);
  }

  setTtl(ttl) {
    // todo validate arg -> positive number, >=0
    return this.set('ttl', ttl);
  }

  setData(data) {
    // todo validate arg -> object of string keys & string values
    return this.set('data', data);
  }

  validate() {
    if (!this.get('to')) {
      // todo 'to' is required
    }
  }

  build() {
    this.validate();
    return this.toJSON();
  }
}

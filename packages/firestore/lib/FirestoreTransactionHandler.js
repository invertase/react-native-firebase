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

import NativeError from '@react-native-firebase/app/lib/internal/NativeFirebaseError';

export default class FirestoreTransactionHandler {

  constructor(firestore) {
    this._firestore = firestore;
    this._pending = {};
    this._firestore.emitter.addListener(
      this._firestore.eventNameForApp('firestore_transaction_event'),
      this._onTransactionEvent.bind(this),
    );
  }

  _onTransactionEvent(event) {
    switch (event.body.type) {
      case 'update':
        this._handleUpdate(event);
        break;
      case 'error':
        this._handleError(event);
        break;
      case 'complete':
        this._handleComplete(event);
        break;
      default:
        break;
    }
  }

  _handleUpdate() {

  }

  _handleError(event) {
    const { id, body } = event;
    const { error } = body;
    const { meta } = this._pending[id];

    if (meta && error) {
      // TODO check stack
      const errorAndStack = new NativeError(error, meta.stack, 'firestore');
      meta.reject(errorAndStack);
    }
  }

  _handleComplete(event) {
    const { id } = event;
    const { meta, transaction } = this._pending[id];

    if (meta) {
      meta.resolve(transaction._pendingResult);
    }
  }

  _add() {

  }

  _remove() {

  }
}

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

let transactionId = 0;

/**
 * Uses the push id generator to create a transaction id
 * @returns {number}
 * @private
 */
const generateTransactionId = (): number => transactionId++;

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

  async _handleUpdate(event) {
    const { id } = event;

    // abort if no longer exists js side
    if (!this._pending[id]) return this._remove(id);

    const { meta, transaction } = this._pending[id];
    const { updateFunction, reject } = meta;

    // clear any saved state from previous transaction runs
    transaction._prepare();

    let finalError;
    let updateFailed;
    let pendingResult;

    try {
      const possiblePromise = updateFunction(transaction);

      // validate user has returned a promise in their update function
      // TODO must it actually return a promise? Can't find any usages of it without one...
      if (!possiblePromise || !possiblePromise.then) {
        finalError = new Error(
          'Update function for `firestore.runTransaction(updateFunction)` must return a Promise.',
        );
      } else {
        pendingResult = await possiblePromise;
      }
    } catch (exception) {
      // exception can still be falsey if user `Promise.reject();` 's with no args
      // so we track the exception with a updateFailed boolean to ensure no fall-through
      updateFailed = true;
      finalError = exception;
    }

    // reject the final promise and remove from native
    // update is failed when either the users updateFunction
    // throws an error or rejects a promise
    if (updateFailed || finalError) {
      return reject(finalError);
    }

    // capture the resolved result as we'll need this
    // to resolve the runTransaction() promise when
    // native emits that the transaction is final
    transaction._pendingResult = pendingResult;

    // send the buffered update/set/delete commands for native to process
    return this._firestore.native.transactionApplyBuffer(id, transaction._commandBuffer);
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

  _add(updateFunction) {
    const id = generateTransactionId();

    const meta = {
      id,
      updateFunction,
      stack: new Error().stack
        .split('\n')
        .slice(2)
        .join('\n'),
    };

    this._pending[id] = {
      meta,
      transaction: null, // todo
    };

    return new Promise((resolve, reject) => {
      this._firestore.native.transactionBegin(id);

      meta.resolve = r => {
        resolve(r);
        this._remove(id);
      };

      meta.reject = e => {
        reject(e);
        this._remove(id);
      };
    });
  }

  _remove(id) {
    this._firestore.native.transactionDispose(id);
    delete this._pending[id];
  }
}

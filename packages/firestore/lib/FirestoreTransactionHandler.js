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
import FirestoreTransaction from './FirestoreTransaction';

let transactionId = 0;

/**
 * Uses the push id generator to create a transaction id
 * @returns {number}
 * @private
 */
const generateTransactionId = () => transactionId++;

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
    }
  }

  async _handleUpdate(event) {
    const { listenerId: id } = event;

    // abort if no longer exists js side
    if (!this._pending[id]) {
      return this._remove(id);
    }

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
      if (!possiblePromise || !possiblePromise.then) {
        throw new Error(
          "firebase.firestore().runTransaction(*) 'updateFunction' must return a Promise.",
        );
      }

      pendingResult = await possiblePromise;
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

    if (
      transaction._calledGetCount > 0 &&
      transaction._calledGetCount !== transaction._commandBuffer.length
    ) {
      return meta.reject(
        new Error(
          'firebase.firestore().runTransaction() Every document read in a transaction must also be written.',
        ),
      );
    }

    // send the buffered update/set/delete commands for native to process
    return this._firestore.native.transactionApplyBuffer(id, transaction._commandBuffer);
  }

  /**
   * Reject the promise with a native error event
   *
   * @param event
   * @private
   */
  _handleError(event) {
    const { listenerId: id, body } = event;
    const { error } = body;

    if (!this._pending[id]) {
      return;
    }

    const { meta } = this._pending[id];

    if (meta && error) {
      const errorAndStack = NativeError.fromEvent(error, 'firestore', meta.stack);
      meta.reject(errorAndStack);
    }
  }

  /**
   * Once the transaction has completed on native, resolve the promise with any
   * pending results
   *
   * @param event
   * @private
   */
  _handleComplete(event) {
    const { listenerId: id } = event;

    if (!this._pending[id]) {
      return;
    }

    const { meta, transaction } = this._pending[id];
    if (meta) {
      meta.resolve(transaction._pendingResult);
    }
  }

  /**
   * Internally adds a transaction execution function to the queue
   *
   * @param updateFunction
   * @returns {Promise<any>}
   * @private
   */
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
      transaction: new FirestoreTransaction(this._firestore, meta),
    };

    return new Promise((resolve, reject) => {
      this._firestore.native.transactionBegin(id);

      meta.resolve = result => {
        this._remove(id);
        resolve(result);
      };

      meta.reject = error => {
        this._remove(id);
        reject(error);
      };
    });
  }

  /**
   * Internally removes the transaction once it has resolved
   * or rejected
   *
   * @param id
   * @private
   */
  _remove(id) {
    this._firestore.native.transactionDispose(id);
    delete this._pending[id];
  }
}

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

import NativeError from '@react-native-firebase/app/dist/module/internal/NativeFirebaseError';
import FirestoreTransaction, { type TransactionMeta } from './FirestoreTransaction';

let transactionId = 0;

const generateTransactionId = (): number => transactionId++;

export interface TransactionPendingEntry {
  meta: TransactionMeta;
  transaction: FirestoreTransaction;
}

export interface TransactionEventBody {
  type?: 'update' | 'error' | 'complete';
  error?: unknown;
}

export interface TransactionEvent {
  body: TransactionEventBody;
  listenerId?: number;
}

export default class FirestoreTransactionHandler {
  _firestore: any;
  _pending: Record<number, TransactionPendingEntry>;

  constructor(firestore: any) {
    this._firestore = firestore;
    this._pending = {};
    this._firestore.emitter.addListener(
      this._firestore.eventNameForApp('firestore_transaction_event'),
      this._onTransactionEvent.bind(this),
    );
  }

  _onTransactionEvent(event: TransactionEvent): void {
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

  async _handleUpdate(event: TransactionEvent): Promise<void> {
    const id = event.listenerId;

    if (id === undefined || !this._pending[id]) {
      if (id !== undefined) {
        this._remove(id);
      }
      return;
    }

    const { meta, transaction } = this._pending[id];
    const { updateFunction, reject } = meta;

    transaction._prepare();

    let finalError: unknown;
    let updateFailed = false;
    let pendingResult: unknown;

    try {
      const possiblePromise = updateFunction(transaction);

      if (!possiblePromise || typeof (possiblePromise as Promise<unknown>)?.then !== 'function') {
        throw new Error(
          "firebase.firestore().runTransaction(*) 'updateFunction' must return a Promise.",
        );
      }

      pendingResult = await possiblePromise;
    } catch (exception) {
      updateFailed = true;
      finalError = exception;
    }

    if (updateFailed || finalError) {
      reject?.(finalError);
      return;
    }

    transaction._pendingResult = pendingResult;

    return this._firestore.native.transactionApplyBuffer(id, transaction._commandBuffer);
  }

  _handleError(event: TransactionEvent): void {
    const id = event.listenerId;
    const { error } = event.body;

    if (id === undefined || !this._pending[id]) {
      return;
    }

    const { meta } = this._pending[id];

    if (meta && error) {
      const errorAndStack = NativeError.fromEvent(error, 'firestore', meta.stack);
      meta.reject?.(errorAndStack);
    }
  }

  _handleComplete(event: TransactionEvent): void {
    const id = event.listenerId;

    if (id === undefined || !this._pending[id]) {
      return;
    }

    const { meta, transaction } = this._pending[id];
    if (meta) {
      meta.resolve?.(transaction._pendingResult);
    }
  }

  _add(updateFunction: (transaction: FirestoreTransaction) => Promise<unknown>): Promise<unknown> {
    const id = generateTransactionId();

    const meta: TransactionMeta = {
      id,
      updateFunction,
      stack: new Error().stack?.split('\n').slice(2).join('\n'),
    };

    this._pending[id] = {
      meta,
      transaction: new FirestoreTransaction(this._firestore, meta),
    };

    return new Promise((resolve, reject) => {
      this._firestore.native.transactionBegin(id);

      meta.resolve = (result: unknown) => {
        this._remove(id);
        resolve(result);
      };

      meta.reject = (error: unknown) => {
        this._remove(id);
        reject(error);
      };
    });
  }

  _remove(id: number): void {
    this._firestore.native.transactionDispose(id);
    delete this._pending[id];
  }
}

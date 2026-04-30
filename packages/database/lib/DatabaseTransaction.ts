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

import { isOther } from '@react-native-firebase/app/dist/module/common';
import NativeError from '@react-native-firebase/app/dist/module/internal/NativeFirebaseError';
import type {
  DatabaseModuleInternal,
  DatabaseReferenceInternal,
  DatabaseSnapshotInternal,
  DatabaseTransactionEventInternal,
  DatabaseTransactionUpdatesInternal,
} from './types/internal';

let transactionId = 0;

type DatabaseTransactionRecordInternal = {
  id: number;
  reference: DatabaseReferenceInternal;
  transactionUpdater: (currentData: unknown) => unknown;
  onComplete: (error: Error | null, committed: boolean, snapshot: unknown | null) => void;
  applyLocally: boolean;
  completed: boolean;
  started: boolean;
};

const generateTransactionId = (): number => transactionId++;

export default class DatabaseTransaction {
  private readonly _database: DatabaseModuleInternal;
  private readonly _emitter: DatabaseModuleInternal['emitter'];
  private readonly _transactions: Record<number, DatabaseTransactionRecordInternal>;

  constructor(database: DatabaseModuleInternal) {
    this._database = database;
    this._emitter = database.emitter;
    this._transactions = {};

    this._emitter.addListener(
      this._database.eventNameForApp('database_transaction_event'),
      this._onTransactionEvent.bind(this),
    );
  }

  add(
    reference: DatabaseReferenceInternal,
    transactionUpdater: (currentData: unknown) => unknown,
    onComplete: (error: Error | null, committed: boolean, snapshot: unknown | null) => void,
    applyLocally = false,
  ): void {
    const id = generateTransactionId();

    this._transactions[id] = {
      id,
      reference,
      transactionUpdater,
      onComplete,
      applyLocally,
      completed: false,
      started: true,
    };

    if (isOther) {
      this._database.native.transactionStart(reference.path, id, applyLocally, transactionUpdater);
    } else {
      this._database.native.transactionStart(reference.path, id, applyLocally);
    }
  }

  private _getTransaction(id: number): DatabaseTransactionRecordInternal | undefined {
    return this._transactions[id];
  }

  private _removeTransaction(id: number): void {
    setImmediate(() => {
      delete this._transactions[id];
    });
  }

  private _onTransactionEvent(event: DatabaseTransactionEventInternal): void {
    switch (event.body.type) {
      case 'update':
        this._handleUpdate(event);
        return;
      case 'error':
        this._handleError(event);
        return;
      case 'complete':
        this._handleComplete(event);
        return;
      default:
        return;
    }
  }

  private _handleUpdate(event: DatabaseTransactionEventInternal): void {
    let newValue: unknown;

    const { id, body } = event;
    const { value } = body as { value?: unknown };

    try {
      const transaction = this._getTransaction(id);
      if (!transaction) {
        return;
      }

      newValue = transaction.transactionUpdater(value);
    } finally {
      const abort = newValue === undefined;

      const updates: DatabaseTransactionUpdatesInternal = {
        value: newValue,
        abort,
      };

      this._database.native.transactionTryCommit(id, updates);
    }
  }

  private _handleError(event: DatabaseTransactionEventInternal): void {
    const transaction = this._getTransaction(event.id);

    if (transaction && !transaction.completed) {
      transaction.completed = true;

      try {
        const error = NativeError.fromEvent(
          (event.body as { error?: unknown }).error as Parameters<typeof NativeError.fromEvent>[0],
          'database',
        ) as Error;
        transaction.onComplete(error, false, null);
      } finally {
        this._removeTransaction(event.id);
      }
    }
  }

  private _handleComplete(event: DatabaseTransactionEventInternal): void {
    const transaction = this._getTransaction(event.id);

    if (transaction && !transaction.completed) {
      transaction.completed = true;

      try {
        transaction.onComplete(
          null,
          !!(event.body as { committed?: boolean }).committed,
          Object.assign(
            {},
            (event.body as { snapshot?: DatabaseSnapshotInternal }).snapshot,
          ) as DatabaseSnapshotInternal,
        );
      } finally {
        this._removeTransaction(event.id);
      }
    }
  }
}

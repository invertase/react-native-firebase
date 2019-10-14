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

const generateTransactionId = () => transactionId++;

export default class DatabaseTransaction {
  constructor(database) {
    this._database = database;
    this._emitter = database.emitter;
    this._transactions = {};

    this._emitter.addListener(
      this._database.eventNameForApp('database_transaction_event'),
      this._onTransactionEvent.bind(this),
    );
  }

  /**
   *
   * @param reference
   * @param transactionUpdater
   * @param onComplete
   * @param applyLocally
   */
  add(reference, transactionUpdater, onComplete, applyLocally = false) {
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

    this._database.native.transactionStart(reference.path, id, applyLocally);
  }

  /**
   * Returns a transaction by ID
   *
   * @param id
   * @return {*}
   * @private
   */
  _getTransaction(id) {
    return this._transactions[id];
  }

  /**
   * Removes a transaction by ID on the next event loop
   *
   * @param id
   * @private
   */
  _removeTransaction(id) {
    setImmediate(() => {
      delete this._transactions[id];
    });
  }

  /**
   *
   * @param event
   * @private
   */
  _onTransactionEvent(event) {
    switch (event.body.type) {
      case 'update':
        return this._handleUpdate(event);
      case 'error':
        return this._handleError(event);
      case 'complete':
        return this._handleComplete(event);
      default:
        return undefined;
    }
  }

  /**
   *
   * @param event
   * @private
   */
  _handleUpdate(event) {
    let newValue;

    const { id, body } = event;
    const { value } = body;

    try {
      const transaction = this._getTransaction(id);
      if (!transaction) {
        return;
      }
      newValue = transaction.transactionUpdater(value);
    } finally {
      let abort = false;

      if (newValue === undefined) {
        abort = true;
      }

      this._database.native.transactionTryCommit(id, {
        value: newValue,
        abort,
      });
    }
  }

  /**
   *
   * @param event
   * @private
   */
  _handleError(event) {
    const transaction = this._getTransaction(event.id);

    if (transaction && !transaction.completed) {
      transaction.completed = true;

      try {
        // error, committed, snapshot
        const error = NativeError.fromEvent(event.body.error, 'database');
        transaction.onComplete(error, false, null);
      } finally {
        this._removeTransaction(event.id);
      }
    }
  }

  /**
   *
   * @param event
   * @private
   */
  _handleComplete(event) {
    const transaction = this._getTransaction(event.id);

    if (transaction && !transaction.completed) {
      transaction.completed = true;

      try {
        // error, committed, snapshot
        transaction.onComplete(null, event.body.committed, Object.assign({}, event.body.snapshot));
      } finally {
        this._removeTransaction(event.id);
      }
    }
  }
}

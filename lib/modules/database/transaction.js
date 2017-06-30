/**
 * @flow
 * Database representation wrapper
 */

import { generatePushID } from './../../utils';

/**
 * @class Database
 */
export default class TransactionHandler {
  constructor(database: Object) {
    this._transactions = {};
    this._database = database;
    this._transactionListener = this._database._eventEmitter.addListener(
      'database_transaction_event',
      event => this._handleTransactionEvent(event),
    );
  }

  /**
   * Add a new transaction and begin starts it natively.
   * @param reference
   * @param transactionUpdater
   * @param onComplete
   * @param applyLocally
   */
  add(
    reference: Object,
    transactionUpdater: Function,
    onComplete?: Function,
    applyLocally?: boolean = false
  ) {
    const id = this._generateTransactionId();

    this._transactions[id] = {
      id,
      reference,
      transactionUpdater,
      onComplete,
      applyLocally,
      completed: false,
      started: true,
    };

    this._database._native.startTransaction(reference.path, id, applyLocally);
  }

  /**
   *  INTERNALS
   */

  /**
   * Uses the push id generator to create a transaction id
   * @returns {string}
   * @private
   */
  _generateTransactionId(): string {
    return generatePushID(this._database.serverTimeOffset);
  }

  /**
   *
   * @param event
   * @returns {*}
   * @private
   */
  _handleTransactionEvent(event: Object = {}) {
    switch (event.type) {
      case 'update':
        return this._handleUpdate(event);
      case 'error':
        return this._handleError(event);
      case 'complete':
        return this._handleComplete(event);
      default:
        this.log.warn(`Unknown transaction event type: '${event.type}'`, event);
        return undefined;
    }
  }

  /**
   *
   * @param event
   * @private
   */
  _handleUpdate(event: Object = {}) {
    let newValue;
    const { id, value } = event;

    try {
      const transaction = this._transactions[id];
      // todo handle when transaction no longer exists on js side?
      newValue = transaction.transactionUpdater(value);
    } finally {
      let abort = false;

      if (newValue === undefined) {
        abort = true;
      }

      this._database._native.tryCommitTransaction(id, { value: newValue, abort });
    }
  }

  /**
   *
   * @param event
   * @private
   */
  _handleError(event: Object = {}) {
    const transaction = this._transactions[event.id];
    if (transaction && !transaction.completed) {
      transaction.completed = true;
      try {
        transaction.onComplete(new Error(event.message, event.code), null);
      } finally {
        setImmediate(() => {
          delete this._transactions[event.id];
        });
      }
    }
  }

  /**
   *
   * @param event
   * @private
   */
  _handleComplete(event: Object = {}) {
    const transaction = this._transactions[event.id];
    if (transaction && !transaction.completed) {
      transaction.completed = true;
      try {
        transaction.onComplete(null, event.committed, Object.assign({}, event.snapshot));
      } finally {
        setImmediate(() => {
          delete this._transactions[event.id];
        });
      }
    }
  }
}

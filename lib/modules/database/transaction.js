/**
 * @flow
 * Database representation wrapper
 */
import { NativeModules } from 'react-native';

import { Base } from './../base';
import { generatePushID } from './../../utils';

const FirebaseDatabase = NativeModules.RNFirebaseDatabase;

/**
 * @class Database
 */
export default class TransactionHandler extends Base {
  constructor(firebase: Object, database: Object, FirebaseDatabaseEvt: Object) {
    super(firebase, {});
    this.transactions = {};
    this.database = database;
    this.namespace = 'firebase:database:transaction';

    this.transactionListener = FirebaseDatabaseEvt.addListener(
      'database_transaction_event',
      event => this._handleTransactionEvent(event)
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

    this.transactions[id] = {
      id,
      reference,
      transactionUpdater,
      onComplete,
      applyLocally,
      completed: false,
      started: true,
    };

    FirebaseDatabase.startTransaction(reference.path, id, applyLocally || false);
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
    return generatePushID(this.database.serverTimeOffset);
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
        return this._handleError(error);
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
      const transaction = this.transactions[id];
      // todo handle when transaction no longer exists on js side?
      newValue = transaction.transactionUpdater(value);
    } finally {
      let abort = false;

      if (newValue === undefined) {
        abort = true;
      }

      FirebaseDatabase.tryCommitTransaction(id, { value: newValue, abort });
    }
  }

  /**
   *
   * @param event
   * @private
   */
  _handleError(event: Object = {}) {
    const transaction = this.transactions[event.id];
    if (transaction && !transaction.completed) {
      transaction.completed = true;
      try {
        transaction.onComplete(new Error(event.message, event.code), null);
      } finally {
        setImmediate(() => {
          delete this.transactions[event.id];
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
    const transaction = this.transactions[event.id];
    if (transaction && !transaction.completed) {
      transaction.completed = true;
      try {
        transaction.onComplete(null, event.committed, Object.assign({}, event.snapshot));
      } finally {
        setImmediate(() => {
          delete this.transactions[event.id];
        });
      }
    }
  }
}

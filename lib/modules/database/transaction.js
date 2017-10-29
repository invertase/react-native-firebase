/**
 * @flow
 * Database Transaction representation wrapper
 */

let transactionId = 0;

/**
 * @class TransactionHandler
 */
export default class TransactionHandler {
  constructor(database: Object) {
    this._transactions = {};
    this._database = database;

    this._transactionListener = this._database.addListener(
      this._database._getAppEventName('database_transaction_event'),
      this._handleTransactionEvent.bind(this),
    );
  }

  /**
   * Add a new transaction and start it natively.
   * @param reference
   * @param transactionUpdater
   * @param onComplete
   * @param applyLocally
   */
  add(reference: Object, transactionUpdater: Function, onComplete?: Function, applyLocally?: boolean = false) {
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

    this._database._native.transactionStart(reference.path, id, applyLocally);
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
    return transactionId++;
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
      if (!transaction) return;

      newValue = transaction.transactionUpdater(value);
    } finally {
      let abort = false;

      if (newValue === undefined) {
        abort = true;
      }

      this._database._native.transactionTryCommit(id, { value: newValue, abort });
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
        transaction.onComplete(new Error(event.error.message, event.error.code), null);
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

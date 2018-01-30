import Database from './';
export interface Reference {
    path: string;
}
export interface TEvent {
    type?: string;
    id?: any;
    value?: any;
    error?: string;
    committed?: boolean;
    snapshot?: any;
}
/**
 * @class TransactionHandler
 */
export default class TransactionHandler {
    _database: Database;
    _transactionListener: Function;
    _transactions: {
        [key: number]: any;
    };
    constructor(database: Database);
    /**
     * Add a new transaction and start it natively.
     * @param reference
     * @param transactionUpdater
     * @param onComplete
     * @param applyLocally
     */
    add(reference: Reference, transactionUpdater: Function, onComplete?: Function, applyLocally?: boolean): void;
    /**
     *  INTERNALS
     */
    /**
     *
     * @param event
     * @returns {*}
     * @private
     */
    _handleTransactionEvent(event?: TEvent): void;
    /**
     *
     * @param event
     * @private
     */
    _handleUpdate(event?: TEvent): void;
    /**
     *
     * @param event
     * @private
     */
    _handleError(event?: TEvent): void;
    /**
     *
     * @param event
     * @private
     */
    _handleComplete(event?: TEvent): void;
}

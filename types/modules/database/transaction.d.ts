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
    private _database;
    protected _transactionListener: any;
    private _transactions;
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
    private _handleTransactionEvent;
    /**
     *
     * @param event
     * @private
     */
    private _handleUpdate;
    /**
     *
     * @param event
     * @private
     */
    private _handleError;
    /**
     *
     * @param event
     * @private
     */
    private _handleComplete;
}

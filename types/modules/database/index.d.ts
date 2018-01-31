import Reference from './reference';
import TransactionHandler from './transaction';
import ModuleBase from '../../utils/ModuleBase';
import App from '../core/firebase-app';
export declare const MODULE_NAME = "RNFirebaseDatabase";
export interface OptionsObj {
    persistence?: boolean;
}
/**
 * @class Database
 */
export default class Database extends ModuleBase {
    static NAMESPACE: string;
    private _offsetRef;
    /** @private */
    _serverTimeOffset: number;
    /** @private */
    _transactionHandler: TransactionHandler;
    constructor(app: App, options?: OptionsObj);
    /**
     *
     * @return {number}
     */
    getServerTime(): number;
    /**
     *
     */
    goOnline(): void;
    /**
     *
     */
    goOffline(): void;
    /**
     * Returns a new firebase reference instance
     * @param path
     * @returns {Reference}
     */
    ref(path: string): Reference;
}
export declare const statics: {
    ServerValue: {};
    enableLogging(enabled: boolean): void;
};

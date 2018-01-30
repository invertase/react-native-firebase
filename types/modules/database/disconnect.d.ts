import Database from './';
import Reference from './reference';
/**
 * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect
 * @class Disconnect
 */
export default class Disconnect {
    _database: Database;
    ref: Reference;
    path: string;
    /**
     *
     * @param ref
     */
    constructor(ref: Reference);
    /**
     * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#set
     * @param value
     * @returns {*}
     */
    set(value: any): Promise<void>;
    /**
     * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#update
     * @param values
     * @returns {*}
     */
    update(values: any): Promise<void>;
    /**
     * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#remove
     * @returns {*}
     */
    remove(): Promise<void>;
    /**
     * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#cancel
     * @returns {*}
     */
    cancel(): Promise<void>;
}

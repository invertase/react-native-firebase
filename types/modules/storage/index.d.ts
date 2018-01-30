import StorageRef from './reference';
import ModuleBase from '../../utils/ModuleBase';
import App from '../core/firebase-app';
export declare const MODULE_NAME = "RNFirebaseStorage";
export interface EventResponse {
    path: string;
    eventName: string;
    body?: any;
}
export default class Storage extends ModuleBase {
    static NAMESPACE: string;
    /**
     * @param app
     * @param options
     */
    constructor(app: App);
    /**
     * Returns a reference for the given path in the default bucket.
     * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#ref
     * @param path
     * @returns {StorageReference}
     */
    ref(path: string): StorageRef;
    /**
     * Returns a reference for the given absolute URL.
     * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#refFromURL
     * @param url
     * @returns {StorageReference}
     */
    refFromURL(url: string): StorageRef;
    /**
     * setMaxOperationRetryTime
     * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxOperationRetryTime
     * @param time The new maximum operation retry time in milliseconds.
     */
    setMaxOperationRetryTime(time: number): void;
    /**
     * setMaxUploadRetryTime
     * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxUploadRetryTime
     * @param time The new maximum upload retry time in milliseconds.
     */
    setMaxUploadRetryTime(time: number): void;
    /**
     * setMaxDownloadRetryTime
     * @url N/A
     * @param time The new maximum download retry time in milliseconds.
     */
    setMaxDownloadRetryTime(time: number): void;
    /**
     * INTERNALS
     */
    _getSubEventName(path: string, eventName: string): string;
    _handleStorageEvent(event: EventResponse): void;
    _handleStorageError(err: EventResponse): void;
    _addListener(path: string, eventName: string, cb: (evt: Object) => Object): void;
    _removeListener(path: string, eventName: string, origCB: (evt: Object) => Object): void;
}
export declare const statics: {
    TaskEvent: {
        STATE_CHANGED: string;
    };
    TaskState: {
        RUNNING: string;
        PAUSED: string;
        SUCCESS: string;
        CANCELLED: string;
        ERROR: string;
    };
    Native: {};
};

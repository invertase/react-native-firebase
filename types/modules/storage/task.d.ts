import Storage, { statics } from './';
import StorageReference from './reference';
export declare const UPLOAD_TASK = "upload";
export declare const DOWNLOAD_TASK = "download";
export declare type UploadTaskSnapshotType = {
    bytesTransferred: number;
    downloadURL: string | null;
    metadata: any;
    ref: StorageReference;
    state: typeof statics.TaskState.RUNNING | typeof statics.TaskState.PAUSED | typeof statics.TaskState.SUCCESS | typeof statics.TaskState.CANCELLED | typeof statics.TaskState.ERROR;
    task: StorageTask;
    totalBytes: number;
};
export declare type FuncSnapshotType = null | ((snapshot: UploadTaskSnapshotType) => any);
export declare type FuncErrorType = null | ((error: Error) => any);
export declare type NextOrObserverType = null | {
    next?: FuncSnapshotType;
    error?: FuncErrorType;
    complete?: FuncSnapshotType;
} | FuncSnapshotType;
export interface TaskError extends Error {
    code?: number;
}
/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask
 */
export default class StorageTask {
    type: typeof UPLOAD_TASK | typeof DOWNLOAD_TASK;
    ref: StorageReference;
    storage: Storage;
    path: string;
    then: () => Promise<any>;
    catch: () => Promise<any>;
    constructor(type: typeof UPLOAD_TASK | typeof DOWNLOAD_TASK, promise: Promise<any>, storageRef: StorageReference);
    /**
     * Intercepts a native snapshot result object attaches ref / task instances
     * and calls the original function
     * @returns {Promise.<T>}
     * @private
     */
    private _interceptSnapshotEvent(f?);
    /**
     * Intercepts a error object form native and converts to a JS Error
     * @param f
     * @returns {*}
     * @private
     */
    private _interceptErrorEvent(f?);
    /**
     *
     * @param nextOrObserver
     * @param error
     * @param complete
     * @returns {function()}
     * @private
     */
    private _subscribe(nextOrObserver, error, complete);
    /**
     *
     * @param event
     * @param nextOrObserver
     * @param error
     * @param complete
     * @returns {function()}
     */
    on(event: string, nextOrObserver: NextOrObserverType, error: FuncErrorType, complete: FuncSnapshotType): Function;
    pause(): void;
    resume(): void;
    cancel(): void;
}

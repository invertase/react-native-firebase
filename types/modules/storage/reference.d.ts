/**
 * @flow
 * StorageReference representation wrapper
 */
import ReferenceBase from '../../utils/ReferenceBase';
import StorageTask from './task';
import Storage from './';
/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference
 */
export default class StorageReference extends ReferenceBase {
    /** @private */
    _storage: Storage;
    constructor(storage: Storage, path: string);
    readonly fullPath: string;
    toString(): string;
    /**
     * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#child
     * @param path
     * @returns {StorageReference}
     */
    child(path: string): StorageReference;
    /**
     * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#delete
     * @returns {Promise.<T>|*}
     */
    delete(): Promise<void>;
    /**
     * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getDownloadURL
     * @returns {Promise.<T>|*}
     */
    getDownloadURL(): Promise<string>;
    /**
     * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getMetadata
     * @returns {Promise.<T>|*}
     */
    getMetadata(): Promise<Object>;
    /**
     * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#updateMetadata
     * @param metadata
     * @returns {Promise.<T>|*}
     */
    updateMetadata(metadata?: Object): Promise<Object>;
    /**
     * Downloads a reference to the device
     * @param {String} filePath Where to store the file
     * @return {Promise}
     */
    downloadFile(filePath: string): StorageTask;
    /**
     * Alias to putFile
     * @returns {StorageReference.putFile}
     */
    readonly put: (filePath: string, metadata?: Object) => StorageTask;
    /**
     * Upload a file path
     * @param  {string} filePath The local path of the file
     * @param  {object} metadata An object containing metadata
     * @return {Promise}
     */
    putFile(filePath: string, metadata?: Object): StorageTask;
}

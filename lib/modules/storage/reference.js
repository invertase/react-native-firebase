/* @flow */

import ReferenceBase from '../../utils/ReferenceBase';
import StorageTask, { UPLOAD_TASK, DOWNLOAD_TASK } from './task';
import Storage from './';


/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference
 */
export default class StorageReference extends ReferenceBase {
  constructor(storage: Storage, path: string) {
    super(path);
    this.storage = storage;
  }

  get fullPath(): string {
    return this.path;
  }

  // todo return full gs://bucket/path
  toString(): String {
    return this.path;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#child
   * @param path
   * @returns {StorageReference}
   */
  child(path: string) {
    return new StorageReference(this.storage, `${this.path}/${path}`);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#delete
   * @returns {Promise.<T>|*}
   */
  delete(): Promise<*> {
    return this.storate._native.delete(this.path);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getDownloadURL
   * @returns {Promise.<T>|*}
   */
  getDownloadURL(): Promise<String> {
    return this.storate._native.getDownloadURL(this.path);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getMetadata
   * @returns {Promise.<T>|*}
   */
  getMetadata(): Promise<Object> {
    return this.storate._native.getMetadata(this.path);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#updateMetadata
   * @param metadata
   * @returns {Promise.<T>|*}
   */
  updateMetadata(metadata: Object = {}): Promise<Object> {
    return this.storate._native.updateMetadata(this.path, metadata);
  }

  /**
   * Downloads a reference to the device
   * @param {String} filePath Where to store the file
   * @return {Promise}
   */
  downloadFile(filePath: string): Promise<Object> {
    return new StorageTask(DOWNLOAD_TASK, this.storate._native.downloadFile(this.path, filePath), this);
  }

  /**
   * Alias to putFile
   * @returns {StorageReference.putFile}
   */
  get put(): Function {
    return this.putFile;
  }

  /**
   * Upload a file path
   * @param  {string} filePath The local path of the file
   * @param  {object} metadata An object containing metadata
   * @return {Promise}
   */
  putFile(filePath: Object, metadata: Object = {}): Promise<Object> {
    const _filePath = filePath.replace('file://', '');
    return new StorageTask(UPLOAD_TASK, this.storate._native.putFile(this.path, _filePath, metadata), this);
  }
}

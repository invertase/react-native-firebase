/**
 * 
 * StorageReference representation wrapper
 */
import ReferenceBase from '../../utils/ReferenceBase';
import StorageTask, { UPLOAD_TASK, DOWNLOAD_TASK } from './task';
import { isIOS } from '../../utils';
import { getNativeModule } from '../../utils/native';

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference
 */
export default class StorageReference extends ReferenceBase {
  constructor(storage, path) {
    super(path);
    this._storage = storage;
  }

  get fullPath() {
    return this.path;
  }

  toString() {
    return `gs://${this._storage.app.options.storageBucket}${this.path}`;
  }
  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#child
   * @param path
   * @returns {StorageReference}
   */


  child(path) {
    return new StorageReference(this._storage, `${this.path}/${path}`);
  }
  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#delete
   * @returns {Promise.<T>|*}
   */


  delete() {
    return getNativeModule(this._storage).delete(this.path);
  }
  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getDownloadURL
   * @returns {Promise.<T>|*}
   */


  getDownloadURL() {
    return getNativeModule(this._storage).getDownloadURL(this.path);
  }
  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getMetadata
   * @returns {Promise.<T>|*}
   */


  getMetadata() {
    return getNativeModule(this._storage).getMetadata(this.path);
  }
  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#updateMetadata
   * @param metadata
   * @returns {Promise.<T>|*}
   */


  updateMetadata(metadata = {}) {
    return getNativeModule(this._storage).updateMetadata(this.path, metadata);
  }
  /**
   * Downloads a reference to the device
   * @param {String} filePath Where to store the file
   * @return {Promise}
   */


  downloadFile(filePath) {
    return new StorageTask(DOWNLOAD_TASK, getNativeModule(this._storage).downloadFile(this.path, filePath), this);
  }
  /**
   * Alias to putFile
   * @returns {StorageReference.putFile}
   */


  get put() {
    return this.putFile;
  }
  /**
   * Upload a file path
   * @param  {string} filePath The local path of the file
   * @param  {object} metadata An object containing metadata
   * @return {Promise}
   */


  putFile(filePath, metadata = {}) {
    let _filePath = isIOS ? filePath.replace('file://', '') : filePath;

    if (_filePath.includes('%')) _filePath = decodeURIComponent(_filePath);
    return new StorageTask(UPLOAD_TASK, getNativeModule(this._storage).putFile(this.path, _filePath, metadata), this);
  }

}
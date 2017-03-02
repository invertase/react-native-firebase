/* @flow */
import { NativeModules } from 'react-native';

import { promisify } from '../../utils';
import { ReferenceBase } from './../base';
import StorageTask, { UPLOAD_TASK, DOWNLOAD_TASK } from './task';
import Storage from './';

const FirebaseStorage = NativeModules.RNFirebaseStorage;

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference
 */
export default class StorageReference extends ReferenceBase {
  constructor(storage: Storage, path: string) {
    super(storage.firebase, path);
    this.storage = storage;
  }

  get fullPath() {
    return this.path;
  }

  // todo add support for method
  put(data: Object, metadata: Object = {}): /*UploadTask*/Promise<Object> {
    throw new Error('put() is not currently supported by react-native-firebase');
  }

  // todo add support for method
  putString(data: string, format: String, metadata: Object = {}): /*UploadTask*/Promise<Object> {
    throw new Error('putString() is not currently supported by react-native-firebase');
  }

  // todo eturn full gs://bucket/path
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
    return promisify('delete', FirebaseStorage)(this.path)
      .catch((error) => {
        this.log.error('Error deleting reference ', this.path, '.  Error: ', error);
        throw error;
      });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getDownloadURL
   * @returns {Promise.<T>|*}
   */
  getDownloadURL(): Promise<String> {
    this.log.debug('getDownloadURL(', this.path, ')');
    return promisify('getDownloadURL', FirebaseStorage)(this.path)
      .catch((err) => {
        this.log.error('Error downloading URL for ', this.path, '.  Error: ', err);
        throw err;
      });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getMetadata
   * @returns {Promise.<T>|*}
   */
  getMetadata(): Promise<Object> {
    return promisify('getMetadata', FirebaseStorage)(this.path)
      .catch((error) => {
        this.log.error('Error getting metadata for ', this.path, '.  Error: ', error);
        throw error;
      });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#updateMetadata
   * @param metadata
   * @returns {Promise.<T>|*}
   */
  updateMetadata(metadata: Object = {}): Promise<Object> {
    return promisify('updateMetadata', FirebaseStorage)(this.path, metadata)
      .catch((error) => {
        this.log.error('Error updating metadata for ', this.path, '.  Error: ', error);
        throw error;
      });
  }

  /**
   * Downloads a reference to the device
   * @param {String} filePath Where to store the file
   * @return {Promise}
   */
  downloadFile(filePath: string): Promise<Object> {
    this.log.debug('download(', this.path, ') -> ', filePath);
    return new StorageTask(DOWNLOAD_TASK, promisify('downloadFile', FirebaseStorage)(this.path, filePath), this);
  }

  /**
   * Upload a file path
   * @param  {string} filePath The local path of the file
   * @param  {object} metadata An object containing metadata
   * @return {Promise}
   */
  putFile(filePath: Object, metadata: Object = {}): Promise<Object> {
    const _filePath = filePath.replace('file://', '');
    this.log.debug('putFile(', _filePath, ') -> ', this.path);
    return new StorageTask(UPLOAD_TASK, promisify('putFile', FirebaseStorage)(this.path, _filePath, metadata), this);
  }
}

/* @flow */
import { NativeModules, NativeEventEmitter } from 'react-native';

import { Base } from './../base';
import StorageRef from './reference';

const FirebaseStorage = NativeModules.RNFirebaseStorage;
const FirebaseStorageEvt = new NativeEventEmitter(FirebaseStorage);

type StorageOptionsType = {
  storageBucket?: ?string,
};

export default class Storage extends Base {
  /**
   *
   * @param firebase
   * @param options
   */
  constructor(firebase: Object, options: StorageOptionsType = {}) {
    super(firebase, options);
    this.subscriptions = {};

    this.successListener = FirebaseStorageEvt.addListener(
      'storage_event',
      event => this._handleStorageEvent(event)
    );

    this.errorListener = FirebaseStorageEvt.addListener(
      'storage_error',
      err => this._handleStorageError(err)
    );
  }

  /**
   * Returns a reference for the given path in the default bucket.
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#ref
   * @param path
   * @returns {StorageReference}
   */
  ref(path: string): StorageRef {
    return new StorageRef(this, path);
  }

  /**
   * Returns a reference for the given absolute URL.
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#refFromURL
   * @param url
   * @returns {StorageReference}
   */
  refFromURL(url: string): Promise<StorageRef> {
    // TODO don't think this is correct?
    return new StorageRef(this, `url::${url}`);
  }

  /**
   * setMaxOperationRetryTime
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxOperationRetryTime
   * @param time The new maximum operation retry time in milliseconds.
   */
  setMaxOperationRetryTime(time: number) {
    FirebaseStorage.setMaxOperationRetryTime(time);
  }

  /**
   * setMaxUploadRetryTime
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxUploadRetryTime
   * @param time The new maximum upload retry time in milliseconds.
   */
  setMaxUploadRetryTime(time: number) {
    FirebaseStorage.setMaxUploadRetryTime(time);
  }

  /**
   * setMaxDownloadRetryTime
   * @url N/A
   * @param time The new maximum download retry time in milliseconds.
   */
  setMaxDownloadRetryTime(time: number) {
    FirebaseStorage.setMaxDownloadRetryTime(time);
  }

  /** **********
   * INTERNALS
   ********** **/

  _handleStorageEvent(event: Object) {
    const { path, eventName } = event;
    const body = event.body || {};

    this.log.debug('_handleStorageEvent: ', path, eventName, body);

    if (this.subscriptions[path] && this.subscriptions[path][eventName]) {
      this.subscriptions[path][eventName].forEach((cb) => {
        cb(body);
      });
    }
  }

  _handleStorageError(err: Object) {
    this.log.debug('_handleStorageError ->', err);
  }

  _addListener(path: string, eventName: string, cb: (evt: Object) => Object) {
    if (!this.subscriptions[path]) this.subscriptions[path] = {};
    if (!this.subscriptions[path][eventName]) this.subscriptions[path][eventName] = [];
    this.subscriptions[path][eventName].push(cb);
  }

  _removeListener(path: string, eventName: string, origCB: (evt: Object) => Object) {
    if (!this.subscriptions[path] || (eventName && !this.subscriptions[path][eventName])) {
      this.log.warn('_removeListener() called, but not currently listening at that location (bad path)', path, eventName);
      return;
    }

    if (eventName && origCB) {
      const i = this.subscriptions[path][eventName].indexOf(origCB);
      if (i === -1) {
        this.log.warn('_removeListener() called, but the callback specified is not listening at this location (bad path)', path, eventName);
      } else {
        this.subscriptions[path][eventName].splice(i, 1);
      }
    } else if (eventName) {
      this.subscriptions[path][eventName] = [];
    } else {
      this.subscriptions[path] = {};
    }
  }

  get namespace(): string {
    return 'firebase:storage';
  }
}

export const statics = {
  TaskEvent: {
    STATE_CHANGED: 'state_changed',
  },
  TaskState: {
    RUNNING: 'running',
    PAUSED: 'paused',
    SUCCESS: 'success',
    CANCELLED: 'cancelled',
    ERROR: 'error',
  },
  Native: {
    MAIN_BUNDLE_PATH: FirebaseStorage.MAIN_BUNDLE_PATH,
    CACHES_DIRECTORY_PATH: FirebaseStorage.CACHES_DIRECTORY_PATH,
    DOCUMENT_DIRECTORY_PATH: FirebaseStorage.DOCUMENT_DIRECTORY_PATH,
    EXTERNAL_DIRECTORY_PATH: FirebaseStorage.EXTERNAL_DIRECTORY_PATH,
    EXTERNAL_STORAGE_DIRECTORY_PATH: FirebaseStorage.EXTERNAL_STORAGE_DIRECTORY_PATH,
    TEMP_DIRECTORY_PATH: FirebaseStorage.TEMP_DIRECTORY_PATH,
    LIBRARY_DIRECTORY_PATH: FirebaseStorage.LIBRARY_DIRECTORY_PATH,
    FILETYPE_REGULAR: FirebaseStorage.FILETYPE_REGULAR,
    FILETYPE_DIRECTORY: FirebaseStorage.FILETYPE_DIRECTORY,
  },
};


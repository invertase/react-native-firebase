/**
 * @flow
 * Storage representation wrapper
 */
import { NativeModules } from 'react-native';

import StorageRef from './reference';
import { getAppEventName, SharedEventEmitter } from '../../utils/events';
import { getLogger } from '../../utils/log';
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';

import type App from '../core/app';

const FirebaseStorage = NativeModules.RNFirebaseStorage;

const NATIVE_EVENTS = ['storage_event', 'storage_error'];

export const MODULE_NAME = 'RNFirebaseStorage';
export const NAMESPACE = 'storage';

export default class Storage extends ModuleBase {
  /**
   *
   * @param app
   * @param options
   */
  constructor(app: App) {
    super(app, {
      events: NATIVE_EVENTS,
      moduleName: MODULE_NAME,
      multiApp: true,
      hasShards: false,
      namespace: NAMESPACE,
    });

    SharedEventEmitter.addListener(
      getAppEventName(this, 'storage_event'),
      this._handleStorageEvent.bind(this)
    );

    SharedEventEmitter.addListener(
      getAppEventName(this, 'storage_error'),
      this._handleStorageEvent.bind(this)
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
  refFromURL(url: string): StorageRef {
    // TODO don't think this is correct?
    return new StorageRef(this, `url::${url}`);
  }

  /**
   * setMaxOperationRetryTime
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxOperationRetryTime
   * @param time The new maximum operation retry time in milliseconds.
   */
  setMaxOperationRetryTime(time: number): void {
    getNativeModule(this).setMaxOperationRetryTime(time);
  }

  /**
   * setMaxUploadRetryTime
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxUploadRetryTime
   * @param time The new maximum upload retry time in milliseconds.
   */
  setMaxUploadRetryTime(time: number): void {
    getNativeModule(this).setMaxUploadRetryTime(time);
  }

  /**
   * setMaxDownloadRetryTime
   * @url N/A
   * @param time The new maximum download retry time in milliseconds.
   */
  setMaxDownloadRetryTime(time: number): void {
    getNativeModule(this).setMaxDownloadRetryTime(time);
  }

  /**
   * INTERNALS
   */
  _getSubEventName(path: string, eventName: string) {
    return getAppEventName(this, `${path}-${eventName}`);
  }

  _handleStorageEvent(event: Object) {
    const { path, eventName } = event;
    const body = event.body || {};

    getLogger(this).debug('_handleStorageEvent: ', path, eventName, body);
    SharedEventEmitter.emit(this._getSubEventName(path, eventName), body);
  }

  _handleStorageError(err: Object) {
    const { path, eventName } = err;
    const body = err.body || {};

    getLogger(this).debug('_handleStorageError ->', err);
    SharedEventEmitter.emit(this._getSubEventName(path, eventName), body);
  }

  _addListener(
    path: string,
    eventName: string,
    cb: (evt: Object) => Object
  ): void {
    SharedEventEmitter.addListener(this._getSubEventName(path, eventName), cb);
  }

  _removeListener(
    path: string,
    eventName: string,
    origCB: (evt: Object) => Object
  ): void {
    SharedEventEmitter.removeListener(
      this._getSubEventName(path, eventName),
      origCB
    );
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
  Native: FirebaseStorage
    ? {
        MAIN_BUNDLE_PATH: FirebaseStorage.MAIN_BUNDLE_PATH,
        CACHES_DIRECTORY_PATH: FirebaseStorage.CACHES_DIRECTORY_PATH,
        DOCUMENT_DIRECTORY_PATH: FirebaseStorage.DOCUMENT_DIRECTORY_PATH,
        EXTERNAL_DIRECTORY_PATH: FirebaseStorage.EXTERNAL_DIRECTORY_PATH,
        EXTERNAL_STORAGE_DIRECTORY_PATH:
          FirebaseStorage.EXTERNAL_STORAGE_DIRECTORY_PATH,
        TEMP_DIRECTORY_PATH: FirebaseStorage.TEMP_DIRECTORY_PATH,
        LIBRARY_DIRECTORY_PATH: FirebaseStorage.LIBRARY_DIRECTORY_PATH,
        FILETYPE_REGULAR: FirebaseStorage.FILETYPE_REGULAR,
        FILETYPE_DIRECTORY: FirebaseStorage.FILETYPE_DIRECTORY,
      }
    : {},
};

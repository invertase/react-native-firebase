/**
 * 
 * UploadTask representation wrapper
 */
import { statics as StorageStatics } from './';
import { isFunction } from '../../utils';
export const UPLOAD_TASK = 'upload';
export const DOWNLOAD_TASK = 'download';

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask
 */
export default class StorageTask {
  constructor(type, promise, storageRef) {
    this.type = type;
    this.ref = storageRef;
    this.storage = storageRef._storage;
    this.path = storageRef.path; // 'proxy' original promise

    this.then = promise.then.bind(promise);
    this.catch = promise.catch.bind(promise);
  }
  /**
   * Intercepts a native snapshot result object attaches ref / task instances
   * and calls the original function
   * @returns {Promise.<T>}
   * @private
   */


  _interceptSnapshotEvent(f) {
    if (!isFunction(f)) return null;
    return snapshot => {
      const _snapshot = Object.assign({}, snapshot);

      _snapshot.task = this;
      _snapshot.ref = this.ref;
      return f && f(_snapshot);
    };
  }
  /**
   * Intercepts a error object form native and converts to a JS Error
   * @param f
   * @returns {*}
   * @private
   */


  _interceptErrorEvent(f) {
    if (!isFunction(f)) return null;
    return error => {
      const _error = new Error(error.message); // $FlowExpectedError


      _error.code = error.code;
      return f && f(_error);
    };
  }
  /**
   *
   * @param nextOrObserver
   * @param error
   * @param complete
   * @returns {function()}
   * @private
   */


  _subscribe(nextOrObserver, error, complete) {
    let _error;

    let _next;

    let _complete;

    if (typeof nextOrObserver === 'function') {
      _error = this._interceptErrorEvent(error);
      _next = this._interceptSnapshotEvent(nextOrObserver);
      _complete = this._interceptSnapshotEvent(complete);
    } else if (nextOrObserver) {
      _error = this._interceptErrorEvent(nextOrObserver.error);
      _next = this._interceptSnapshotEvent(nextOrObserver.next);
      _complete = this._interceptSnapshotEvent(nextOrObserver.complete);
    }

    if (_next) {
      this.storage._addListener(this.path, StorageStatics.TaskEvent.STATE_CHANGED, _next);
    }

    if (_error) {
      this.storage._addListener(this.path, `${this.type}_failure`, _error);
    }

    if (_complete) {
      this.storage._addListener(this.path, `${this.type}_success`, _complete);
    }

    return () => {
      if (_next) this.storage._removeListener(this.path, StorageStatics.TaskEvent.STATE_CHANGED, _next);
      if (_error) this.storage._removeListener(this.path, `${this.type}_failure`, _error);
      if (_complete) this.storage._removeListener(this.path, `${this.type}_success`, _complete);
    };
  }
  /**
   *
   * @param event
   * @param nextOrObserver
   * @param error
   * @param complete
   * @returns {function()}
   */


  on(event = StorageStatics.TaskEvent.STATE_CHANGED, nextOrObserver, error, complete) {
    if (!event) {
      throw new Error("StorageTask.on listener is missing required string argument 'event'.");
    }

    if (event !== StorageStatics.TaskEvent.STATE_CHANGED) {
      throw new Error(`StorageTask.on event argument must be a string with a value of '${StorageStatics.TaskEvent.STATE_CHANGED}'`);
    } // if only event provided return the subscriber function


    if (!nextOrObserver && !error && !complete) {
      return this._subscribe.bind(this);
    }

    return this._subscribe(nextOrObserver, error, complete);
  }

  pause() {
    throw new Error('.pause() is not currently supported by react-native-firebase');
  }

  resume() {
    // todo
    throw new Error('.resume() is not currently supported by react-native-firebase');
  }

  cancel() {
    // todo
    throw new Error('.cancel() is not currently supported by react-native-firebase');
  }

}
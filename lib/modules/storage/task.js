export const UPLOAD_TASK = 'upload';
export const DOWNLOAD_TASK = 'download';

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask
 */
export default class StorageTask {
  constructor(type: string, promise, storageRef) {
    this.type = type;
    this.ref = storageRef;
    this.promise = promise;
    this.storage = storageRef.storage;
    this.path = storageRef.path;

    // 'proxy' original promise
    this.then = promise.then.bind(promise);
    this.catch = promise.catch.bind(promise);
  }

  /**
   *
   * @param event
   * @param nextOrObserver
   * @param error
   * @param complete
   * @returns {function()}
   */
  on(event = 'state_changed', nextOrObserver, error, complete) {
    if (nextOrObserver) this.storage._addListener(this.path, 'state_changed', nextOrObserver);
    if (error) this.storage._addListener(this.path, `${this.type}_failure`, error);
    if (complete) this.storage._addListener(this.path, `${this.type}_success`, complete);
    // off
    // todo support add callback syntax as per https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#on
    return () => {
      if (nextOrObserver) this.storage._removeListener(this.path, 'state_changed', nextOrObserver);
      if (error) this.storage._removeListener(this.path, `${this.type}_failure`, error);
      if (complete) this.storage._removeListener(this.path, `${this.type}_success`, complete);
    };
  }

  pause() {
    // todo
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

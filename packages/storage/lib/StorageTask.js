/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { isFunction, isNull, isObject } from '@react-native-firebase/app/lib/common';
import StorageStatics from './StorageStatics';

let TASK_ID = 0;

function wrapErrorEventListener(listenerFn, unsubscribe) {
  return event => {
    if (unsubscribe) {
      setTimeout(() => unsubscribe(), 0);
    } // 1 frame = 16ms, pushing to next frame
    if (isFunction(listenerFn)) {
      listenerFn(event.error);
    }
  };
}

function wrapSnapshotEventListener(task, listenerFn, unsubscribe) {
  if (!isFunction(listenerFn)) {
    return null;
  }
  return event => {
    if (unsubscribe) {
      setTimeout(() => unsubscribe(), 0);
    } // 1 frame = 16ms, pushing to next frame
    if (isFunction(listenerFn)) {
      const snapshot = Object.assign({}, event);
      snapshot.task = task;
      snapshot.ref = task._ref;

      if (snapshot.metadata) {
        if (!snapshot.metadata.generation) {
          snapshot.metadata.generation = '';
        }
        if (!snapshot.metadata.bucket) {
          snapshot.metadata.bucket = task._ref.bucket;
        }
        if (!snapshot.metadata.metageneration) {
          snapshot.metadata.metageneration = '';
        }
        // // TODO(salakar): these are always here, cannot repro without, remove in 6.1.0 if no issues:
        // if (!snapshot.metadata.name) snapshot.metadata.name = task._ref.name;
        // if (!snapshot.metadata.fullPath) snapshot.metadata.fullPath = task._ref.fullPath;
      }

      Object.freeze(snapshot);
      task._snapshot = snapshot;

      listenerFn(snapshot);
    }
  };
}

function addTaskEventListener(task, eventName, listener) {
  let _eventName = eventName;
  if (_eventName !== StorageStatics.TaskEvent.STATE_CHANGED) {
    _eventName = `${task._type}_${eventName}`;
  }

  return task._storage.emitter.addListener(
    task._storage.eventNameForApp(task._id, _eventName),
    listener,
  );
}

function subscribeToEvents(task, nextOrObserver, error, complete) {
  let _error;
  let _errorSubscription;

  let _next;
  let _nextSubscription;

  let _complete;
  let _completeSubscription;

  const unsubscribe = () => {
    if (_nextSubscription) {
      _nextSubscription.remove();
    }
    if (_errorSubscription) {
      _errorSubscription.remove();
    }
    if (_completeSubscription) {
      _completeSubscription.remove();
    }
  };

  if (isFunction(nextOrObserver)) {
    _error = wrapErrorEventListener(error, unsubscribe);
    _next = wrapSnapshotEventListener(task, nextOrObserver);
    _complete = wrapSnapshotEventListener(task, complete, unsubscribe);
  } else if (isObject(nextOrObserver)) {
    _error = wrapErrorEventListener(nextOrObserver.error, unsubscribe);
    _next = wrapSnapshotEventListener(task, nextOrObserver.next);
    _complete = wrapSnapshotEventListener(task, nextOrObserver.complete, unsubscribe);
  } else if (isNull(nextOrObserver)) {
    _error = wrapErrorEventListener(error, unsubscribe);
    _complete = wrapSnapshotEventListener(task, complete, unsubscribe);
  } else {
    throw new Error(
      "firebase.storage.StorageTask.on(*, _) 'nextOrObserver' must be a Function, an Object or Null.",
    );
  }

  if (_next) {
    _nextSubscription = addTaskEventListener(task, StorageStatics.TaskEvent.STATE_CHANGED, _next);
  }

  if (_error) {
    _errorSubscription = addTaskEventListener(task, 'failure', _error);
  }

  if (_complete) {
    _completeSubscription = addTaskEventListener(task, 'success', _complete);
  }

  return unsubscribe;
}

export default class StorageTask {
  constructor(type, storageRef, beginTaskFn) {
    this._type = type;
    this._id = TASK_ID++;
    this._promise = null;
    this._ref = storageRef;
    this._beginTask = beginTaskFn;
    this._storage = storageRef._storage;
    this._snapshot = null;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#then
   */
  get then() {
    if (!this._promise) {
      this._promise = this._beginTask(this);
    }

    return new Promise((resolve, reject) => {
      const boundPromise = this._promise.then.bind(this._promise);

      boundPromise(response => {
        this._snapshot = { ...response, ref: this._ref, task: this };
        resolve(response);
      }).catch(error => {
        reject(error);
      });
    }).then.bind(this._promise);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#catch
   */
  get catch() {
    if (!this._promise) {
      this._promise = this._beginTask(this);
    }
    return this._promise.catch.bind(this._promise);
  }

  get snapshot() {
    return this._snapshot;
  }

  // // NOT on Web SDK
  // /**
  //  * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#finally
  //  */
  // get finally() {
  //   if (!this._promise) this._promise = this._beginTask(this);
  //   return this._promise.finally.bind(this._promise);
  // }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#on
   */
  on(event, nextOrObserver, error, complete) {
    if (event !== StorageStatics.TaskEvent.STATE_CHANGED) {
      throw new Error(
        `firebase.storage.StorageTask.on event argument must be a string with a value of '${StorageStatics.TaskEvent.STATE_CHANGED}'`,
      );
    }

    if (!this._promise) {
      this._promise = this._beginTask(this);
    }

    // if only event provided return the subscriber function
    if (!nextOrObserver && !error && !complete) {
      return subscribeToEvents.bind(null, this);
    }

    return subscribeToEvents(this, nextOrObserver, error, complete);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#pause
   */
  pause() {
    return this._storage.native.setTaskStatus(this._id, 0);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#resume
   */
  resume() {
    return this._storage.native.setTaskStatus(this._id, 1);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#cancel
   */
  cancel() {
    return this._storage.native.setTaskStatus(this._id, 2);
  }
}

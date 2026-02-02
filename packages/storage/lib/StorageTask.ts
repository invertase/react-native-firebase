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

import { isFunction, isNull, isObject } from '@react-native-firebase/app/dist/module/common';
import type { EmitterSubscription } from 'react-native';
import { TaskEvent } from './StorageStatics';
import type { TaskSnapshot, Reference, Task, TaskSnapshotObserver } from './types/storage';
import type { ReferenceInternal, StorageInternal } from './types/internal';

let TASK_ID = 0;

function wrapErrorEventListener(
  listenerFn: ((error: Error) => void) | null | undefined,
  unsubscribe: (() => void) | null | undefined,
): (snapshot: TaskSnapshot) => void {
  return (snapshot: TaskSnapshot) => {
    if (unsubscribe) {
      setTimeout(() => unsubscribe(), 0);
    } // 1 frame = 16ms, pushing to next frame
    if (isFunction(listenerFn)) {
      const errorEvent = snapshot as TaskSnapshot & { error?: Error };
      if (errorEvent.error) {
        listenerFn(errorEvent.error);
      }
    }
  };
}

function wrapSnapshotEventListener(
  task: StorageTask,
  listenerFn: ((snapshot: TaskSnapshot) => void) | null | undefined,
  unsubscribe: (() => void) | null | undefined,
): ((snapshot: TaskSnapshot) => void) | null {
  if (!isFunction(listenerFn)) {
    return null;
  }
  return (snapshot: TaskSnapshot) => {
    if (unsubscribe) {
      setTimeout(() => unsubscribe(), 0);
    } // 1 frame = 16ms, pushing to next frame
    if (isFunction(listenerFn)) {
      const taskSnapshot = Object.assign({}, snapshot);
      taskSnapshot.task = task as unknown as Task;
      taskSnapshot.ref = task._ref;

      if (taskSnapshot.metadata) {
        if (!taskSnapshot.metadata.generation) {
          taskSnapshot.metadata.generation = '';
        }
        if (!taskSnapshot.metadata.bucket) {
          taskSnapshot.metadata.bucket = task._ref.bucket;
        }
        if (!taskSnapshot.metadata.metageneration) {
          taskSnapshot.metadata.metageneration = '';
        }
        // // TODO(salakar): these are always here, cannot repro without, remove in 6.1.0 if no issues:
        // if (!taskSnapshot.metadata.name) taskSnapshot.metadata.name = task._ref.name;
        // if (!taskSnapshot.metadata.fullPath) taskSnapshot.metadata.fullPath = task._ref.fullPath;
      }

      Object.freeze(taskSnapshot);
      task._snapshot = taskSnapshot;

      listenerFn(taskSnapshot);
    }
  };
}

function addTaskEventListener(
  task: StorageTask,
  eventName: string,
  listener: (snapshot: TaskSnapshot) => void,
): EmitterSubscription {
  let _eventName = eventName;
  if (_eventName !== TaskEvent.STATE_CHANGED) {
    _eventName = `${task._type}_${eventName}`;
  }

  return task._storage.emitter.addListener(
    task._storage.eventNameForApp(task._id, _eventName),
    listener,
  );
}

function subscribeToEvents(
  task: StorageTask,
  nextOrObserver?: ((snapshot: TaskSnapshot) => void) | TaskSnapshotObserver | null,
  error?: ((error: Error) => void) | null,
  complete?: (() => void) | null,
): () => void {
  let _error: ((snapshot: TaskSnapshot) => void) | undefined;
  let _errorSubscription: EmitterSubscription | undefined;

  let _next: ((snapshot: TaskSnapshot) => void) | null | undefined;
  let _nextSubscription: EmitterSubscription | undefined;

  let _complete: ((snapshot: TaskSnapshot) => void) | null | undefined;
  let _completeSubscription: EmitterSubscription | undefined;

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
    _next = wrapSnapshotEventListener(task, nextOrObserver, unsubscribe);
    _complete = wrapSnapshotEventListener(task, complete, unsubscribe);
  } else if (isObject(nextOrObserver)) {
    const observer = nextOrObserver as TaskSnapshotObserver;
    _error = wrapErrorEventListener(observer.error, unsubscribe);
    _next = wrapSnapshotEventListener(task, observer.next, unsubscribe);
    _complete = wrapSnapshotEventListener(task, observer.complete, unsubscribe);
  } else if (isNull(nextOrObserver)) {
    _error = wrapErrorEventListener(error, unsubscribe);
    _complete = wrapSnapshotEventListener(task, complete, unsubscribe);
  } else {
    throw new Error(
      "firebase.storage.StorageTask.on(*, _) 'nextOrObserver' must be a Function, an Object or Null.",
    );
  }

  if (_next) {
    _nextSubscription = addTaskEventListener(task, TaskEvent.STATE_CHANGED, _next);
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
  _type: string;
  _id: number;
  _promise: Promise<TaskSnapshot> | null;
  _ref: Reference;
  _beginTask: (task: StorageTask) => Promise<TaskSnapshot>;
  _storage: StorageInternal;
  _snapshot: TaskSnapshot | null;

  constructor(
    type: string,
    storageRef: Reference,
    beginTaskFn: (task: StorageTask) => Promise<TaskSnapshot>,
  ) {
    this._type = type;
    this._id = TASK_ID++;
    this._promise = null;
    this._ref = storageRef;
    this._beginTask = beginTaskFn;
    this._storage = (storageRef as ReferenceInternal)._storage;
    this._snapshot = null;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#then
   */
  get then(): (
    onFulfilled?: ((snapshot: TaskSnapshot) => TaskSnapshot) | null,
    onRejected?: ((error: Error) => any) | null,
  ) => Promise<TaskSnapshot> {
    if (!this._promise) {
      this._promise = this._beginTask(this);
    }

    const promise = this._promise;
    return (
      onFulfilled?: ((snapshot: TaskSnapshot) => any) | null,
      onRejected?: ((error: Error) => any) | null,
    ) => {
      return new Promise((resolve, reject) => {
        promise
          .then((response: any) => {
            this._snapshot = { ...response, ref: this._ref, task: this } as TaskSnapshot;
            if (onFulfilled) {
              resolve(onFulfilled(this._snapshot!));
            } else {
              resolve(response);
            }
          })
          .catch((error: Error) => {
            if (onRejected) {
              resolve(onRejected(error));
            } else {
              reject(error);
            }
          });
      });
    };
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#catch
   */
  get catch(): (onRejected: (error: Error) => any) => Promise<any> {
    if (!this._promise) {
      this._promise = this._beginTask(this);
    }
    return this._promise!.catch.bind(this._promise);
  }

  get snapshot(): TaskSnapshot | null {
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
  on(
    event: 'state_changed',
    nextOrObserver?: TaskSnapshotObserver | null | ((snapshot: TaskSnapshot) => void),
    error?: ((error: Error) => void) | null,
    complete?: (() => void) | null,
  ): () => void {
    if (event !== TaskEvent.STATE_CHANGED) {
      throw new Error(
        `firebase.storage.StorageTask.on event argument must be a string with a value of '${TaskEvent.STATE_CHANGED}'`,
      );
    }

    if (!this._promise) {
      this._promise = this._beginTask(this);
    }

    // if only event provided return the subscriber function
    if (!nextOrObserver && !error && !complete) {
      return ((...args: any[]) => subscribeToEvents(this, ...args)) as () => void;
    }

    return subscribeToEvents(this, nextOrObserver, error, complete);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#pause
   */
  pause(): Promise<boolean> {
    return this._storage.native.setTaskStatus(this._id, 0);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#pause
   */
  resume(): Promise<boolean> {
    return this._storage.native.setTaskStatus(this._id, 1);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#cancel
   */
  cancel(): Promise<boolean> {
    return this._storage.native.setTaskStatus(this._id, 2);
  }
}

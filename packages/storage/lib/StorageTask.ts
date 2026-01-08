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
import type { EmitterSubscription } from 'react-native';
import { TaskEvent } from './StorageStatics';
import type { TaskSnapshot, Reference } from './types/storage';

let TASK_ID = 0;

function wrapErrorEventListener(
  listenerFn: ((error: Error) => void) | null | undefined,
  unsubscribe: (() => void) | null | undefined,
): (event: { error: Error }) => void {
  return event => {
    if (unsubscribe) {
      setTimeout(() => unsubscribe(), 0);
    } // 1 frame = 16ms, pushing to next frame
    if (isFunction(listenerFn)) {
      listenerFn(event.error);
    }
  };
}

function wrapSnapshotEventListener(
  task: StorageTask,
  listenerFn: ((snapshot: TaskSnapshot) => void) | null | undefined,
  unsubscribe: (() => void) | null | undefined,
): ((event: any) => void) | null {
  if (!isFunction(listenerFn)) {
    return null;
  }
  return event => {
    if (unsubscribe) {
      setTimeout(() => unsubscribe(), 0);
    } // 1 frame = 16ms, pushing to next frame
    if (isFunction(listenerFn)) {
      const snapshot = Object.assign({}, event) as any;
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

function addTaskEventListener(
  task: StorageTask,
  eventName: string,
  listener: (event: any) => void,
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
  nextOrObserver?:
    | ((snapshot: TaskSnapshot) => void)
    | {
        next?: (snapshot: TaskSnapshot) => void;
        error?: (error: Error) => void;
        complete?: () => void;
      }
    | null,
  error?: ((error: Error) => void) | null,
  complete?: (() => void) | null,
): () => void {
  let _error: ((event: { error: Error }) => void) | undefined;
  let _errorSubscription: EmitterSubscription | undefined;

  let _next: ((event: any) => void) | null | undefined;
  let _nextSubscription: EmitterSubscription | undefined;

  let _complete: ((event: any) => void) | null | undefined;
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
    _error = wrapErrorEventListener(nextOrObserver.error, unsubscribe);
    _next = wrapSnapshotEventListener(task, nextOrObserver.next, unsubscribe);
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
  _promise: Promise<any> | null;
  _ref: Reference;
  _beginTask: (task: StorageTask) => Promise<any>;
  _storage: any; // Will be properly typed when Storage module is converted
  _snapshot: TaskSnapshot | null;

  constructor(
    type: string,
    storageRef: Reference,
    beginTaskFn: (task: StorageTask) => Promise<any>,
  ) {
    this._type = type;
    this._id = TASK_ID++;
    this._promise = null;
    this._ref = storageRef;
    this._beginTask = beginTaskFn;
    this._storage = (storageRef as any)._storage;
    this._snapshot = null;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#then
   */
  get then(): (
    onFulfilled?: ((snapshot: TaskSnapshot) => any) | null,
    onRejected?: ((error: Error) => any) | null,
  ) => Promise<any> {
    if (!this._promise) {
      this._promise = this._beginTask(this);
    }

    const promise = this._promise;
    return ((
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
    }) as any;
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
    event: string,
    nextOrObserver?:
      | ((snapshot: TaskSnapshot) => void)
      | {
          next?: (snapshot: TaskSnapshot) => void;
          error?: (error: Error) => void;
          complete?: () => void;
        }
      | null,
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

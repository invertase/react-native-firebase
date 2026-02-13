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
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type {
  FullMetadata,
  StorageObserver,
  StorageReference,
  Subscribe,
  Task,
  TaskEvent as TaskEventType,
  TaskSnapshot,
  TaskState,
  Unsubscribe,
} from './types/storage';
import type { StorageReferenceInternal, StorageInternal } from './types/internal';

let TASK_ID = 0;

function createEmptyMetadata(ref: StorageReference): FullMetadata {
  return {
    bucket: ref.bucket,
    fullPath: ref.fullPath,
    generation: '',
    metageneration: '',
    name: ref.name,
    size: 0,
    timeCreated: '',
    updated: '',
    downloadTokens: undefined,
    ref,
  };
}

function normalizeTaskState(state: TaskState): TaskState {
  return state;
}

function wrapErrorEventListener(
  listenerFn: ((error: ReactNativeFirebase.NativeFirebaseError) => void) | null | undefined,
  unsubscribe: (() => void) | null | undefined,
): (snapshot: TaskSnapshot) => void {
  return (snapshot: TaskSnapshot) => {
    if (unsubscribe) {
      setTimeout(() => unsubscribe(), 0);
    } // 1 frame = 16ms, pushing to next frame
    if (isFunction(listenerFn)) {
      const errorEvent = snapshot as TaskSnapshot & {
        error?: ReactNativeFirebase.NativeFirebaseError;
      };
      if (errorEvent.error) {
        listenerFn(errorEvent.error);
      }
    }
  };
}

function wrapSnapshotEventListener(
  task: StorageTask,
  listenerFn: ((snapshot: TaskSnapshot) => unknown) | null | undefined,
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
      taskSnapshot.task = task as Task;
      taskSnapshot.ref = task._ref;
      taskSnapshot.state = normalizeTaskState(taskSnapshot.state);

      if (!taskSnapshot.metadata) {
        taskSnapshot.metadata = createEmptyMetadata(task._ref);
      } else {
        if (!taskSnapshot.metadata.generation) taskSnapshot.metadata.generation = '';
        if (!taskSnapshot.metadata.bucket) taskSnapshot.metadata.bucket = task._ref.bucket;
        if (!taskSnapshot.metadata.metageneration) taskSnapshot.metadata.metageneration = '';
        if (!taskSnapshot.metadata.fullPath) taskSnapshot.metadata.fullPath = task._ref.fullPath;
        if (!taskSnapshot.metadata.name) taskSnapshot.metadata.name = task._ref.name;
        if (!taskSnapshot.metadata.ref) taskSnapshot.metadata.ref = task._ref;
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
  nextOrObserver?: ((snapshot: TaskSnapshot) => unknown) | StorageObserver<TaskSnapshot> | null,
  error?: ((error: ReactNativeFirebase.NativeFirebaseError) => unknown) | null,
  complete?: (() => unknown) | null,
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
    _next = wrapSnapshotEventListener(task, nextOrObserver, null);
    _complete = wrapSnapshotEventListener(task, complete, unsubscribe);
  } else if (isObject(nextOrObserver)) {
    const observer = nextOrObserver as StorageObserver<TaskSnapshot>;
    _error = wrapErrorEventListener(observer.error, unsubscribe);
    _next = wrapSnapshotEventListener(task, observer.next, null);
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
  _ref: StorageReference;
  _beginTask: (task: StorageTask) => Promise<TaskSnapshot>;
  _storage: StorageInternal;
  _snapshot: TaskSnapshot;

  constructor(
    type: string,
    storageRef: StorageReference,
    beginTaskFn: (task: StorageTask) => Promise<TaskSnapshot>,
  ) {
    this._type = type;
    this._id = TASK_ID++;
    this._promise = null;
    this._ref = storageRef;
    this._beginTask = beginTaskFn;
    this._storage = (storageRef as StorageReferenceInternal)._storage;
    this._snapshot = {
      bytesTransferred: 0,
      totalBytes: 0,
      state: 'running',
      metadata: createEmptyMetadata(storageRef),
      task: this as Task,
      ref: storageRef,
    };
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask#then
   */
  get then(): (
    onFulfilled?: ((snapshot: TaskSnapshot) => TaskSnapshot) | null,
    onRejected?: ((error: ReactNativeFirebase.NativeFirebaseError) => any) | null,
  ) => Promise<TaskSnapshot> {
    if (!this._promise) {
      this._promise = this._beginTask(this);
    }

    const promise = this._promise;
    return (
      onFulfilled?: ((snapshot: TaskSnapshot) => any) | null,
      onRejected?: ((error: ReactNativeFirebase.NativeFirebaseError) => any) | null,
    ) => {
      return new Promise((resolve, reject) => {
        promise
          .then((response: any) => {
            this._snapshot = {
              ...response,
              ref: this._ref,
              task: this as Task,
              state: normalizeTaskState((response?.state ?? this._snapshot.state) as TaskState),
              metadata: response?.metadata ? response.metadata : createEmptyMetadata(this._ref),
            } as TaskSnapshot;
            if (onFulfilled) {
              resolve(onFulfilled(this._snapshot!));
            } else {
              resolve(response);
            }
          })
          .catch((error: ReactNativeFirebase.NativeFirebaseError) => {
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
  get catch(): (
    onRejected: (error: ReactNativeFirebase.NativeFirebaseError) => any,
  ) => Promise<any> {
    if (!this._promise) {
      this._promise = this._beginTask(this);
    }
    return this._promise!.catch.bind(this._promise);
  }

  get snapshot(): TaskSnapshot {
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
  on(event: TaskEventType): Subscribe<TaskSnapshot>;
  on(
    event: TaskEventType,
    nextOrObserver?: StorageObserver<TaskSnapshot> | null | ((snapshot: TaskSnapshot) => unknown),
    error?: ((error: ReactNativeFirebase.NativeFirebaseError) => unknown) | null,
    complete?: (() => unknown) | null,
  ): Unsubscribe;
  on(
    event: TaskEventType,
    nextOrObserver?: StorageObserver<TaskSnapshot> | null | ((snapshot: TaskSnapshot) => unknown),
    error?: ((error: ReactNativeFirebase.NativeFirebaseError) => unknown) | null,
    complete?: (() => unknown) | null,
  ): Unsubscribe | Subscribe<TaskSnapshot> {
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
      return ((...args: Parameters<Subscribe<TaskSnapshot>>) =>
        subscribeToEvents(this, ...args)) as Subscribe<TaskSnapshot>;
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

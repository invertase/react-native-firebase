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

import { isFunction } from '@react-native-firebase/common';
import StorageStatics from './StorageStatics';

let TASK_ID = 0;

export default class StorageTaskInternal {
  constructor(type, storageRef) {
    this._id = TASK_ID++;
    this._type = type;
    this._ref = storageRef;
    this._storage = storageRef._storage;
    this._url = storageRef.toString();

    // 'proxy' original promise
    // this.then = promise.then.bind(promise);
    // this.catch = promise.catch.bind(promise);
  }

  _interceptSnapshotEvent(f) {
    if (!isFunction(f)) return null;
    return snapshot => {
      const _snapshot = Object.assign({}, snapshot);
      _snapshot.task = this;
      _snapshot.ref = this._ref;
      return f && f(_snapshot);
    };
  }

  _interceptErrorEvent(f) {
    if (!isFunction(f)) return null;
    return error => {
      const _error = new Error(error.message);
      _error.code = error.code;
      return f && f(_error);
    };
  }

  _subscribe(nextOrObserver, error, complete) {
    let _error;
    let _errorSubscription;

    let _next;
    let _nextSubscription;

    let _complete;
    let _completeSubscription;

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
      _nextSubscription = this._storage._addListener(
        this._url,
        StorageStatics.TaskEvent.STATE_CHANGED,
        _next,
      );
    }

    if (_error) {
      _errorSubscription = this._storage._addListener(this._url, `${this._type}_failure`, _error);
    }

    if (_complete) {
      _completeSubscription = this._storage._addListener(
        this._url,
        `${this._type}_success`,
        _complete,
      );
    }

    return () => {
      if (_nextSubscription) _nextSubscription.remove();
      if (_errorSubscription) _errorSubscription.remove();
      if (_completeSubscription) _completeSubscription.remove();
    };
  }

  on(event, nextOrObserver, error, complete) {
    if (!event) {
      throw new Error("StorageTask.on listener is missing required string argument 'event'.");
    }

    if (event !== StorageStatics.TaskEvent.STATE_CHANGED) {
      throw new Error(
        `StorageTask.on event argument must be a string with a value of '${
          StorageStatics.TaskEvent.STATE_CHANGED
        }'`,
      );
    }

    // if only event provided return the subscriber function
    if (!nextOrObserver && !error && !complete) {
      return this._subscribe.bind(this);
    }

    return this._subscribe(nextOrObserver, error, complete);
  }

  pause() {
    // TODO(salakar) implement
  }

  resume() {
    // TODO(salakar) implement
  }

  cancel() {
    // TODO(salakar) implement
  }
}

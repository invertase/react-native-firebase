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

import type { LoadBundleTaskProgress } from './types/firestore';

export type { LoadBundleTaskProgress, TaskState } from './types/firestore';

type ProgressObserver = {
  next?: (progress: LoadBundleTaskProgress) => unknown;
  error?: (err: Error) => unknown;
  complete?: () => void;
};

export class LoadBundleTask implements PromiseLike<LoadBundleTaskProgress> {
  private _progressObserver: ProgressObserver = {};
  private _completionPromise: Promise<LoadBundleTaskProgress>;
  private _resolve?: (progress: LoadBundleTaskProgress) => void;
  private _reject?: (error: Error) => void;
  private _lastProgress: LoadBundleTaskProgress = {
    taskState: 'Running',
    totalBytes: 0,
    totalDocuments: 0,
    bytesLoaded: 0,
    documentsLoaded: 0,
  };

  constructor() {
    this._completionPromise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  onProgress(
    next?: (progress: LoadBundleTaskProgress) => unknown,
    error?: (err: Error) => unknown,
    complete?: () => void,
  ): void {
    this._progressObserver = { next, error, complete };
  }

  catch<R>(onRejected: (a: Error) => R | PromiseLike<R>): Promise<R | LoadBundleTaskProgress> {
    return this._completionPromise.catch(onRejected);
  }

  then<T, R>(
    onFulfilled?: (a: LoadBundleTaskProgress) => T | PromiseLike<T>,
    onRejected?: (a: Error) => R | PromiseLike<R>,
  ): Promise<T | R> {
    return this._completionPromise.then(onFulfilled, onRejected);
  }

  _completeWith(progress: LoadBundleTaskProgress): void {
    this._updateProgress(progress);
    this._progressObserver.complete?.();
    this._resolve?.(progress);
  }

  _failWith(error: Error): void {
    this._lastProgress = { ...this._lastProgress, taskState: 'Error' };
    this._progressObserver.next?.(this._lastProgress);
    this._progressObserver.error?.(error);
    this._reject?.(error);
  }

  _updateProgress(progress: LoadBundleTaskProgress): void {
    if (this._lastProgress.taskState !== 'Running') {
      return;
    }
    this._lastProgress = progress;
    this._progressObserver.next?.(progress);
  }
}

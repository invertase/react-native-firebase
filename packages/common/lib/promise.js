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

import { isFunction } from './validate';

/**
 *
 */
export function promiseDefer() {
  const deferred = {
    resolve: null,
    reject: null,
  };

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
}

/**
 * @param promise
 * @param callback
 */
export function promiseWithOptionalCallback(promise, callback) {
  if (!isFunction(callback)) {
    return promise;
  }

  return promise
    .then(result => {
      if (callback && callback.length === 1) {
        callback(null);
      } else if (callback) {
        callback(null, result);
      }

      return result;
    })
    .catch(error => {
      if (callback) {
        callback(error);
      }
      return Promise.reject(error);
    });
}

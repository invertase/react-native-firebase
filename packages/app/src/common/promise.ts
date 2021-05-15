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
interface PromiseDefer<T = void, E = Error> {
  promise: Promise<T>;
  resolve: (result: T) => void;
  reject: (error?: E) => void;
}

export function promiseDefer<T, E>(): PromiseDefer<T, E> {
  const deferred: PromiseDefer<T, E> = {
    promise: Promise.resolve<T>({} as T),
    resolve: null as any,
    reject: null as any,
  };

  deferred.promise = new Promise<T>((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
}

type OptionalCallback<T> = (error: Error | null, result?: T) => void;

/**
 * @param promise
 * @param callback
 */
export async function promiseWithOptionalCallback<T>(
  promise: Promise<T>,
  callback: OptionalCallback<T>,
): Promise<T> {
  if (!isFunction(callback)) {
    return promise;
  }

  try {
    const result = await promise;
    if (callback && callback.length === 1) {
      callback(null);
    } else if (callback) {
      callback(null, result);
    }
    return result;
  } catch (error) {
    if (callback) {
      callback(error);
    }
    return await Promise.reject(error);
  }
}

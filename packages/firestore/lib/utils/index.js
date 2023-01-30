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

import {
  hasOwnProperty,
  isArray,
  isBoolean,
  isFunction,
  isObject,
  isString,
  isUndefined,
} from '@react-native-firebase/app/lib/common';
import FirestoreFieldPath, { fromDotSeparatedString } from '../FirestoreFieldPath';

export function extractFieldPathData(data, segments) {
  if (!isObject(data)) {
    return undefined;
  }

  const pathValue = data[segments[0]];

  if (segments.length === 1) {
    return pathValue;
  }

  return extractFieldPathData(pathValue, segments.slice(1));
}

export function parseUpdateArgs(args) {
  let data = {};
  if (args.length === 1) {
    if (!isObject(args[0])) {
      throw new Error('if using a single update argument, it must be an object.');
    }
    [data] = args;
  } else if (args.length % 2 === 1) {
    throw new Error(
      'the update arguments must be either a single object argument, or equal numbers of key/value pairs.',
    );
  } else {
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i];
      const value = args[i + 1];
      if (isString(key)) {
        data[key] = value;
      } else if (key instanceof FirestoreFieldPath) {
        data[key._toPath()] = value;
      } else {
        throw new Error(`argument at index ${i} must be a string or FieldPath`);
      }
    }
  }
  return data;
}

/**
 *
 * @param options
 */
export function parseSetOptions(options) {
  const out = {};

  if (isUndefined(options)) {
    return out;
  }

  if (!isObject(options)) {
    throw new Error("'options' must be an object.");
  }

  if (hasOwnProperty(options, 'merge') && hasOwnProperty(options, 'mergeFields')) {
    throw new Error("'options' must not contain both 'merge' & 'mergeFields'.");
  }

  if (!isUndefined(options.merge)) {
    if (!isBoolean(options.merge)) {
      throw new Error("'options.merge' must be a boolean value.");
    }

    out.merge = options.merge;
  }

  if (!isUndefined(options.mergeFields)) {
    if (!isArray(options.mergeFields)) {
      throw new Error("'options.mergeFields' must be an array.");
    }

    out.mergeFields = [];

    for (let i = 0; i < options.mergeFields.length; i++) {
      const field = options.mergeFields[i];
      if (!isString(field) && !(field instanceof FirestoreFieldPath)) {
        throw new Error(
          `'options.mergeFields' all fields must be of type string or FieldPath, but the value at index ${i} was ${typeof field}`,
        );
      }

      let path = field;

      if (isString(path)) {
        try {
          path = fromDotSeparatedString(field);
        } catch (e) {
          throw new Error(`'options.mergeFields' ${e.message}`);
        }
      }

      if (field instanceof FirestoreFieldPath) {
        out.mergeFields.push(field._toPath());
      } else {
        out.mergeFields.push(field);
      }
    }
  }

  return out;
}

// function buildFieldPathData(segments, value) {
//   if (segments.length === 1) {
//     return {
//       [segments[0]]: value,
//     };
//   }
//   return {
//     [segments[0]]: buildFieldPathData(segments.slice(1), value),
//   };
// }

function isPartialObserver(input) {
  if (input == null) {
    return false;
  }
  return input.next != null || input.error != null || input.complete != null;
}

export function parseSnapshotArgs(args) {
  if (args.length === 0) {
    throw new Error('expected at least one argument.');
  }

  // Ignore onComplete as its never used
  const NOOP = () => {};
  const snapshotListenOptions = {};
  let callback = NOOP;
  let onError = NOOP;
  let onNext = NOOP;

  /**
   * .onSnapshot(Function...
   */
  if (isFunction(args[0])) {
    /**
     * .onSnapshot((snapshot) => {}, (error) => {}
     */
    if (isFunction(args[1])) {
      onNext = args[0];
      onError = args[1];
    } else {
      /**
       * .onSnapshot((snapshot, error) => {})
       */
      callback = args[0];
    }
  }

  /**
   * .onSnapshot({ complete: () => {}, error: (e) => {}, next: (snapshot) => {} })
   */
  if (isObject(args[0]) && isPartialObserver(args[0])) {
    const observer = args[0];
    if (observer.error) {
      onError = isFunction(observer.error) ? observer.error.bind(observer) : observer.error;
    }
    if (observer.next) {
      onNext = isFunction(observer.next) ? observer.next.bind(observer) : observer.next;
    }
  }

  /**
   * .onSnapshot(SnapshotListenOptions, ...
   */
  if (isObject(args[0]) && !isPartialObserver(args[0])) {
    snapshotListenOptions.includeMetadataChanges =
      args[0].includeMetadataChanges == null ? false : args[0].includeMetadataChanges;
    if (isFunction(args[1])) {
      /**
       * .onSnapshot(SnapshotListenOptions, Function);
       */
      if (isFunction(args[2])) {
        /**
         * .onSnapshot(SnapshotListenOptions, (snapshot) => {}, (error) => {});
         */
        onNext = args[1];
        onError = args[2];
      } else {
        /**
         * .onSnapshot(SnapshotListenOptions, (s, e) => {};
         */
        callback = args[1];
      }
    } else if (isPartialObserver(args[1])) {
      /**
       * .onSnapshot(SnapshotListenOptions, { complete: () => {}, error: (e) => {}, next: (snapshot) => {} });
       */
      const observer = args[1];
      if (observer.error) {
        onError = isFunction(observer.error) ? observer.error.bind(observer) : observer.error;
      }
      if (observer.next) {
        onNext = isFunction(observer.next) ? observer.next.bind(observer) : observer.next;
      }
    }
  }

  if (hasOwnProperty(snapshotListenOptions, 'includeMetadataChanges')) {
    if (!isBoolean(snapshotListenOptions.includeMetadataChanges)) {
      throw new Error("'options' SnapshotOptions.includeMetadataChanges must be a boolean value.");
    }
  }

  if (!isFunction(onNext)) {
    throw new Error("'observer.next' or 'onNext' expected a function.");
  }

  if (!isFunction(onError)) {
    throw new Error("'observer.error' or 'onError' expected a function.");
  }

  return { snapshotListenOptions, callback, onNext, onError };
}

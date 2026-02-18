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
} from '@react-native-firebase/app/dist/module/common';
import FieldPath, { fromDotSeparatedString } from '../FirestoreFieldPath';

export function extractFieldPathData(data: unknown, segments: string[]): unknown {
  if (!isObject(data)) {
    return undefined;
  }

  const key = segments[0];
  if (key === undefined) return undefined;
  const pathValue = (data as Record<string, unknown>)[key];

  if (segments.length === 1) {
    return pathValue;
  }

  return extractFieldPathData(pathValue, segments.slice(1));
}

export function parseUpdateArgs(args: unknown[]): Record<string, unknown> {
  let data: Record<string, unknown> = {};
  if (args.length === 1) {
    if (!isObject(args[0])) {
      throw new Error('if using a single update argument, it must be an object.');
    }
    data = args[0] as Record<string, unknown>;
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
      } else if (key instanceof FieldPath) {
        data[key._toPath()] = value;
      } else {
        throw new Error(`argument at index ${i} must be a string or FieldPath`);
      }
    }
  }
  return data;
}

export function parseSetOptions(options?: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  if (isUndefined(options)) {
    return out;
  }

  if (!isObject(options)) {
    throw new Error("'options' must be an object.");
  }

  const opts = options as Record<string, unknown>;
  if (hasOwnProperty(opts, 'merge') && hasOwnProperty(opts, 'mergeFields')) {
    throw new Error("'options' must not contain both 'merge' & 'mergeFields'.");
  }

  if (!isUndefined(opts.merge)) {
    if (!isBoolean(opts.merge)) {
      throw new Error("'options.merge' must be a boolean value.");
    }
    out.merge = opts.merge;
  }

  if (!isUndefined(opts.mergeFields)) {
    if (!isArray(opts.mergeFields)) {
      throw new Error("'options.mergeFields' must be an array.");
    }
    out.mergeFields = [];

    const mergeFields = opts.mergeFields as unknown[];
    for (let i = 0; i < mergeFields.length; i++) {
      const field = mergeFields[i];
      if (!isString(field) && !(field instanceof FieldPath)) {
        throw new Error(
          `'options.mergeFields' all fields must be of type string or FieldPath, but the value at index ${i} was ${typeof field}`,
        );
      }

      if (field instanceof FieldPath) {
        (out.mergeFields as string[]).push(field._toPath());
      } else {
        try {
          fromDotSeparatedString(field as string);
        } catch (e) {
          throw new Error(`'options.mergeFields' ${(e as Error).message}`);
        }
        (out.mergeFields as string[]).push(field as string);
      }
    }
  }

  return out;
}

export function applyFirestoreDataConverter(
  data: unknown,
  converter: unknown,
  options?: unknown,
): unknown {
  if (
    converter &&
    (converter as { toFirestore?: (data: unknown, options?: unknown) => unknown }).toFirestore
  ) {
    return (
      converter as { toFirestore: (data: unknown, options?: unknown) => unknown }
    ).toFirestore(data, options);
  }
  return data;
}

function isPartialObserver(
  input: unknown,
): input is { next?: unknown; error?: unknown; complete?: unknown } {
  if (input == null) {
    return false;
  }
  const o = input as Record<string, unknown>;
  return o.next != null || o.error != null || o.complete != null;
}

export interface ParseSnapshotArgsResult {
  snapshotListenOptions: { includeMetadataChanges?: boolean };
  callback: (snapshot: unknown, error: Error | null) => void;
  onNext: (snapshot: unknown) => void;
  onError: (error: Error) => void;
}

export function parseSnapshotArgs(args: unknown[]): ParseSnapshotArgsResult {
  if (args.length === 0) {
    throw new Error('expected at least one argument.');
  }

  const NOOP = (): void => {};
  const snapshotListenOptions: { includeMetadataChanges?: boolean } = {};
  let callback: (snapshot: unknown, error: Error | null) => void = NOOP;
  let onError: (error: Error) => void = NOOP;
  let onNext: (snapshot: unknown) => void = NOOP;

  if (isFunction(args[0])) {
    if (isFunction(args[1])) {
      onNext = args[0] as (snapshot: unknown) => void;
      onError = args[1] as (error: Error) => void;
    } else {
      callback = args[0] as (snapshot: unknown, error: Error | null) => void;
    }
  }

  if (isObject(args[0]) && isPartialObserver(args[0])) {
    const observer = args[0] as { next?: (snapshot: unknown) => void; error?: (e: Error) => void };
    if (observer.error) {
      onError =
        typeof observer.error === 'function' ? observer.error.bind(observer) : observer.error;
    }
    if (observer.next) {
      onNext = typeof observer.next === 'function' ? observer.next.bind(observer) : observer.next;
    }
  }

  if (isObject(args[0]) && !isPartialObserver(args[0])) {
    const opts = args[0] as { includeMetadataChanges?: boolean };
    snapshotListenOptions.includeMetadataChanges =
      opts.includeMetadataChanges == null ? false : opts.includeMetadataChanges;
    if (isFunction(args[1])) {
      if (isFunction(args[2])) {
        onNext = args[1] as (snapshot: unknown) => void;
        onError = args[2] as (error: Error) => void;
      } else {
        callback = args[1] as (snapshot: unknown, error: Error | null) => void;
      }
    } else if (isPartialObserver(args[1])) {
      const observer = args[1] as {
        next?: (snapshot: unknown) => void;
        error?: (e: Error) => void;
      };
      if (observer.error) {
        onError =
          typeof observer.error === 'function' ? observer.error.bind(observer) : observer.error;
      }
      if (observer.next) {
        onNext = typeof observer.next === 'function' ? observer.next.bind(observer) : observer.next;
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

export function validateWithConverter(converter: unknown): void {
  if (isUndefined(converter) || !isObject(converter)) {
    throw new Error('expected an object value.');
  }

  const c = converter as { toFirestore?: unknown; fromFirestore?: unknown };
  if (!isFunction(c.toFirestore)) {
    throw new Error("'toFirestore' expected a function.");
  }

  if (!isFunction(c.fromFirestore)) {
    throw new Error("'fromFirestore' expected a function.");
  }
}

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
  DocumentReference,
  Timestamp,
  GeoPoint,
  Bytes,
  doc,
  documentId,
  serverTimestamp,
  increment,
  deleteField,
  arrayUnion,
  arrayRemove,
  vector,
  VectorValue,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestore';

const INT_NAN = 0;
const INT_NEGATIVE_INFINITY = 1;
const INT_POSITIVE_INFINITY = 2;
const INT_NULL = 3;
const INT_DOCUMENTID = 4;
const INT_BOOLEAN_TRUE = 5;
const INT_BOOLEAN_FALSE = 6;
const INT_DOUBLE = 7;
const INT_STRING = 8;
const INT_STRING_EMPTY = 9;
const INT_ARRAY = 10;
const INT_REFERENCE = 11;
const INT_GEOPOINT = 12;
const INT_TIMESTAMP = 13;
const INT_BLOB = 14;
const INT_FIELDVALUE = 15;
const INT_OBJECT = 16;
const INT_INTEGER = 17;
const INT_NEGATIVE_ZERO = 18;
const INT_VECTOR = 19;
const INT_UNKNOWN = -999;

const TYPE = 'type';
const KEY_PATH = 'path';
const KEY_DATA = 'data';
const KEY_OPTIONS = 'options';

export function objectToWriteable(object: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(object)) {
    out[key] = buildTypeMap(value);
  }
  return out;
}

export function arrayToWriteable(array: unknown[]): unknown[] {
  return array.map(buildTypeMap);
}

export function readableToObject(
  firestore: any,
  readableMap: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(readableMap)) {
    out[key] = parseTypeMap(firestore, value as [number, unknown?]);
  }
  return out;
}

export function readableToArray(firestore: any, readableArray: unknown[]): unknown[] {
  return readableArray.map(value => parseTypeMap(firestore, value as [number, unknown?]));
}

export interface ParsedDocumentBatch {
  type: string;
  path: string;
  data?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

export function parseDocumentBatches(
  firestore: any,
  readableArray: Array<Record<string, unknown>>,
): ParsedDocumentBatch[] {
  const out: ParsedDocumentBatch[] = [];

  for (const map of readableArray) {
    const write: ParsedDocumentBatch = {
      [TYPE]: map[TYPE] as string,
      [KEY_PATH]: map[KEY_PATH] as string,
    };

    if (KEY_DATA in map) {
      write.data = readableToObject(firestore, map[KEY_DATA] as Record<string, unknown>);
    }

    if (KEY_OPTIONS in map) {
      write.options = map[KEY_OPTIONS] as Record<string, unknown>;
    }

    out.push(write);
  }

  return out;
}

function buildTypeMap(value: unknown): unknown {
  const out: unknown[] = [];
  if (value === null) {
    out.push(INT_NULL);
    return out;
  }

  if (typeof value === 'boolean') {
    out.push(value ? INT_BOOLEAN_TRUE : INT_BOOLEAN_FALSE);
    return out;
  }

  if (typeof value === 'number' && !Number.isInteger(value)) {
    out.push(INT_DOUBLE);
    out.push(value);
    return out;
  }

  if (typeof value === 'number' && Number.isInteger(value)) {
    if (value === Number.NEGATIVE_INFINITY) {
      out.push(INT_NEGATIVE_INFINITY);
      return out;
    }
    if (value === Number.POSITIVE_INFINITY) {
      out.push(INT_POSITIVE_INFINITY);
      return out;
    }
    if (Number.isNaN(value)) {
      out.push(INT_NAN);
      return out;
    }
    out.push(INT_DOUBLE);
    out.push(value);
    return out;
  }

  if (typeof value === 'string') {
    if (value === '') {
      out.push(INT_STRING_EMPTY);
    } else {
      out.push(INT_STRING);
      out.push(value);
    }
    return out;
  }

  if (Array.isArray(value)) {
    out.push(INT_ARRAY);
    out.push(arrayToWriteable(value));
    return out;
  }

  if (value instanceof DocumentReference) {
    out.push(INT_REFERENCE);
    out.push(value.path);
    return out;
  }

  if (value instanceof Timestamp) {
    out.push(INT_TIMESTAMP);
    out.push([value.seconds, value.nanoseconds]);
    return out;
  }

  if (value instanceof GeoPoint) {
    out.push(INT_GEOPOINT);
    out.push([value.latitude, value.longitude]);
    return out;
  }

  if (value instanceof Bytes) {
    out.push(INT_BLOB);
    out.push(value.toBase64());
    return out;
  }

  if (value instanceof VectorValue) {
    out.push(INT_VECTOR);
    out.push(value.toArray());
    return out;
  }

  if (typeof value === 'object') {
    out.push(INT_OBJECT);
    out.push(objectToWriteable(value as Record<string, unknown>));
    return out;
  }

  out.push(INT_UNKNOWN);
  return out;
}

export function parseTypeMap(firestore: any, typedArray: [number, unknown?]): unknown {
  const value = typedArray[0];

  switch (value) {
    case INT_NAN:
      return NaN;
    case INT_NEGATIVE_INFINITY:
      return Number.NEGATIVE_INFINITY;
    case INT_POSITIVE_INFINITY:
      return Number.POSITIVE_INFINITY;
    case INT_NULL:
      return null;
    case INT_DOCUMENTID:
      return documentId();
    case INT_BOOLEAN_TRUE:
      return true;
    case INT_BOOLEAN_FALSE:
      return false;
    case INT_NEGATIVE_ZERO:
      return -0;
    case INT_INTEGER:
      return Number(typedArray[1]);
    case INT_DOUBLE:
      return Number(typedArray[1]);
    case INT_STRING:
      return String(typedArray[1]);
    case INT_STRING_EMPTY:
      return '';
    case INT_ARRAY:
      return readableToArray(firestore, (typedArray[1] ?? []) as unknown[]);
    case INT_REFERENCE:
      return doc(firestore, typedArray[1] as string);
    case INT_GEOPOINT: {
      const v = (typedArray[1] ?? []) as number[];
      return new GeoPoint(v[0] ?? 0, v[1] ?? 0);
    }
    case INT_TIMESTAMP: {
      const v = (typedArray[1] ?? []) as number[];
      return new Timestamp(v[0] ?? 0, v[1] ?? 0);
    }
    case INT_BLOB:
      return Bytes.fromBase64String(typedArray[1] as string);
    case INT_FIELDVALUE: {
      const fieldValueArray = (typedArray[1] ?? []) as unknown[];
      const fieldValueType = fieldValueArray[0];

      if (fieldValueType === 'timestamp') {
        return serverTimestamp();
      }
      if (fieldValueType === 'increment') {
        return increment(fieldValueArray[1] as number);
      }
      if (fieldValueType === 'delete') {
        return deleteField();
      }
      if (fieldValueType === 'array_union') {
        const elements = readableToArray(firestore, (fieldValueArray[1] ?? []) as unknown[]);
        return arrayUnion(...elements);
      }
      if (fieldValueType === 'array_remove') {
        const elements = readableToArray(firestore, (fieldValueArray[1] ?? []) as unknown[]);
        return arrayRemove(...elements);
      }
      return null;
    }
    case INT_OBJECT:
      return readableToObject(firestore, (typedArray[1] ?? {}) as Record<string, unknown>);
    case INT_VECTOR:
      return vector(typedArray[1] as number[]);
    case INT_UNKNOWN:
    default:
      return null;
  }
}

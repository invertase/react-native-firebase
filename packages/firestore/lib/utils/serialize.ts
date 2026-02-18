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
  isArray,
  isBoolean,
  isDate,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from '@react-native-firebase/app/dist/module/common';
import FirestoreBlob from '../FirestoreBlob';
import { DOCUMENT_ID } from '../FirestoreFieldPath';
import FirestoreGeoPoint from '../FirestoreGeoPoint';
import FirestorePath from '../FirestorePath';
import FirestoreTimestamp from '../FirestoreTimestamp';
import { getTypeMapInt, getTypeMapName } from './typemap';
import { Bytes } from '../modular/Bytes';
import FirestoreVectorValue from '../FirestoreVectorValue';

let FirestoreDocumentReference: (new (firestore: any, path: any) => { path: string }) | null = null;

export function provideDocumentReferenceClass(
  documentReference: (new (firestore: any, path: any) => { path: string }) | null,
): void {
  FirestoreDocumentReference = documentReference;
}

let FirestoreFieldValue: (new (...args: any[]) => { _type: string; _elements: unknown }) | null =
  null;

export function provideFieldValueClass(
  fieldValue: (new (...args: any[]) => { _type: string; _elements: unknown }) | null,
): void {
  FirestoreFieldValue = fieldValue;
}

export function buildNativeMap(
  data: Record<string, unknown> | null | undefined,
  ignoreUndefined?: boolean,
): Record<string, unknown> {
  const nativeData: Record<string, unknown> = {};
  if (data) {
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]!;

      if (typeof data[key] === 'undefined') {
        if (!ignoreUndefined) {
          throw new Error('Unsupported field value: undefined');
        }
        continue;
      }

      const typeMap = generateNativeData(data[key], ignoreUndefined);
      if (typeMap) {
        nativeData[key] = typeMap;
      }
    }
  }
  return nativeData;
}

export function buildNativeArray(
  array: unknown[] | null | undefined,
  ignoreUndefined?: boolean,
): unknown[] {
  const nativeArray: unknown[] = [];
  if (array) {
    for (let i = 0; i < array.length; i++) {
      const value = array[i];
      if (typeof value === 'undefined') {
        if (!ignoreUndefined) {
          throw new Error('Unsupported field value: undefined');
        }
        continue;
      }
      const typeMap = generateNativeData(value, ignoreUndefined);
      if (typeMap) {
        nativeArray.push(typeMap);
      }
    }
  }
  return nativeArray;
}

export function generateNativeData(
  value: unknown,
  ignoreUndefined?: boolean,
): [number, unknown?] | null {
  if (Number.isNaN(value)) {
    return getTypeMapInt('nan');
  }

  if (value === Number.NEGATIVE_INFINITY) {
    return getTypeMapInt('-infinity');
  }

  if (value === Number.POSITIVE_INFINITY) {
    return getTypeMapInt('infinity');
  }

  if (isNull(value) || isUndefined(value)) {
    return getTypeMapInt('null');
  }

  if (value === DOCUMENT_ID) {
    return getTypeMapInt('documentid');
  }

  if (isBoolean(value)) {
    return value ? getTypeMapInt('booleanTrue') : getTypeMapInt('booleanFalse');
  }

  if (isNumber(value)) {
    if (value === 0 && 1 / value === -Infinity) {
      return getTypeMapInt('negativeZero');
    }
    if (Number.isSafeInteger(value)) {
      return getTypeMapInt('integer', value);
    }
    return getTypeMapInt('double', value);
  }

  if (isString(value)) {
    return value === '' ? getTypeMapInt('stringEmpty') : getTypeMapInt('string', value);
  }

  if (isArray(value)) {
    return getTypeMapInt('array', buildNativeArray(value, ignoreUndefined));
  }

  if (isObject(value)) {
    if (FirestoreDocumentReference && value instanceof FirestoreDocumentReference) {
      return getTypeMapInt('reference', value.path);
    }

    if (value instanceof FirestoreGeoPoint) {
      return getTypeMapInt('geopoint', [value.latitude, value.longitude]);
    }

    if (isDate(value)) {
      const timestamp = FirestoreTimestamp.fromDate(value);
      return getTypeMapInt('timestamp', [timestamp.seconds, timestamp.nanoseconds]);
    }

    if (value instanceof FirestoreTimestamp) {
      return getTypeMapInt('timestamp', [value.seconds, value.nanoseconds]);
    }

    if (value instanceof FirestoreBlob || value instanceof Bytes) {
      return getTypeMapInt('blob', value.toBase64());
    }

    if (FirestoreFieldValue && value instanceof FirestoreFieldValue) {
      return getTypeMapInt('fieldvalue', [value._type, value._elements]);
    }

    if (value instanceof FirestoreVectorValue) {
      return getTypeMapInt('vector', value.toArray());
    }

    return getTypeMapInt(
      'object',
      buildNativeMap(value as Record<string, unknown>, ignoreUndefined),
    );
  }

  console.warn(`Unknown data type received ${value}`);
  return getTypeMapInt('unknown');
}

export function parseNativeMap(
  firestore: any,
  nativeData: Record<string, unknown> | null | undefined,
): Record<string, unknown> | undefined {
  let data: Record<string, unknown> | undefined;
  if (nativeData) {
    data = {};
    const entries = Object.entries(nativeData);
    for (let i = 0; i < entries.length; i++) {
      const [key, typeArray] = entries[i]!;
      data[key] = parseNativeData(firestore, typeArray as [number, unknown?]);
    }
  }
  return data;
}

export function parseNativeArray(firestore: any, nativeArray: unknown[]): unknown[] {
  const array: unknown[] = [];
  if (nativeArray) {
    for (let i = 0; i < nativeArray.length; i++) {
      array.push(parseNativeData(firestore, nativeArray[i] as [number, unknown?]));
    }
  }
  return array;
}

export function parseNativeData(firestore: any, nativeArray: [number, unknown?]): unknown {
  const [int, value] = nativeArray;
  const type = getTypeMapName(int);

  switch (type) {
    case 'nan':
      return NaN;
    case '-infinity':
      return -Infinity;
    case 'infinity':
      return Infinity;
    case 'null':
      return null;
    case 'booleanTrue':
      return true;
    case 'booleanFalse':
      return false;
    case 'double':
    case 'integer':
    case 'negativeZero':
    case 'string':
      return value;
    case 'stringEmpty':
      return '';
    case 'array':
      return parseNativeArray(firestore, (value ?? []) as unknown[]);
    case 'object':
      return parseNativeMap(firestore, value as Record<string, unknown>);
    case 'reference':
      return new FirestoreDocumentReference!(firestore, FirestorePath.fromName(value as string));
    case 'geopoint': {
      const v = (value ?? []) as number[];
      return new FirestoreGeoPoint(v[0] ?? 0, v[1] ?? 0);
    }
    case 'timestamp': {
      const v = (value ?? []) as number[];
      return new FirestoreTimestamp(v[0] ?? 0, v[1] ?? 0);
    }
    case 'blob':
      return Bytes.fromBase64String(value as string);
    case 'vector':
      return new FirestoreVectorValue(value as number[]);
    default:
      console.warn(`Unknown data type received from native channel: ${type}`);
      return value;
  }
}

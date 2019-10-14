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
} from '@react-native-firebase/app/lib/common';
import FirestoreBlob from '../FirestoreBlob';
import { DOCUMENT_ID } from '../FirestoreFieldPath';
import FirestoreGeoPoint from '../FirestoreGeoPoint';
import FirestorePath from '../FirestorePath';
import FirestoreTimestamp from '../FirestoreTimestamp';
import { getTypeMapInt, getTypeMapName } from './typemap';

// To avoid React Native require cycle warnings
let FirestoreDocumentReference = null;
export function provideDocumentReferenceClass(documentReference) {
  FirestoreDocumentReference = documentReference;
}

let FirestoreFieldValue = null;
export function provideFieldValueClass(fieldValue) {
  FirestoreFieldValue = fieldValue;
}

/**
 *
 * @param data
 */
export function buildNativeMap(data) {
  const nativeData = {};
  if (data) {
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const typeMap = generateNativeData(data[key]);
      if (typeMap) {
        nativeData[key] = typeMap;
      }
    }
  }
  return nativeData;
}

/**
 *
 * @param array
 * @returns {Array}
 */
export function buildNativeArray(array) {
  const nativeArray = [];
  if (array) {
    for (let i = 0; i < array.length; i++) {
      const value = array[i];
      const typeMap = generateNativeData(value);
      if (typeMap) {
        nativeArray.push(typeMap);
      }
    }
  }
  return nativeArray;
}

/**
 * Creates a lightweight array of an object value to be sent over the bridge.
 * The type is convered to an integer which is handled on the native side
 * to create the correct types.
 *
 * Example: [7, 'some string'];
 *
 * @param value
 * @returns {*}
 */
export function generateNativeData(value) {
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
    if (value === true) {
      return getTypeMapInt('booleanTrue');
    }
    return getTypeMapInt('booleanFalse');
  }

  if (isNumber(value)) {
    return getTypeMapInt('number', value);
  }

  if (isString(value)) {
    if (value === '') {
      return getTypeMapInt('stringEmpty');
    }
    return getTypeMapInt('string', value);
  }

  if (isArray(value)) {
    return getTypeMapInt('array', buildNativeArray(value));
  }

  if (isObject(value)) {
    if (value instanceof FirestoreDocumentReference) {
      return getTypeMapInt('reference', value.path);
    }

    if (value instanceof FirestoreGeoPoint) {
      return getTypeMapInt('geopoint', [value.latitude, value.longitude]);
    }

    // Handle Date objects are Timestamps as per web sdk
    if (isDate(value)) {
      const timestamp = FirestoreTimestamp.fromDate(value);
      return getTypeMapInt('timestamp', [timestamp.seconds, timestamp.nanoseconds]);
    }

    if (value instanceof FirestoreTimestamp) {
      return getTypeMapInt('timestamp', [value.seconds, value.nanoseconds]);
    }

    if (value instanceof FirestoreBlob) {
      return getTypeMapInt('blob', value.toBase64());
    }

    if (value instanceof FirestoreFieldValue) {
      return getTypeMapInt('fieldvalue', [value._type, value._elements]);
    }

    return getTypeMapInt('object', buildNativeMap(value));
  }

  // eslint-disable-next-line no-console
  console.warn(`Unknown data type received ${value}`);

  return getTypeMapInt('unknown');
}

/**
 *
 * @param firestore
 * @param nativeData
 */
export function parseNativeMap(firestore, nativeData) {
  let data;
  if (nativeData) {
    data = {};
    const entries = Object.entries(nativeData);
    for (let i = 0; i < entries.length; i++) {
      const [key, typeArray] = entries[i];
      data[key] = parseNativeData(firestore, typeArray);
    }
  }
  return data;
}

/**
 *
 * @param firestore
 * @param nativeArray
 * @returns {Array}
 */
export function parseNativeArray(firestore, nativeArray) {
  const array = [];
  if (nativeArray) {
    for (let i = 0; i < nativeArray.length; i++) {
      array.push(parseNativeData(firestore, nativeArray[i]));
    }
  }
  return array;
}

/**
 * Data returned from native is constructed in the same way it sent to keep
 * payloads over the bridge as small as possible. The index matches to a type
 * which is then created on JS land.
 *
 * Example: [7, 'string']
 *
 * @param firestore
 * @param nativeArray
 * @returns *
 */
export function parseNativeData(firestore, nativeArray) {
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
    case 'number':
    case 'string':
      return value;
    case 'stringEmpty':
      return '';
    case 'array':
      return parseNativeArray(firestore, value);
    case 'object':
      return parseNativeMap(firestore, value);
    case 'reference':
      return new FirestoreDocumentReference(firestore, FirestorePath.fromName(value));
    case 'geopoint':
      return new FirestoreGeoPoint(value[0], value[1]);
    case 'timestamp':
      return new FirestoreTimestamp(value[0], value[1]);
    case 'blob':
      return FirestoreBlob.fromBase64String(value);
    default:
      // eslint-disable-next-line no-console
      console.warn(`Unknown data type received from native channel: ${type}`);
      return value;
  }
}

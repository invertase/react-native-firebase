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

import FirestoreDocumentReference from '../FirestoreDocumentReference';

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
      const typeMap = buildTypeMap(data[key]);
      if (typeMap) nativeData[key] = typeMap;
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
      const typeMap = buildTypeMap(value);
      if (typeMap) nativeArray.push(typeMap);
    }
  }
  return nativeArray;
}

/**
 *
 * @param value
 * @returns {*}
 */
export function buildTypeMap(value) {
  const type = typeOf(value);

  if (Number.isNaN(value)) {
    return {
      type: 'nan',
      value: null,
    };
  }

  if (value === Infinity) {
    return {
      type: 'infinity',
      value: null,
    };
  }

  if (value === null || value === undefined) {
    return {
      type: 'null',
      value: null,
    };
  }

  if (value === DOCUMENT_ID) {
    return {
      type: 'documentid',
      value: null,
    };
  }

  if (type === 'boolean' || type === 'number' || type === 'string') {
    return {
      type,
      value,
    };
  }

  if (type === 'array') {
    return {
      type,
      value: buildNativeArray(value),
    };
  }

  if (type === 'object') {
    if (value instanceof FirestoreDocumentReference) {
      return {
        type: 'reference',
        value: value.path,
      };
    }

    if (value instanceof GeoPoint) {
      return {
        type: 'geopoint',
        value: {
          latitude: value.latitude,
          longitude: value.longitude,
        },
      };
    }

    if (value instanceof Timestamp) {
      return {
        type: 'timestamp',
        value: {
          seconds: value.seconds,
          nanoseconds: value.nanoseconds,
        },
      };
    }

    if (value instanceof Date) {
      return {
        type: 'date',
        value: value.getTime(),
      };
    }

    if (value instanceof Blob) {
      return {
        type: 'blob',
        value: value.toBase64(),
      };
    }

    // TODO: Salakar: Refactor in v6 - add internal `type` flag
    if (value instanceof FieldValue) {
      return {
        type: 'fieldvalue',
        value: {
          elements: value.elements,
          type: value.type,
        },
      };
    }

    return {
      type: 'object',
      value: buildNativeMap(value),
    };
  }

  console.warn(`Unknown data type received ${type}`);
  return null;
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
    const keys = Object.keys(nativeData);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      data[key] = parseTypeMap(firestore, nativeData[key]);
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
      array.push(parseTypeMap(firestore, nativeArray[i]));
    }
  }
  return array;
}

/**
 *
 * @param firestore
 * @param typeMap
 * @returns *
 */
export function parseTypeMap(firestore, typeMap) {
  const { type, value } = typeMap;
  if (type === 'null') {
    return null;
  }

  if (type === 'boolean' || type === 'number' || type === 'string') {
    return value;
  }

  if (type === 'array') {
    return parseNativeArray(firestore, value);
  }

  if (type === 'object') {
    return parseNativeMap(firestore, value);
  }

  if (type === 'reference') {
    return new FirestoreDocumentReference(firestore, Path.fromName(value));
  }

  if (type === 'geopoint') {
    return new GeoPoint(value.latitude, value.longitude);
  }

  if (type === 'timestamp') {
    return new Timestamp(value.seconds, value.nanoseconds);
  }

  if (type === 'date') {
    return new Date(value);
  }

  if (type === 'blob') {
    return Blob.fromBase64String(value);
  }

  if (type === 'infinity') {
    return Infinity;
  }

  if (type === 'nan') {
    return NaN;
  }

  console.warn(`Unknown data type received ${type}`);
  return value;
}

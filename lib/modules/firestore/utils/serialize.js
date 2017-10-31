// @flow

import DocumentReference from '../DocumentReference';
import { DELETE_FIELD_VALUE, SERVER_TIMESTAMP_FIELD_VALUE } from '../FieldValue';
import GeoPoint from '../GeoPoint';
import Path from '../Path';
import { typeOf } from '../../../utils';

type TypeMap = {
  type: 'array' | 'boolean' | 'geopoint' | 'null' | 'number' | 'object' | 'reference' | 'string',
  value: any,
}

/*
 * Functions that build up the data needed to represent
 * the different types available within Firestore
 * for transmission to the native side
 */

export const buildNativeMap = (data: Object): Object => {
  const nativeData = {};
  if (data) {
    Object.keys(data).forEach((key) => {
      nativeData[key] = buildTypeMap(data[key]);
    });
  }
  return nativeData;
};

export const buildNativeArray = (array: Object[]): any[] => {
  const nativeArray = [];
  if (array) {
    array.forEach((value) => {
      nativeArray.push(buildTypeMap(value));
    });
  }
  return nativeArray;
};

export const buildTypeMap = (value: any): any => {
  const typeMap = {};
  const type = typeOf(value);
  if (value === null || value === undefined) {
    typeMap.type = 'null';
    typeMap.value = null;
  } else if (value === DELETE_FIELD_VALUE) {
    typeMap.type = 'fieldvalue';
    typeMap.value = 'delete';
  } else if (value === SERVER_TIMESTAMP_FIELD_VALUE) {
    typeMap.type = 'fieldvalue';
    typeMap.value = 'timestamp';
  } else if (type === 'boolean' || type === 'number' || type === 'string') {
    typeMap.type = type;
    typeMap.value = value;
  } else if (type === 'array') {
    typeMap.type = type;
    typeMap.value = buildNativeArray(value);
  } else if (type === 'object') {
    if (value instanceof DocumentReference) {
      typeMap.type = 'reference';
      typeMap.value = value.path;
    } else if (value instanceof GeoPoint) {
      typeMap.type = 'geopoint';
      typeMap.value = {
        latitude: value.latitude,
        longitude: value.longitude,
      };
    } else if (value instanceof Date) {
      typeMap.type = 'date';
      typeMap.value = value.getTime();
    } else {
      typeMap.type = 'object';
      typeMap.value = buildNativeMap(value);
    }
  } else {
    console.warn(`Unknown data type received ${type}`);
  }
  return typeMap;
};

/*
 * Functions that parse the received from the native
 * side and converts to the correct Firestore JS types
 */

export const parseNativeMap = (firestore: Object, nativeData: Object): Object => {
  let data;
  if (nativeData) {
    data = {};
    Object.keys(nativeData).forEach((key) => {
      data[key] = parseTypeMap(firestore, nativeData[key]);
    });
  }
  return data;
};

const parseNativeArray = (firestore: Object, nativeArray: Object[]): any[] => {
  const array = [];
  if (nativeArray) {
    nativeArray.forEach((typeMap) => {
      array.push(parseTypeMap(firestore, typeMap));
    });
  }
  return array;
};

const parseTypeMap = (firestore: Object, typeMap: TypeMap): any => {
  const { type, value } = typeMap;
  if (type === 'null') {
    return null;
  } else if (type === 'boolean' || type === 'number' || type === 'string') {
    return value;
  } else if (type === 'array') {
    return parseNativeArray(firestore, value);
  } else if (type === 'object') {
    return parseNativeMap(firestore, value);
  } else if (type === 'reference') {
    return new DocumentReference(firestore, Path.fromName(value));
  } else if (type === 'geopoint') {
    return new GeoPoint(value.latitude, value.longitude);
  } else if (type === 'date') {
    return new Date(value);
  }
  console.warn(`Unknown data type received ${type}`);
  return value;
};

import {
  DocumentReference,
  Timestamp,
  GeoPoint,
  Blob,
} from '@react-native-firebase/app/lib/internal/web/firebaseFirestore';

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
const INT_UNKNOWN = -999;

// Converts an object to a writeable object.
export function objectToWriteable(object) {
  const out = {};
  for (const [key, value] of Object.entries(object)) {
    out[key] = buildTypeMap(value);
  }
  return out;
}

// Converts an array of values to a writeable array.
export function arrayToWriteable(array) {
  return array.map(buildTypeMap);
}

// Returns a typed array of a value.
function buildTypeMap(value) {
  const out = [];
  if (value === null) {
    out.push(INT_NULL);
    return out;
  }

  if (typeof value === 'boolean') {
    if (value) out.push(INT_BOOLEAN_TRUE);
    else out.push(INT_BOOLEAN_FALSE);
    return out;
  }

  // Double
  if (typeof value === 'number' && !Number.isInteger(value)) {
    out.push(INT_DOUBLE);
    out.push(value);
    return out;
  }

  // Integer
  if (typeof value === 'number' && Number.isInteger(value)) {
    if (value == Number.NEGATIVE_INFINITY) {
      out.push(INT_NEGATIVE_INFINITY);
      return out;
    }

    if (value == Number.POSITIVE_INFINITY) {
      out.push(INT_POSITIVE_INFINITY);
      return out;
    }

    if (isNaN(value)) {
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
    // TODO push array;
    return out;
  }

  if (typeof value === 'object') {
    out.push(INT_OBJECT);
    // TODO push object;
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

  if (value instanceof Blob) {
    out.push(INT_BLOB);
    out.push(value.toBase64());
    return out;
  }

  out.push(INT_UNKNOWN);
  return out;
}

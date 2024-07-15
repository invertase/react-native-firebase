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

const TYPE = 'type';
const KEY_PATH = 'path';
const KEY_DATA = 'data';
const KEY_OPTIONS = 'options';

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

// Converts a readable object into a plain js object.
export function readableToObject(firestore, readableMap) {
  const out = {};

  for (const [key, value] of Object.entries(readableMap)) {
    out[key] = parseTypeMap(firestore, value);
  }

  return out;
}

// Converts a readable array into a plain js array.
export function readableToArray(firestore, readableArray) {
  return readableArray.map(value => parseTypeMap(firestore, value));
}

// Converts a readable array of document batch data into a plain js array.
export function parseDocumentBatches(firestore, readableArray) {
  const out = [];

  for (const map of readableArray) {
    const write = {
      [TYPE]: map[TYPE],
      [KEY_PATH]: map[KEY_PATH],
    };

    if (KEY_DATA in map) {
      write[KEY_DATA] = readableToObject(firestore, map[KEY_DATA]);
    }

    if (KEY_OPTIONS in map) {
      write[KEY_OPTIONS] = map[KEY_OPTIONS];
    }

    out.push(write);
  }

  return out;
}

// Returns a typed array of a value.
export function buildTypeMap(value) {
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

  if (typeof value === 'object') {
    out.push(INT_OBJECT);
    out.push(objectToWriteable(value));
    return out;
  }

  out.push(INT_UNKNOWN);
  return out;
}

// Parses a typed array into a value.
export function parseTypeMap(firestore, typedArray) {
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
      return readableToArray(firestore, typedArray[1]);
    case INT_REFERENCE:
      return doc(firestore, typedArray[1]);
    case INT_GEOPOINT:
      const [latitude, longitude] = typedArray[1];
      return new GeoPoint(latitude, longitude);
    case INT_TIMESTAMP:
      const [seconds, nanoseconds] = typedArray[1];
      return new Timestamp(seconds, nanoseconds);
    case INT_BLOB:
      return Bytes.fromBase64String(typedArray[1]);
    case INT_FIELDVALUE:
      const fieldValueArray = typedArray[1];
      const fieldValueType = fieldValueArray[0];

      if (fieldValueType === 'timestamp') {
        return serverTimestamp();
      }

      if (fieldValueType === 'increment') {
        return increment(fieldValueArray[1]);
      }

      if (fieldValueType === 'delete') {
        return deleteField();
      }

      if (fieldValueType === 'array_union') {
        const elements = readableToArray(firestore, fieldValueArray[1]);
        return arrayUnion(...elements);
      }

      if (fieldValueType === 'array_remove') {
        const elements = readableToArray(firestore, fieldValueArray[1]);
        return arrayRemove(...elements);
      }
    case INT_OBJECT:
      return readableToObject(firestore, typedArray[1]);
    case INT_UNKNOWN:
    default:
      return null;
  }
}

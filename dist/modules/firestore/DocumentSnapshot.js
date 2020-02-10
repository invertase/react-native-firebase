/**
 * 
 * DocumentSnapshot representation wrapper
 */
import DocumentReference from './DocumentReference';
import FieldPath from './FieldPath';
import Path from './Path';
import { isObject, deepGet } from '../../utils';
import { parseNativeMap } from './utils/serialize';

const extractFieldPathData = (data, segments) => {
  if (!data || !isObject(data)) {
    return undefined;
  }

  const pathValue = data[segments[0]];

  if (segments.length === 1) {
    return pathValue;
  }

  return extractFieldPathData(pathValue, segments.slice(1));
};
/**
 * @class DocumentSnapshot
 */


export default class DocumentSnapshot {
  constructor(firestore, nativeData) {
    this._data = parseNativeMap(firestore, nativeData.data);
    this._metadata = nativeData.metadata;
    this._ref = new DocumentReference(firestore, Path.fromName(nativeData.path));
  }

  get exists() {
    return this._data !== undefined;
  }

  get id() {
    return this._ref.id;
  }

  get metadata() {
    return this._metadata;
  }

  get ref() {
    return this._ref;
  }

  data = () => this._data;
  get = fieldPath => {
    if (fieldPath instanceof FieldPath) {
      return extractFieldPathData(this._data, fieldPath._segments);
    }

    return deepGet(this._data, fieldPath, '.');
  };
}
/**
 * @flow
 * FieldValue representation wrapper
 */
import AnyJs from './utils/any';

export default class FieldValue {
  _elements: AnyJs[];

  get elements(): AnyJs[] {
    return this._elements;
  }

  set elements(elements: AnyJs[]) {
    this._elements = elements;
  }

  static delete(): FieldValue {
    return DELETE_FIELD_VALUE;
  }

  static serverTimestamp(): FieldValue {
    return SERVER_TIMESTAMP_FIELD_VALUE;
  }

  static arrayUnion(...elements: AnyJs[]) {
    ARRAY_UNION_FIELD_VALUE.elements = elements;
    return ARRAY_UNION_FIELD_VALUE;
  }

  static arrayRemove(...elements: AnyJs[]) {
    ARRAY_REMOVE_FIELD_VALUE.elements = elements;
    return ARRAY_REMOVE_FIELD_VALUE;
  }
}

export const DELETE_FIELD_VALUE = new FieldValue();
export const SERVER_TIMESTAMP_FIELD_VALUE = new FieldValue();
export const ARRAY_UNION_FIELD_VALUE = new FieldValue();
export const ARRAY_REMOVE_FIELD_VALUE = new FieldValue();

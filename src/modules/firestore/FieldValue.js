/**
 * @flow
 * FieldValue representation wrapper
 */

export default class FieldValue {
  get elements() {
    return this._elemenets;
  }

  set elements(elements) {
    this._elemenets = elements;
  }

  static delete(): FieldValue {
    return DELETE_FIELD_VALUE;
  }

  static serverTimestamp(): FieldValue {
    return SERVER_TIMESTAMP_FIELD_VALUE;
  }

  static arrayUnion(...elements: any[]) {
    ARRAY_UNION_FIELD_VALUE.elements = elements;
    return ARRAY_UNION_FIELD_VALUE;
  }

  static arrayRemove(...elements: any[]) {
    ARRAY_REMOVE_FIELD_VALUE.elements = elements;
    return ARRAY_REMOVE_FIELD_VALUE;
  }
}

export const DELETE_FIELD_VALUE = new FieldValue();
export const SERVER_TIMESTAMP_FIELD_VALUE = new FieldValue();
export const ARRAY_UNION_FIELD_VALUE = new FieldValue();
export const ARRAY_REMOVE_FIELD_VALUE = new FieldValue();

/**
 * 
 * FieldValue representation wrapper
 */
import AnyJs from './utils/any';
import { buildNativeArray } from './utils/serialize'; // TODO: Salakar: Refactor in v6

export default class FieldValue {
  constructor(type, elements) {
    this._type = type;
    this._elements = elements;
  }

  get type() {
    return this._type;
  }

  get elements() {
    return this._elements;
  }

  static delete() {
    return new FieldValue(TypeFieldValueDelete);
  }

  static increment(n) {
    return new FieldValue(TypeFieldValueIncrement, n);
  }

  static serverTimestamp() {
    return new FieldValue(TypeFieldValueTimestamp);
  }

  static arrayUnion(...elements) {
    // TODO Salakar: v6: validate elements, any primitive or FirestoreReference allowed
    // TODO Salakar: v6: explicitly deny use of serverTimestamp - only allowed on set/update
    // TODO Salakar: v6: explicitly deny use of nested arrays - not supported on sdk
    return new FieldValue(TypeFieldValueUnion, buildNativeArray(elements));
  }

  static arrayRemove(...elements) {
    // TODO Salakar: v6: validate elements, any primitive or FirestoreReference allowed
    // TODO Salakar: v6: explicitly deny use of serverTimestamp - only allowed on set/update
    // TODO Salakar: v6: explicitly deny use of nested arrays - not supported on sdk
    return new FieldValue(TypeFieldValueRemove, buildNativeArray(elements));
  }

}
export const TypeFieldValueDelete = 'delete';
export const TypeFieldValueIncrement = 'increment';
export const TypeFieldValueRemove = 'remove';
export const TypeFieldValueUnion = 'union';
export const TypeFieldValueTimestamp = 'timestamp';
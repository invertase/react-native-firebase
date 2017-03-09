/**
 * @flow
 */
import Reference from './reference.js';
import { isObject, deepGet, deepExists } from './../../utils';

export default class Snapshot {
  static key: String;
  static value: Object;
  static exists: boolean;
  static hasChildren: boolean;
  static childKeys: String[];

  ref: Object;
  key: string;
  value: any;
  exists: boolean;
  priority: any;
  childKeys: Array<string>;

  constructor(ref: Reference, snapshot: Object) {
    this.ref = ref;
    this.key = snapshot.key;
    this.value = snapshot.value;
    this.priority = snapshot.priority === undefined ? null : snapshot.priority;
    this.childKeys = snapshot.childKeys || [];
  }

  /*
   * DEFAULT API METHODS
   */

  val() {
    return this.value;
  }

  child(path: string) {
    const value = deepGet(this.value, path);
    const childRef = this.ref.child(path);
    return new Snapshot(childRef, {
      value,
      key: childRef.key,
      exists: value !== null,
      childKeys: isObject(value) ? Object.keys(value) : [],
    });
  }

  exists() {
    return this.value !== null;
  }

  forEach(fn: (key: any) => any) {
    return this.childKeys.forEach((key, i) => fn(this.child(key), i));
  }

  getPriority() {
    return this.priority;
  }

  hasChild(path: string) {
    return deepExists(this.value, path);
  }

  hasChildren() {
    return this.numChildren() > 0;
  }

  numChildren() {
    if (!isObject(this.value)) return 0;
    return Object.keys(this.value).length;
  }

  /*
   * EXTRA API METHODS
   */
  map(fn: (key: string) => mixed) {
    const arr = [];
    this.forEach((item, i) => arr.push(fn(item, i)));
    return arr;
  }

  reverseMap(fn: (key: string) => mixed) {
    return this.map(fn).reverse();
  }
}

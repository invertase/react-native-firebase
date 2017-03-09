/**
 * @flow
 */
import Reference from './reference.js';
import { isObject, deepGet, deepExists } from './../../utils';

/**
 * @link https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot
 */
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

  /**
   * Extracts a JavaScript value from a DataSnapshot.
   * @link https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#val
   * @returns {any}
   */
  val(): any {
    return this.value;
  }

  /**
   * Gets another DataSnapshot for the location at the specified relative path.
   * @param path
   * @link https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#forEach
   * @returns {Snapshot}
   */
  child(path: string): Snapshot {
    const value = deepGet(this.value, path);
    const childRef = this.ref.child(path);
    return new Snapshot(childRef, {
      value,
      key: childRef.key,
      exists: value !== null,

      // todo this is wrong - child keys needs to be the ordered keys, from FB
      // todo potential solution is build up a tree/map of a snapshot and its children
      // todo natively and send that back to JS to be use in this class.
      childKeys: isObject(value) ? Object.keys(value) : [],
    });
  }

  /**
   * Returns true if this DataSnapshot contains any data.
   * @link https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#exists
   * @returns {boolean}
   */
  exists(): Boolean {
    return this.value !== null;
  }

  /**
   * Enumerates the top-level children in the DataSnapshot.
   * @link https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#forEach
   * @param action
   */
  forEach(action: (key: any) => any): Boolean {
    if (!this.childKeys.length) return false;
    let cancelled = false;

    for (let i = 0, len = this.childKeys.length; i < len; i++) {
      const key = this.childKeys[i];
      const childSnapshot = this.child(key);
      const returnValue = action(childSnapshot);

      if (returnValue === true) {
        cancelled = true;
        break;
      }
    }

    return cancelled;
  }

  /**
   * Gets the priority value of the data in this DataSnapshot.
   * @link https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#getPriority
   * @returns {String|Number|null}
   */
  getPriority(): String|Number|null {
    return this.priority;
  }

  /**
   * Returns true if the specified child path has (non-null) data.
   * @link https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#hasChild
   * @param path
   * @returns {Boolean}
   */
  hasChild(path: string): Boolean {
    return deepExists(this.value, path);
  }

  /**
   * Returns whether or not the DataSnapshot has any non-null child properties.
   * @link https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#hasChildren
   * @returns {boolean}
   */
  hasChildren(): Boolean {
    return this.numChildren() > 0;
  }

  /**
   * Returns the number of child properties of this DataSnapshot.
   * @link https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#numChildren
   * @returns {Number}
   */
  numChildren(): Number {
    if (!isObject(this.value)) return 0;
    return Object.keys(this.value).length;
  }

  /**
   * Returns a JSON-serializable representation of this object.
   * @link https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#toJSON
   * @returns {any}
   */
  toJSON(): any {
    return this.val();
  }
}

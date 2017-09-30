/* @flow */

import { typeOf } from './../../utils';
import Reference from './reference';


/**
 * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect
 * @class Disconnect
 */
export default class Disconnect {
  ref: Reference;
  path: string;

  /**
   *
   * @param ref
   */
  constructor(ref: Reference) {
    this.ref = ref;
    this.path = ref.path;
    this._database = ref._database;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#set
   * @param value
   * @returns {*}
   */
  set(value: string | Object): Promise<void> {
    return this._database._native.onDisconnectSet(this.path, { type: typeOf(value), value });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#update
   * @param values
   * @returns {*}
   */
  update(values: Object): Promise<void> {
    return this._database._native.onDisconnectUpdate(this.path, values);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#remove
   * @returns {*}
   */
  remove(): Promise<void> {
    return this._database._native.onDisconnectRemove(this.path);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#cancel
   * @returns {*}
   */
  cancel(): Promise<void> {
    return this._database._native.onDisconnectCancel(this.path);
  }
}

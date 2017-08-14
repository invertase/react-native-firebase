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
   * @param path Reference Path
   */
  constructor(path: string) {
    this.path = path;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#set
   * @param value
   * @returns {*}
   */
  set(value: string | Object) {
    return this.database._native.onDisconnectSet(this.path, { type: typeOf(value), value });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#update
   * @param values
   * @returns {*}
   */
  update(values: Object) {
    return this.database._native.onDisconnectUpdate(this.path, values);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#remove
   * @returns {*}
   */
  remove() {
    return this.database._native.onDisconnectRemove(this.path);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#cancel
   * @returns {*}
   */
  cancel() {
    return this.database._native.onDisconnectCancel(this.path);
  }
}

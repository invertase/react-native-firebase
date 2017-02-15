/* @flow */

import { NativeModules } from 'react-native';
import { promisify, typeOf } from './../../utils';
import Reference from './reference';

const FirebaseDatabase = NativeModules.FirebaseDatabase;

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect
 * @class Disconnect
 */
export default class Disconnect {
  ref: Reference;

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
    return promisify('onDisconnectSet', FirebaseDatabase)(this.path, { type: typeOf(value), value });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#update
   * @param values
   * @returns {*}
   */
  update(values: Object) {
    return promisify('onDisconnectUpdate', FirebaseDatabase)(this.path, values);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#remove
   * @returns {*}
   */
  remove() {
    return promisify('onDisconnectRemove', FirebaseDatabase)(this.path);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#cancel
   * @returns {*}
   */
  cancel() {
    return promisify('onDisconnectCancel', FirebaseDatabase)(this.path);
  }
}

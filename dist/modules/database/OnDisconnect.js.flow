/**
 * @flow
 * OnDisconnect representation wrapper
 */
import { typeOf } from '../../utils';
import { getNativeModule } from '../../utils/native';
import type Database from './';
import type Reference from './Reference';

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect
 * @class OmDisconnect
 */
export default class OnDisconnect {
  _database: Database;

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
    return getNativeModule(this._database).onDisconnectSet(this.path, {
      type: typeOf(value),
      value,
    });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#update
   * @param values
   * @returns {*}
   */
  update(values: Object): Promise<void> {
    return getNativeModule(this._database).onDisconnectUpdate(
      this.path,
      values
    );
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#remove
   * @returns {*}
   */
  remove(): Promise<void> {
    return getNativeModule(this._database).onDisconnectRemove(this.path);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#cancel
   * @returns {*}
   */
  cancel(): Promise<void> {
    return getNativeModule(this._database).onDisconnectCancel(this.path);
  }
}

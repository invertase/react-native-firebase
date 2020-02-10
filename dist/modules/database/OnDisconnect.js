/**
 * 
 * OnDisconnect representation wrapper
 */
import { typeOf } from '../../utils';
import { getNativeModule } from '../../utils/native';

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect
 * @class OmDisconnect
 */
export default class OnDisconnect {
  /**
   *
   * @param ref
   */
  constructor(ref) {
    this.ref = ref;
    this.path = ref.path;
    this._database = ref._database;
  }
  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#set
   * @param value
   * @returns {*}
   */


  set(value) {
    return getNativeModule(this._database).onDisconnectSet(this.path, {
      type: typeOf(value),
      value
    });
  }
  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#update
   * @param values
   * @returns {*}
   */


  update(values) {
    return getNativeModule(this._database).onDisconnectUpdate(this.path, values);
  }
  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#remove
   * @returns {*}
   */


  remove() {
    return getNativeModule(this._database).onDisconnectRemove(this.path);
  }
  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#cancel
   * @returns {*}
   */


  cancel() {
    return getNativeModule(this._database).onDisconnectCancel(this.path);
  }

}
/**
 * @flow
 * Database representation wrapper
 */
import { NativeModules } from 'react-native';

import Reference from './reference';
import TransactionHandler from './transaction';
import ModuleBase from './../../utils/ModuleBase';

/**
 * @class Database
 */

export default class Database extends ModuleBase {
  constructor(firebaseApp: Object, options: Object = {}) {
    super(firebaseApp, options, 'Database', true);
    this._transactionHandler = new TransactionHandler(this);
    if (this._options.persistence) this._native.setPersistence(this._options.persistence);

    // todo event & error listeners
    // todo serverTimeOffset event/listener - make ref natively and switch to events
    // todo use nativeToJSError for on/off error events
  }

  /**
   *
   */
  goOnline() {
    this._native.goOnline();
  }

  /**
   *
   */
  goOffline() {
    this._native.goOffline();
  }

  /**
   * Returns a new firebase reference instance
   * @param path
   * @returns {Reference}
   */
  ref(path: string) {
    return new Reference(this, path);
  }
}

export const statics = {
  ServerValue: NativeModules.FirebaseDatabase ? {
    TIMESTAMP: NativeModules.FirebaseDatabase.serverValueTimestamp || { '.sv': 'timestamp' },
  } : {},
};

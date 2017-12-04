/**
 * @flow
 * Database representation wrapper
 */
import { NativeModules } from 'react-native';

import Reference from './reference';
import TransactionHandler from './transaction';
import ModuleBase from './../../utils/ModuleBase';

import type FirebaseApp from '../core/firebase-app';

/**
 * @class Database
 */
export default class Database extends ModuleBase {
  static _NAMESPACE = 'database';
  static _NATIVE_MODULE = 'RNFirebaseDatabase';

  _offsetRef: Reference;
  _serverTimeOffset: number;
  _transactionHandler: TransactionHandler;

  constructor(firebaseApp: FirebaseApp, options: Object = {}) {
    super(firebaseApp, options, true);
    this._transactionHandler = new TransactionHandler(this);

    if (this._options.persistence) {
      this._native.setPersistence(this._options.persistence);
    }

    // server time listener
    // setTimeout used to avoid setPersistence race conditions
    // todo move this and persistence to native side, create a db configure() method natively perhaps?
    // todo and then native can call setPersistence and then emit offset events
    setTimeout(() => {
      this._serverTimeOffset = 0;
      this._offsetRef = this.ref('.info/serverTimeOffset');
      this._offsetRef.on('value', (snapshot) => {
        this._serverTimeOffset = snapshot.val() || this._serverTimeOffset;
      });
    }, 1);
  }

  /**
   *
   * @return {number}
   */
  getServerTime(): number {
    return new Date(Date.now() + this._serverTimeOffset);
  }

  /**
   *
   */
  goOnline(): void {
    this._native.goOnline();
  }

  /**
   *
   */
  goOffline(): void {
    this._native.goOffline();
  }

  /**
   * Returns a new firebase reference instance
   * @param path
   * @returns {Reference}
   */
  ref(path: string): Reference {
    return new Reference(this, path);
  }
}

export const statics = {
  ServerValue: NativeModules.RNFirebaseDatabase ? {
    TIMESTAMP: NativeModules.RNFirebaseDatabase.serverValueTimestamp || { '.sv': 'timestamp' },
  } : {},
  enableLogging(enabled: boolean) {
    if (NativeModules[Database._NATIVE_MODULE]) {
      NativeModules[Database._NATIVE_MODULE].enableLogging(enabled);
    }
  },
};

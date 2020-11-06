/**
 * 
 * Database representation wrapper
 */
import { NativeModules } from 'react-native';
import Reference from './Reference';
import TransactionHandler from './transaction';
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';
import firebase from '../core/firebase';
const NATIVE_EVENTS = ['database_transaction_event' // 'database_server_offset', // TODO
];
export const MODULE_NAME = 'RNFirebaseDatabase';
export const NAMESPACE = 'database';
/**
 * @class Database
 */

export default class Database extends ModuleBase {
  constructor(appOrCustomUrl, customUrl) {
    let app;
    let url;

    if (typeof appOrCustomUrl === 'string') {
      app = firebase.app();
      url = appOrCustomUrl;
    } else {
      app = appOrCustomUrl;
      url = customUrl || app.options.databaseURL;
    } // enforce trailing slash


    url = url.endsWith('/') ? url : `${url}/`;
    super(app, {
      events: NATIVE_EVENTS,
      moduleName: MODULE_NAME,
      hasMultiAppSupport: true,
      hasCustomUrlSupport: true,
      namespace: NAMESPACE
    }, url);
    this._serverTimeOffset = 0;
    this._databaseURL = url;
    this._transactionHandler = new TransactionHandler(this);

    if (app.options.persistence) {
      getNativeModule(this).setPersistence(app.options.persistence);
    } // server time listener
    // setTimeout used to avoid setPersistence race conditions
    // todo move this and persistence to native side, create a db configure() method natively perhaps?
    // todo and then native can call setPersistence and then emit offset events


    setTimeout(() => {
      this._offsetRef = this.ref('.info/serverTimeOffset');

      this._offsetRef.on('value', snapshot => {
        this._serverTimeOffset = snapshot.val() || this._serverTimeOffset;
      });
    }, 1);
  }
  /**
   *
   * @return {Date}
   */


  getServerTime() {
    return new Date(Date.now() + this._serverTimeOffset);
  }
  /**
   *
   */


  goOnline() {
    getNativeModule(this).goOnline();
  }
  /**
   *
   */


  goOffline() {
    getNativeModule(this).goOffline();
  }
  /**
   * Returns a new firebase reference instance
   * @param path
   * @returns {Reference}
   */


  ref(path) {
    return new Reference(this, path);
  }
  /**
   * Returns the database url
   * @returns {string}
   */


  get databaseUrl() {
    return this._databaseURL;
  }

}
export const statics = {
  ServerValue: NativeModules.RNFirebaseDatabase ? {
    TIMESTAMP: NativeModules.RNFirebaseDatabase.serverValueTimestamp || {
      '.sv': 'timestamp'
    }
  } : {},

  enableLogging(enabled) {
    if (NativeModules[MODULE_NAME]) {
      NativeModules[MODULE_NAME].enableLogging(enabled);
    }
  }

};
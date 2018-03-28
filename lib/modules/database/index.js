/**
 * @flow
 * Database representation wrapper
 */
import { NativeModules } from 'react-native';

import Reference from './Reference';
import TransactionHandler from './transaction';
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';

import type App from '../core/app';
import firebase from '../core/firebase';

const NATIVE_EVENTS = [
  'database_transaction_event',
  // 'database_server_offset', // TODO
];

export const MODULE_NAME = 'RNFirebaseDatabase';
export const NAMESPACE = 'database';

/**
 * @class Database
 */
export default class Database extends ModuleBase {
  _offsetRef: Reference;
  _serverTimeOffset: number;
  _transactionHandler: TransactionHandler;
  _serviceUrl: string;

  constructor(appOrUrl: App | string, options: Object = {}) {
    let app;
    let serviceUrl;
    if (typeof appOrUrl === 'string') {
      app = firebase.app();
      serviceUrl = appOrUrl.endsWith('/') ? appOrUrl : `${appOrUrl}/`;
    } else {
      app = appOrUrl;
      serviceUrl = app.options.databaseURL;
    }

    super(
      app,
      {
        events: NATIVE_EVENTS,
        moduleName: MODULE_NAME,
        multiApp: true,
        hasShards: true,
        namespace: NAMESPACE,
      },
      serviceUrl
    );

    this._serverTimeOffset = 0;
    this._serviceUrl = serviceUrl;
    this._transactionHandler = new TransactionHandler(this);

    if (options.persistence) {
      getNativeModule(this).setPersistence(options.persistence);
    }

    // server time listener
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
   * @return {number}
   */
  getServerTime(): number {
    return new Date(Date.now() + this._serverTimeOffset);
  }

  /**
   *
   */
  goOnline(): void {
    getNativeModule(this).goOnline();
  }

  /**
   *
   */
  goOffline(): void {
    getNativeModule(this).goOffline();
  }

  /**
   * Returns a new firebase reference instance
   * @param path
   * @returns {Reference}
   */
  ref(path: string): Reference {
    return new Reference(this, path);
  }

  /**
   * Returns the database url
   * @returns {string}
   */
  get databaseUrl(): string {
    return this._serviceUrl;
  }
}

export const statics = {
  ServerValue: NativeModules.RNFirebaseDatabase
    ? {
        TIMESTAMP: NativeModules.RNFirebaseDatabase.serverValueTimestamp || {
          '.sv': 'timestamp',
        },
      }
    : {},
  enableLogging(enabled: boolean) {
    if (NativeModules[MODULE_NAME]) {
      NativeModules[MODULE_NAME].enableLogging(enabled);
    }
  },
};

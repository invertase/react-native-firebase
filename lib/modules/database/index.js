/**
 * @flow
 * Database representation wrapper
 */
import { NativeModules } from 'react-native';

import Reference from './reference';
import Snapshot from './snapshot';
import TransactionHandler from './transaction';
import ModuleBase from './../../utils/ModuleBase';

/**
 * @class Database
 */
export default class Database extends ModuleBase {
  constructor(firebaseApp: Object, options: Object = {}) {
    super(firebaseApp, options, 'Database', true);
    this._references = {};
    this._serverTimeOffset = 0;
    this._transactionHandler = new TransactionHandler(this);

    if (this._options.persistence) {
      this._native.setPersistence(this._options.persistence);
    }

    // todo serverTimeOffset event/listener - make ref natively and switch to events
    // todo use nativeToJSError for on/off error events
    this.addListener(
      this._getAppEventName('database_cancel_event'),
      this._handleCancelEvent.bind(this),
    );

    this.addListener(
      this._getAppEventName('database_on_event'),
      this._handleOnEvent.bind(this),
    );
  }

  _handleOnEvent(event) {
    console.log('>>>ON-event>>>', event);
    const { queryKey, body, refId } = event;
    const { snapshot, previousChildName } = body;

    const remainingListeners = this.listeners(queryKey);

    if (!remainingListeners || !remainingListeners.length) {
      this._database._native.off(
        _refId,
        queryKey,
      );

      delete this._references[refId];
    } else {
      const ref = this._references[refId];

      if (!ref) {
        this._database._native.off(
          _refId,
          queryKey,
        );
      } else {
        this.emit(queryKey, new Snapshot(ref, snapshot), previousChildName);
      }
    }
  }

  _handleCancelEvent(event) {
    console.log('>>>CANCEL-event>>>', event);
  }

  /**
   *
   * @return {number}
   */
  getServerTime() {
    return new Date().getTime() + this._serverTimeOffset;
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


  /**
   * INTERNALS
   */

  // todo handleDbEvent
  // todo handleDbError
}

export const statics = {
  ServerValue: NativeModules.FirebaseDatabase ? {
    TIMESTAMP: NativeModules.FirebaseDatabase.serverValueTimestamp || { '.sv': 'timestamp' },
  } : {},
};

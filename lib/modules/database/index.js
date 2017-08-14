/**
 * @flow
 * Database representation wrapper
 */
import { NativeModules } from 'react-native';

import Reference from './reference';
import Snapshot from './snapshot';
import TransactionHandler from './transaction';
import ModuleBase from './../../utils/ModuleBase';
import { nativeToJSError } from './../../utils';

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

  /**
   * Routes native database 'on' events to their js equivalent counterpart.
   * If there is no longer any listeners remaining for this event we internally
   * call the native unsub method to prevent further events coming through.
   *
   * @param event
   * @private
   */
  _handleOnEvent(event) {
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


  /**
   * Routes native database query listener cancellation events to their js counterparts.
   *
   * @param event
   * @private
   */
  _handleCancelEvent(event) {
    const { queryKey, code, message, path, refId, appName } = event;
    const remainingListeners = this.listeners(`${queryKey}:cancelled`);

    if (remainingListeners && remainingListeners.length) {
      const error = nativeToJSError(code, message, { path, queryKey, refId, appName });
      this.emit(`${queryKey}:cancelled`, error);
    }
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
}

export const statics = {
  ServerValue: NativeModules.FirebaseDatabase ? {
    TIMESTAMP: NativeModules.FirebaseDatabase.serverValueTimestamp || { '.sv': 'timestamp' },
  } : {},
};

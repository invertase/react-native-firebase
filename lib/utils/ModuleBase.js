/**
 * @flow
 */
import { NativeModules } from 'react-native';

import Log from '../utils/log';
import INTERNALS from './../internals';
import FirebaseCore from './../firebase';
import FirebaseApp from '../firebase-app';
import { nativeWithApp } from './../utils';

const logs = {};

// Firebase Native SDKs that support multiple app instances
const MULTI_APP_MODULES = [
  'auth',
  'database',
  'firestore',
  'storage',
];

const NATIVE_MODULE_EVENTS = {
  Storage: [
    'storage_event',
    'storage_error',
  ],
  Auth: [
    'auth_state_changed',
    'phone_auth_state_changed',
  ],
  Database: [
    'database_transaction_event',
    // 'database_server_offset', // TODO
  ],
  Firestore: [
    'firestore_collection_sync_event',
    'firestore_document_sync_event',
  ],
};

const DEFAULTS = {
  Database: {
    persistence: false,
  },
};

export default class ModuleBase {
  _native: Object;
  _module: string;
  _options: Object;
  _appName: string;
  _namespace: string;
  _firebaseApp: Object;
  _eventEmitter: Object;
  static _NAMESPACE: string;
  static _NATIVE_MODULE: string;

  /**
   *
   * @param firebaseApp
   * @param options
   * @param withEventEmitter
   */
  constructor(firebaseApp: Object, options: Object, withEventEmitter: boolean = false) {
    this._module = this.constructor._NATIVE_MODULE.replace('RNFirebase', '');
    this._firebaseApp = firebaseApp;
    this._appName = firebaseApp._name;
    this._namespace = `${this._appName}:${this._module}`;
    this._options = Object.assign({}, DEFAULTS[this._module] || {}, options);

    // check if native module exists as all native
    // modules are now optionally part of build
    const nativeModule = NativeModules[this.constructor._NATIVE_MODULE];

    if (!nativeModule) {
      throw new Error(
        INTERNALS.STRINGS.ERROR_MISSING_MODULE(
          this.constructor._NAMESPACE,
          this.constructor._NATIVE_MODULE,
        ),
      );
    }

    // used by the modules that extend ModuleBase
    // to access their native module counterpart
    if (!MULTI_APP_MODULES.includes(this._module.toLowerCase())) {
      this._native = nativeModule;
    } else {
      this._native = nativeWithApp(this._appName, nativeModule);
    }

    if (withEventEmitter) {
      this._setupEventEmitter(nativeModule, this._module);
    }
  }

  /**
   *
   * @param nativeModule
   * @param moduleName
   * @private
   */
  _setupEventEmitter(nativeModule, moduleName) {
    this._eventEmitter = FirebaseCore._getOrSetNativeEmitter(`${this._appName}-${this._module}`, nativeModule);
    const events = NATIVE_MODULE_EVENTS[moduleName];

    if (events && events.length) {
      for (let i = 0, len = events.length; i < len; i++) {
        FirebaseCore._subscribeForDistribution(events[i], this._eventEmitter);
      }
    }
  }

  /**
   *
   * @param eventName
   * @return {string}
   * @private
   */
  _getAppEventName(eventName) {
    return `${this._appName}-${eventName}`;
  }

  /**
   * Returns the FirebaseApp instance for current module
   * @return {*}
   */
  get app(): FirebaseApp {
    return this._firebaseApp;
  }

  get log(): Log {
    if (logs[this._namespace]) return logs[this._namespace];
    return logs[this._namespace] = Log.createLogger(
      `🔥 ${this._namespace.toUpperCase()}`,
    );
  }

  /*
   * Proxy functions to shared event emitter instance
   * https://github.com/facebook/react-native/blob/master/Libraries/EventEmitter/EventEmitter.js
   */
  get sharedEventEmitter(): Object {
    return INTERNALS.SharedEventEmitter;
  }

  get addListener(): Function {
    return INTERNALS.SharedEventEmitter.addListener.bind(INTERNALS.SharedEventEmitter);
  }

  get once(): Function {
    return INTERNALS.SharedEventEmitter.once.bind(INTERNALS.SharedEventEmitter);
  }

  get on(): Function {
    return INTERNALS.SharedEventEmitter.addListener.bind(INTERNALS.SharedEventEmitter);
  }

  get emit(): Function {
    return INTERNALS.SharedEventEmitter.emit.bind(INTERNALS.SharedEventEmitter);
  }

  get listeners(): Function {
    return INTERNALS.SharedEventEmitter.listeners.bind(INTERNALS.SharedEventEmitter);
  }

  hasListeners(eventType: string): Boolean {
    const subscriptions = INTERNALS.SharedEventEmitter._subscriber.getSubscriptionsForType(eventType);
    return subscriptions && subscriptions.length;
  }

  get removeListener(): Function {
    return INTERNALS.SharedEventEmitter.removeListener.bind(INTERNALS.SharedEventEmitter);
  }

  get removeAllListeners(): Function {
    return INTERNALS.SharedEventEmitter.removeAllListeners.bind(INTERNALS.SharedEventEmitter);
  }
}

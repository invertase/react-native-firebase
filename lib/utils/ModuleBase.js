/**
 * @flow
 */
import { NativeModules } from 'react-native';
import Log from '../utils/log';
import { nativeWithApp } from './../utils';
import INTERNALS from './../internals';

// logging instances

const logs = {};

export default class ModuleBase {
  constructor(firebaseApp, options, moduleName) {
    this._options = Object.assign({}, options);
    this._module = moduleName;
    this._firebaseApp = firebaseApp;
    this._appName = firebaseApp.name;
    this._namespace = `${this._appName}:${this._module}`;

    // check if native module exists as all native modules are now optionally part of build
    const nativeModule = NativeModules[`RNFirebase${moduleName}`];

    if (!nativeModule) {
      throw new Error(INTERNALS.STRINGS.ERROR_MISSING_MODULE(moduleName));
    }

    // used by the modules that extend ModuleBase to access their native module counterpart
    this._native = nativeWithApp(this._appName, nativeModule);
  }

  /**
   * Returns the FirebaseApp instance for current module
   * @return {*}
   */
  get app() {
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
  get sharedEventEmitter() {
    return INTERNALS.SharedEventEmitter;
  }

  get addListener() {
    return INTERNALS.SharedEventEmitter.addListener.bind(INTERNALS.SharedEventEmitter);
  }

  get on() {
    return INTERNALS.SharedEventEmitter.addListener.bind(INTERNALS.SharedEventEmitter);
  }

  get emit() {
    return INTERNALS.SharedEventEmitter.emit.bind(INTERNALS.SharedEventEmitter);
  }

  get listeners() {
    return INTERNALS.SharedEventEmitter.listeners.bind(INTERNALS.SharedEventEmitter);
  }

  hasListeners(eventType: string): Boolean {
    const subscriptions = INTERNALS.SharedEventEmitter._subscriber.getSubscriptionsForType(eventType);
    return subscriptions && subscriptions.length;
  }

  get removeListener() {
    return INTERNALS.SharedEventEmitter.removeListener.bind(INTERNALS.SharedEventEmitter);
  }

  get removeAllListeners() {
    return INTERNALS.SharedEventEmitter.removeAllListeners.bind(INTERNALS.SharedEventEmitter);
  }
}

/**
 * @flow
 */
import { initialiseNativeModuleEventEmitter } from './events';
import { getNativeModule, initialiseNativeModule } from './native';

import type FirebaseApp from '../modules/core/firebase-app';
import type { FirebaseModuleName } from '../types';

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
  _firebaseApp: FirebaseApp;
  static _NAMESPACE: FirebaseModuleName;
  static _NATIVE_MODULE: string;

  /**
   *
   * @param firebaseApp
   * @param options
   * @param withEventEmitter
   */
  constructor(firebaseApp: FirebaseApp, options: Object, withEventEmitter: boolean = false) {
    this._module = this.constructor._NATIVE_MODULE.replace('RNFirebase', '');
    this._firebaseApp = firebaseApp;
    this._appName = firebaseApp._name;
    this._namespace = `${this._appName}:${this._module}`;
    this._options = Object.assign({}, DEFAULTS[this._module] || {}, options);

    // check if native module exists as all native
    initialiseNativeModule(this);
    // TODO: Get rid of
    this._native = getNativeModule(this);

    if (withEventEmitter) {
      initialiseNativeModuleEventEmitter(this);
    }
  }

  /**
   * Returns the FirebaseApp instance for current module
   * @return {*}
   */
  get app(): FirebaseApp {
    return this._firebaseApp;
  }
}

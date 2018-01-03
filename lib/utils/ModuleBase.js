/**
 * @flow
 */
import { initialiseLogger } from './log';
import { initialiseNativeModule } from './native';

import type FirebaseApp from '../modules/core/firebase-app';
import type { FirebaseModuleConfig } from '../types';

export default class ModuleBase {
  _firebaseApp: FirebaseApp;
  _native: Object;
  _options: Object;

  /**
   *
   * @param firebaseApp
   * @param options
   * @param withEventEmitter
   */
  constructor(firebaseApp: FirebaseApp, options: Object, config: FirebaseModuleConfig) {
    if (!config.moduleName) {
      throw new Error('Missing module name');
    }
    if (!config.namespace) {
      throw new Error('Missing namespace');
    }
    const { moduleName } = config;
    this._firebaseApp = firebaseApp;
    this._options = options;

    // check if native module exists as all native
    // TODO: Get rid of this._native and change to using getNativeModule instead?
    this._native = initialiseNativeModule(this, config);
    initialiseLogger(this, `${firebaseApp.name}:${moduleName.replace('RNFirebase', '')}`);
  }

  /**
   * Returns the FirebaseApp instance for current module
   * @return {*}
   */
  get app(): FirebaseApp {
    return this._firebaseApp;
  }
}

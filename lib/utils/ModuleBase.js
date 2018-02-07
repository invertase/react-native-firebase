/**
 * @flow
 */
import { initialiseLogger } from './log';
import { initialiseNativeModule } from './native';

import type App from '../modules/core/firebase-app';
import type { FirebaseModuleConfig, FirebaseNamespace } from '../types';

export default class ModuleBase {
  _app: App;
  namespace: FirebaseNamespace;

  /**
   *
   * @param app
   * @param config
   */
  constructor(app: App, config: FirebaseModuleConfig) {
    if (!config.moduleName) {
      throw new Error('Missing module name');
    }
    if (!config.namespace) {
      throw new Error('Missing namespace');
    }
    const { moduleName } = config;
    this._app = app;
    this.namespace = config.namespace;

    // check if native module exists as all native
    initialiseNativeModule(this, config);
    initialiseLogger(
      this,
      `${app.name}:${moduleName.replace('RNFirebase', '')}`
    );
  }

  /**
   * Returns the App instance for current module
   * @return {*}
   */
  get app(): App {
    return this._app;
  }
}

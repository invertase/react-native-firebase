import { initialiseLogger, getLogger } from './log';
import { initialiseNativeModule } from './native';
export default class ModuleBase {
  /**
   *
   * @param app
   * @param config
   * @param customUrlOrRegion
   */
  constructor(app, config, customUrlOrRegion) {
    if (!config.moduleName) {
      throw new Error('Missing module name');
    }

    if (!config.namespace) {
      throw new Error('Missing namespace');
    }

    const {
      moduleName
    } = config;
    this._app = app;
    this._customUrlOrRegion = customUrlOrRegion;
    this.namespace = config.namespace; // check if native module exists as all native

    initialiseNativeModule(this, config, customUrlOrRegion);
    initialiseLogger(this, `${app.name}:${moduleName.replace('RNFirebase', '')}`);
  }
  /**
   * Returns the App instance for current module
   * @return {*}
   */


  get app() {
    return this._app;
  }

  get log() {
    return getLogger(this);
  }

}
export default class FirebaseModule {
  constructor(app, config, customUrlOrRegion) {
    this._app = app;
    this._nativeModule = null;
    this._namespace = config.namespace;
    this._customUrlOrRegion = customUrlOrRegion;
  }

  /**
   * Returns the App instance for current module
   * @public
   * @return {*}
   */
  get app(): App {
    return this._app;
  }

  /**
   * @private
   * @returns {null}
   */
  get native() {
    if (this._nativeModule) return this._nativeModule;
    // TODO bootstrap native module and wrap multi-app helpers
    return null;
  }

  get log() {
    // TODO logger;
    return null;
  }
}

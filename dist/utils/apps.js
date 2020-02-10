import { NativeModules } from 'react-native';
import App from '../modules/core/app';
import INTERNALS from './internals';
import { isAndroid, isObject, isString } from './';
const FirebaseCoreModule = NativeModules.RNFirebase;
const APPS = {};
const DEFAULT_APP_NAME = '[DEFAULT]';
const APP_MODULES = {};
const CUSTOM_URL_OR_REGION_NAMESPACES = {
  database: true,
  functions: true,
  storage: false,
  // TODO true once multi-bucket support added.
  // for flow:
  admob: false,
  analytics: false,
  auth: false,
  config: false,
  crashlytics: false,
  firestore: false,
  iid: false,
  invites: false,
  links: false,
  messaging: false,
  notifications: false,
  perf: false,
  utils: false
};
export default {
  DEFAULT_APP_NAME,

  app(name) {
    const _name = name ? name.toUpperCase() : DEFAULT_APP_NAME;

    const app = APPS[_name];
    if (!app) throw new Error(INTERNALS.STRINGS.ERROR_APP_NOT_INIT(_name));
    return app;
  },

  apps() {
    // $FlowExpectedError: Object.values always returns mixed type: https://github.com/facebook/flow/issues/2221
    return Object.values(APPS);
  },

  /**
   *
   * @param app
   * @param namespace
   * @param InstanceClass
   * @return {function()}
   * @private
   */
  appModule(app, namespace, InstanceClass) {
    return (customUrlOrRegion = null) => {
      if (customUrlOrRegion && !CUSTOM_URL_OR_REGION_NAMESPACES[namespace]) {
        throw new Error(INTERNALS.STRINGS.ERROR_INIT_SERVICE_URL_OR_REGION_UNSUPPORTED(namespace));
      }

      const appInstanceIdentifier = `${app.name}${customUrlOrRegion || ''}`;

      if (!APP_MODULES[appInstanceIdentifier]) {
        APP_MODULES[appInstanceIdentifier] = {};
      }

      if (!APP_MODULES[appInstanceIdentifier][namespace]) {
        APP_MODULES[appInstanceIdentifier][namespace] = new InstanceClass(app, customUrlOrRegion); // only check once on new app namespace instance

        if (isAndroid && namespace !== 'utils' && !INTERNALS.FLAGS.checkedPlayServices) {
          INTERNALS.FLAGS.checkedPlayServices = true;
          app.utils().checkPlayServicesAvailability();
        }
      }

      return APP_MODULES[appInstanceIdentifier][namespace];
    };
  },

  /**
   *
   * @param name
   * @returns {*}
   */
  deleteApp(name) {
    const app = APPS[name];
    if (!app) return;
    delete APPS[name];
  },

  /**
   * Web SDK initializeApp
   *
   * @param options
   * @param name
   * @return {*}
   */
  initializeApp(options, name) {
    if (name && !isString(name)) {
      throw new Error(INTERNALS.STRINGS.ERROR_INIT_STRING_NAME);
    }

    const _name = (name || DEFAULT_APP_NAME).toUpperCase(); // return an existing app if found
    // TODO in v5 remove deprecation and throw an error


    if (APPS[_name]) {
      console.warn(INTERNALS.STRINGS.WARN_INITIALIZE_DEPRECATION);
      return APPS[_name];
    } // only validate if app doesn't already exist
    // to allow apps already initialized natively
    // to still go through init without erroring (backwards compatibility)


    if (!isObject(options)) {
      throw new Error(INTERNALS.STRINGS.ERROR_INIT_OBJECT);
    }

    if (!options.apiKey) {
      throw new Error(INTERNALS.STRINGS.ERROR_MISSING_OPT('apiKey'));
    }

    if (!options.appId) {
      throw new Error(INTERNALS.STRINGS.ERROR_MISSING_OPT('appId'));
    }

    if (!options.databaseURL) {
      throw new Error(INTERNALS.STRINGS.ERROR_MISSING_OPT('databaseURL'));
    }

    if (!options.messagingSenderId) {
      throw new Error(INTERNALS.STRINGS.ERROR_MISSING_OPT('messagingSenderId'));
    }

    if (!options.projectId) {
      throw new Error(INTERNALS.STRINGS.ERROR_MISSING_OPT('projectId'));
    }

    if (!options.storageBucket) {
      throw new Error(INTERNALS.STRINGS.ERROR_MISSING_OPT('storageBucket'));
    }

    APPS[_name] = new App(_name, options);
    return APPS[_name];
  },

  /**
   * Bootstraps all native app instances that were discovered on boot
   */
  initializeNativeApps() {
    for (let i = 0, len = FirebaseCoreModule.apps.length; i < len; i++) {
      const app = FirebaseCoreModule.apps[i];
      const options = Object.assign({}, app);
      delete options.name;
      APPS[app.name.toUpperCase()] = new App(app.name.toUpperCase(), options, true);
    }
  },

  /**
   *
   * @param namespace
   * @param statics
   * @param moduleName
   * @return {function(App=)}
   */
  moduleAndStatics(namespace, statics, moduleName) {
    const getModule = (appOrUrlOrRegion, customUrlOrRegion) => {
      let _app = appOrUrlOrRegion;

      let _customUrlOrRegion = customUrlOrRegion || null;

      if (typeof appOrUrlOrRegion === 'string' && CUSTOM_URL_OR_REGION_NAMESPACES[namespace]) {
        _app = null;
        _customUrlOrRegion = appOrUrlOrRegion;
      } // throw an error if it's not a valid app instance


      if (_app && !(_app instanceof App)) {
        throw new Error(INTERNALS.STRINGS.ERROR_NOT_APP(namespace));
      } else if (!_app) {
        // default to the 'DEFAULT' app if no arg provided - will throw an error
        // if default app not initialized
        _app = this.app(DEFAULT_APP_NAME);
      } // $FlowExpectedError: Flow doesn't support indexable signatures on classes: https://github.com/facebook/flow/issues/1323


      const module = _app[namespace];
      return module(_customUrlOrRegion);
    };

    return Object.assign(getModule, statics, {
      nativeModuleExists: !!NativeModules[moduleName]
    });
  }

};
/**
 * @flow
 */
import { NativeModules } from 'react-native';
import FirebaseApp from '../modules/core/firebase-app';
import INTERNALS from './internals';
import { isAndroid, isObject, isString } from './';

import type {
  FirebaseModule,
  FirebaseModuleAndStatics,
  FirebaseModuleName,
  FirebaseOptions,
  FirebaseStatics,
} from '../types';

const FirebaseCoreModule = NativeModules.RNFirebase;

const APPS: { [string]: FirebaseApp } = {};
const APP_MODULES: { [FirebaseApp]: { [string]: FirebaseModule }} = {};

export default {
  app(name?: string): FirebaseApp {
    const _name = name ? name.toUpperCase() : INTERNALS.STRINGS.DEFAULT_APP_NAME;
    const app = APPS[_name];
    if (!app) throw new Error(INTERNALS.STRINGS.ERROR_APP_NOT_INIT(_name));
    return app;
  },

  apps(): Array<FirebaseApp> {
    return Object.values(APPS);
  },

  /**
   *
   * @param statics
   * @param InstanceClass
   * @return {function()}
   * @private
   */
  appModule<M: FirebaseModule>(firebaseApp: FirebaseApp, moduleName: FirebaseModuleName, InstanceClass: Class<M>): () => FirebaseModule {
    return (): M => {
      if (!APP_MODULES[firebaseApp]) {
        APP_MODULES[firebaseApp] = {};
      }

      if (isAndroid && moduleName !== 'utils' && !INTERNALS.FLAGS.checkedPlayServices) {
        INTERNALS.FLAGS.checkedPlayServices = true;
        this.utils().checkPlayServicesAvailability();
      }

      if (!APP_MODULES[firebaseApp][moduleName]) {
        APP_MODULES[firebaseApp][moduleName] = new InstanceClass(firebaseApp, this._options);
      }

      return APP_MODULES[firebaseApp][moduleName];
    };
  },

  deleteApp(name: string): Promise<boolean> {
    const app = APPS[name];
    if (!app) return Promise.resolve(true);

    // https://firebase.google.com/docs/reference/js/firebase.app.App#delete
    return app.delete().then(() => {
      delete APPS[name];
      return true;
    });
  },

  /**
   * Web SDK initializeApp
   *
   * @param options
   * @param name
   * @return {*}
   */
  initializeApp(options: FirebaseOptions, name: string): FirebaseApp {
    if (name && !isString(name)) {
      throw new Error(INTERNALS.STRINGS.ERROR_INIT_STRING_NAME);
    }

    const _name = (name || INTERNALS.STRINGS.DEFAULT_APP_NAME).toUpperCase();

    // return an existing app if found
    // todo in v4 remove deprecation and throw an error
    if (APPS[_name]) {
      console.warn(INTERNALS.STRINGS.WARN_INITIALIZE_DEPRECATION);
      return APPS[_name];
    }

    // only validate if app doesn't already exist
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

    APPS[_name] = new FirebaseApp(_name, options);

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
      APPS[app.name] = new FirebaseApp(app.name, options, true);
    }
  },

  /**
   *
   * @param statics
   * @param InstanceClass
   * @return {function(FirebaseApp=)}
   */
  moduleAndStatics<M: FirebaseModule, S: FirebaseStatics>(moduleName: FirebaseModuleName, statics: S, InstanceClass: Class<M>): FirebaseModuleAndStatics<M, S> {
    const getModule = (app?: FirebaseApp): FirebaseModule => {
      let firebaseApp = app;

      // throw an error if it's not a valid app instance
      if (firebaseApp && !(firebaseApp instanceof FirebaseApp)) throw new Error(INTERNALS.STRINGS.ERROR_NOT_APP(moduleName));

      // default to the 'DEFAULT' app if no arg provided - will throw an error
      // if default app not initialized
      else if (!firebaseApp) firebaseApp = this.app(INTERNALS.STRINGS.DEFAULT_APP_NAME);
      if (moduleName === 'crashlytics') {
        return firebaseApp.fabric[moduleName]();
      }
      const module = firebaseApp[moduleName];
      return module();
    };

    return Object.assign(getModule, statics, {
      nativeModuleExists: !!NativeModules[InstanceClass._NATIVE_MODULE],
    });
  },
};

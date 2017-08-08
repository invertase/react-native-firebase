/**
 * @providesModule Firebase
 * @flow
 */
import { NativeModules, NativeEventEmitter } from 'react-native';

import { isObject, isString } from './utils';

import INTERNALS from './internals';
import PACKAGE from './../package.json';
import FirebaseApp from './firebase-app';

// module imports
import AdMob, { statics as AdMobStatics } from './modules/admob';
import Auth, { statics as AuthStatics } from './modules/auth';
import Analytics from './modules/analytics';
import Crash from './modules/crash';
import Performance from './modules/perf';
import RemoteConfig from './modules/config';
import Storage, { statics as StorageStatics } from './modules/storage';
import Database, { statics as DatabaseStatics } from './modules/database';
import Messaging, { statics as MessagingStatics } from './modules/messaging';

const FirebaseCoreModule = NativeModules.RNFirebase;

class FirebaseCore {
  constructor() {
    this._nativeEmitters = {};
    this._nativeSubscriptions = {};

    for (let i = 0, len = FirebaseCoreModule.apps.length; i < len; i++) {
      const app = FirebaseCoreModule.apps[i];
      const options = Object.assign({}, app);
      delete options.name;
      INTERNALS.APPS[app.name] = new FirebaseApp(app.name, options);
      INTERNALS.APPS[app.name]._initializeApp(true);
    }

    // modules
    this.admob = this._appNamespaceOrStatics('admob', AdMobStatics, AdMob);
    this.auth = this._appNamespaceOrStatics('auth', AuthStatics, Auth);
    this.analytics = this._appNamespaceOrStatics('analytics', {}, Analytics);
    this.config = this._appNamespaceOrStatics('config', {}, RemoteConfig);
    this.crash = this._appNamespaceOrStatics('crash', {}, Crash);
    this.database = this._appNamespaceOrStatics('database', DatabaseStatics, Database);
    this.messaging = this._appNamespaceOrStatics('messaging', MessagingStatics, Messaging);
    this.perf = this._appNamespaceOrStatics('perf', DatabaseStatics, Performance);
    this.storage = this._appNamespaceOrStatics('storage', StorageStatics, Storage);
  }

  /**
   * Web SDK initializeApp
   *
   * @param options
   * @param name
   * @return {*}
   */
  initializeApp(options: Object = {}, name: string): FirebaseApp {
    if (name && !isString(name)) {
      throw new Error(INTERNALS.STRINGS.ERROR_INIT_STRING_NAME);
    }

    const _name = (name || INTERNALS.STRINGS.DEFAULT_APP_NAME).toUpperCase();

    // return an existing app if found
    if (INTERNALS.APPS[_name]) return INTERNALS.APPS[_name];

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

    INTERNALS.APPS[_name] = new FirebaseApp(_name, options);
    // only initialize if certain props are available
    if (options.databaseURL && options.apiKey) {
      INTERNALS.APPS[_name]._initializeApp();
    }

    return INTERNALS.APPS[_name];
  }

  /**
   * Retrieves a Firebase app instance.
   *
   * When called with no arguments, the default app is returned.
   * When an app name is provided, the app corresponding to that name is returned.
   *
   * @param name
   * @return {*}
   */
  app(name?: string): FirebaseApp {
    const _name = name ? name.toUpperCase() : INTERNALS.STRINGS.DEFAULT_APP_NAME;
    const app = INTERNALS.APPS[_name];
    if (!app) throw new Error(INTERNALS.STRINGS.ERROR_APP_NOT_INIT(_name));
    return app;
  }

  /**
   * A (read-only) array of all initialized apps.
   * @return {Array}
   */
  get apps(): Array<Object> {
    return Object.values(INTERNALS.APPS);
  }

  /**
   * The current RNFirebase SDK version.
   */
  get SDK_VERSION() {
    return PACKAGE.version;
  }

  /**
   * The platform specific default app name
   */
  get DEFAULT_APP_NAME() {
    return INTERNALS.STRINGS.DEFAULT_APP_NAME;
  }

  /**
   * Returns props from the android GoogleApiAvailability sdk
   * @android
   * @return {RNFirebase.GoogleApiAvailabilityType|{isAvailable: boolean, status: number}}
   */
  get googleApiAvailability(): GoogleApiAvailabilityType {
    return FirebaseCoreModule.googleApiAvailability || { isAvailable: true, status: 0 };
  }

  /*
   * CONFIG METHODS
   */
  /**
   * Set the global logging level for all logs.
   *
   * @param booleanOrDebugString
   */
  setLogLevel(booleanOrDebugString) {
    INTERNALS.OPTIONS.logLevel = booleanOrDebugString;
    Log.setLevel(booleanOrDebugString);
  }

  /*
   * INTERNALS
   */

  /**
   * Subscribe to a native event for js side distribution by appName
   *    React Native events are hard set at compile - cant do dynamic event names
   *    so we use a single event send it to js and js then internally can prefix it
   *    and distribute dynamically.
   *
   * @param eventName
   * @param nativeEmitter
   * @private
   */
  _subscribeForDistribution(eventName, nativeEmitter) {
    if (!this._nativeSubscriptions[eventName]) {
      nativeEmitter.addListener(eventName, (event) => {
        if (event.appName) {
          // native event has an appName property - auto prefix and internally emit
          INTERNALS.SharedEventEmitter.emit(`${event.appName}-${eventName}`, event);
        } else {
          // standard event - no need to prefix
          INTERNALS.SharedEventEmitter.emit(eventName, event);
        }
      });

      this._nativeSubscriptions[eventName] = true;
    }
  }

  /**
   *
   * @param namespace
   * @param statics
   * @return {function(FirebaseApp=)}
   * @private
   */
  _appNamespaceOrStatics(namespace, statics = {}): Function {
    const getNamespace = (app?: FirebaseApp) => {
      let _app = app;
      // throw an error if it's not a valid app instance
      if (_app && !(_app instanceof FirebaseApp)) throw new Error(INTERNALS.STRINGS.ERROR_NOT_APP(namespace));

      // default to the 'DEFAULT' app if no arg provided - will throw an error
      // if default app not initialized
      else if (!_app) _app = this.app(INTERNALS.STRINGS.DEFAULT_APP_NAME);
      return INTERNALS.APPS[_app.name][namespace](_app);
    };

    Object.assign(getNamespace, statics);
    return getNamespace;
  }

  /**
   *
   * @param name
   * @param nativeModule
   * @return {*}
   * @private
   */
  _getOrSetNativeEmitter(name, nativeModule) {
    if (this._nativeEmitters[name]) {
      return this._nativeEmitters[name];
    }

    return this._nativeEmitters[name] = new NativeEventEmitter(nativeModule);
  }

}

export default new FirebaseCore();

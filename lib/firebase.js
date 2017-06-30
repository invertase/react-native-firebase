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
import Auth, { statics as AuthStatics } from './modules/auth';
import Storage, { statics as StorageStatics } from './modules/storage';
import Database, { statics as DatabaseStatics } from './modules/database';
import Messaging, { statics as MessagingStatics } from './modules/messaging';

const FirebaseCoreModule = NativeModules.RNFirebase;

class FirebaseCore {
  constructor() {
    this._nativeEmitters = {};

    // todo init other modules if available on native
    // todo generalise this so adding other modules isn't so repetitive:
    if (NativeModules.RNFirebaseAuth) {
      this._nativeEmitters.auth = new NativeEventEmitter(NativeModules.RNFirebaseAuth);
      this._subscribeForDistribution('onAuthStateChanged', this._nativeEmitters.auth);
    }
    // ...
  }

  /**
   * Web SDK initializeApp
   *
   * @param options
   * @param name
   * @return {*}
   */
  initializeApp(options: Object = {}, name: string): FirebaseApp {
    if (!isObject(options)) {
      throw new Error(INTERNALS.STRINGS.ERROR_INIT_OBJECT);
    }

    // todo validate required options

    if (name && !isString(name)) {
      throw new Error(INTERNALS.STRINGS.ERROR_INIT_STRING_NAME);
    }

    const _name = (name || INTERNALS.STRINGS.DEFAULT_APP_NAME).toUpperCase();

    if (!INTERNALS.APPS[_name]) {
      INTERNALS.APPS[_name] = new FirebaseApp(_name, options);
      // only initialize if certain props are available
      if (options.databaseURL && options.apiKey) {
        INTERNALS.APPS[_name]._initializeApp();
      }
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
   * Returns props from the android GoogleApiAvailability sdk
   * @android
   * @return {RNFirebase.GoogleApiAvailabilityType|{isAvailable: boolean, status: number}}
   */
  get googleApiAvailabilty(): GoogleApiAvailabilityType {
    return FirebaseCoreModule.googleApiAvailability || { isAvailable: true, status: 0 };
  }

  /*
   * MODULES
   */

  get auth() {
    return this._appNamespaceOrStatics('auth', AuthStatics, Auth);
  }

  get database() {
    return this._appNamespaceOrStatics('database', DatabaseStatics, Database);
  }

  get messaging() {
    return this._appNamespaceOrStatics('messaging', MessagingStatics, Messaging);
  }

  get storage() {
    return this._appNamespaceOrStatics('storage', StorageStatics, Storage);
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
    nativeEmitter.addListener(eventName, (event) => {
      if (event.appName) {
        // native event has an appName property - auto prefix and internally emit
        INTERNALS.SharedEventEmitter.emit(`${event.appName}-${eventName}`, event);
      } else {
        // standard event - no need to prefix
        INTERNALS.SharedEventEmitter.emit(eventName, event);
      }
    });
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

}

export default new FirebaseCore();

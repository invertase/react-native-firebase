/**
 * @providesModule Firebase
 * @flow
 */
import { NativeModules, NativeEventEmitter } from 'react-native';

import INTERNALS from '../../utils/internals';
import FirebaseApp from './firebase-app';
import { isObject, isString } from '../../utils';

// module imports
import AdMob, { statics as AdMobStatics } from '../admob';
import Auth, { statics as AuthStatics } from '../auth';
import Analytics, { statics as AnalyticsStatics } from '../analytics';
import Config, { statics as ConfigStatics } from '../config';
import Crash, { statics as CrashStatics } from '../crash';
import Crashlytics, { statics as CrashlyticsStatics } from '../fabric/crashlytics';
import Database, { statics as DatabaseStatics } from '../database';
import Firestore, { statics as FirestoreStatics } from '../firestore';
import Links, { statics as LinksStatics } from '../links';
import Messaging, { statics as MessagingStatics } from '../messaging';
import Performance, { statics as PerformanceStatics } from '../perf';
import Storage, { statics as StorageStatics } from '../storage';
import Utils, { statics as UtilsStatics } from '../utils';

import type {
  AdMobModule,
  AnalyticsModule,
  AuthModule,
  ConfigModule,
  CrashModule,
  DatabaseModule,
  FabricModule,
  FirebaseModule,
  FirebaseModuleAndStatics,
  FirebaseOptions,
  FirebaseStatics,
  FirestoreModule,
  LinksModule,
  MessagingModule,
  PerformanceModule,
  StorageModule,
  UtilsModule,
} from '../../types';

const FirebaseCoreModule = NativeModules.RNFirebase;

class FirebaseCore {
  _nativeEmitters: { [string]: NativeEventEmitter };
  _nativeSubscriptions: { [string]: boolean };
  admob: AdMobModule;
  analytics: AnalyticsModule;
  auth: AuthModule;
  config: ConfigModule;
  crash: CrashModule;
  database: DatabaseModule;
  fabric: FabricModule;
  firestore: FirestoreModule;
  links: LinksModule;
  messaging: MessagingModule;
  perf: PerformanceModule;
  storage: StorageModule;
  utils: UtilsModule;

  constructor() {
    this._nativeEmitters = {};
    this._nativeSubscriptions = {};

    if (!FirebaseCoreModule) {
      throw (new Error(INTERNALS.STRINGS.ERROR_MISSING_CORE));
    }

    this._initializeNativeApps();

    // modules
    this.admob = this._appNamespaceOrStatics(AdMobStatics, AdMob);
    this.analytics = this._appNamespaceOrStatics(AnalyticsStatics, Analytics);
    this.auth = this._appNamespaceOrStatics(AuthStatics, Auth);
    this.config = this._appNamespaceOrStatics(ConfigStatics, Config);
    this.crash = this._appNamespaceOrStatics(CrashStatics, Crash);
    this.database = this._appNamespaceOrStatics(DatabaseStatics, Database);
    this.fabric = {
      crashlytics: this._appNamespaceOrStatics(CrashlyticsStatics, Crashlytics),
    };
    this.firestore = this._appNamespaceOrStatics(FirestoreStatics, Firestore);
    this.links = this._appNamespaceOrStatics(LinksStatics, Links);
    this.messaging = this._appNamespaceOrStatics(MessagingStatics, Messaging);
    this.perf = this._appNamespaceOrStatics(PerformanceStatics, Performance);
    this.storage = this._appNamespaceOrStatics(StorageStatics, Storage);
    this.utils = this._appNamespaceOrStatics(UtilsStatics, Utils);
  }

  /**
   * Bootstraps all native app instances that were discovered on boot
   * @private
   */
  _initializeNativeApps() {
    for (let i = 0, len = FirebaseCoreModule.apps.length; i < len; i++) {
      const app = FirebaseCoreModule.apps[i];
      const options = Object.assign({}, app);
      delete options.name;
      INTERNALS.APPS[app.name] = new FirebaseApp(app.name, options);
      INTERNALS.APPS[app.name]._initializeApp(true);
    }
  }

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
    if (INTERNALS.APPS[_name]) {
      console.warn(INTERNALS.STRINGS.WARN_INITIALIZE_DEPRECATION);
      return INTERNALS.APPS[_name];
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
  get apps(): Array<FirebaseApp> {
    return Object.values(INTERNALS.APPS);
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
  _subscribeForDistribution(eventName: string, nativeEmitter: NativeEventEmitter) {
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
   * @param statics
   * @param InstanceClass
   * @return {function(FirebaseApp=)}
   * @private
   */
  _appNamespaceOrStatics<M: FirebaseModule, S: FirebaseStatics>(statics: S, InstanceClass: Class<M>): FirebaseModuleAndStatics<M, S> {
    const namespace = InstanceClass._NAMESPACE;

    const getNamespace = (app?: FirebaseApp) => {
      let _app = app;

      // throw an error if it's not a valid app instance
      if (_app && !(_app instanceof FirebaseApp)) throw new Error(INTERNALS.STRINGS.ERROR_NOT_APP(namespace));

      // default to the 'DEFAULT' app if no arg provided - will throw an error
      // if default app not initialized
      else if (!_app) _app = this.app(INTERNALS.STRINGS.DEFAULT_APP_NAME);
      const firebaseApp = INTERNALS.APPS[_app._name];
      if (namespace === 'crashlytics') {
        return firebaseApp.fabric[namespace](_app);
      }
      return firebaseApp[namespace](_app);
    };

    return Object.assign(getNamespace, statics, {
      nativeModuleExists: !!NativeModules[InstanceClass._NATIVE_MODULE],
    });
  }

  /**
   *
   * @param name
   * @param nativeModule
   * @return {*}
   * @private
   */
  _getOrSetNativeEmitter(name: string, nativeModule: Object): NativeEventEmitter {
    if (this._nativeEmitters[name]) {
      return this._nativeEmitters[name];
    }

    return this._nativeEmitters[name] = new NativeEventEmitter(nativeModule);
  }
}

export default new FirebaseCore();

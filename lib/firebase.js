/**
 * @providesModule Firebase
 * @flow
 */
import { NativeModules } from 'react-native';

import Log from './utils/log';
import { isObject } from './utils';

// modules
import Auth, { statics as AuthStatics } from './modules/auth';
import Storage, { statics as StorageStatics } from './modules/storage';
import Database, { statics as DatabaseStatics } from './modules/database';
import Messaging, { statics as MessagingStatics } from './modules/messaging';
import Analytics from './modules/analytics';
import Crash from './modules/crash';
import RemoteConfig from './modules/config';
import Performance from './modules/perf';
import AdMob, { statics as AdMobStatics } from './modules/admob';
import Links, { statics as LinksStatics } from './modules/links';

const instances: Object = { default: null };
const FirebaseModule = NativeModules.RNFirebase;

/**
 * @class Firebase
 */
export default class Firebase {
  _log: ?Object;
  _auth: ?Object;
  _store: ?Object;
  _storage: ?Object;
  _database: ?Object;
  _presence: ?Object;
  _analytics: ?Object;
  _constants: ?Object;
  _messaging: ?Object;
  _config: ?Object;
  _crash: ?Object;
  _perf: ?Object;
  _admob: ?Object;
  _links: ?Object;

  auth: Function;
  crash: Function;
  storage: Function;
  database: Function;
  analytics: Function;
  messaging: Function;
  config: Function;
  perf: Function;
  admob: Function;
  links: Function;

  eventHandlers: Object;
  debug: boolean;
  options: {
    errorOnMissingPlayServices: boolean,
    debug?: boolean,
    persistence?: boolean
  };

  /**
   *
   * @param options
   */
  constructor(options: Object = {}) {
    this.eventHandlers = {};
    this.debug = options.debug || false;
    this.options = Object.assign({ errorOnMissingPlayServices: true, promptOnMissingPlayServices: true }, options);

    if (this.debug) {
      Log.enable(this.debug);
    }

    this._log = new Log('firebase');

    if (!this.googleApiAvailability.isAvailable) {
      if (this.options.promptOnMissingPlayServices && this.googleApiAvailability.isUserResolvableError) {
        FirebaseModule.promptPlayServices();
      } else {
        const error = `Google Play Services is required to run this application but no valid installation was found (Code ${this.googleApiAvailability.status}).`;
        if (this.options.errorOnMissingPlayServices) {
          throw new Error(error);
        } else {
          console.warn(error);
        }
      }
    }

    this.auth = this._staticsOrInstance('auth', AuthStatics, Auth);
    this.storage = this._staticsOrInstance('storage', StorageStatics, Storage);
    this.database = this._staticsOrInstance('database', DatabaseStatics, Database);
    this.messaging = this._staticsOrInstance('messaging', MessagingStatics, Messaging);
    this.analytics = this._staticsOrInstance('analytics', {}, Analytics);
    this.crash = this._staticsOrInstance('crash', {}, Crash);
    this.config = this._staticsOrInstance('config', {}, RemoteConfig);
    this.perf = this._staticsOrInstance('perf', {}, Performance);
    this.admob = this._staticsOrInstance('admob', AdMobStatics, AdMob);
    this.links = this._staticsOrInstance('links', LinksStatics, Links);

    // init auth to start listeners
    if (NativeModules.RNFirebaseAuth) {
      this.auth();
    }
  }

  /**
   * Support web version of initApp.
   * @param options
   * @param name
   * @returns {*}
   */
  static initializeApp(options: Object = {}, name: string = 'default') {
    if (!isObject(options)) {
      throw new Error('Firebase.initializeApp(options <- requires a configuration object');
    }

    if (typeof name !== 'string') {
      throw new Error('Firebase.initializeApp(options, name <- requires a string value');
    }

    if (name !== 'default') {
      throw new Error('RNFirebase currently only supports one instance of firebase - the default one.');
    }

    if (!instances[name]) instances[name] = new Firebase(options);
    return instances[name];
  }

  get apps(): Array<string> {
    return Object.keys(instances);
  }

  /**
   * Returns androids GoogleApiAvailability status and message if available.
   * @returns {GoogleApiAvailabilityType|{isAvailable: boolean, status: number}}
   */
  get googleApiAvailability(): GoogleApiAvailabilityType {
    // if not available then return a fake object for ios - saves doing platform specific logic.
    return FirebaseModule.googleApiAvailability || { isAvailable: true, status: 0 };
  }

  /**
   * Logger
   */
  get log(): Log {
    return this._log;
  }

  /**
   *
   * @param name
   * @param statics
   * @param InstanceClass
   * @returns {function()}
   * @private
   */
  _staticsOrInstance(name, statics, InstanceClass): Function {
    const getInstance = () => {
      const internalPropName = `_${name}`;

      // $FlowFixMe
      if (!this[internalPropName]) {
        // $FlowFixMe
        this[internalPropName] = new InstanceClass(this);
      }

      // $FlowFixMe
      return this[internalPropName];
    };

    Object.assign(getInstance, statics || {});
    return getInstance;
  }
}

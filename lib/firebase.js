/**
 * @providesModule Firebase
 * @flow
 */
import { NativeModules, NativeEventEmitter } from 'react-native';

import Log from './utils/log';
import { promisify } from './utils';
import Singleton from './utils/singleton';

// modules
import Auth from './modules/auth';
import Storage from './modules/storage';
import Database from './modules/database';
import Messaging from './modules/messaging';
import Analytics from './modules/analytics';
import Crash from './modules/crash';

let log;
const instances = { default: null };
const FirebaseModule = NativeModules.RNFirebase;
const FirebaseModuleEvt = new NativeEventEmitter(FirebaseModule);

/**
 * @class Firebase
 */
export default class Firebase extends Singleton {

  /**
   *
   * @param options
   */
  constructor(options: Object = {}) {
    const instance = super(options);

    instance.options = Object.assign({ errorOnMissingPlayServices: true }, options);
    instance._debug = instance.options.debug || false;

    Log.enable(instance._debug);
    log = instance._log = new Log('firebase');

    log.info('Creating new firebase instance');

    instance._remoteConfig = instance.options.remoteConfig || {};
    delete instance.options.remoteConfig;

    instance.configured = instance.options.configure || false;

    instance.eventHandlers = {};

    log.info('Calling configure with options', instance.options);
    instance.configurePromise = instance.configure(instance.options);

    instance._auth = new Auth(instance, instance.options);

    if (instance.options.errorOnMissingPlayServices && !this.googleApiAvailability.isAvailable) {
      throw new Error(`Google Play Services is required to run this application but no valid installation was found (Code ${this.googleApiAvailability.status}).`);
    }
  }

  _db: ?Object;
  _log: ?Object;
  _auth: ?Object;
  _store: ?Object;
  _storage: ?Object;
  _presence: ?Object;
  _analytics: ?Object;
  _constants: ?Object;
  _messaging: ?Object;
  _remoteConfig: ?Object;
  _crash: ?Object;

  /**
   * Support web version of initApp.
   * @param options
   * @param name
   * @returns {*}
   */
  static initializeApp(options: Object = {}, name: string = 'default') {
    if (!instances[name]) instances[name] = new Firebase(options);
    return instances[name];
  }


  /**
   *
   * @param opts
   * @returns {Promise.<TResult>|*|Promise.<T>}
   */
  configure(opts: Object = {}) {
    if (!this.configurePromise) {
      const firebaseOptions = Object.assign({}, this.options, opts);

      this.configurePromise = promisify('configureWithOptions', FirebaseModule)(firebaseOptions)
        .then((configuredProperties) => {
          log.info('Native configureWithOptions success', configuredProperties);
          this.configured = true;
          this.firebaseOptions = configuredProperties;
          return configuredProperties;
        }).catch((err) => {
          log.info('Native error occurred while calling configure', err);
        });
    }
    return this.configurePromise;
  }

  onReady(cb: Function) {
    // TODO wut o.O
    return this.configurePromise = this.configurePromise.then(cb);
  }

  /**
   * Wrappers
   * We add methods from each wrapper to this instance
   * when they are needed. Not sure if this is a good
   * idea or not (imperative vs. direct manipulation/proxy)
   */
  auth() {
    return this._auth;
  }


  database() {
    if (!this._db) {
      this._db = new Database(this);
    }
    return this._db;
  }


  analytics() {
    if (!this._analytics) {
      this._analytics = new Analytics(this);
    }
    return this._analytics;
  }

  // storage
  storage() {
    if (!this._storage) {
      this._storage = new Storage(this);
    }
    return this._storage;
  }

  messaging() {
    if (!this._messaging) {
      this._messaging = new Messaging(this);
    }
    return this._messaging;
  }

  crash() {
    if (!this._crash) {
      this._crash = new Crash(this);
    }
    return this._crash;
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
   * Redux store
   **/
  get store(): ?Object {
    return this._store;
  }

  get constants(): Object {
    if (!this._constants) {
      this._constants = Object.assign({}, Storage.constants);
    }
    return this._constants;
  }

  /**
   * Set the redux store helper
   */
  setStore(store: Object) {
    if (store) {
      this.log.info('Setting the store for Firebase instance');
      this._store = store;
    }
  }

  /**
   * Global event handlers for the single Firebase instance
   */
  on(name: string, cb: Function, nativeModule: Object = FirebaseModuleEvt) {
    if (!this.eventHandlers[name]) {
      this.eventHandlers[name] = [];
    }

    const sub = nativeModule.addListener(name, cb);
    this.eventHandlers[name].push(sub);
    return sub;
  }

  off(name: string) {
    if (this.eventHandlers[name]) {
      this.eventHandlers[name]
        .forEach(subscription => subscription.remove());
    }
  }
}

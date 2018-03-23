import { NativeModules } from 'react-native';

import INTERNALS from './internals';
import { isObject, isAndroid } from './utils';

import AdMob, { statics as AdMobStatics } from './modules/admob';
import Auth, { statics as AuthStatics } from './modules/auth';
import Analytics from './modules/analytics';
import Crash from './modules/crash';
import Performance from './modules/perf';
import RemoteConfig from './modules/config';
import Storage, { statics as StorageStatics } from './modules/storage';
import Database, { statics as DatabaseStatics } from './modules/database';
import Messaging, { statics as MessagingStatics } from './modules/messaging';
import Firestore, { statics as FirestoreStatics } from './modules/firestore';
import Links, { statics as LinksStatics } from './modules/links';
import Utils, { statics as UtilsStatics } from './modules/utils';

const FirebaseCoreModule = NativeModules.RNFirebase;

export default class FirebaseApp {
  constructor(name: string, options: Object = {}) {
    this._name = name;
    this._namespaces = {};
    this._options = Object.assign({}, options);

    // native ios/android to confirm initialized
    this._initialized = false;
    this._nativeInitialized = false;

    // modules
    this.admob = this._staticsOrModuleInstance(AdMobStatics, AdMob);
    this.auth = this._staticsOrModuleInstance(AuthStatics, Auth);
    this.analytics = this._staticsOrModuleInstance({}, Analytics);
    this.config = this._staticsOrModuleInstance({}, RemoteConfig);
    this.crash = this._staticsOrModuleInstance({}, Crash);
    this.database = this._staticsOrModuleInstance(DatabaseStatics, Database);
    this.firestore = this._staticsOrModuleInstance(FirestoreStatics, Firestore);
    this.links = this._staticsOrModuleInstance(LinksStatics, Links);
    this.messaging = this._staticsOrModuleInstance(MessagingStatics, Messaging);
    this.perf = this._staticsOrModuleInstance({}, Performance);
    this.storage = this._staticsOrModuleInstance(StorageStatics, Storage);
    this.utils = this._staticsOrModuleInstance(UtilsStatics, Utils);
    this._extendedProps = {};
  }

  /**
   *
   * @param native
   * @private
   */
  _initializeApp(native = false) {
    if (native) {
      // for apps already initialized natively that
      // we have info from RN constants
      this._initialized = true;
      this._nativeInitialized = true;
    } else {
      FirebaseCoreModule.initializeApp(this._name, this._options, (error, result) => {
        this._initialized = true;
        INTERNALS.SharedEventEmitter.emit(`AppReady:${this._name}`, { error, result });
      });
    }
  }

  /**
   *
   * @return {*}
   */
  get name() {
    if (this._name === INTERNALS.STRINGS.DEFAULT_APP_NAME) {
      // ios and android firebase sdk's  return different
      // app names - so we just return what the web sdk
      // would if it was default.
      return '[DEFAULT]';
    }

    return this._name;
  }

  /**
   *
   * @return {*}
   */
  get options() {
    return Object.assign({}, this._options);
  }

  /**
   * Undocumented firebase web sdk method that allows adding additional properties onto
   * a firebase app instance.
   *
   * See: https://github.com/firebase/firebase-js-sdk/blob/master/tests/app/firebase_app.test.ts#L328
   *
   * @param props
   */
  extendApp(props: Object) {
    if (!isObject(props)) throw new Error(INTERNALS.ERROR_MISSING_ARG('Object', 'extendApp'));
    const keys = Object.keys(props);

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];

      if (!this._extendedProps[key] && Object.hasOwnProperty.call(this, key)) {
        throw new Error(INTERNALS.ERROR_PROTECTED_PROP(key));
      }

      this[key] = props[key];
      this._extendedProps[key] = true;
    }
  }

  /**
   *
   * @return {Promise}
   */
  delete() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_METHOD('app', 'delete'));
    // TODO only the ios sdk currently supports delete, add back in when android also supports it
    // if (this._name === INTERNALS.STRINGS.DEFAULT_APP_NAME && this._nativeInitialized) {
    //   return Promise.reject(
    //     new Error('Unable to delete the default native firebase app instance.'),
    //   );
    // }
    //
    // return FirebaseCoreModule.deleteApp(this._name);
  }


  /**
   *
   * @return {*}
   */
  onReady(): Promise {
    if (this._initialized) return Promise.resolve(this);

    return new Promise((resolve, reject) => {
      INTERNALS.SharedEventEmitter.once(`AppReady:${this._name}`, ({ error }) => {
        if (error) return reject(new Error(error)); // error is a string as it's from native
        return resolve(this); // return app
      });
    });
  }

  /**
   *
   * @param name
   * @param statics
   * @param InstanceClass
   * @return {function()}
   * @private
   */
  _staticsOrModuleInstance(statics = {}, InstanceClass): Function {
    const getInstance = () => {
      const _name = `_${InstanceClass._NAMESPACE}`;

      if (isAndroid && InstanceClass._NAMESPACE !== Utils._NAMESPACE && !INTERNALS.FLAGS.checkedPlayServices) {
        INTERNALS.FLAGS.checkedPlayServices = true;
        this.utils().checkPlayServicesAvailability();
      }

      if (!this._namespaces[_name]) {
        this._namespaces[_name] = new InstanceClass(this, this._options);
      }

      return this._namespaces[_name];
    };

    Object.assign(getInstance, statics, {
      nativeModuleExists: !!NativeModules[InstanceClass._NATIVE_MODULE],
    });

    return getInstance;
  }
}

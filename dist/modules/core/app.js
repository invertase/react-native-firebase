import { NativeModules } from 'react-native';
import APPS from '../../utils/apps';
import { SharedEventEmitter } from '../../utils/events';
import INTERNALS from '../../utils/internals';
import { isObject } from '../../utils';
import AdMob, { NAMESPACE as AdmobNamespace } from '../admob';
import Auth, { NAMESPACE as AuthNamespace } from '../auth';
import Analytics, { NAMESPACE as AnalyticsNamespace } from '../analytics';
import Config, { NAMESPACE as ConfigNamespace } from '../config';
import Crashlytics, { NAMESPACE as CrashlyticsNamespace } from '../crashlytics';
import Database, { NAMESPACE as DatabaseNamespace } from '../database';
import Firestore, { NAMESPACE as FirestoreNamespace } from '../firestore';
import Functions, { NAMESPACE as FunctionsNamespace } from '../functions';
import InstanceId, { NAMESPACE as InstanceIdNamespace } from '../iid';
import Links, { NAMESPACE as LinksNamespace } from '../links';
import Messaging, { NAMESPACE as MessagingNamespace } from '../messaging';
import Notifications, { NAMESPACE as NotificationsNamespace } from '../notifications';
import Performance, { NAMESPACE as PerfNamespace } from '../perf';
import Storage, { NAMESPACE as StorageNamespace } from '../storage';
import Utils, { NAMESPACE as UtilsNamespace } from '../utils';
const FirebaseCoreModule = NativeModules.RNFirebase;
export default class App {
  _initialized = false;
  _nativeInitialized = false;

  constructor(name, options, fromNative = false) {
    this._name = name;
    this._options = Object.assign({}, options);

    if (fromNative) {
      this._initialized = true;
      this._nativeInitialized = true;
    } else if (options.databaseURL && options.apiKey) {
      FirebaseCoreModule.initializeApp(this._name, this._options, (error, result) => {
        this._initialized = true;
        SharedEventEmitter.emit(`AppReady:${this._name}`, {
          error,
          result
        });
      });
    } // modules


    this.admob = APPS.appModule(this, AdmobNamespace, AdMob);
    this.analytics = APPS.appModule(this, AnalyticsNamespace, Analytics);
    this.auth = APPS.appModule(this, AuthNamespace, Auth);
    this.config = APPS.appModule(this, ConfigNamespace, Config);
    this.crashlytics = APPS.appModule(this, CrashlyticsNamespace, Crashlytics);
    this.database = APPS.appModule(this, DatabaseNamespace, Database);
    this.firestore = APPS.appModule(this, FirestoreNamespace, Firestore);
    this.functions = APPS.appModule(this, FunctionsNamespace, Functions);
    this.iid = APPS.appModule(this, InstanceIdNamespace, InstanceId);
    this.links = APPS.appModule(this, LinksNamespace, Links);
    this.messaging = APPS.appModule(this, MessagingNamespace, Messaging);
    this.notifications = APPS.appModule(this, NotificationsNamespace, Notifications);
    this.perf = APPS.appModule(this, PerfNamespace, Performance);
    this.storage = APPS.appModule(this, StorageNamespace, Storage);
    this.utils = APPS.appModule(this, UtilsNamespace, Utils);
    this._extendedProps = {};
  }
  /**
   *
   * @return {*}
   */


  get name() {
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


  extendApp(props) {
    if (!isObject(props)) {
      throw new Error(INTERNALS.STRINGS.ERROR_MISSING_ARG('Object', 'extendApp'));
    }

    const keys = Object.keys(props);

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];

      if (!this._extendedProps[key] && Object.hasOwnProperty.call(this, key)) {
        throw new Error(INTERNALS.STRINGS.ERROR_PROTECTED_PROP(key));
      } // $FlowExpectedError: Flow doesn't support indexable signatures on classes: https://github.com/facebook/flow/issues/1323


      this[key] = props[key];
      this._extendedProps[key] = true;
    }
  }
  /**
   *
   * @return {Promise}
   */


  delete() {
    if (this._name === APPS.DEFAULT_APP_NAME && this._nativeInitialized) {
      return Promise.reject(new Error('Unable to delete the default native firebase app instance.'));
    }

    return FirebaseCoreModule.deleteApp(this._name).then(() => APPS.deleteApp(this._name));
  }
  /**
   *
   * @return {*}
   */


  onReady() {
    if (this._initialized) return Promise.resolve(this);
    return new Promise((resolve, reject) => {
      SharedEventEmitter.once(`AppReady:${this._name}`, ({
        error
      }) => {
        if (error) return reject(new Error(error)); // error is a string as it's from native

        return resolve(this); // return app
      });
    });
  }
  /**
   * toString returns the name of the app.
   *
   * @return {string}
   */


  toString() {
    return this._name;
  }

}
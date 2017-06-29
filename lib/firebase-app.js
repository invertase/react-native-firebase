import { NativeModules } from 'react-native';

import INTERNALS from './internals';

// modules
import Crash from './modules/crash';
import Performance from './modules/perf';
import RemoteConfig from './modules/config';
import Analytics from './modules/analytics';
import Auth, { statics as AuthStatics } from './modules/auth';
import AdMob, { statics as AdMobStatics } from './modules/admob';
import Storage, { statics as StorageStatics } from './modules/storage';
import Database, { statics as DatabaseStatics } from './modules/database';
import Messaging, { statics as MessagingStatics } from './modules/messaging';


const FirebaseCoreModule = NativeModules.RNFirebase;


export default class FirebaseApp {
  constructor(name: string, options: Object = {}) {
    this._name = name;
    this._namespaces = {};
    this._options = Object.assign({}, options);

    // native ios/android to confirm initialized
    this._intialized = false;
  }

  _initializeApp() {
    FirebaseCoreModule.initializeApp(this._name, this._options, (error, result) => {
      // todo check error/result
      this._initialized = true;
    });
  }

  get name() {
    return this._name;
  }

  get options() {
    return Object.assign({}, this._options);
  }

  delete() {
    // todo
    return Promise.resolve();
  }


  /*
   *  MODULES
   */

  get auth() {
    return this._staticsOrModuleInstance('auth', AuthStatics, Auth);
  }

  get database() {
    return this._staticsOrModuleInstance('database', DatabaseStatics, Database);
  }

  get messaging() {
    return this._staticsOrModuleInstance('messaging', MessagingStatics, Messaging);
  }

  get storage() {
    return this._staticsOrModuleInstance('storage', StorageStatics, Storage);
  }


  /**
   *
   * @param name
   * @param statics
   * @param InstanceClass
   * @return {function()}
   * @private
   */
  _staticsOrModuleInstance(name, statics = {}, InstanceClass): Function {
    const getInstance = () => {
      const _name = `_${name}`;

      if (!this._namespaces[_name]) {
        this._namespaces[_name] = new InstanceClass(this);
      }

      return this._namespaces[_name];
    };

    Object.assign(getInstance, statics);
    return getInstance;
  }
}

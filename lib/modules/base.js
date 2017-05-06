/**
 * @flow
 */
import { NativeModules, NativeEventEmitter } from 'react-native';

import Log from '../utils/log';
import EventEmitter from './../utils/eventEmitter';

const FirebaseModule = NativeModules.RNFirebase;
const FirebaseModuleEvt = new NativeEventEmitter(FirebaseModule);

const logs = {};

type FirebaseOptions = {};

export class Base extends EventEmitter {
  constructor(firebase: Object, options: FirebaseOptions = {}) {
    super();
    this.firebase = firebase;
    this.eventHandlers = {};
    this.options = Object.assign({}, firebase.options, options);
  }

  /**
   * Return a namespaced instance of Log
   * @returns {*}
   */
  get log(): Log {
    if (logs[this.namespace]) return logs[this.namespace];
    return logs[this.namespace] = new Log(this.namespace, this.firebase._debug);
  }

  /**
   * app instance
   **/
  get app(): Object {
    return this.firebase.app;
  }


  /**
   * Add a native module event subscription
   * @param name
   * @param handler
   * @param nativeModule
   * @returns {*}
   * @private
   */
  _on(name, handler, nativeModule) {
    let _nativeModule = nativeModule;

    if (!_nativeModule) {
      _nativeModule = FirebaseModuleEvt;
    }

    return this.eventHandlers[name] = _nativeModule.addListener(name, handler);
  }

  /**
   * Remove a native module event subscription
   * @param name
   * @private
   */
  _off(name): void {
    const subscription = this.eventHandlers[name];
    if (!subscription) return;

    subscription.remove();
    delete this.eventHandlers[name];
  }
}

export class ReferenceBase extends Base {
  constructor(firebase: Object, path: string) {
    super(firebase);
    this.path = path || '/';
  }

  /**
   * The last part of a Reference's path (after the last '/')
   * The key of a root Reference is null.
   * @type {String}
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#key}
   */
  get key(): string|null {
    return this.path === '/' ? null : this.path.substring(this.path.lastIndexOf('/') + 1);
  }
}

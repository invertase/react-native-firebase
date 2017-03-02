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

// TODO cleanup
export class Base extends EventEmitter {
  constructor(firebase: Object, options: FirebaseOptions = {}) {
    super();
    this.firebase = firebase;
    this.eventHandlers = {};
    this.options = Object.assign({}, firebase.options, options);
  }

  // Logger
  get log(): Log {
    if (!logs[this.namespace]) logs[this.namespace] = new Log(this.namespace, this.firebase._debug);
    return logs[this.namespace];
  }

  /**
   * app instance
   **/
  get app(): Object {
    return this.firebase.app;
  }

  whenReady(promise: Promise<*>): Promise<*> {
    return this.firebase.configurePromise.then(() => promise);
  }

  // Event handlers
  // proxy to firebase instance
  _on(name, cb, nativeModule) {
    return new Promise((resolve) => {
      // if (!this.eventHandlers[name]) {
      //   this.eventHandlers[name] = {};
      // }
      if (!nativeModule) {
        nativeModule = FirebaseModuleEvt;
      }
      const sub = nativeModule.addListener(name, cb);
      this.eventHandlers[name] = sub;
      resolve(sub);
    });
  }

  _off(name) {
    return new Promise((resolve) => {
      if (this.eventHandlers[name]) {
        const subscription = this.eventHandlers[name];
        subscription.remove(); // Remove subscription
        delete this.eventHandlers[name];
        resolve(subscription);
      }
    });
  }
}

export class ReferenceBase extends Base {
  constructor(firebase: Object, path: string) {
    super(firebase);
    this.path = path || '/';
  }

  get key(): string|null {
    return this.path === '/' ? null : this.path.substring(this.path.lastIndexOf('/') + 1);
  }
}

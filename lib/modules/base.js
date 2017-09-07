/**
 * @flow
 */

import Log from '../utils/log';
import EventEmitter from './../utils/emitter/EventEmitter';

const logs = {};
const SharedEventEmitter = new EventEmitter();

export class Base {

  /**
   * Return a namespaced instance of Log
   * @returns {*}
   */
  get log(): Log {
    if (logs[this.namespace]) return logs[this.namespace];

    // todo grab log level from global config provider (still todo);
    return logs[this.namespace] = new Log(this.namespace, '*');
  }

  /*
   * Proxy functions to shared event emitter instance
   * https://github.com/facebook/react-native/blob/master/Libraries/EventEmitter/EventEmitter.js
   */

  get sharedEventEmitter () {
    return SharedEventEmitter;
  }

  get addListener() {
    return SharedEventEmitter.addListener.bind(SharedEventEmitter);
  }

  get on() {
    return SharedEventEmitter.addListener.bind(SharedEventEmitter);
  }

  get emit() {
    return SharedEventEmitter.emit.bind(SharedEventEmitter);
  }

  get listeners() {
    return SharedEventEmitter.listeners.bind(SharedEventEmitter);
  }

  hasListeners(eventType: string): Boolean {
    const subscriptions = SharedEventEmitter._subscriber.getSubscriptionsForType(eventType);
    return subscriptions && subscriptions.length;
  }

  get removeListener() {
    return SharedEventEmitter.removeListener.bind(SharedEventEmitter);
  }

  get removeAllListeners() {
    return SharedEventEmitter.removeAllListeners.bind(SharedEventEmitter);
  }
}

export class ReferenceBase extends Base {
  constructor(path: string) {
    super();
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

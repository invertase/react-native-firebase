/**
 * @flow
 */
import { NativeEventEmitter } from 'react-native';
import EventEmitter from './emitter/EventEmitter';
import { getRawNativeModule } from './native';

import type ModuleBase from './ModuleBase';

const NATIVE_MODULE_EVENTS = {
  Storage: [
    'storage_event',
    'storage_error',
  ],
  Auth: [
    'auth_state_changed',
    'phone_auth_state_changed',
  ],
  Database: [
    'database_transaction_event',
    // 'database_server_offset', // TODO
  ],
  Firestore: [
    'firestore_collection_sync_event',
    'firestore_document_sync_event',
  ],
};
const NATIVE_EMITTERS: { [string]: NativeEventEmitter } = {};
const NATIVE_SUBSCRIPTIONS: { [string]: boolean } = {};

export const SharedEventEmitter = new EventEmitter();

export const getAppEventName = (module: ModuleBase, eventName: string): string => {
  return `${module._firebaseApp._name}-${eventName}`;
};

const getNativeEmitter = (module: ModuleBase): NativeEventEmitter => {
  const name = `${module._appName}-${module._module}`;
  const nativeModule = getRawNativeModule(module);
  if (!NATIVE_EMITTERS[name]) {
    NATIVE_EMITTERS[name] = new NativeEventEmitter(nativeModule);
  }
  return NATIVE_EMITTERS[name];
};

/**
 * Subscribe to a native event for js side distribution by appName
 *    React Native events are hard set at compile - cant do dynamic event names
 *    so we use a single event send it to js and js then internally can prefix it
 *    and distribute dynamically.
 *
 * @param module
 * @param eventName
 * @private
 */
const subscribeToNativeModuleEvents = (module: ModuleBase, eventName: string): void => {
  if (!NATIVE_SUBSCRIPTIONS[eventName]) {
    const nativeEmitter = getNativeEmitter(module);
    nativeEmitter.addListener(eventName, (event) => {
      if (event.appName) {
        // native event has an appName property - auto prefix and internally emit
        SharedEventEmitter.emit(`${event.appName}-${eventName}`, event);
      } else {
        // standard event - no need to prefix
        SharedEventEmitter.emit(eventName, event);
      }
    });

    NATIVE_SUBSCRIPTIONS[eventName] = true;
  }
};

export const initialiseNativeModuleEventEmitter = (module: ModuleBase): void => {
  const events = NATIVE_MODULE_EVENTS[module._module];

  if (events && events.length) {
    for (let i = 0, len = events.length; i < len; i++) {
      subscribeToNativeModuleEvents(module, events[i]);
    }
  }
};

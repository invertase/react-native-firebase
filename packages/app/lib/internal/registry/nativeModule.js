/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { NativeModules } from 'react-native';

import NativeFirebaseError from '../NativeFirebaseError';
import RNFBNativeEventEmitter from '../RNFBNativeEventEmitter';
import SharedEventEmitter from '../SharedEventEmitter';

const NATIVE_MODULE_REGISTRY = {};
const NATIVE_MODULE_EVENT_SUBSCRIPTIONS = {};

function nativeModuleKey(module) {
  return `${module._customUrlOrRegion || module.app.name}:${module.namespace}`;
}

/**
 * Wraps a native module method to provide
 * auto prepended args and custom Error classes.
 *
 * @param namespace
 * @param method
 * @param argToPrepend
 * @returns {Function}
 */
function nativeModuleMethodWrapped(namespace, method, argToPrepend) {
  return (...args) => {
    const possiblePromise = method(...[...argToPrepend, ...args]);

    if (possiblePromise && possiblePromise.then) {
      const jsStack = new Error().stack;
      return possiblePromise.catch(nativeError =>
        Promise.reject(new NativeFirebaseError(nativeError, jsStack, namespace)),
      );
    }

    return possiblePromise;
  };
}

/**
 * Prepends all arguments in prependArgs to all native method calls
 *
 * @param namespace
 * @param NativeModule
 * @param argToPrepend
 */
function nativeModuleWrapped(namespace, NativeModule, argToPrepend) {
  const native = {};
  const properties = Object.keys(NativeModule);

  for (let i = 0, len = properties.length; i < len; i++) {
    const property = properties[i];
    if (typeof NativeModule[property] === 'function') {
      native[property] = nativeModuleMethodWrapped(namespace, NativeModule[property], argToPrepend);
    } else {
      native[property] = NativeModule[property];
    }
  }

  return native;
}

function initialiseNativeModule(module) {
  const config = module._config;
  const key = nativeModuleKey(module);
  const customUrlOrRegion = module._customUrlOrRegion;
  const {
    namespace,
    nativeEvents,
    nativeModuleName,
    hasRegionsSupport,
    hasMultiAppSupport,
    hasCustomUrlSupport,
  } = config;
  const nativeModule = NativeModules[nativeModuleName];

  if (!nativeModule) {
    throw new Error(INTERNALS.STRINGS.ERROR_MISSING_MODULE(namespace, nativeModuleName));
  }

  const argToPrepend = [];

  if (hasMultiAppSupport) {
    argToPrepend.push(module.app.name);
  }

  if (hasCustomUrlSupport || hasRegionsSupport) {
    argToPrepend.push(customUrlOrRegion);
  }

  NATIVE_MODULE_REGISTRY[key] = nativeModuleWrapped(namespace, nativeModule, argToPrepend);

  if (nativeEvents && nativeEvents.length) {
    for (let i = 0, len = nativeEvents.length; i < len; i++) {
      subscribeToNativeModuleEvent(nativeEvents[i]);
    }
  }

  return NATIVE_MODULE_REGISTRY[key];
}

/**
 * Subscribe to a native event for js side distribution by appName
 *    React Native events are hard set at compile - cant do dynamic event names
 *    so we use a single event send it to js and js then internally can prefix it
 *    and distribute dynamically.
 *
 * @param eventName
 * @private
 */
function subscribeToNativeModuleEvent(eventName) {
  if (!NATIVE_MODULE_EVENT_SUBSCRIPTIONS[eventName]) {
    RNFBNativeEventEmitter.addListener(eventName, event => {
      if (event.appName) {
        // native event has an appName property - auto prefix and internally emit
        SharedEventEmitter.emit(`${event.appName}-${eventName}`, event);
      } else {
        // standard event - no need to prefix
        SharedEventEmitter.emit(eventName, event);
      }
    });

    NATIVE_MODULE_EVENT_SUBSCRIPTIONS[eventName] = true;
  }
}

export function getNativeModule(module) {
  const key = nativeModuleKey(module);

  if (NATIVE_MODULE_REGISTRY[key]) {
    return NATIVE_MODULE_REGISTRY[key];
  }

  return initialiseNativeModule(module);
}

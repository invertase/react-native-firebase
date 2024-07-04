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

import { APP_NATIVE_MODULE } from '../constants';
import NativeFirebaseError from '../NativeFirebaseError';
import RNFBNativeEventEmitter from '../RNFBNativeEventEmitter';
import SharedEventEmitter from '../SharedEventEmitter';
import { getReactNativeModule } from '../nativeModule';
import { isAndroid, isIOS } from '../../common';

const NATIVE_MODULE_REGISTRY = {};
const NATIVE_MODULE_EVENT_SUBSCRIPTIONS = {};

function nativeModuleKey(module) {
  return `${module._customUrlOrRegion || ''}:${module.app.name}:${module._config.namespace}`;
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
  if (!NativeModule) {
    return NativeModule;
  }

  let properties = Object.keys(Object.getPrototypeOf(NativeModule));
  if (!properties.length) properties = Object.keys(NativeModule);

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

/**
 * Initialises and wraps all the native module methods.
 *
 * @param module
 * @returns {*}
 */
function initialiseNativeModule(module) {
  const config = module._config;
  const key = nativeModuleKey(module);
  const {
    namespace,
    nativeEvents,
    nativeModuleName,
    hasMultiAppSupport,
    hasCustomUrlOrRegionSupport,
    disablePrependCustomUrlOrRegion,
  } = config;
  const multiModuleRoot = {};
  const multiModule = Array.isArray(nativeModuleName);
  const nativeModuleNames = multiModule ? nativeModuleName : [nativeModuleName];

  for (let i = 0; i < nativeModuleNames.length; i++) {
    const nativeModule = getReactNativeModule(nativeModuleNames[i]);

    // only error if there's a single native module
    // as multi modules can mean some are optional
    if (!multiModule && !nativeModule) {
      throw new Error(getMissingModuleHelpText(namespace));
    }

    if (multiModule) {
      multiModuleRoot[nativeModuleNames[i]] = !!nativeModule;
    }

    const argToPrepend = [];

    if (hasMultiAppSupport) {
      argToPrepend.push(module.app.name);
    }

    if (hasCustomUrlOrRegionSupport && !disablePrependCustomUrlOrRegion) {
      argToPrepend.push(module._customUrlOrRegion);
    }

    Object.assign(multiModuleRoot, nativeModuleWrapped(namespace, nativeModule, argToPrepend));
  }

  if (nativeEvents && nativeEvents.length) {
    for (let i = 0, len = nativeEvents.length; i < len; i++) {
      subscribeToNativeModuleEvent(nativeEvents[i]);
    }
  }

  Object.freeze(multiModuleRoot);

  NATIVE_MODULE_REGISTRY[key] = multiModuleRoot;

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

/**
 * Help text for integrating the native counter parts for each firebase module.
 *
 * @param namespace
 * @returns {string}
 */
function getMissingModuleHelpText(namespace) {
  const snippet = `firebase.${namespace}()`;

  if (isIOS || isAndroid) {
    return (
      `You attempted to use a Firebase module that's not installed natively on your project by calling ${snippet}.` +
      `\r\n\r\nEnsure you have installed the npm package '@react-native-firebase/${namespace}',` +
      ' have imported it in your project, and have rebuilt your native application.'
    );
  }

  return (
    `You attempted to use a Firebase module that's not installed on your project by calling ${snippet}.` +
    `\r\n\r\nEnsure you have installed the npm package '@react-native-firebase/${namespace}' and` +
    ' have imported it in your project.'
  );
}

/**
 * Gets a wrapped native module instance for the provided firebase module.
 * Will attempt to create a new instance if non previously created.
 *
 * @param module
 * @returns {*}
 */
export function getNativeModule(module) {
  const key = nativeModuleKey(module);

  if (NATIVE_MODULE_REGISTRY[key]) {
    return NATIVE_MODULE_REGISTRY[key];
  }

  return initialiseNativeModule(module);
}

/**
 * Custom wrapped app module as it does not have it's own FirebaseModule based class.
 *
 * @returns {*}
 */
export function getAppModule() {
  if (NATIVE_MODULE_REGISTRY[APP_NATIVE_MODULE]) {
    return NATIVE_MODULE_REGISTRY[APP_NATIVE_MODULE];
  }

  const namespace = 'app';
  const nativeModule = getReactNativeModule(APP_NATIVE_MODULE);

  if (!nativeModule) {
    throw new Error(getMissingModuleHelpText(namespace));
  }

  NATIVE_MODULE_REGISTRY[APP_NATIVE_MODULE] = nativeModuleWrapped(namespace, nativeModule, []);

  return NATIVE_MODULE_REGISTRY[APP_NATIVE_MODULE];
}

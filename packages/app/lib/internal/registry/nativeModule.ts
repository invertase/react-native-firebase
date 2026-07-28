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
import { APP_NATIVE_MODULE, UTILS_NATIVE_MODULE } from '../constants';
import NativeFirebaseError from '../NativeFirebaseError';
import type { NativeError } from '../../types/internal';
import RNFBNativeEventEmitter from '../RNFBNativeEventEmitter';
import SharedEventEmitter from '../SharedEventEmitter';
import { getReactNativeModule } from '../nativeModule';
import { isAndroid, isIOS } from '../../common';
import FirebaseModule from '../FirebaseModule';
import type { WrappedNativeModule, RNFBAppModuleInterface } from '../NativeModules';
import { encodeNullValues } from '../nullSerialization';

interface NativeEvent {
  appName?: string;
  databaseId?: string;
  [key: string]: unknown;
}

interface RouteEntry {
  host: Record<string, unknown>;
  key: string;
  argToPrepend: unknown[];
}

const NATIVE_MODULE_REGISTRY: Record<string, WrappedNativeModule> = {};
const NATIVE_MODULE_EVENT_SUBSCRIPTIONS: Record<string, boolean> = {};
let staticUtilsModule: WrappedNativeModule | null = null;

function nativeModuleKey(module: FirebaseModule): string {
  return `${module._customUrlOrRegion || ''}:${module.app.name}:${module._config.namespace}`;
}

/**
 * Wraps a native module method to provide
 * auto prepended args and custom Error classes.
 */
function nativeModuleMethodWrapped(
  namespace: string,
  method: (...args: unknown[]) => unknown,
  argToPrepend: unknown[],
  isTurboModule: boolean,
): (...args: unknown[]) => unknown {
  return (...args: unknown[]) => {
    // Per-call encodeNullValues walk is intentional: args may differ on every invocation.
    const processedArgs = isIOS && isTurboModule ? args.map(arg => encodeNullValues(arg)) : args;
    const allArgs = [...argToPrepend, ...processedArgs];
    const possiblePromise = method(...allArgs);

    if (possiblePromise && typeof possiblePromise === 'object' && 'then' in possiblePromise) {
      const jsStack = new Error().stack;
      return (possiblePromise as Promise<unknown>).catch((nativeError: NativeError) =>
        Promise.reject(new NativeFirebaseError(nativeError, jsStack as string, namespace)),
      );
    }

    return possiblePromise;
  };
}

/**
 * NewArch-AD-14 / NewArch-AD-14a: routing composite Proxy — lazy wrap+bind on first access per method.
 */
function createRoutingCompositeProxy(
  namespace: string,
  hosts: Array<{ module: Record<string, unknown> | undefined; argToPrepend: unknown[] }>,
  isTurboModule: boolean,
): WrappedNativeModule {
  const routingMap: Record<string, RouteEntry> = {};
  const memoizedMethods: Record<string, (...args: unknown[]) => unknown> = {};
  const memoizedConstants: Record<string, unknown> = {};

  for (const { module, argToPrepend } of hosts) {
    if (!module) {
      continue;
    }
    for (const key in module) {
      if (key === 'constructor' || key === 'getConstants') {
        continue;
      }
      routingMap[key] = { host: module, key, argToPrepend };
    }
  }

  const target = Object.create(null) as WrappedNativeModule;

  return new Proxy(target, {
    get(_target, name: string | symbol) {
      if (typeof name !== 'string' || !(name in routingMap)) {
        return undefined;
      }

      const route = routingMap[name];
      if (!route) {
        return undefined;
      }

      const value = route.host[route.key];

      if (typeof value !== 'function') {
        if (!(name in memoizedConstants)) {
          memoizedConstants[name] = value;
        }
        return memoizedConstants[name];
      }

      if (!memoizedMethods[name]) {
        memoizedMethods[name] = nativeModuleMethodWrapped(
          namespace,
          (value as (...args: unknown[]) => unknown).bind(route.host),
          route.argToPrepend,
          isTurboModule,
        ) as (...args: unknown[]) => unknown;
      }

      return memoizedMethods[name];
    },
    has(_target, name) {
      return typeof name === 'string' && name in routingMap;
    },
    ownKeys() {
      return Object.keys(routingMap);
    },
    getOwnPropertyDescriptor(_target, name) {
      if (typeof name !== 'string' || !(name in routingMap)) {
        return undefined;
      }
      return {
        enumerable: true,
        configurable: true,
      };
    },
    set() {
      return false;
    },
  });
}

/**
 * NewArch-AD-14a N=1: single-host routing composite (TurboModule by default).
 */
function createSingleHostComposite(
  namespace: string,
  moduleName: string,
  argToPrepend: unknown[] = [],
  isTurboModule = true,
): WrappedNativeModule {
  const nativeModule = getReactNativeModule(moduleName);

  if (!nativeModule) {
    throw new Error(getMissingModuleHelpText(namespace));
  }

  return createRoutingCompositeProxy(
    namespace,
    [{ module: nativeModule, argToPrepend }],
    isTurboModule,
  );
}

/**
 * Initialises and wraps all the native module methods.
 */
function initialiseNativeModule(module: FirebaseModule): WrappedNativeModule {
  const config = module._config;
  const key = nativeModuleKey(module);
  const {
    namespace,
    nativeEvents,
    nativeModuleName,
    hasMultiAppSupport,
    hasCustomUrlOrRegionSupport,
    disablePrependCustomUrlOrRegion,
    turboModule,
  } = config;
  const isTurboModule = !!turboModule;
  const multiModule = Array.isArray(nativeModuleName);
  const nativeModuleNames = multiModule ? nativeModuleName : [nativeModuleName];

  const argToPrepend: Array<string> = [];

  if (hasMultiAppSupport) {
    argToPrepend.push(module.app.name);
  }

  if (hasCustomUrlOrRegionSupport && !disablePrependCustomUrlOrRegion) {
    argToPrepend.push(module._customUrlOrRegion as string);
  }

  let composite: WrappedNativeModule;

  if (!multiModule) {
    const moduleName = nativeModuleNames[0];
    if (!moduleName) {
      throw new Error(getMissingModuleHelpText(namespace));
    }

    composite = createSingleHostComposite(namespace, moduleName, argToPrepend, isTurboModule);
  } else {
    const hosts: Array<{ module: Record<string, unknown> | undefined; argToPrepend: unknown[] }> =
      [];

    for (let i = 0; i < nativeModuleNames.length; i++) {
      const moduleName = nativeModuleNames[i];
      if (!moduleName) continue;

      const nativeModule = getReactNativeModule(moduleName);

      if (nativeModule) {
        hosts.push({ module: nativeModule, argToPrepend });
      }
    }

    composite = createRoutingCompositeProxy(namespace, hosts, isTurboModule);
  }

  if (nativeEvents && Array.isArray(nativeEvents) && nativeEvents.length) {
    for (let i = 0, len = nativeEvents.length; i < len; i++) {
      const eventName = nativeEvents[i];
      if (eventName) {
        subscribeToNativeModuleEvent(eventName);
      }
    }
  }

  NATIVE_MODULE_REGISTRY[key] = composite;

  return NATIVE_MODULE_REGISTRY[key];
}

function subscribeToNativeModuleEvent(eventName: string): void {
  if (!NATIVE_MODULE_EVENT_SUBSCRIPTIONS[eventName]) {
    RNFBNativeEventEmitter.addListener(eventName, (...args: unknown[]) => {
      const event = args[0] as NativeEvent;
      if (event.appName && event.databaseId) {
        SharedEventEmitter.emit(`${event.appName}-${event.databaseId}-${eventName}`, event);
      } else if (event.appName) {
        SharedEventEmitter.emit(`${event.appName}-${eventName}`, event);
      } else {
        SharedEventEmitter.emit(eventName, event);
      }
    });

    NATIVE_MODULE_EVENT_SUBSCRIPTIONS[eventName] = true;
  }
}

function getMissingModuleHelpText(namespace: string): string {
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

export function getNativeModule(module: FirebaseModule): WrappedNativeModule {
  const key = nativeModuleKey(module);

  if (NATIVE_MODULE_REGISTRY[key]) {
    return NATIVE_MODULE_REGISTRY[key];
  }

  return initialiseNativeModule(module);
}

export function getAppModule(): RNFBAppModuleInterface {
  if (NATIVE_MODULE_REGISTRY[APP_NATIVE_MODULE]) {
    return NATIVE_MODULE_REGISTRY[APP_NATIVE_MODULE] as unknown as RNFBAppModuleInterface;
  }

  NATIVE_MODULE_REGISTRY[APP_NATIVE_MODULE] = createSingleHostComposite('app', APP_NATIVE_MODULE);

  return NATIVE_MODULE_REGISTRY[APP_NATIVE_MODULE] as unknown as RNFBAppModuleInterface;
}

/**
 * Memoized wrapped utils surface for static path-constant reads (NewArch-AD-18 E5).
 */
export function getStaticUtilsModule(): WrappedNativeModule {
  if (staticUtilsModule) {
    return staticUtilsModule;
  }

  staticUtilsModule = createSingleHostComposite('utils', UTILS_NATIVE_MODULE);

  return staticUtilsModule;
}

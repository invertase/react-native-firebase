import { NativeModules } from 'react-native';
import { FirebaseError, isAndroid, isFunction, isIOS, isPromise } from './common';
import RNFBNativeEventEmitter from './RNFBNativeEventEmitter';
import SharedEventEmitter from './SharedEventEmitter';

export type NativeNamespace = 'app' | 'utils' | 'storage';

/**
 * Options used to create a bridge to the native module.
 */
export interface NativeModuleOptions {
  /**
   * The namespace of the module, e.g. `firestore`.
   *
   * This is used to automatically prefix error messages with a code.
   */
  namespace: NativeNamespace;
  /**
   * The name of the registered native module, e.g. `RNFBAppModule`.
   */
  nativeModule: string;
  /**
   * Additional configuration options.
   */
  config?: NativeModuleConfig;
}

export type NativeModuleConfig = {
  // hasMultiAppSupport: boolean; // TODO Not used yet
  hasCustomUrlOrRegionSupport?: boolean; // TODO Not used yet
  events?: ReadonlyArray<string>;
};

/**
 * The interface describing what a Native Module contains.
 */
export interface NativeModule<T = unknown> {
  /**
   * A singleton event emitter.
   *
   * When creating a native module, ensure the `events` key is populated
   * with event names to be able to listen to those events via this emitter.
   */
  readonly emitter: typeof SharedEventEmitter;
  /**
   * The Native Module.
   */
  readonly module: T;
}

// Cache of native modules.
const MODULE_CACHE: {
  [key in NativeNamespace]?: {
    [nativeModule: string]: NativeModule;
  };
} = {};

// Store holding reference to whether an event subscription has been created.
const EVENT_SUBSCRIPTION_CACHE: { [key: string]: true } = {};

export function getNativeModule<T = unknown>(options: NativeModuleOptions): NativeModule<T> {
  const { namespace, nativeModule, config } = options;

  // Return a cached module if it exists.
  if (MODULE_CACHE?.[namespace]?.[nativeModule]) {
    return MODULE_CACHE[namespace]?.[nativeModule] as NativeModule<T>;
  }

  const module = NativeModules[nativeModule];

  if (!module) {
    if (isIOS) {
      throw new Error(
        `You attempted to use the Firebase module "${namespace}" which is not installed natively on your iOS project.` +
          '\r\n\r\nEnsure you have either linked the module or added it to your projects Podfile.' +
          '\r\n\r\nSee http://invertase.link/ios for full setup instructions.',
      );
    }

    const moduleName = namespace.charAt(0).toUpperCase() + namespace.slice(1);
    const rnFirebasePackage = `'io.invertase.firebase.${namespace}.ReactNativeFirebase${moduleName}Package'`;
    const newInstance = `'new ReactNativeFirebase${moduleName}Package()'`;

    if (isAndroid) {
      throw new Error(
        `You attempted to use a Firebase module "${namespace}" which is not installed on your Android project.` +
          `\r\n\r\nEnsure you have:\r\n\r\n1) imported the ${rnFirebasePackage} module in your 'MainApplication.java' file.\r\n\r\n2) Added the ` +
          `${newInstance} line inside of the RN 'getPackages()' method list.` +
          '\r\n\r\nSee http://invertase.link/android for full setup instructions.',
      );
    }

    throw new Error(
      `Something went wrong loading the native module for the Firebase module "${namespace}".`,
    );
  }

  // Subscribe to any requested events.
  if (config?.events?.length) {
    for (const event of config.events) {
      _subscribeToNativeEvent(event);
    }
  }

  const _module = {
    emitter: SharedEventEmitter,
    module: new Proxy<any>(module as T, {
      get(target, prop) {
        const maybeFunction = target[prop];

        if (!isFunction(maybeFunction)) {
          return maybeFunction;
        }

        return (...args: any[]) => {
          const result = maybeFunction(args);

          if (isPromise(result)) {
            return result.catch((error: Error) => {
              // TODO convert native error to FirebaseError
              return Promise.reject(new FirebaseError(error, options.namespace, 'todo'));
            });
          }

          return result;
        };
      },
    }),
  };

  // Cache the module.
  if (!MODULE_CACHE[namespace]) MODULE_CACHE[namespace] = {};
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  MODULE_CACHE[namespace]![nativeModule] = _module;

  return _module;
}

/**
 * Creates a native subscription for a given event name.
 *
 * When an event is received from the native event emitter, it is forwarded onto
 * the JavaScript shared event emitter.
 *
 * @param type
 * @returns
 */
function _subscribeToNativeEvent(type: string) {
  if (EVENT_SUBSCRIPTION_CACHE[type]) {
    return;
  }

  RNFBNativeEventEmitter.addListener(type, event => {
    if (event.appName) {
      SharedEventEmitter.emit(`${event.appName}-${event.eventName}`, event);
    } else {
      SharedEventEmitter.emit(event.eventName, event);
    }
  });

  EVENT_SUBSCRIPTION_CACHE[type] = true;
}

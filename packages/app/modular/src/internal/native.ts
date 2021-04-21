import { NativeModules } from 'react-native';
import { FirebaseError, isFunction, isPromise } from '../common';

export type NativeNamespace = 'app' | 'utils';

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
  config: NativeModuleConfig;
}

export type NativeModuleConfig = {
  // hasMultiAppSupport: boolean;
  hasCustomUrlOrRegionSupport: boolean;
  events?: ReadonlyArray<string>;
};

export interface NativeModule<T = unknown> {
  readonly emitter: any;
  readonly module: T;
}

const MODULE_CACHE: {
  [key in NativeNamespace]?: {
    [nativeModule: string]: NativeModule;
  };
} = {};

export function getNativeModule<T = unknown>(options: NativeModuleOptions): NativeModule<T> {
  const { namespace, nativeModule, config } = options;

  if (MODULE_CACHE?.[namespace]?.[nativeModule]) {
    return MODULE_CACHE[namespace]?.[nativeModule] as NativeModule<T>;
  }

  const module = NativeModules[nativeModule];

  if (!module) {
    // TODO
    throw new Error(`You have attempted to use a module which isn't installed... TODO`);
  }

  if (config.events?.length) {
    // TODO subscribe to events
  }

  return {
    emitter: () => {},
    module: new Proxy<any>(module as T, {
      get(target, prop, ...args) {
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
}

import { NativeModules } from 'react-native';

export type NativeNamespace = 'app' | 'firestore';

export interface NativeModuleOptions {
  namespace: NativeNamespace;
  nativeModule: string; // e.g. RNFBAppModule
  config: NativeModuleConfig;
}

export type NativeModuleConfig = {
  hasMultiAppSupport: boolean;
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
    module: module as T,
  };
}

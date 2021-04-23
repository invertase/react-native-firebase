import type { EventEmitter } from 'react-native';

/**
 * Supported native module namespaces.
 */
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
  // hasCustomUrlOrRegionSupport?: boolean; TODO Not used yet
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
  readonly emitter: EventEmitter;
  /**
   * The Native Module.
   */
  readonly module: T;
}

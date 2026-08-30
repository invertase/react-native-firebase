import RNFBAppModule from './web/RNFBAppModule';
import { APP_NATIVE_MODULE } from './constants';
import { createNativeModuleDebugProxy } from './nativeModuleDebug';

// Register before exporting getters — RNFBNativeEventEmitter instantiates during circular imports.
const nativeModuleRegistry: Record<string, Record<string, unknown>> = {
  RNFBAppModule: RNFBAppModule as unknown as Record<string, unknown>,
  [APP_NATIVE_MODULE]: RNFBAppModule as unknown as Record<string, unknown>,
};
const memoizedDebugProxies = new Map<string, Record<string, unknown>>();

export function getReactNativeModule(moduleName: string): Record<string, unknown> | undefined {
  const nativeModule = nativeModuleRegistry[moduleName];
  // Throw an error if the module is not registered.
  if (!nativeModule) {
    throw new Error(`Native module ${moduleName} is not registered.`);
  }
  if (!globalThis.RNFBDebug) {
    return nativeModule;
  }

  let debugProxy = memoizedDebugProxies.get(moduleName);
  if (!debugProxy) {
    debugProxy = createNativeModuleDebugProxy(moduleName, nativeModule);
    memoizedDebugProxies.set(moduleName, debugProxy);
  }
  return debugProxy;
}

export function setReactNativeModule(
  moduleName: string,
  nativeModule: Record<string, unknown>,
): void {
  nativeModuleRegistry[moduleName] = nativeModule;
  memoizedDebugProxies.delete(moduleName);
}

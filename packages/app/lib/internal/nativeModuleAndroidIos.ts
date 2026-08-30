import { TurboModuleRegistry } from 'react-native';
import { createNativeModuleDebugProxy } from './nativeModuleDebug';

const DYNAMIC_CONSTANT_KEYS = new Set(['androidPlayServices']);

const memoizedModuleConstants = new Map<string, Record<string, unknown>>();
const memoizedDebugProxies = new Map<string, Record<string, unknown>>();

function withTurboConstants(
  moduleName: string,
  module: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!module) {
    return module;
  }

  const getConstants = module.getConstants;
  if (typeof getConstants !== 'function') {
    return module;
  }

  let constants = memoizedModuleConstants.get(moduleName);
  if (!constants) {
    constants = (getConstants as () => Record<string, unknown>).call(module) || {};
    memoizedModuleConstants.set(moduleName, constants);
  }

  const descriptors: PropertyDescriptorMap = {};
  for (const key of Object.keys(constants)) {
    if (DYNAMIC_CONSTANT_KEYS.has(key)) {
      continue;
    }
    descriptors[key] = {
      value: constants[key],
      enumerable: true,
      writable: true,
      configurable: true,
    };
  }

  return Object.create(module, descriptors);
}

/**
 * Unified native module resolver — TurboModule only (NewArch-AD-6 Phase R).
 */
export function getReactNativeModule(moduleName: string): Record<string, unknown> {
  const turboModule = TurboModuleRegistry.get(moduleName);
  if (!turboModule) {
    throw new Error(`Native module ${moduleName} is not registered.`);
  }

  const nativeModule = withTurboConstants(
    moduleName,
    turboModule as Record<string, unknown>,
  ) as Record<string, unknown>;

  if (!globalThis.RNFBDebug) {
    return nativeModule;
  }

  let debugProxy = memoizedDebugProxies.get(moduleName);
  if (debugProxy) {
    return debugProxy;
  }

  debugProxy = createNativeModuleDebugProxy(moduleName, nativeModule);
  memoizedDebugProxies.set(moduleName, debugProxy);
  return debugProxy;
}

export function setReactNativeModule(): void {
  // No-op
}

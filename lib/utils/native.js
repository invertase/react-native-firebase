/*
 * @flow
 */
import { NativeModules } from 'react-native';
import INTERNALS from './internals';

import type ModuleBase from './ModuleBase';

// Firebase Native SDKs that support multiple app instances
const MULTI_APP_MODULES = [
  'auth',
  'database',
  'firestore',
  'storage',
];

const NATIVE_MODULES: { [ModuleBase]: Object } = {};
const RAW_NATIVE_MODULES: { [ModuleBase]: Object } = {};

/**
 * Prepends appName arg to all native method calls
 * @param appName
 * @param NativeModule
 */
const nativeWithApp = (appName: string, NativeModule: Object): Object => {
  const native = {};
  const methods = Object.keys(NativeModule);

  for (let i = 0, len = methods.length; i < len; i++) {
    const method = methods[i];
    native[method] = (...args) => {
      return NativeModule[method](...[appName, ...args]);
    };
  }

  return native;
};

export const getNativeModule = (module: ModuleBase): Object => {
  return NATIVE_MODULES[module];
};

export const getRawNativeModule = (module: ModuleBase): Object => {
  return RAW_NATIVE_MODULES[module];
};

export const initialiseNativeModule = (module: ModuleBase): void => {
  const nativeModule = NativeModules[module.constructor._NATIVE_MODULE];

  if (!nativeModule && !module.constructor._NATIVE_DISABLED) {
    throw new Error(INTERNALS.STRINGS.ERROR_MISSING_MODULE(module.constructor._NAMESPACE, module.constructor._NATIVE_MODULE));
  }

  // used by the modules that extend ModuleBase
  // to access their native module counterpart
  RAW_NATIVE_MODULES[module] = nativeModule;
  if (!MULTI_APP_MODULES.includes(module._module.toLowerCase())) {
    NATIVE_MODULES[module] = nativeModule;
  } else {
    NATIVE_MODULES[module] = nativeWithApp(module._appName, nativeModule);
  }
};

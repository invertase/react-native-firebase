/*
 * @flow
 */
import { NativeModules } from 'react-native';
import { initialiseNativeModuleEventEmitter } from './events';
import INTERNALS from './internals';

import type ModuleBase from './ModuleBase';
import type { FirebaseModuleConfig } from '../types';

// Firebase Native SDKs that support multiple app instances
const MULTI_APP_MODULES = [
  'RNFirebaseAuth',
  'RNFirebaseDatabase',
  'RNFirebaseFirestore',
  'RNFirebaseStorage',
];

const NATIVE_MODULES: { [ModuleBase]: Object } = {};

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

export const initialiseNativeModule = (module: ModuleBase, config: FirebaseModuleConfig): Object => {
  const { moduleName, namespace } = config;
  const nativeModule = NativeModules[moduleName];

  if (!nativeModule && namespace !== 'utils') {
    throw new Error(INTERNALS.STRINGS.ERROR_MISSING_MODULE(namespace, moduleName));
  }

  // used by the modules that extend ModuleBase
  // to access their native module counterpart
  if (!MULTI_APP_MODULES.includes(moduleName)) {
    NATIVE_MODULES[module] = nativeModule;
  } else {
    NATIVE_MODULES[module] = nativeWithApp(module.app.name, nativeModule);
  }

  initialiseNativeModuleEventEmitter(module, config);

  return NATIVE_MODULES[module];
};

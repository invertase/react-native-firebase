/* eslint-disable no-console */
import { NativeModules } from 'react-native';

/**
 * This is used by Android and iOS to get a native module.
 * We additionally add a Proxy to the module to intercept calls
 * and log them to the console for debugging purposes, if enabled.
 * @param moduleName
 */
export function getReactNativeModule(moduleName) {
  const nativeModule = NativeModules[moduleName];
  if (!globalThis.RNFBDebug) {
    return nativeModule;
  }
  return new Proxy(nativeModule, {
    ownKeys(target) {
      return Object.keys(target);
    },
    get: (_, name) => {
      if (typeof nativeModule[name] !== 'function') return nativeModule[name];
      return (...args) => {
        console.debug(`[RNFB->Native][🔵] ${moduleName}.${name} -> ${JSON.stringify(args)}`);
        const result = nativeModule[name](...args);
        if (result && result.then) {
          return result.then(
            res => {
              console.debug(`[RNFB<-Native][🟢] ${moduleName}.${name} <- ${JSON.stringify(res)}`);
              return res;
            },
            err => {
              console.debug(`[RNFB<-Native][🔴] ${moduleName}.${name} <- ${JSON.stringify(err)}`);
              throw err;
            },
          );
        }
        console.debug(`[RNFB<-Native][🟢] ${moduleName}.${name} <- ${JSON.stringify(result)}`);
        return result;
      };
    },
  });
}

export function setReactNativeModule() {
  // No-op
}

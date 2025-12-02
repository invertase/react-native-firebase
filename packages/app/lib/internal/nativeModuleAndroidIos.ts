/* eslint-disable no-console */
import { NativeModules } from 'react-native';

/**
 * This is used by Android and iOS to get a native module.
 * We additionally add a Proxy to the module to intercept calls
 * and log them to the console for debugging purposes, if enabled.
 * @param moduleName
 */
export function getReactNativeModule(moduleName: string): any {
  const nativeModule = NativeModules[moduleName];
  if (!globalThis.RNFBDebug) {
    return nativeModule;
  }
  return new Proxy(nativeModule, {
    ownKeys(target) {
      return Object.keys(target);
    },
    get: (_, name) => {
      if (typeof nativeModule[name as string] !== 'function') return nativeModule[name as string];
      return (...args: any[]) => {
        console.debug(`[RNFB->Native][🔵] ${moduleName}.${String(name)} -> ${JSON.stringify(args)}`);
        const result = nativeModule[name as string](...args);
        if (result && result.then) {
          return result.then(
            (res: any) => {
              console.debug(`[RNFB<-Native][🟢] ${moduleName}.${String(name)} <- ${JSON.stringify(res)}`);
              return res;
            },
            (err: any) => {
              console.debug(`[RNFB<-Native][🔴] ${moduleName}.${String(name)} <- ${JSON.stringify(err)}`);
              throw err;
            },
          );
        }
        console.debug(`[RNFB<-Native][🟢] ${moduleName}.${String(name)} <- ${JSON.stringify(result)}`);
        return result;
      };
    },
  });
}

export function setReactNativeModule(): void {
  // No-op
}


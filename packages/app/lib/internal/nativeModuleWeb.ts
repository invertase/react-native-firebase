/* eslint-disable no-console */

import './global';
// @ts-expect-error
import RNFBAppModule from './web/RNFBAppModule';

const nativeModuleRegistry: Record<string, any> = {};

export function getReactNativeModule(moduleName: string): any {
  const nativeModule = nativeModuleRegistry[moduleName];
  // Throw an error if the module is not registered.
  if (!nativeModule) {
    throw new Error(`Native module ${moduleName} is not registered.`);
  }
  if (!globalThis.RNFBDebug) {
    return nativeModule;
  }
  return new Proxy(nativeModule, {
    ownKeys(target) {
      // FIXME - test in new arch context - I don't think Object.keys works
      return Object.keys(target);
    },
    get: (_, name) => {
      if (typeof nativeModule[name as string] !== 'function') return nativeModule[name as string];
      return (...args: any[]) => {
        console.debug(
          `[RNFB->Native][🔵] ${moduleName}.${String(name)} -> ${JSON.stringify(args)}`,
        );
        const result = nativeModule[name as string](...args);
        if (result && result.then) {
          return result.then(
            (res: any) => {
              console.debug(
                `[RNFB<-Native][🟢] ${moduleName}.${String(name)} <- ${JSON.stringify(res)}`,
              );
              return res;
            },
            (err: any) => {
              console.debug(
                `[RNFB<-Native][🔴] ${moduleName}.${String(name)} <- ${JSON.stringify(err)}`,
              );
              throw err;
            },
          );
        }
        console.debug(
          `[RNFB<-Native][🟢] ${moduleName}.${String(name)} <- ${JSON.stringify(result)}`,
        );
        return result;
      };
    },
  });
}

export function setReactNativeModule(moduleName: string, nativeModule: any): void {
  nativeModuleRegistry[moduleName] = nativeModule;
}

setReactNativeModule('RNFBAppModule', RNFBAppModule);

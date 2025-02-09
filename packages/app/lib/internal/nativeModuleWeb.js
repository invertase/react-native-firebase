/* eslint-disable no-console */

import RNFBAppModule from './web/RNFBAppModule';

const nativeModuleRegistry = {};

export function getReactNativeModule(moduleName) {
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

export function setReactNativeModule(moduleName, nativeModule) {
  nativeModuleRegistry[moduleName] = nativeModule;
}

setReactNativeModule('RNFBAppModule', RNFBAppModule);

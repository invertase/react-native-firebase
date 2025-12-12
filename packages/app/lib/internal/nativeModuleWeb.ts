/* eslint-disable no-console */
import RNFBAppModule from './web/RNFBAppModule';

const nativeModuleRegistry: Record<string, Record<string, unknown>> = {};

export function getReactNativeModule(moduleName: string): Record<string, unknown> | undefined {
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
      const prop = nativeModule[name as string];
      if (typeof prop !== 'function') return prop;
      return (...args: unknown[]) => {
        console.debug(
          `[RNFB->Native][🔵] ${moduleName}.${String(name)} -> ${JSON.stringify(args)}`,
        );
        const result: unknown = (prop as (...args: unknown[]) => unknown)(...args);
        if (result && typeof result === 'object' && 'then' in result) {
          return (result as Promise<unknown>).then(
            (res: unknown) => {
              console.debug(
                `[RNFB<-Native][🟢] ${moduleName}.${String(name)} <- ${JSON.stringify(res)}`,
              );
              return res;
            },
            (err: unknown) => {
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

export function setReactNativeModule(
  moduleName: string,
  nativeModule: Record<string, unknown>,
): void {
  nativeModuleRegistry[moduleName] = nativeModule;
}

setReactNativeModule('RNFBAppModule', RNFBAppModule);

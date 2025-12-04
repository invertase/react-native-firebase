/* eslint-disable no-console */
import { NativeModules } from 'react-native';

/**
 * This is used by Android and iOS to get a native module.
 * We additionally add a Proxy to the module to intercept calls
 * and log them to the console for debugging purposes, if enabled.
 * @param moduleName
 * @returns Raw native module from React Native (object with methods/properties or undefined)
 */
export function getReactNativeModule(moduleName: string): Record<string, unknown> | undefined {
  const nativeModule = NativeModules[moduleName];
  if (!globalThis.RNFBDebug) {
    return nativeModule;
  }
  return new Proxy(nativeModule, {
    ownKeys(target) {
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

export function setReactNativeModule(): void {
  // No-op
}

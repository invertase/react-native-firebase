/* eslint-disable no-console */

function serializeDebugValue(value: unknown): string {
  const seen = new WeakSet<object>();

  try {
    const serialized = JSON.stringify(value, (_key, currentValue: unknown) => {
      if (typeof currentValue === 'bigint') {
        return `${currentValue}n`;
      }
      if (currentValue instanceof Error) {
        return { name: currentValue.name, message: currentValue.message };
      }
      if (currentValue && typeof currentValue === 'object') {
        if (seen.has(currentValue)) {
          return '[Circular]';
        }
        seen.add(currentValue);
      }
      return currentValue;
    });
    return serialized ?? String(value);
  } catch (_error) {
    return '[Unserializable]';
  }
}

function logDebug(message: string): void {
  try {
    console.debug(message);
  } catch (_error) {
    // Debug logging must not change native module behavior.
  }
}

export function createNativeModuleDebugProxy(
  moduleName: string,
  nativeModule: Record<string, unknown>,
): Record<string, unknown> {
  return new Proxy(nativeModule, {
    ownKeys(target) {
      const keys: string[] = [];
      for (const key in target) {
        keys.push(key);
      }
      return keys;
    },
    get: (_, name) => {
      const prop = nativeModule[name as string];
      if (typeof prop !== 'function') return prop;

      return (...args: unknown[]) => {
        logDebug(
          `[RNFB->Native][🔵] ${moduleName}.${String(name)} -> ${serializeDebugValue(args)}`,
        );

        let result: unknown;
        try {
          result = Reflect.apply(prop, nativeModule, args);
        } catch (error) {
          logDebug(
            `[RNFB<-Native][🔴] ${moduleName}.${String(name)} <- ${serializeDebugValue(error)}`,
          );
          throw error;
        }

        if (
          result &&
          typeof result === 'object' &&
          typeof (result as Promise<unknown>).then === 'function'
        ) {
          return (result as Promise<unknown>).then(
            resolvedValue => {
              logDebug(
                `[RNFB<-Native][🟢] ${moduleName}.${String(name)} <- ${serializeDebugValue(
                  resolvedValue,
                )}`,
              );
              return resolvedValue;
            },
            error => {
              logDebug(
                `[RNFB<-Native][🔴] ${moduleName}.${String(name)} <- ${serializeDebugValue(error)}`,
              );
              throw error;
            },
          );
        }

        logDebug(
          `[RNFB<-Native][🟢] ${moduleName}.${String(name)} <- ${serializeDebugValue(result)}`,
        );
        return result;
      };
    },
  });
}

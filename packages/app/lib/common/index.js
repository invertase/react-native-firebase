/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { Platform } from 'react-native';
import Base64 from './Base64';
import { isString } from './validate';

export * from './id';
export * from './path';
export * from './promise';
export * from './validate';

export { default as Base64 } from './Base64';
export { default as ReferenceBase } from './ReferenceBase';

export function getDataUrlParts(dataUrlString) {
  const isBase64 = dataUrlString.includes(';base64');
  let [mediaType, base64String] = dataUrlString.split(',');
  if (!mediaType || !base64String) {
    return { base64String: undefined, mediaType: undefined };
  }
  mediaType = mediaType.replace('data:', '').replace(';base64', '');
  if (base64String && base64String.includes('%')) {
    base64String = decodeURIComponent(base64String);
  }
  if (!isBase64) {
    base64String = Base64.btoa(base64String);
  }
  return { base64String, mediaType };
}

export function once(fn, context) {
  let onceResult;
  let ranOnce = false;

  return function onceInner(...args) {
    if (!ranOnce) {
      ranOnce = true;
      onceResult = fn.apply(context || this, args);
    }

    return onceResult;
  };
}

export function isError(value) {
  if (Object.prototype.toString.call(value) === '[object Error]') {
    return true;
  }

  return value instanceof Error;
}

export function hasOwnProperty(target, property) {
  return Object.hasOwnProperty.call(target, property);
}

/**
 * Remove a trailing forward slash from a string if it exists
 *
 * @param string
 * @returns {*}
 */
export function stripTrailingSlash(string) {
  if (!isString(string)) {
    return string;
  }
  return string.endsWith('/') ? string.slice(0, -1) : string;
}

export const isIOS = Platform.OS === 'ios';

export const isAndroid = Platform.OS === 'android';

export const isOther = Platform.OS !== 'ios' && Platform.OS !== 'android';

export function tryJSONParse(string) {
  try {
    return string && JSON.parse(string);
  } catch (_) {
    return string;
  }
}

export function tryJSONStringify(data) {
  try {
    return JSON.stringify(data);
  } catch (_) {
    return null;
  }
}

// Used to indicate if there is no corresponding modular function
const NO_REPLACEMENT = true;

const mapOfDeprecationReplacements = {
  appCheck: {
    default: {
      activate: 'initializeAppCheck()',
      setTokenAutoRefreshEnabled: 'setTokenAutoRefreshEnabled()',
      getToken: 'getToken()',
      getLimitedUseToken: 'getLimitedUseToken()',
      onTokenChanged: 'onTokenChanged()',
    },
    statics: {
      CustomProvider: 'CustomProvider',
    },
  },
  crashlytics: {
    default: {
      checkForUnsentReports: 'checkForUnsentReports()',
      crash: 'crash()',
      deleteUnsentReports: 'deleteUnsentReports()',
      didCrashOnPreviousExecution: 'didCrashOnPreviousExecution()',
      log: 'log()',
      setAttribute: 'setAttribute()',
      setAttributes: 'setAttributes()',
      setUserId: 'setUserId()',
      recordError: 'recordError()',
      sendUnsentReports: 'sendUnsentReports()',
      setCrashlyticsCollectionEnabled: 'setCrashlyticsCollectionEnabled()',
    },
  },
  firestore: {
    default: {
      batch: 'writeBatch()',
      loadBundle: 'loadBundle()',
      namedQuery: 'namedQuery()',
      clearPersistence: 'clearIndexedDbPersistence()',
      waitForPendingWrites: 'waitForPendingWrites()',
      terminate: 'terminate()',
      useEmulator: 'connectFirestoreEmulator()',
      collection: 'collection()',
      collectionGroup: 'collectionGroup()',
      disableNetwork: 'disableNetwork()',
      doc: 'doc()',
      enableNetwork: 'enableNetwork()',
      runTransaction: 'runTransaction()',
      settings: 'settings()',
      persistentCacheIndexManager: 'getPersistentCacheIndexManager()',
    },
    statics: {
      setLogLevel: 'setLogLevel()',
      Filter: 'where()',
      FieldValue: 'FieldValue',
      Timestamp: 'Timestamp',
      GeoPoint: 'GeoPoint',
      Blob: 'Bytes',
      FieldPath: 'FieldPath',
    },
    FirestoreCollectionReference: {
      count: 'getCountFromServer()',
      countFromServer: 'getCountFromServer()',
      endAt: 'endAt()',
      endBefore: 'endBefore()',
      get: 'getDocs()',
      isEqual: NO_REPLACEMENT,
      limit: 'limit()',
      limitToLast: 'limitToLast()',
      onSnapshot: 'onSnapshot()',
      orderBy: 'orderBy()',
      startAfter: 'startAfter()',
      startAt: 'startAt()',
      where: 'where()',
      add: 'addDoc()',
      doc: 'doc()',
    },
    FirestoreDocumentReference: {
      collection: 'collection()',
      delete: 'deleteDoc()',
      get: 'getDoc()',
      isEqual: NO_REPLACEMENT,
      onSnapshot: 'onSnapshot()',
      set: 'setDoc()',
      update: 'updateDoc()',
    },
    FirestoreDocumentSnapshot: {
      isEqual: NO_REPLACEMENT,
    },
    FirestoreFieldValue: {
      arrayRemove: 'arrayRemove()',
      arrayUnion: 'arrayUnion()',
      delete: 'deleteField()',
      increment: 'increment()',
      serverTimestamp: 'serverTimestamp()',
    },
    Filter: {
      or: 'or()',
      and: 'and()',
    },
    FirestorePersistentCacheIndexManager: {
      enableIndexAutoCreation: 'enablePersistentCacheIndexAutoCreation()',
      disableIndexAutoCreation: 'disablePersistentCacheIndexAutoCreation()',
      deleteAllIndexes: 'deleteAllPersistentCacheIndexes()',
    },
    FirestoreTimestamp: {
      seconds: NO_REPLACEMENT,
      nanoseconds: NO_REPLACEMENT,
    },
  },
};

const modularDeprecationMessage =
  'This method is deprecated (as well as all React Native Firebase namespaced API) and will be removed in the next major release ' +
  'as part of move to match Firebase Web modular SDK API. Please see migration guide for more details: https://rnfirebase.io/migrating-to-v22';

export function deprecationConsoleWarning(nameSpace, methodName, instanceName, isModularMethod) {
  if (!isModularMethod) {
    const moduleMap = mapOfDeprecationReplacements[nameSpace];
    if (moduleMap) {
      const instanceMap = moduleMap[instanceName];
      const deprecatedMethod = instanceMap[methodName];
      if (instanceMap && deprecatedMethod) {
        if (!globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS) {
          // eslint-disable-next-line no-console
          console.warn(createMessage(nameSpace, methodName, instanceName));

          if (globalThis.RNFB_MODULAR_DEPRECATION_STRICT_MODE === true) {
            throw new Error('Deprecated API usage detected while in strict mode.');
          }
        }
      }
    }
  }
}

export function createMessage(
  nameSpace,
  methodName,
  instanceName = 'default',
  uniqueMessage = null,
) {
  if (uniqueMessage) {
    // Unique deprecation message used for testing
    return uniqueMessage;
  }

  const moduleMap = mapOfDeprecationReplacements[nameSpace];
  if (moduleMap) {
    const instance = moduleMap[instanceName];
    if (instance) {
      const replacementMethodName = instance[methodName];

      if (replacementMethodName !== NO_REPLACEMENT) {
        return (
          modularDeprecationMessage +
          `. Method called was \`${methodName}\`. Please use \`${replacementMethodName}\` instead.`
        );
      } else {
        return modularDeprecationMessage + `. Method called was \`${methodName}\``;
      }
    }
  }
}

function getNamespace(target) {
  if (target.GeoPoint || target.CustomProvider) {
    // target is statics object. GeoPoint - Firestore, CustomProvider - AppCheck
    return 'firestore';
  }
  if (target._config && target._config.namespace) {
    return target._config.namespace;
  }
  const className = target.name ? target.name : target.constructor.name;
  return Object.keys(mapOfDeprecationReplacements).find(key => {
    if (mapOfDeprecationReplacements[key][className]) {
      return key;
    }
  });
}

function getInstanceName(target) {
  if (target.GeoPoint || target.CustomProvider) {
    // target is statics object. GeoPoint - Firestore, CustomProvider - AppCheck
    return 'statics';
  }
  if (target._config) {
    // module class instance, we use default to store map of deprecated methods
    return 'default';
  }
  if (target.name) {
    // It's a function which has a name property unlike classes
    return target.name;
  }
  // It's a class instance
  return target.constructor.name;
}

export function createDeprecationProxy(instance) {
  return new Proxy(instance, {
    construct(target, args) {
      // needed for Timestamp which we pass as static, when we construct new instance, we need to wrap it in proxy again.
      return createDeprecationProxy(new target(...args));
    },
    get(target, prop, receiver) {
      const originalMethod = target[prop];

      if (prop === 'constructor') {
        return Reflect.get(target, prop, receiver);
      }

      if (target && target.constructor && target.constructor.name === 'FirestoreTimestamp') {
        deprecationConsoleWarning('firestore', prop, 'FirestoreTimestamp', false);
        return Reflect.get(target, prop, receiver);
      }

      if (target && target.name === 'firebaseModuleWithApp') {
        // statics
        if (
          prop === 'Filter' ||
          prop === 'FieldValue' ||
          prop === 'Timestamp' ||
          prop === 'GeoPoint' ||
          prop === 'Blob' ||
          prop === 'FieldPath'
        ) {
          deprecationConsoleWarning('firestore', prop, 'statics', false);
        }
        if (prop === 'CustomProvider') {
          deprecationConsoleWarning('appCheck', prop, 'statics', false);
        }

        if (prop !== 'setLogLevel') {
          // we want to capture setLogLevel function call which we do below
          return Reflect.get(target, prop, receiver);
        }
      }

      if (typeof originalMethod === 'function') {
        return function (...args) {
          const isModularMethod = args.includes(MODULAR_DEPRECATION_ARG);
          const instanceName = getInstanceName(target);
          const nameSpace = getNamespace(target);

          deprecationConsoleWarning(nameSpace, prop, instanceName, isModularMethod);

          return originalMethod.apply(target, filterModularArgument(args));
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

export const MODULAR_DEPRECATION_ARG = 'react-native-firebase-modular-method-call';

export function filterModularArgument(list) {
  return list.filter(arg => arg !== MODULAR_DEPRECATION_ARG);
}

export function warnIfNotModularCall(args, replacementMethodName = '') {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === MODULAR_DEPRECATION_ARG) {
      return;
    }
  }

  let message = modularDeprecationMessage;
  if (replacementMethodName.length > 0) {
    message += ` Please use \`${replacementMethodName}\` instead.`;
  }

  if (!globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS) {
    // eslint-disable-next-line no-console
    console.warn(message);

    if (globalThis.RNFB_MODULAR_DEPRECATION_STRICT_MODE === true) {
      throw new Error('Deprecated API usage detected while in strict mode.');
    }
  }
}

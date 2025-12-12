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

import { isString, createDeprecationProxy } from '../../common';
import FirebaseApp from '../../FirebaseApp';
import { version as SDK_VERSION } from '../../version';
import { DEFAULT_APP_NAME, KNOWN_NAMESPACES, type KnownNamespace } from '../constants';
import FirebaseModule from '../FirebaseModule';
import type { ModuleGetter, FirebaseRoot, NamespaceConfig } from '../../types/internal';
import {
  getApp,
  getApps,
  initializeApp,
  setLogLevel,
  setReactNativeAsyncStorage,
  setOnAppCreate,
  setOnAppDestroy,
} from './app';

// firebase.X
let FIREBASE_ROOT: FirebaseRoot | null = null;

const NAMESPACE_REGISTRY: Record<string, NamespaceConfig | undefined> = {};
const APP_MODULE_INSTANCE: Record<string, Record<string, FirebaseModule<any>>> = {};
const MODULE_GETTER_FOR_APP: Record<string, Record<string, ModuleGetter>> = {};
const MODULE_GETTER_FOR_ROOT: Record<string, ModuleGetter> = {};

/**
 * Attaches module namespace getters on every newly created app.
 *
 * Structured like this to avoid metro require cycles.
 */
setOnAppCreate(app => {
  for (let i = 0; i < KNOWN_NAMESPACES.length; i++) {
    const moduleNamespace = KNOWN_NAMESPACES[i];
    if (moduleNamespace) {
      Object.defineProperty(app, moduleNamespace, {
        enumerable: false,
        get: firebaseAppModuleProxy.bind(null, app, moduleNamespace),
      });
    }
  }
});

/**
 * Destroys all APP_MODULE_INSTANCE & MODULE_GETTER_FOR_APP objects relating to the
 * recently destroyed app.
 *
 * Structured like this to avoid metro require cycles.
 */
setOnAppDestroy(app => {
  delete APP_MODULE_INSTANCE[app.name];
  delete MODULE_GETTER_FOR_APP[app.name];
});

/**
 *
 * @param app
 * @param moduleNamespace
 * @returns {*}
 */
function getOrCreateModuleForApp(app: FirebaseApp, moduleNamespace: KnownNamespace): ModuleGetter {
  if (MODULE_GETTER_FOR_APP[app.name] && MODULE_GETTER_FOR_APP[app.name]?.[moduleNamespace]) {
    return MODULE_GETTER_FOR_APP[app.name]![moduleNamespace]!;
  }

  if (!MODULE_GETTER_FOR_APP[app.name]) {
    MODULE_GETTER_FOR_APP[app.name] = {};
  }

  const config = NAMESPACE_REGISTRY[moduleNamespace];
  if (!config) {
    throw new Error(`Module namespace '${moduleNamespace}' is not registered.`);
  }
  const { hasCustomUrlOrRegionSupport, hasMultiAppSupport, ModuleClass } = config;

  // modules such as analytics only run on the default app
  if (!hasMultiAppSupport && app.name !== DEFAULT_APP_NAME) {
    throw new Error(
      [
        `You attempted to call "firebase.app('${app.name}').${moduleNamespace}" but; ${moduleNamespace} does not support multiple Firebase Apps.`,
        '',
        `Ensure you access ${moduleNamespace} from the default application only.`,
      ].join('\r\n'),
    );
  }

  // e.g. firebase.storage(customUrlOrRegion), firebase.functions(customUrlOrRegion), firebase.firestore(databaseId), firebase.database(url)
  function firebaseModuleWithArgs(customUrlOrRegionOrDatabaseId?: string): FirebaseModule<any> {
    if (customUrlOrRegionOrDatabaseId !== undefined) {
      if (!hasCustomUrlOrRegionSupport) {
        // TODO throw Module does not support arguments error
      }

      if (!isString(customUrlOrRegionOrDatabaseId)) {
        // TODO throw Module first argument must be a string error
      }
    }

    const key = customUrlOrRegionOrDatabaseId
      ? `${customUrlOrRegionOrDatabaseId}:${moduleNamespace}`
      : moduleNamespace;

    if (!APP_MODULE_INSTANCE[app.name]) {
      APP_MODULE_INSTANCE[app.name] = {};
    }

    if (!APP_MODULE_INSTANCE[app.name]?.[key]) {
      const moduleConfig = NAMESPACE_REGISTRY[moduleNamespace];
      if (!moduleConfig) {
        throw new Error(`Module namespace '${moduleNamespace}' is not registered.`);
      }
      const module = createDeprecationProxy(
        new ModuleClass(app, moduleConfig, customUrlOrRegionOrDatabaseId),
      ) as unknown as FirebaseModule<any>;

      APP_MODULE_INSTANCE[app.name]![key] = module;
    }

    return APP_MODULE_INSTANCE[app.name]![key]!;
  }

  MODULE_GETTER_FOR_APP[app.name]![moduleNamespace] =
    firebaseModuleWithArgs as unknown as ModuleGetter;
  return MODULE_GETTER_FOR_APP[app.name]![moduleNamespace]!;
}

/**
 *
 * @param moduleNamespace
 * @returns {*}
 */
function getOrCreateModuleForRoot(moduleNamespace: KnownNamespace): ModuleGetter {
  if (MODULE_GETTER_FOR_ROOT[moduleNamespace]) {
    return MODULE_GETTER_FOR_ROOT[moduleNamespace];
  }

  const config = NAMESPACE_REGISTRY[moduleNamespace];
  if (!config) {
    throw new Error(`Module namespace '${moduleNamespace}' is not registered.`);
  }
  const { statics, hasMultiAppSupport, ModuleClass } = config;

  // e.g. firebase.storage(app)
  function firebaseModuleWithApp(app?: FirebaseApp): FirebaseModule<any> {
    const _app = app || getApp();

    // Duck-type check for FirebaseApp (checking for required properties)
    if (
      !_app ||
      typeof _app !== 'object' ||
      !('name' in _app) ||
      !('options' in _app) ||
      typeof _app.name !== 'string'
    ) {
      throw new Error(
        [
          `"firebase.${moduleNamespace}(app)" arg expects a FirebaseApp instance or undefined.`,
          '',
          'Ensure the arg provided is a Firebase app instance; or no args to use the default Firebase app.',
        ].join('\r\n'),
      );
    }

    // modules such as analytics only run on the default app
    if (!hasMultiAppSupport && _app.name !== DEFAULT_APP_NAME) {
      throw new Error(
        [
          `You attempted to call "firebase.${moduleNamespace}(app)" but; ${moduleNamespace} does not support multiple Firebase Apps.`,
          '',
          `Ensure the app provided is the default Firebase app only and not the "${_app.name}" app.`,
        ].join('\r\n'),
      );
    }

    if (!APP_MODULE_INSTANCE[_app.name]) {
      APP_MODULE_INSTANCE[_app.name] = {};
    }

    if (!APP_MODULE_INSTANCE[_app.name]?.[moduleNamespace]) {
      const moduleConfig = NAMESPACE_REGISTRY[moduleNamespace];
      if (!moduleConfig) {
        throw new Error(`Module namespace '${moduleNamespace}' is not registered.`);
      }
      const module = createDeprecationProxy(
        new ModuleClass(_app, moduleConfig),
      ) as unknown as FirebaseModule<any>;
      APP_MODULE_INSTANCE[_app.name]![moduleNamespace] = module;
    }

    return APP_MODULE_INSTANCE[_app.name]![moduleNamespace]!;
  }

  Object.assign(firebaseModuleWithApp, statics || {});
  // Object.freeze(firebaseModuleWithApp);
  // Wrap around statics, e.g. firebase.firestore.FieldValue, removed freeze as it stops proxy working. it is deprecated anyway
  MODULE_GETTER_FOR_ROOT[moduleNamespace] = createDeprecationProxy(
    firebaseModuleWithApp,
  ) as unknown as ModuleGetter;

  return MODULE_GETTER_FOR_ROOT[moduleNamespace]!;
}

/**
 *
 * @param firebaseNamespace
 * @param moduleNamespace
 * @returns {*}
 */
function firebaseRootModuleProxy(
  _firebaseNamespace: FirebaseRoot,
  moduleNamespace: string,
): ModuleGetter {
  if (NAMESPACE_REGISTRY[moduleNamespace]) {
    return getOrCreateModuleForRoot(moduleNamespace as KnownNamespace);
  }

  const moduleWithDashes = moduleNamespace
    .split(/(?=[A-Z])/)
    .join('-')
    .toLowerCase();

  throw new Error(
    [
      `You attempted to use 'firebase.${moduleNamespace}' but this module could not be found.`,
      '',
      `Ensure you have installed and imported the '@react-native-firebase/${moduleWithDashes}' package.`,
    ].join('\r\n'),
  );
}

/**
 *
 * @param app
 * @param moduleNamespace
 * @returns {*}
 */
export function firebaseAppModuleProxy(app: FirebaseApp, moduleNamespace: string): ModuleGetter {
  if (NAMESPACE_REGISTRY[moduleNamespace]) {
    // Call private _checkDestroyed method
    (app as unknown as { _checkDestroyed: () => void })._checkDestroyed();
    return getOrCreateModuleForApp(app, moduleNamespace as KnownNamespace);
  }

  const moduleWithDashes = moduleNamespace
    .split(/(?=[A-Z])/)
    .join('-')
    .toLowerCase();

  throw new Error(
    [
      `You attempted to use "firebase.app('${app.name}').${moduleNamespace}" but this module could not be found.`,
      '',
      `Ensure you have installed and imported the '@react-native-firebase/${moduleWithDashes}' package.`,
    ].join('\r\n'),
  );
}

/**
 *
 * @returns {*}
 */
export function createFirebaseRoot(): FirebaseRoot {
  // Create partial root object - module namespaces like 'utils' are added dynamically below
  const root = {
    initializeApp,
    setReactNativeAsyncStorage,
    get app() {
      return getApp;
    },
    get apps() {
      return getApps();
    },
    SDK_VERSION,
    setLogLevel,
  } as FirebaseRoot;

  for (let i = 0; i < KNOWN_NAMESPACES.length; i++) {
    const namespace = KNOWN_NAMESPACES[i];
    if (namespace) {
      Object.defineProperty(root, namespace, {
        enumerable: false,
        get: firebaseRootModuleProxy.bind(null, root, namespace),
      });
    }
  }

  FIREBASE_ROOT = root;
  return root;
}

/**
 *
 * @returns {*}
 */
export function getFirebaseRoot(): FirebaseRoot {
  if (FIREBASE_ROOT) {
    return FIREBASE_ROOT;
  }
  return createFirebaseRoot();
}

/**
 *
 * @param options
 * @returns {*}
 */
export function createModuleNamespace(options: NamespaceConfig): ModuleGetter {
  const { namespace, ModuleClass } = options;

  if (!NAMESPACE_REGISTRY[namespace]) {
    // validation only for internal / module dev usage
    const firebaseModuleExtended = (FirebaseModule as unknown as { __extended__: object })
      .__extended__;
    const moduleClassExtended = (ModuleClass as unknown as { __extended__: object }).__extended__;
    if (firebaseModuleExtended !== moduleClassExtended) {
      throw new Error('INTERNAL ERROR: ModuleClass must be an instance of FirebaseModule.');
    }

    NAMESPACE_REGISTRY[namespace] = Object.assign({}, options);
  }

  return getFirebaseRoot()[namespace] as ModuleGetter;
}

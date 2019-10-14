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

import { isString } from '@react-native-firebase/app/lib/common';
import FirebaseApp from '../../FirebaseApp';
import SDK_VERSION from '../../version';
import { DEFAULT_APP_NAME, KNOWN_NAMESPACES } from '../constants';
import FirebaseModule from '../FirebaseModule';
import { getApp, getApps, initializeApp, setOnAppCreate, setOnAppDestroy } from './app';

// firebase.X
let FIREBASE_ROOT = null;

const NAMESPACE_REGISTRY = {};
const APP_MODULE_INSTANCE = {};
const MODULE_GETTER_FOR_APP = {};
const MODULE_GETTER_FOR_ROOT = {};

/**
 * Attaches module namespace getters on every newly created app.
 *
 * Structured like this to avoid metro require cycles.
 */
setOnAppCreate(app => {
  for (let i = 0; i < KNOWN_NAMESPACES.length; i++) {
    const moduleNamespace = KNOWN_NAMESPACES[i];
    Object.defineProperty(app, moduleNamespace, {
      enumerable: false,
      get: firebaseAppModuleProxy.bind(null, app, moduleNamespace),
    });
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
function getOrCreateModuleForApp(app, moduleNamespace) {
  if (MODULE_GETTER_FOR_APP[app.name] && MODULE_GETTER_FOR_APP[app.name][moduleNamespace]) {
    return MODULE_GETTER_FOR_APP[app.name][moduleNamespace];
  }

  if (!MODULE_GETTER_FOR_APP[app.name]) {
    MODULE_GETTER_FOR_APP[app.name] = {};
  }

  const { hasCustomUrlOrRegionSupport, hasMultiAppSupport, ModuleClass } = NAMESPACE_REGISTRY[
    moduleNamespace
  ];

  // modules such as analytics only run on the default app
  if (!hasMultiAppSupport && app.name !== DEFAULT_APP_NAME) {
    throw new Error(
      [
        `You attempted to call "firebase.app('${
          app.name
        }').${moduleNamespace}" but; ${moduleNamespace} does not support multiple Firebase Apps.`,
        '',
        `Ensure you access ${moduleNamespace} from the default application only.`,
      ].join('\r\n'),
    );
  }

  // e.g. firebase.storage(customUrlOrRegion)
  function firebaseModuleWithArgs(customUrlOrRegion) {
    if (customUrlOrRegion !== undefined) {
      if (!hasCustomUrlOrRegionSupport) {
        // TODO throw Module does not support arguments error
      }

      if (!isString(customUrlOrRegion)) {
        // TODO throw Module first argument must be a string error
      }
    }

    const key = customUrlOrRegion ? `${customUrlOrRegion}:${moduleNamespace}` : moduleNamespace;

    if (!APP_MODULE_INSTANCE[app.name]) {
      APP_MODULE_INSTANCE[app.name] = {};
    }

    if (!APP_MODULE_INSTANCE[app.name][key]) {
      APP_MODULE_INSTANCE[app.name][key] = new ModuleClass(
        app,
        NAMESPACE_REGISTRY[moduleNamespace],
        customUrlOrRegion,
      );
    }

    return APP_MODULE_INSTANCE[app.name][key];
  }

  MODULE_GETTER_FOR_APP[app.name][moduleNamespace] = firebaseModuleWithArgs;
  return MODULE_GETTER_FOR_APP[app.name][moduleNamespace];
}

/**
 *
 * @param moduleNamespace
 * @returns {*}
 */
function getOrCreateModuleForRoot(moduleNamespace) {
  if (MODULE_GETTER_FOR_ROOT[moduleNamespace]) {
    return MODULE_GETTER_FOR_ROOT[moduleNamespace];
  }

  const { statics, hasMultiAppSupport, ModuleClass } = NAMESPACE_REGISTRY[moduleNamespace];

  // e.g. firebase.storage(app)
  function firebaseModuleWithApp(app) {
    const _app = app || getApp();

    if (!(_app instanceof FirebaseApp)) {
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
          `Ensure the app provided is the default Firebase app only and not the "${
            _app.name
          }" app.`,
        ].join('\r\n'),
      );
    }

    if (!APP_MODULE_INSTANCE[_app.name]) {
      APP_MODULE_INSTANCE[_app.name] = {};
    }

    if (!APP_MODULE_INSTANCE[_app.name][moduleNamespace]) {
      APP_MODULE_INSTANCE[_app.name][moduleNamespace] = new ModuleClass(
        _app,
        NAMESPACE_REGISTRY[moduleNamespace],
      );
    }

    return APP_MODULE_INSTANCE[_app.name][moduleNamespace];
  }

  Object.assign(firebaseModuleWithApp, statics || {});
  Object.freeze(firebaseModuleWithApp);
  MODULE_GETTER_FOR_ROOT[moduleNamespace] = firebaseModuleWithApp;

  return MODULE_GETTER_FOR_ROOT[moduleNamespace];
}

/**
 *
 * @param firebaseNamespace
 * @param moduleNamespace
 * @returns {*}
 */
function firebaseRootModuleProxy(firebaseNamespace, moduleNamespace) {
  if (NAMESPACE_REGISTRY[moduleNamespace]) {
    return getOrCreateModuleForRoot(moduleNamespace);
  }

  throw new Error(
    [
      `You attempted to use 'firebase.${moduleNamespace}' but this module could not be found.`,
      '',
      `Ensure you have installed and imported the '@react-native-firebase/${moduleNamespace}' package.`,
    ].join('\r\n'),
  );
}

/**
 *
 * @param app
 * @param moduleNamespace
 * @returns {*}
 */
export function firebaseAppModuleProxy(app, moduleNamespace) {
  if (NAMESPACE_REGISTRY[moduleNamespace]) {
    app._checkDestroyed();
    return getOrCreateModuleForApp(app, moduleNamespace);
  }

  throw new Error(
    [
      `You attempted to use "firebase.app('${
        app.name
      }').${moduleNamespace}" but this module could not be found.`,
      '',
      `Ensure you have installed and imported the '@react-native-firebase/${moduleNamespace}' package.`,
    ].join('\r\n'),
  );
}

/**
 *
 * @returns {*}
 */
export function createFirebaseRoot() {
  FIREBASE_ROOT = {
    initializeApp,
    get app() {
      return getApp;
    },
    get apps() {
      return getApps();
    },
    SDK_VERSION,
  };

  for (let i = 0; i < KNOWN_NAMESPACES.length; i++) {
    const namespace = KNOWN_NAMESPACES[i];
    Object.defineProperty(FIREBASE_ROOT, namespace, {
      enumerable: false,
      get: firebaseRootModuleProxy.bind(null, FIREBASE_ROOT, namespace),
    });
  }

  return Object.freeze(FIREBASE_ROOT);
}

/**
 *
 * @returns {*}
 */
export function getFirebaseRoot() {
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
export function createModuleNamespace(options = {}) {
  const { namespace, ModuleClass, version } = options;

  if (!NAMESPACE_REGISTRY[namespace]) {
    // validation only for internal / module dev usage
    // TODO instanceof does not work in build
    if (FirebaseModule.__extended__ !== ModuleClass.__extended__) {
      throw new Error('INTERNAL ERROR: ModuleClass must be an instance of FirebaseModule.');
    }

    // TODO remove me after notifications ready, temporarily excludes it from this logic
    if (version !== SDK_VERSION && namespace !== 'notifications') {
      throw new Error(
        [
          `You've attempted to require '@react-native-firebase/${namespace}' version '${version}', ` +
            `however, the '@react-native-firebase/app' module is of a different version (${SDK_VERSION}).`,
          '',
          'All React Native Firebase modules must be of the same version. Please ensure they match up ' +
            'in your package.json file and re-run yarn/npm install.',
        ].join('\n'),
      );
    }

    NAMESPACE_REGISTRY[namespace] = Object.assign({}, options);
  }

  return getFirebaseRoot()[namespace];
}

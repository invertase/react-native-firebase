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

import { noop, isUndefined, Proxy, isOneOf } from '@react-native-firebase/common';

import SDK_VERSION from '../../version';
import FirebaseModule from '../FirebaseModule';
import { getApp, getApps, initializeApp } from './app';
import { knownFirebaseNamespaces } from '../constants';

let ROOT_NAMESPACE = null;
let ROOT_NAMESPACE_PROXY = null;
const NAMESPACE_REGISTRY = {};
const MODULE_WITH_STATICS = {};
const APP_NAMESPACE_INSTANCE = {};

/**
 *
 * @returns {*}
 * @param namespace
 */
function getOrCreateModuleWithStatics(namespace) {
  const { statics, hasMultiAppSupport, ModuleClass } = NAMESPACE_REGISTRY[namespace];

  if (MODULE_WITH_STATICS[namespace]) return MODULE_WITH_STATICS[namespace];

  const moduleGetterFn = function firebaseModuleWithApp(app) {
    let _app = app || getApp();
    // modules such as analytics only run on the default app
    if (!hasMultiAppSupport) _app = getApp();

    if (!APP_NAMESPACE_INSTANCE[_app.name]) {
      APP_NAMESPACE_INSTANCE[_app.name] = {};
    }

    if (!APP_NAMESPACE_INSTANCE[_app.name][namespace]) {
      APP_NAMESPACE_INSTANCE[_app.name][namespace] = new ModuleClass(
        _app,
        NAMESPACE_REGISTRY[namespace],
      );
    }

    return APP_NAMESPACE_INSTANCE[_app.name][namespace];
  };

  Object.assign(moduleGetterFn, statics || {});
  Object.seal(moduleGetterFn);

  MODULE_WITH_STATICS[namespace] = moduleGetterFn;
  return MODULE_WITH_STATICS[namespace];
}

/**
 *
 * @param firebaseNamespace
 * @param property
 * @returns {*}
 */
function firebaseModuleProxy(firebaseNamespace, property) {
  if (!isUndefined(firebaseNamespace[property])) {
    return firebaseNamespace[property];
  }

  if (NAMESPACE_REGISTRY[property]) {
    return getOrCreateModuleWithStatics(property);
  }

  if (isOneOf(property, knownFirebaseNamespaces)) {
    throw new Error(
      [
        `You attempted to use 'firebase.${property}' but this module could not be found.`,
        '',
        `Ensure you have installed and imported the '@react-native-firebase/${property}' package.`,
      ].join('\r\n'),
    );
  }

  return undefined;
}

/**
 *
 * @returns {*}
 */
export function createFirebaseNamespace() {
  ROOT_NAMESPACE = {
    initializeApp,
    get app() {
      return getApp;
    },
    get apps() {
      return getApps();
    },
    SDK_VERSION,
  };

  ROOT_NAMESPACE_PROXY = new Proxy(ROOT_NAMESPACE, { set: noop, get: firebaseModuleProxy });
  return ROOT_NAMESPACE_PROXY;
}

/**
 *
 * @returns {*}
 */
export function getFirebaseNamespace() {
  if (ROOT_NAMESPACE_PROXY) return ROOT_NAMESPACE_PROXY;
  return createFirebaseNamespace();
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
    // instanceof does not work in build
    if (FirebaseModule.__extended__ !== ModuleClass.__extended__) {
      throw new Error('INTERNAL ERROR: ModuleClass must be an instance of FirebaseModule.');
    }

    if (version !== SDK_VERSION) {
      throw new Error(
        [
          `You've attempted to require '@react-native-firebase/${namespace}' version '${version}', ` +
            `however, 'react-native-firebase' core module is of a different version (${SDK_VERSION}).`,
          '',
          `All React Native Firebase modules must be of the same version. Please ensure they match up ` +
          `in your package.json file and re-run yarn/npm install.`,
        ].join('\n'),
      );
    }

    NAMESPACE_REGISTRY[namespace] = Object.assign({}, options);
  }

  return getFirebaseNamespace()[namespace];
}

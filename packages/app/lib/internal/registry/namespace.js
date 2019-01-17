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

import { noop, isUndefined, Proxy } from '@react-native-firebase/common';

import SDK_VERSION from '../../version';
import FirebaseModule from '../FirebaseModule';
import { getApp, getApps, initializeApp } from './app';

let ROOT_NAMESPACE = null;
let ROOT_NAMESPACE_PROXY = null;

const NAMESPACE_REGISTRY = {};
const MODULE_WITH_STATICS = {};
const APP_NAMESPACE_INSTANCE = {};

/**
 *
 * @param namespaceRegistration
 * @returns {*}
 */
function getOrCreateModuleWithStatics(namespaceRegistration) {
  const { namespace, statics, hasMultiAppSupport, ModuleClass } = namespaceRegistration;

  if (MODULE_WITH_STATICS[namespace]) return MODULE_WITH_STATICS[namespace];

  const moduleGetterFn = function firebaseModuleWithApp(app) {
    let _app = app || getApp();
    // modules such as analytics only run on the default app
    if (!hasMultiAppSupport) _app = getApp();

    if (!APP_NAMESPACE_INSTANCE[_app.name]) {
      APP_NAMESPACE_INSTANCE[_app.name] = {};
    }

    if (!APP_NAMESPACE_INSTANCE[_app.name][namespace]) {
      APP_NAMESPACE_INSTANCE[_app.name][namespace] = new ModuleClass(_app, namespaceRegistration);
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
    return getOrCreateModuleWithStatics(NAMESPACE_REGISTRY[property]);
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
      return getApp();
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
  const { namespace, ModuleClass } = options;

  if (!NAMESPACE_REGISTRY[namespace]) {
    // hacky inheritance check - instanceof not working once bundled
    // only for internal / module dev use
    if (FirebaseModule.__extended__ !== ModuleClass.__extended__) {
      throw new Error('INTERNAL ERROR: ModuleClass must be an instance of FirebaseModule.');
    }

    NAMESPACE_REGISTRY[namespace] = Object.assign({}, options);
  }

  return getFirebaseNamespace()[namespace];
}

/**
 *
 * @param namespace
 * @returns {*}
 */
export function getModuleNamespace(namespace = ROOT_NAMESPACE) {
  return NAMESPACE_REGISTRY[namespace];
}

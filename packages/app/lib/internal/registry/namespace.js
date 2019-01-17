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

let ROOT_NAMESPACE = {};
const NAMESPACE_REGISTRY = {};

function firebaseModuleProxy(firebaseNamespace, property) {
  if (!isUndefined(firebaseNamespace[property])) {
    return firebaseNamespace[property];
  }

  // TODO get namespace
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

  return new Proxy(ROOT_NAMESPACE, { set: noop, get: firebaseModuleProxy });
}

/**
 *
 * @param options
 * @returns {*}
 */
export function createModuleNamespace(options = {}) {
  const { namespace, ModuleClass } = options;
  console.warn(options)
  if (!NAMESPACE_REGISTRY[namespace]) {
    // new registration so validate it only once
    if (!(ModuleClass instanceof FirebaseModule)) {
      throw new Error('INTERNAL ERROR: ModuleClass must be an instance of FirebaseModule.');
    }

    NAMESPACE_REGISTRY[namespace] = Object.assign({}, options);
    if (namespace !== ROOT_NAMESPACE) attachNamespace();
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

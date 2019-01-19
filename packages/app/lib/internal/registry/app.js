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

import FirebaseApp from '../../FirebaseApp';
import { getAppModule } from './nativeModule';

const APP_REGISTRY = {};
const DEFAULT_APP_NAME = '[DEFAULT]';
let initializedNativeApps = false;

/**
 *
 */
export function initializeNativeApps() {
  const nativeModule = getAppModule();
  const { apps } = nativeModule;

  if (apps && apps.length) {
    for (let i = 0; i < apps.length; i++) {
      const { name, state, options } = apps[i];
      APP_REGISTRY[name] = new FirebaseApp(
        options,
        { name, ...state },
        true,
        deleteApp.bind(null, name, true),
      );
    }
  }

  initializedNativeApps = true;
}

/**
 *
 * @param name
 */
export function getApp(name = DEFAULT_APP_NAME) {
  if (!initializedNativeApps) initializeNativeApps();
  const app = APP_REGISTRY[name];

  if (!app) {
    throw new Error(`No Firebase App '${name}' has been created - call firebase.initializeApp()`);
  }

  return app;
}

/**
 *
 */
export function getApps() {
  return Object.values(APP_REGISTRY);
}

/**
 *
 * @param options
 * @param configOrName
 */
export function initializeApp(options = {}, configOrName) {
  // TODO
}

/**
 *
 */
export function deleteApp(name, nativeInitialized) {
  if (name === DEFAULT_APP_NAME && nativeInitialized) {
    throw new Error('Unable to delete the default native firebase app instance.');
  }

  const app = APP_REGISTRY[name];
  const nativeModule = getAppModule();

  return nativeModule.deleteApp(name).then(() => {
    app._deleted = true;
    delete APP_REGISTRY[name];
  });
}

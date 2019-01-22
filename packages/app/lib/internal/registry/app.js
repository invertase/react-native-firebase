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

import { isObject, isNull, isString, isUndefined } from '@react-native-firebase/common';

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
      const { appConfig, options } = apps[i];
      const { name } = appConfig;

      APP_REGISTRY[name] = new FirebaseApp(
        options,
        appConfig,
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
  let appConfig = configOrName;

  if (!isObject(configOrName) || isNull(configOrName)) {
    appConfig = {
      name: configOrName,
      automaticResourceManagement: false,
      automaticDataCollectionEnabled: true,
    };
  }

  if (isUndefined(appConfig.name)) {
    appConfig.name = DEFAULT_APP_NAME;
  }

  const { name } = appConfig;

  if (!name || !isString(name)) {
    return Promise.reject(new Error(`Illegal App name: '${name}'`));
  }

  if (APP_REGISTRY[name]) {
    return Promise.reject(new Error(`Firebase App named '${name}' already exists`));
  }

  // VALIDATE OPTIONS
  if (!isObject(options)) {
    return Promise.reject(
      new Error(`firebase.initializeApp(options, <- expects an Object but got '${typeof options}'`),
    );
  }

  if (!isString(options.apiKey)) {
    return Promise.reject(new Error(`Missing or invalid FirebaseOptions property 'apiKey'.`));
  }

  if (!isString(options.appId)) {
    return Promise.reject(new Error(`Missing or invalid FirebaseOptions property 'appId'.`));
  }

  // TODO - make required only if database module exists - init app on native ios&android needs changing also
  if (!isString(options.databaseURL)) {
    return Promise.reject(new Error(`Missing or invalid FirebaseOptions property 'databaseURL'.`));
  }

  // TODO - make required only if messaging/notifications module exists - init app on native ios&android needs changing also
  if (!isString(options.messagingSenderId)) {
    return Promise.reject(
      new Error(`Missing or invalid FirebaseOptions property 'messagingSenderId'.`),
    );
  }

  if (!isString(options.projectId)) {
    return Promise.reject(new Error(`Missing or invalid FirebaseOptions property 'projectId'.`));
  }

  // TODO - make required only if database module exists - init app on native ios&android needs changing also
  if (!isString(options.storageBucket)) {
    return Promise.reject(
      new Error(`Missing or invalid FirebaseOptions property 'storageBucket'.`),
    );
  }

  const app = new FirebaseApp(options, { name }, false, deleteApp.bind(null, name, true));

  APP_REGISTRY[name] = app;

  return getAppModule()
    .initializeApp(options, { name })
    .then(() => {
      app._intialized = true;
      return app;
    });
}

/**
 *
 */
export function deleteApp(name, nativeInitialized) {
  if (name === DEFAULT_APP_NAME && nativeInitialized) {
    return Promise.reject(new Error('Unable to delete the default native firebase app instance.'));
  }

  const app = APP_REGISTRY[name];

  const nativeModule = getAppModule();

  return nativeModule.deleteApp(name).then(() => {
    app._deleted = true;
    delete APP_REGISTRY[name];
  });
}

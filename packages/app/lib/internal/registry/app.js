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

import {
  isIOS,
  isOther,
  isNull,
  isObject,
  isFunction,
  isString,
  isUndefined,
} from '@react-native-firebase/app/lib/common';
import FirebaseApp from '../../FirebaseApp';
import { DEFAULT_APP_NAME } from '../constants';
import { setReactNativeAsyncStorageInternal } from '../asyncStorage';
import { getAppModule } from './nativeModule';

const APP_REGISTRY = {};
let onAppCreateFn = null;
let onAppDestroyFn = null;
let initializedNativeApps = false;

/**
 * This was needed to avoid metro require cycles...
 * @param fn
 */
export function setOnAppCreate(fn) {
  onAppCreateFn = fn;
}

/**
 * This was needed to avoid metro require cycles...
 * @param fn
 */
export function setOnAppDestroy(fn) {
  onAppDestroyFn = fn;
}

/**
 * Initializes all apps that were created natively (android/ios),
 * e.g. the Default firebase app from plist/json google services file.
 */
export function initializeNativeApps() {
  const nativeModule = getAppModule();
  const { NATIVE_FIREBASE_APPS } = nativeModule;

  if (NATIVE_FIREBASE_APPS && NATIVE_FIREBASE_APPS.length) {
    for (let i = 0; i < NATIVE_FIREBASE_APPS.length; i++) {
      const { appConfig, options } = NATIVE_FIREBASE_APPS[i];
      const { name } = appConfig;
      APP_REGISTRY[name] = new FirebaseApp(
        options,
        appConfig,
        true,
        deleteApp.bind(null, name, true),
      );
      onAppCreateFn(APP_REGISTRY[name]);
    }
  }

  initializedNativeApps = true;
}

/**
 * Get an app by name; or the default app.
 *
 * On first call of this method it will initialize any
 * natively created apps in JS. This makes this 'lazy load'.
 *
 * @param name
 */
export function getApp(name = DEFAULT_APP_NAME) {
  if (!initializedNativeApps) {
    initializeNativeApps();
  }
  const app = APP_REGISTRY[name];

  if (!app) {
    throw new Error(`No Firebase App '${name}' has been created - call firebase.initializeApp()`);
  }

  return app;
}

/**
 * Gets all app instances, used for `firebase.apps`
 */
export function getApps() {
  if (!initializedNativeApps) {
    initializeNativeApps();
  }
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
    return Promise.reject(new Error("Missing or invalid FirebaseOptions property 'apiKey'."));
  }

  if (!isString(options.appId)) {
    return Promise.reject(new Error("Missing or invalid FirebaseOptions property 'appId'."));
  }

  // TODO - make required only if database module exists - init app on native ios&android needs changing also
  if (!isString(options.databaseURL)) {
    return Promise.reject(new Error("Missing or invalid FirebaseOptions property 'databaseURL'."));
  }

  // TODO - make required only if messaging/notifications module exists - init app on native ios&android needs changing also
  if (!isString(options.messagingSenderId)) {
    return Promise.reject(
      new Error("Missing or invalid FirebaseOptions property 'messagingSenderId'."),
    );
  }

  if (!isString(options.projectId)) {
    return Promise.reject(new Error("Missing or invalid FirebaseOptions property 'projectId'."));
  }

  // TODO - make required only if database module exists - init app on native ios&android needs changing also
  if (!isString(options.storageBucket)) {
    return Promise.reject(
      new Error("Missing or invalid FirebaseOptions property 'storageBucket'."),
    );
  }

  const app = new FirebaseApp(options, appConfig, false, deleteApp.bind(null, name, true));

  // Note these initialization actions with side effects are performed prior to knowledge of
  // successful initialization in the native code. Native code *may* throw an error.
  APP_REGISTRY[name] = app;
  onAppCreateFn(APP_REGISTRY[name]);

  return getAppModule()
    .initializeApp(options, appConfig)
    .then(() => {
      app._initialized = true;
      return app;
    })
    .catch(e => {
      // we need to clean the app entry from registry as the app does not actually exist
      // There are still possible side effects from `onAppCreateFn` to consider but as existing
      // code may rely on that function running prior to native create, re-ordering it is a semantic change
      // and will be avoided
      delete APP_REGISTRY[name];

      // Now allow calling code to handle the initialization issue
      throw e;
    });
}

export function setLogLevel(logLevel) {
  if (!['error', 'warn', 'info', 'debug', 'verbose'].includes(logLevel)) {
    throw new Error('LogLevel must be one of "error", "warn", "info", "debug", "verbose"');
  }

  if (isIOS || isOther) {
    getAppModule().setLogLevel(logLevel);
  }
}

export function setReactNativeAsyncStorage(asyncStorage) {
  if (!isObject(asyncStorage)) {
    throw new Error("firebase.setReactNativeAsyncStorage(*) 'asyncStorage' must be an object.");
  }

  if (!isFunction(asyncStorage.setItem)) {
    throw new Error(
      "firebase.setReactNativeAsyncStorage(*) 'asyncStorage.setItem' must be a function.",
    );
  }

  if (!isFunction(asyncStorage.getItem)) {
    throw new Error(
      "firebase.setReactNativeAsyncStorage(*) 'asyncStorage.getItem' must be a function.",
    );
  }

  if (!isFunction(asyncStorage.removeItem)) {
    throw new Error(
      "firebase.setReactNativeAsyncStorage(*) 'asyncStorage.removeItem' must be a function.",
    );
  }

  setReactNativeAsyncStorageInternal(asyncStorage);
}

/**
 *
 */
export function deleteApp(name, nativeInitialized) {
  if (name === DEFAULT_APP_NAME && nativeInitialized) {
    return Promise.reject(new Error('Unable to delete the default native firebase app instance.'));
  }

  const app = APP_REGISTRY[name];

  if (app === undefined) {
    throw new Error(`Firebase App named '${name}' already deleted`);
  }

  const nativeModule = getAppModule();

  return nativeModule.deleteApp(name).then(() => {
    app._deleted = true;
    onAppDestroyFn(app);
    delete APP_REGISTRY[name];
  });
}

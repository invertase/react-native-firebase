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
/**
 * @typedef {import("..").FirebaseFunctionsTypes.Module} Functions
 * @typedef {import("..").FirebaseFunctionsTypes.HttpsCallable} HttpsCallable
 * @typedef {import("..").FirebaseFunctionsTypes.HttpsCallableOptions} HttpsCallableOptions
 * @typedef {import("@firebase/app").FirebaseApp} FirebaseApp
 */

import { firebase } from '..';

/**
 * Returns a Functions instance for the given app.
 * @param {FirebaseApp | undefined} app - The FirebaseApp to use. Optional.
 * @param {string | undefined} regionOrCustomDomain - One of: a) The region the callable functions are located in (ex: us-central1) b) A custom domain hosting the callable functions (ex: https://mydomain.com). Optional.
 * @returns {Functions}
 */
export function getFunctions(app, regionOrCustomDomain) {
  if (app) {
    return firebase.app(app.name).functions(regionOrCustomDomain);
  }

  return firebase.app().functions(regionOrCustomDomain);
}

/**
 * Modify this instance to communicate with the Cloud Functions emulator.
 * Note: this must be called before this instance has been used to do any operations.
 * @param {Functions} functionsInstance A functions instance.
 * @param {string} host The emulator host. (ex: localhost)
 * @param {number} port The emulator port. (ex: 5001)
 * @returns {void}
 */
export function connectFunctionsEmulator(functionsInstance, host, port) {
  return firebase
    .app(functionsInstance.app.name)
    .functions(functionsInstance._customUrlOrRegion)
    .useEmulator(host, port);
}

/**
 * Returns a reference to the callable HTTPS trigger with the given name.
 * @param {Functions} functionsInstance A functions instance.
 * @param {string} name The name of the trigger.
 * @param {HttpsCallableOptions | undefined} options An interface for metadata about how calls should be executed.
 * @returns {HttpsCallable}
 */
export function httpsCallable(functionsInstance, name, options) {
  return firebase
    .app(functionsInstance.app.name)
    .functions(functionsInstance._customUrlOrRegion)
    .httpsCallable(name, options);
}

/**
 * Returns a reference to the callable HTTPS trigger with the specified url.
 * @param {Functions} functionsInstance A functions instance.
 * @param {string} url The url of the trigger.
 * @param {HttpsCallableOptions | undefined} options An instance of {@link HttpsCallableOptions} containing metadata about how calls should be executed.
 * @returns {HttpsCallable}
 */
export function httpsCallableFromUrl(functionsInstance, url, options) {
  return firebase
    .app(functionsInstance.app.name)
    .functions(functionsInstance._customUrlOrRegion)
    .httpsCallableFromUrl(url, options);
}

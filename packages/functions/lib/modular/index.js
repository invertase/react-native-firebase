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

import { firebase } from '..';

/**
 * Returns a Functions instance for the given app.
 * @param app - FirebaseApp. Optional.
 * @param regionOrCustomDomain - A String of the region or domain of the Firebase Function you wish to call. Optional.
 * @returns {Functions}
 */
export function getFunctions(app, regionOrCustomDomain) {
  return firebase.app(app.name).functions(regionOrCustomDomain);
}

/**
 * Returns nothing
 * @param functions - Functions instance
 * @param host - The domain host of the Functions emulator
 * @param port - The port of the Functions emulator
 * @returns {void}
 */
export function connectFunctionsEmulator(functions, host, port) {
  return firebase.app(functions.app.name).functions().useEmulator(host, port);
}

/**
 * Returns a HttpsCallable instance
 * @param functions - Functions instance
 * @param name - The name of the trigger
 * @param options - An HttpsCallableOptions object
 * @returns {HttpsCallable}
 */
export function httpsCallable(functions, name, options) {
  return firebase.app(functions.app.name).functions().httpsCallable(name, options);
}

/**
 * Returns a HttpsCallable instance
 * @param functions - Functions instance
 * @param url - The url of the trigger
 * @param options - An HttpsCallableOptions object
 * @returns {HttpsCallable}
 */
export function httpsCallableFromUrl(functions, url, options) {
  return firebase.app(functions.app.name).functions().httpsCallableFromUrl(url, options);
}

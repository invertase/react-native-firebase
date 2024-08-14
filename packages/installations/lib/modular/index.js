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
 * @typedef {import('..').FirebaseInstallationsTypes.Module} FirebaseInstallation
 */

export function getInstallations(app) {
  if (app) {
    return firebase.app(app.name).installations();
  }
  return firebase.app().installations();
}

/**
 * @param {FirebaseInstallation} installations
 * @returns {Promise<void>}
 */
export function deleteInstallations(installations) {
  return firebase.app(installations.app.name).installations().delete();
}

/**
 * @param {FirebaseInstallation} installations
 * @returns {Promise<string>}
 */
export function getId(installations) {
  return firebase.app(installations.app.name).installations().getId();
}

/**
 * @param {FirebaseInstallation} installations
 * @param {boolean | undefined} forceRefresh
 * @returns {Promise<string>}
 */
export function getToken(installations, forceRefresh) {
  return firebase.app(installations.app.name).installations().getToken(forceRefresh);
}

/**
 * @param {FirebaseInstallation} installations
 * @param {(string) => void} callback
 * @returns {() => void}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function onIdChange(installations, callback) {
  throw new Error('onIdChange() is unsupported by the React Native Firebase SDK.');
}

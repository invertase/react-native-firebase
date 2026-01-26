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

import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
/**
 * @typedef {import('..').FirebaseInstallationsTypes.Module} FirebaseInstallation
 */

export function getInstallations(app) {
  if (app) {
    return getApp(app.name).installations();
  }
  return getApp().installations();
}

/**
 * @param {FirebaseInstallation} installations
 * @returns {Promise<void>}
 */
export function deleteInstallations(installations) {
  return installations.delete.call(installations, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {FirebaseInstallation} installations
 * @returns {Promise<string>}
 */
export function getId(installations) {
  return installations.getId.call(installations, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {FirebaseInstallation} installations
 * @param {boolean | undefined} forceRefresh
 * @returns {Promise<string>}
 */
export function getToken(installations, forceRefresh) {
  return installations.getToken.call(installations, forceRefresh, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {FirebaseInstallation} installations
 * @param {(string) => void} callback
 * @returns {() => void}
 */
export function onIdChange(_installations, _callback) {
  throw new Error('onIdChange() is unsupported by the React Native Firebase SDK.');
}

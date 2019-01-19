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

import { NativeModules } from 'react-native';

import FirebaseApp from '../../FirebaseApp';

const APP_REGISTRY = {};
const DEFAULT_APP_NAME = '[DEFAULT]';

let initializedNativeApps = false;

/**
 *
 */
export function initializeNativeApps() {


  initializedNativeApps = true;
}

/**
 *
 * @param name
 */
export function getApp(name = DEFAULT_APP_NAME) {
  if (!initializedNativeApps) initializeNativeApps();
  // TODO
  const app = new FirebaseApp(name, {}, false, deleteApp.bind(null, name));
  return app;
}

/**
 *
 */
export function getApps() {
  // TODO
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
export function deleteApp() {
  // TODO
}

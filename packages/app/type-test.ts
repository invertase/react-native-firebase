/*
 *  Copyright (c) 2016-present Invertase Limited & Contributors
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this library except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {
  getApp,
  getApps,
  getUtils,
  initializeApp,
  SDK_VERSION,
  FilePath,
} from '.';
import type { ReactNativeFirebase } from '.';
import type { FirebaseError } from '@firebase/app';

// modular app accessors
console.log(getUtils().app.name);
console.log(getApp().name);
console.log(getApp('foo').name);

// checks statics exist
console.log(SDK_VERSION);
console.log(FilePath.CACHES_DIRECTORY);

// initialize app variants
initializeApp({ apiKey: 'a', appId: 'b', projectId: 'c' });
initializeApp({ apiKey: 'a', appId: 'b', projectId: 'c' }, 'foo');

// utils instance API
const modularUtils = getUtils();
console.log(modularUtils.isRunningInTestLab);
console.log(modularUtils.playServicesAvailability);
modularUtils.getPlayServicesStatus();
modularUtils.promptForPlayServices();
modularUtils.makePlayServicesAvailable();
modularUtils.resolutionForPlayServices();

// checks root exists
console.log(SDK_VERSION);
console.log(getApps().length);

// NativeFirebaseError is structurally assignable to FirebaseError for SDK callback parity
export type NativeFirebaseErrorAssignableToFirebaseError =
  ReactNativeFirebase.NativeFirebaseError extends FirebaseError ? true : false;

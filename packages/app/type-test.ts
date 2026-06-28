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

import firebase, { utils, getUtils, FilePath } from '.';

// checks module exists at root
console.log(firebase.utils().app.name);
console.log(utils().app.name);
console.log(getUtils().app.name);
console.log(firebase.app().name);
console.log(firebase.app('foo').name);

// checks module exists at app level
console.log(firebase.app().utils().app.name);
console.log(getUtils().app.name);

// checks statics exist
console.log(firebase.utils.SDK_VERSION);
console.log(utils.SDK_VERSION);
console.log(firebase.utils.FilePath.CACHES_DIRECTORY);
console.log(utils.FilePath.CACHES_DIRECTORY);
console.log(FilePath.CACHES_DIRECTORY);

console.log(firebase.utils.FilePath.CACHES_DIRECTORY);
console.log(utils.FilePath.CACHES_DIRECTORY);
console.log(FilePath.CACHES_DIRECTORY);

// initialize app variants
firebase.initializeApp({ apiKey: 'a', appId: 'b', projectId: 'c' });
firebase.initializeApp({ apiKey: 'a', appId: 'b', projectId: 'c' }, 'foo');

// utils instance API
const u = firebase.utils();
const modularUtils = getUtils();
console.log(u.isRunningInTestLab);
console.log(modularUtils.isRunningInTestLab);
console.log(u.playServicesAvailability);
console.log(modularUtils.playServicesAvailability);
u.getPlayServicesStatus();
modularUtils.getPlayServicesStatus();
u.promptForPlayServices();
modularUtils.promptForPlayServices();
u.makePlayServicesAvailable();
modularUtils.makePlayServicesAvailable();
u.resolutionForPlayServices();
modularUtils.resolutionForPlayServices();

// checks root exists
console.log(firebase.SDK_VERSION);

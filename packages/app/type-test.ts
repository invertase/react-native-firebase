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

import firebase, { utils } from '@react-native-firebase/app';

// checks module exists at root
console.log(firebase.utils().app.name);
console.log(utils().app.name);

// checks module exists at app level
console.log(firebase.app().utils().app.name);

// checks statics exist
console.log(firebase.utils.SDK_VERSION);
console.log(utils.SDK_VERSION);
console.log(firebase.utils.FilePath.CACHES_DIRECTORY);
console.log(utils.FilePath.CACHES_DIRECTORY);

console.log(firebase.utils.FilePath.CACHES_DIRECTORY);
console.log(utils.FilePath.CACHES_DIRECTORY);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
// console.log(firebase.utils(firebase.app()).app.name);

// checks default export supports app arg
// console.log(defaultExport(firebase.app()).app.name);

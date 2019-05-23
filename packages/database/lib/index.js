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
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import { isString, isUndefined, isValidPath } from '@react-native-firebase/common';

import version from './version';
import DatabaseStatics from './DatabaseStatics';
import DatabaseReference from './DatabaseReference';

const namespace = 'database';

const nativeModuleName = 'RNFBDatabaseModule';

class FirebaseDatabaseModule extends FirebaseModule {
  constructor(...args) {
    super(...args);
    this._serverTimeOffset = 0;
  }

  get _serverTime() {
    return new Date(Date.now() + this._serverTimeOffset);
  }

  ref(path = '/') {
    if (!isString(path)) {
      throw new Error(
        `firebase.app().database().ref(*) 'path' must be a string value.`,
      );
    }


    if (!isValidPath(path)) {
      throw new Error(
        `firebase.app().database().ref(*) 'path' can't contain ".", "#", "$", "[", or "]"`,
      );
    }

    return new DatabaseReference(this, path);
  }

  refFromURL() {
    // TODO Not supported?
  }

  goOnline() {
    // TODO Not supported?
  }

  goOffline() {
    // TODO Not supported?
  }
}

// import { SDK_VERSION } from '@react-native-firebase/database';
export const SDK_VERSION = version;

// import database from '@react-native-firebase/database';
// database().X(...);
export default createModuleNamespace({
  statics: DatabaseStatics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseDatabaseModule,
});

// import database, { firebase } from '@react-native-firebase/database';
// database().X(...);
// firebase.database().X(...);
export const firebase = getFirebaseRoot();

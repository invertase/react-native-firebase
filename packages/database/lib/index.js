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
import { isString, isValidPath } from '@react-native-firebase/common';

import version from './version';
import DatabaseStatics from './DatabaseStatics';
import DatabaseReference from './DatabaseReference';

const namespace = 'database';

const nativeModuleName = [
  'RNFBDatabaseModule',
  'RNFBDatabaseReferenceModule',
];

class FirebaseDatabaseModule extends FirebaseModule {
  constructor(app, config, databaseUrl) {
    super(app, config, databaseUrl);
    this._serverTimeOffset = 0;
    this._customUrlOrRegion = databaseUrl || this.app.options.databaseURL;
    // this._syncServerTimeOffset();
  }

  /**
   * Keep the server time offset in sync with the server time
   * @private
   */
  _syncServerTimeOffset() {
    this.ref('.info/serverTimeOffset').on('value', snapshot => {
      this._serverTimeOffset = snapshot.val() || this._serverTimeOffset;
    });
  }

  /**
   * Get the current server time, used to generate data such as database keys
   * @returns {Date}
   * @private
   */
  get _serverTime() {
    return new Date(Date.now() + this._serverTimeOffset);
  }

  /**
   * Returns a new Reference instance from a given path. Defaults to the root reference.
   * @param path
   * @returns {DatabaseReference}
   */
  ref(path = '/') {
    if (!isString(path)) {
      throw new Error(`firebase.app().database().ref(*) 'path' must be a string value.`);
    }

    if (!isValidPath(path)) {
      throw new Error(
        `firebase.app().database().ref(*) 'path' can't contain ".", "#", "$", "[", or "]"`,
      );
    }

    return new DatabaseReference(this, path);
  }

  /**
   * Generates a Reference from a database URL.
   * Note domain must be the same.
   * Any query parameters are stripped as per the web SDK.
   * @param url
   * @returns {DatabaseReference}
   */
  refFromURL(url) {
    if (!isString(url) || !url.startsWith('https://')) {
      throw new Error(
        `firebase.app().database().refFromURL(*) 'url' must be a valid database URL.`,
      );
    }

    if (!url.includes(this._customUrlOrRegion)) {
      throw new Error(
        `firebase.app().database().refFromURL(*) 'url' must be the same domain as the current instance (${
          this._customUrlOrRegion
        }). To use a different database domain, create a new Firebase instance.`,
      );
    }

    let path = url.replace(this._customUrlOrRegion, '');
    if (path.includes('?')) path = path.slice(0, path.indexOf('?'));

    return new DatabaseReference(this, path);
  }

  /**
   * goOnline
   */
  goOnline() {
    return this.native.goOnline();
  }

  /**
   * goOffline
   */
  goOffline() {
    return this.native.goOffline();
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
  hasCustomUrlOrRegionSupport: true,
  ModuleClass: FirebaseDatabaseModule,
});

// import database, { firebase } from '@react-native-firebase/database';
// database().X(...);
// firebase.database().X(...);
export const firebase = getFirebaseRoot();

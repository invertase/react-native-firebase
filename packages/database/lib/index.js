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

import { isBoolean, isNumber, isString } from '@react-native-firebase/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import DatabaseReference from './DatabaseReference';
import DatabaseStatics from './DatabaseStatics';
import DatabaseTransaction from './DatabaseTransaction';
import version from './version';

const namespace = 'database';

const nativeModuleName = [
  'RNFBDatabaseModule',
  'RNFBDatabaseReferenceModule',
  'RNFBDatabaseQueryModule',
  'RNFBDatabaseOnDisconnectModule',
  'RNFBDatabaseTransactionModule',
];

class FirebaseDatabaseModule extends FirebaseModule {
  constructor(app, config, databaseUrl) {
    super(app, config, databaseUrl);
    this._serverTimeOffset = 0;
    this._customUrlOrRegion = databaseUrl || this.app.options.databaseURL;
    this._transaction = new DatabaseTransaction(this);
    setTimeout(() => {
      this._syncServerTimeOffset();
    }, 100);
  }

  /**
   * Keep the server time offset in sync with the server time
   * @private
   */
  _syncServerTimeOffset() {
    this.ref('.info/serverTimeOffset').on('value', snapshot => {
      this._serverTimeOffset = snapshot.val();
    });
  }

  /**
   *
   * @returns {Date}
   * @private
   */
  getServerTime() {
    return new Date(Date.now() + this._serverTimeOffset);
  }

  /**
   * Returns a new Reference instance from a given path. Defaults to the root reference.
   * @param path
   * @returns {DatabaseReference}
   */
  ref(path = '/') {
    if (!isString(path)) {
      throw new Error("firebase.app().database().ref(*) 'path' must be a string value.");
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
        "firebase.app().database().refFromURL(*) 'url' must be a valid database URL.",
      );
    }

    if (!url.includes(this._customUrlOrRegion)) {
      throw new Error(
        `firebase.app().database().refFromURL(*) 'url' must be the same domain as the current instance (${this._customUrlOrRegion}). To use a different database domain, create a new Firebase instance.`,
      );
    }

    let path = url.replace(this._customUrlOrRegion, '');
    if (path.includes('?')) {
      path = path.slice(0, path.indexOf('?'));
    }

    return new DatabaseReference(this, path || '/');
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

  /**
   *
   * @param enabled
   */
  setPersistenceEnabled(enabled) {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.app().database().setPersistenceEnabled(*) 'enabled' must be a boolean value.",
      );
    }

    return this.native.setPersistenceEnabled(enabled);
  }

  /**
   *
   * @param enabled
   */
  setLoggingEnabled(enabled) {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.app().database().setLoggingEnabled(*) 'enabled' must be a boolean value.",
      );
    }

    return this.native.setLoggingEnabled(enabled);
  }

  /**
   *
   * @param bytes
   */
  setPersistenceCacheSizeBytes(bytes) {
    if (!isNumber(bytes)) {
      throw new Error(
        "firebase.app().database().setPersistenceCacheSizeBytes(*) 'bytes' must be a number value.",
      );
    }

    if (bytes < 1048576) {
      throw new Error(
        "firebase.app().database().setPersistenceCacheSizeBytes(*) 'bytes' must be greater than 1048576 bytes (1MB).",
      );
    }

    if (bytes > 104857600) {
      throw new Error(
        "firebase.app().database().setPersistenceCacheSizeBytes(*) 'bytes' must be less than 104857600 bytes (100MB).",
      );
    }

    return this.native.setPersistenceCacheSizeBytes(bytes);
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
  nativeEvents: ['database_transaction_event', 'database_sync_event'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  ModuleClass: FirebaseDatabaseModule,
});

// import database, { firebase } from '@react-native-firebase/database';
// database().X(...);
// firebase.database().X(...);
export const firebase = getFirebaseRoot();

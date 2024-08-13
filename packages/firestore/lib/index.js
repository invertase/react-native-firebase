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
  isBoolean,
  isFunction,
  isNumber,
  isObject,
  isString,
  isUndefined,
  isAndroid,
} from '@react-native-firebase/app/lib/common';
import { setReactNativeModule } from '@react-native-firebase/app/lib/internal/nativeModule';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import FirestoreCollectionReference from './FirestoreCollectionReference';
import FirestoreDocumentReference from './FirestoreDocumentReference';
import FirestorePath from './FirestorePath';
import FirestoreQuery from './FirestoreQuery';
import FirestoreQueryModifiers from './FirestoreQueryModifiers';
import FirestoreStatics from './FirestoreStatics';
import FirestoreTransactionHandler from './FirestoreTransactionHandler';
import FirestoreWriteBatch from './FirestoreWriteBatch';
import version from './version';
import fallBackModule from './web/RNFBFirestoreModule';
import FirestorePersistentCacheIndexManager from './FirestorePersistentCacheIndexManager';

const namespace = 'firestore';

const nativeModuleName = [
  'RNFBFirestoreModule',
  'RNFBFirestoreCollectionModule',
  'RNFBFirestoreDocumentModule',
  'RNFBFirestoreTransactionModule',
];

const nativeEvents = [
  'firestore_collection_sync_event',
  'firestore_document_sync_event',
  'firestore_transaction_event',
];

class FirebaseFirestoreModule extends FirebaseModule {
  constructor(app, config, databaseId) {
    super(app, config);
    if (isString(databaseId) || databaseId === undefined) {
      this._customUrlOrRegion = databaseId || '(default)';
    } else if (!isString(databaseId)) {
      throw new Error('firebase.app().firestore(*) database ID must be a string');
    }
    this._referencePath = new FirestorePath();
    this._transactionHandler = new FirestoreTransactionHandler(this);

    // Fan out native events
    this.emitter.addListener(this.eventNameForApp('firestore_collection_sync_event'), event => {
      this.emitter.emit(
        this.eventNameForApp(`firestore_collection_sync_event:${event.listenerId}`),
        event,
      );
    });

    this.emitter.addListener(this.eventNameForApp('firestore_document_sync_event'), event => {
      this.emitter.emit(
        this.eventNameForApp(`firestore_document_sync_event:${event.listenerId}`),
        event,
      );
    });

    this._settings = {
      ignoreUndefinedProperties: false,
      persistence: true,
    };
  }
  // We override the FirebaseModule's `eventNameForApp()` method to include the customUrlOrRegion
  eventNameForApp(...args) {
    return `${this.app.name}-${this._customUrlOrRegion}-${args.join('-')}`;
  }

  batch() {
    return new FirestoreWriteBatch(this);
  }

  loadBundle(bundle) {
    if (!isString(bundle)) {
      throw new Error("firebase.firestore().loadBundle(*) 'bundle' must be a string value.");
    }

    if (bundle === '') {
      throw new Error("firebase.firestore().loadBundle(*) 'bundle' must be a non-empty string.");
    }

    return this.native.loadBundle(bundle);
  }

  namedQuery(queryName) {
    if (!isString(queryName)) {
      throw new Error("firebase.firestore().namedQuery(*) 'queryName' must be a string value.");
    }

    if (queryName === '') {
      throw new Error("firebase.firestore().namedQuery(*) 'queryName' must be a non-empty string.");
    }

    return new FirestoreQuery(this, this._referencePath, new FirestoreQueryModifiers(), queryName);
  }

  async clearPersistence() {
    await this.native.clearPersistence();
  }

  async waitForPendingWrites() {
    await this.native.waitForPendingWrites();
  }

  async terminate() {
    await this.native.terminate();
  }

  useEmulator(host, port) {
    if (!host || !isString(host) || !port || !isNumber(port)) {
      throw new Error('firebase.firestore().useEmulator() takes a non-empty host and port');
    }
    let _host = host;
    const androidBypassEmulatorUrlRemap =
      typeof this.firebaseJson.android_bypass_emulator_url_remap === 'boolean' &&
      this.firebaseJson.android_bypass_emulator_url_remap;
    if (!androidBypassEmulatorUrlRemap && isAndroid && _host) {
      if (_host === 'localhost' || _host === '127.0.0.1') {
        _host = '10.0.2.2';
        // eslint-disable-next-line no-console
        console.log(
          'Mapping firestore host to "10.0.2.2" for android emulators. Use real IP on real devices. You can bypass this behaviour with "android_bypass_emulator_url_remap" flag.',
        );
      }
    }
    this.native.useEmulator(_host, port);
    return [_host, port]; // undocumented return, just used to unit test android host remapping
  }

  collection(collectionPath) {
    if (!isString(collectionPath)) {
      throw new Error(
        "firebase.firestore().collection(*) 'collectionPath' must be a string value.",
      );
    }

    if (collectionPath === '') {
      throw new Error(
        "firebase.firestore().collection(*) 'collectionPath' must be a non-empty string.",
      );
    }

    const path = this._referencePath.child(collectionPath);

    if (!path.isCollection) {
      throw new Error(
        "firebase.firestore().collection(*) 'collectionPath' must point to a collection.",
      );
    }

    return new FirestoreCollectionReference(this, path);
  }

  collectionGroup(collectionId) {
    if (!isString(collectionId)) {
      throw new Error(
        "firebase.firestore().collectionGroup(*) 'collectionId' must be a string value.",
      );
    }

    if (collectionId === '') {
      throw new Error(
        "firebase.firestore().collectionGroup(*) 'collectionId' must be a non-empty string.",
      );
    }

    if (collectionId.indexOf('/') >= 0) {
      throw new Error(
        "firebase.firestore().collectionGroup(*) 'collectionId' must not contain '/'.",
      );
    }

    return new FirestoreQuery(
      this,
      this._referencePath.child(collectionId),
      new FirestoreQueryModifiers().asCollectionGroupQuery(),
      undefined,
    );
  }

  async disableNetwork() {
    await this.native.disableNetwork();
  }

  doc(documentPath) {
    if (!isString(documentPath)) {
      throw new Error("firebase.firestore().doc(*) 'documentPath' must be a string value.");
    }

    if (documentPath === '') {
      throw new Error("firebase.firestore().doc(*) 'documentPath' must be a non-empty string.");
    }

    const path = this._referencePath.child(documentPath);

    if (!path.isDocument) {
      throw new Error("firebase.firestore().doc(*) 'documentPath' must point to a document.");
    }

    return new FirestoreDocumentReference(this, path);
  }

  async enableNetwork() {
    await this.native.enableNetwork();
  }

  runTransaction(updateFunction) {
    if (!isFunction(updateFunction)) {
      return Promise.reject(
        new Error("firebase.firestore().runTransaction(*) 'updateFunction' must be a function."),
      );
    }

    return this._transactionHandler._add(updateFunction);
  }

  settings(settings) {
    if (!isObject(settings)) {
      return Promise.reject(
        new Error("firebase.firestore().settings(*) 'settings' must be an object."),
      );
    }

    const keys = Object.keys(settings);

    const opts = [
      'cacheSizeBytes',
      'host',
      'persistence',
      'ssl',
      'ignoreUndefinedProperties',
      'serverTimestampBehavior',
    ];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!opts.includes(key)) {
        return Promise.reject(
          new Error(
            `firebase.firestore().settings(*) 'settings.${key}' is not a valid settings field.`,
          ),
        );
      }
    }

    if (!isUndefined(settings.cacheSizeBytes)) {
      if (!isNumber(settings.cacheSizeBytes)) {
        return Promise.reject(
          new Error(
            "firebase.firestore().settings(*) 'settings.cacheSizeBytes' must be a number value.",
          ),
        );
      }

      if (
        settings.cacheSizeBytes !== FirestoreStatics.CACHE_SIZE_UNLIMITED &&
        settings.cacheSizeBytes < 1048576 // 1MB
      ) {
        return Promise.reject(
          new Error(
            "firebase.firestore().settings(*) 'settings.cacheSizeBytes' the minimum cache size is 1048576 bytes (1MB).",
          ),
        );
      }
    }

    if (!isUndefined(settings.host)) {
      // eslint-disable-next-line no-console
      console.warn(
        'host in settings to connect with firestore emulator is deprecated. Use useEmulator instead.',
      );
      if (!isString(settings.host)) {
        return Promise.reject(
          new Error("firebase.firestore().settings(*) 'settings.host' must be a string value."),
        );
      }

      if (settings.host === '') {
        return Promise.reject(
          new Error(
            "firebase.firestore().settings(*) 'settings.host' must not be an empty string.",
          ),
        );
      }

      if (isAndroid) {
        if (settings.host.startsWith('localhost')) {
          settings.host = settings.host.replace('localhost', '10.0.2.2');
          // eslint-disable-next-line no-console
          console.log(
            'Mapping firestore host "localhost" to "10.0.2.2" for android emulators. Use real IP on real devices.',
          );
        }
        if (settings.host.startsWith('127.0.0.1')) {
          settings.host = settings.host.replace('127.0.0.1', '10.0.2.2');
          // eslint-disable-next-line no-console
          console.log(
            'Mapping firestore host "127.0.0.1" to "10.0.2.2" for android emulators. Use real IP on real devices.',
          );
        }
      }
    }

    if (!isUndefined(settings.persistence) && !isBoolean(settings.persistence)) {
      return Promise.reject(
        new Error(
          "firebase.firestore().settings(*) 'settings.persistence' must be a boolean value.",
        ),
      );
    }

    if (!isUndefined(settings.ssl) && !isBoolean(settings.ssl)) {
      throw new Error("firebase.firestore().settings(*) 'settings.ssl' must be a boolean value.");
    }

    if (
      !isUndefined(settings.serverTimestampBehavior) &&
      !['estimate', 'previous', 'none'].includes(settings.serverTimestampBehavior)
    ) {
      return Promise.reject(
        new Error(
          "firebase.firestore().settings(*) 'settings.serverTimestampBehavior' must be one of 'estimate', 'previous', 'none'.",
        ),
      );
    }

    if (!isUndefined(settings.ignoreUndefinedProperties)) {
      if (!isBoolean(settings.ignoreUndefinedProperties)) {
        return Promise.reject(
          new Error(
            "firebase.firestore().settings(*) 'settings.ignoreUndefinedProperties' must be a boolean value.",
          ),
        );
      } else {
        this._settings.ignoreUndefinedProperties = settings.ignoreUndefinedProperties;
      }

      delete settings.ignoreUndefinedProperties;
    }

    if (settings.persistence === false) {
      // Required for persistentCacheIndexManager(), if this setting is `false`, it returns `null`
      this._settings.persistence = false;
    }

    return this.native.settings(settings);
  }

  persistentCacheIndexManager() {
    if (this._settings.persistence === false) {
      return null;
    }
    return new FirestorePersistentCacheIndexManager(this);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/firestore';
export const SDK_VERSION = version;

export * from './modular';

// import firestore from '@react-native-firebase/firestore';
// firestore().X(...);
export default createModuleNamespace({
  statics: FirestoreStatics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  ModuleClass: FirebaseFirestoreModule,
});

// import firestore, { firebase } from '@react-native-firebase/firestore';
// firestore().X(...);
// firebase.firestore().X(...);
export const firebase = getFirebaseRoot();

// Register the interop module for non-native platforms.
for (let i = 0; i < nativeModuleName.length; i++) {
  setReactNativeModule(nativeModuleName[i], fallBackModule);
}

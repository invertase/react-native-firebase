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
  constructor(app, config) {
    super(app, config);
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
  }

  batch() {
    return new FirestoreWriteBatch(this);
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
      throw new Error(
        "firebase.firestore().runTransaction(*) 'updateFunction' must be a function.",
      );
    }

    return this._transactionHandler._add(updateFunction);
  }

  settings(settings) {
    if (!isObject(settings)) {
      throw new Error("firebase.firestore().settings(*) 'settings' must be an object.");
    }

    const keys = Object.keys(settings);

    const opts = ['cacheSizeBytes', 'host', 'persistence', 'ssl'];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!opts.includes(key)) {
        throw new Error(
          `firebase.firestore().settings(*) 'settings.${key}' is not a valid settings field.`,
        );
      }
    }

    if (!isUndefined(settings.cacheSizeBytes)) {
      if (!isNumber(settings.cacheSizeBytes)) {
        throw new Error(
          "firebase.firestore().settings(*) 'settings.cacheSizeBytes' must be a number value.",
        );
      }

      if (
        settings.cacheSizeBytes !== FirestoreStatics.CACHE_SIZE_UNLIMITED &&
        settings.cacheSizeBytes < 1048576 // 1MB
      ) {
        throw new Error(
          "firebase.firestore().settings(*) 'settings.cacheSizeBytes' the minimum cache size is 1048576 bytes (1MB).",
        );
      }
    }

    if (!isUndefined(settings.host)) {
      if (!isString(settings.host)) {
        throw new Error("firebase.firestore().settings(*) 'settings.host' must be a string value.");
      }

      if (settings.host === '') {
        throw new Error(
          "firebase.firestore().settings(*) 'settings.host' must not be an empty string.",
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
      throw new Error(
        "firebase.firestore().settings(*) 'settings.persistence' must be a boolean value.",
      );
    }

    if (!isUndefined(settings.ssl) && !isBoolean(settings.ssl)) {
      throw new Error("firebase.firestore().settings(*) 'settings.ssl' must be a boolean value.");
    }

    return this.native.settings(settings);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/firestore';
export const SDK_VERSION = version;

// import firestore from '@react-native-firebase/firestore';
// firestore().X(...);
export default createModuleNamespace({
  statics: FirestoreStatics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseFirestoreModule,
});

// import firestore, { firebase } from '@react-native-firebase/firestore';
// firestore().X(...);
// firebase.firestore().X(...);
export const firebase = getFirebaseRoot();

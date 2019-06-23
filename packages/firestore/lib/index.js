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
import {
  isBoolean,
  isFunction,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from '@react-native-firebase/common';

import version from './version';
import FirestoreStatics from './FirestoreStatics';
import FirestorePath from './FirestorePath';
import FirestoreCollectionReference from './FirestoreCollectionReference';
import FirestoreDocumentReference from './FirestoreDocumentReference';
import FirestoreQuery from './FirestoreQuery';
import FirestoreQueryModifiers from './FirestoreQueryModifiers';
import FirestoreWriteBatch from './FirestoreWriteBatch';

const namespace = 'firestore';

const nativeModuleName = ['RNFBFirestoreModule', 'RNFBFirestoreCollectionModule'];

class FirebaseFirestoreModule extends FirebaseModule {
  constructor(app, config) {
    super(app, config);
    this._referencePath = new FirestorePath();
  }

  batch() {
    return new FirestoreWriteBatch(this);
  }

  clearPersistence() {
    // TODO not in v5
    // Not available in native SDK?
  }

  collection(collectionPath) {
    if (!isString(collectionPath)) {
      throw new Error(
        `firebase.app().firestore().collection(*) 'collectionPath' must be a string value.`,
      );
    }

    if (collectionPath === '') {
      throw new Error(
        `firebase.app().firestore().collection(*) 'collectionPath' must be a non-empty string.`,
      );
    }

    const path = this._referencePath.child(collectionPath);

    if (!path.isCollection) {
      throw new Error(
        `firebase.app().firestore().collection(*) 'collectionPath' must point to a collection.`,
      );
    }

    return new FirestoreCollectionReference(this, path);
  }

  collectionGroup(collectionId) {
    if (!isString(collectionId)) {
      throw new Error(
        `firebase.app().firestore().collectionGroup(*) 'collectionId' must be a string value.`,
      );
    }

    if (collectionId === '') {
      throw new Error(
        `firebase.app().firestore().collectionGroup(*) 'collectionId' must be a non-empty string.`,
      );
    }

    if (collectionId.indexOf('/') >= 0) {
      throw new Error(
        `firebase.app().firestore().collectionGroup(*) 'collectionId' must not contain '/'.`,
      );
    }

    // todo validate string (no slashes)

    return new FirestoreQuery(
      this,
      this._referencePath.child(collectionId),
      new FirestoreQueryModifiers().asCollectionGroup(),
    );
  }

  disableNetwork() {
    return this.native.disableNetwork();
  }

  doc(documentPath) {
    if (!isString(documentPath)) {
      throw new Error(`firebase.app().firestore().doc(*) 'documentPath' must be a string value.`);
    }

    if (documentPath === '') {
      throw new Error(
        `firebase.app().firestore().doc(*) 'documentPath' must be a non-empty string.`,
      );
    }

    const path = this._referencePath.child(documentPath);

    if (!path.isDocument) {
      throw new Error(`firebase.app().firestore().doc(*) 'documentPath' must point to a document.`);
    }

    return new FirestoreDocumentReference(this, path);
  }

  enableNetwork() {
    return this.native.enableNetwork();
  }

  enablePersistence() {
    // TODO? Covered in settings
    // Not in native
  }

  runTransaction(updateFunction) {
    if (!isFunction(updateFunction)) {
      throw new Error(
        `firebase.app().firestore().runTransaction(*) 'updateFunction' must point to a function.`,
      );
    }

    // TODO
  }

  settings(settings) {
    if (!isObject(settings)) {
      throw new Error(`firebase.app().firestore().settings(*) 'settings' must be an object.`);
    }

    const keys = Object.keys(settings);

    if (keys.length === 0) {
      throw new Error(
        `firebase.app().firestore().settings(*) 'settings' must not be an empty object.`,
      );
    }

    const opts = ['cacheSizeBytes', 'host', 'persistence', 'ssl'];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!opts.includes(key)) {
        throw new Error(
          `firebase.app().firestore().settings(*) 'settings.${key}' is not a valid settings field.`,
        );
      }
    }

    if (!isUndefined(settings.cacheSizeBytes)) {
      if (!isNumber(settings.cacheSizeBytes)) {
        throw new Error(
          `firebase.app().firestore().settings(*) 'settings.cacheSizeBytes' must be a number value.`,
        );
      }

      if (
        settings.cacheSizeBytes !== FirestoreStatics.CACHE_SIZE_UNLIMITED &&
        settings.cacheSizeBytes < 1048576 // 1MB
      ) {
        throw new Error(
          `firebase.app().firestore().settings(*) 'settings.cacheSizeBytes' the minimum cache size is 1048576 bytes (1MB).`,
        );
      }
    }

    if (!isUndefined(settings.host)) {
      if (!isString(settings.host)) {
        throw new Error(
          `firebase.app().firestore().settings(*) 'settings.host' must be a string value.`,
        );
      }

      if (settings.host === '') {
        throw new Error(
          `firebase.app().firestore().settings(*) 'settings.host' must not be an empty string.`,
        );
      }
    }

    if (!isUndefined(settings.persistence) && !isBoolean(settings.persistence)) {
      throw new Error(
        `firebase.app().firestore().settings(*) 'settings.persistence' must be a boolean value.`,
      );
    }

    if (!isUndefined(settings.ssl) && !isBoolean(settings.ssl)) {
      throw new Error(
        `firebase.app().firestore().settings(*) 'settings.ssl' must be a boolean value.`,
      );
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
  nativeEvents: false,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseFirestoreModule,
});

// import firestore, { firebase } from '@react-native-firebase/firestore';
// firestore().X(...);
// firebase.firestore().X(...);
export const firebase = getFirebaseRoot();

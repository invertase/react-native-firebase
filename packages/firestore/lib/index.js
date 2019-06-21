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
import { isFunction, isString } from '@react-native-firebase/common';

import version from './version';
import FirestorePath from './FirestorePath';
import FirestoreDocumentReference from './FirestoreDocumentReference';

const statics = {};

const namespace = 'firestore';

const nativeModuleName = 'RNFBFirestoreModule';

class FirebaseFirestoreModule extends FirebaseModule {
  constructor(app, config) {
    super(app, config);
    this._referencePath = new FirestorePath();
  }

  batch() {
    // TODO
  }

  clearPersistence() {
    // TODO not in v5
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

    // TODO
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
    // TODO?
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
    // TODO
  }
}

// import { SDK_VERSION } from '@react-native-firebase/firestore';
export const SDK_VERSION = version;

// import firestore from '@react-native-firebase/firestore';
// firestore().X(...);
export default createModuleNamespace({
  statics,
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

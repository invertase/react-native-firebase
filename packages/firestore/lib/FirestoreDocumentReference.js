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

import FirestoreCollectionReference from "./FirestoreCollectionReference";
import {isObject, isString, isUndefined} from "@react-native-firebase/common";

export default class FirestoreDocumentReference {
  constructor(firestore, documentPath) {
    this._firestore = firestore;
    this._documentPath = documentPath;
  }

  get firestore() {
    return this._firestore;
  }

  get id() {
    return this._documentPath.id;
  }

  get parent() {
    const parentPath = this._documentPath.parent();
    // TODO circular ref?
    return new FirestoreCollectionReference(this._firestore, parentPath);
  }

  get path() {
    return this._documentPath.relativeName;
  }

  collection(collectionPath) {
    if (!isString(collectionPath)) {
      throw new Error(`firebase.app()...firestore().collection(*) 'collectionPath' must be a string value.`);
    }

    if (collectionPath === '') {
      throw new Error(
        `firebase.app().firestore()...doc().collection(*) 'collectionPath' must be a non-empty string.`,
      );
    }

    const path = this._documentPath.child(collectionPath);

    if (!path.isCollection) {
      throw new Error(
        `firebase.app().firestore()...doc().collection(*) 'collectionPath' must point to a collection.`,
      );
    }

    return new FirestoreCollectionReference(this, path);
  }

  delete() {
    // TODO
  }

  get(options) {
    if (!isUndefined(options) && isObject(options)) {
      throw new Error(
        `firebase.app().firestore()...doc().get(*) 'options' must point to an object is provided.`,
      );
    }

    // TODO validate options
    // TODO native via documentGet
  }

  isEqual(other) {
    // TODO (private to string method?)
  }

  onSnapshot(observer) {
    // TODO
  }

  set(data, options) {

  }

  update() {

  }
}

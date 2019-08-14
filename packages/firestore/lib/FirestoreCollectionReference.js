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

import { generateFirestoreId, isObject } from '@react-native-firebase/app/lib/common';
import FirestoreDocumentReference, {
  provideCollectionReferenceClass,
} from './FirestoreDocumentReference';
import FirestoreQuery from './FirestoreQuery';
import FirestoreQueryModifiers from './FirestoreQueryModifiers';

export default class FirestoreCollectionReference extends FirestoreQuery {
  constructor(firestore, collectionPath) {
    super(firestore, collectionPath, new FirestoreQueryModifiers());
  }

  get id() {
    return this._collectionPath.id;
  }

  get parent() {
    const parent = this._collectionPath.parent();
    if (!parent) {
      return null;
    }
    return new FirestoreDocumentReference(this._firestore, parent);
  }

  get path() {
    return this._collectionPath.relativeName;
  }

  add(data) {
    if (!isObject(data)) {
      throw new Error("firebase.firestore().collection().add(*) 'data' must be an object.");
    }

    const documentRef = this.doc();
    return documentRef.set(data).then(() => Promise.resolve(documentRef));
  }

  doc(documentPath) {
    const newPath = documentPath || generateFirestoreId();
    const path = this._collectionPath.child(newPath);

    if (!path.isDocument) {
      throw new Error(
        "firebase.firestore().collection().doc(*) 'documentPath' must point to a document.",
      );
    }

    return new FirestoreDocumentReference(this._firestore, path);
  }
}

// To avoid React Native require cycle warnings
provideCollectionReferenceClass(FirestoreCollectionReference);

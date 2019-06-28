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

import { isFunction } from '@react-native-firebase/common';
import FirestoreDocumentChange from './FirestoreDocumentChange';
import FirestoreDocumentSnapshot from './FirestoreDocumentSnapshot';
import FirestoreSnapshotMetadata from './FirestoreSnapshotMetadata';

export default class FirestoreQuerySnapshot {
  constructor(firestore, query, nativeData) {
    this._query = query;
    this._changes = nativeData.changes.map($ => new FirestoreDocumentChange(firestore, $));
    this._docs = nativeData.documents.map($ => new FirestoreDocumentSnapshot(firestore, $));
    this._metadata = new FirestoreSnapshotMetadata(nativeData.metadata);
  }

  get docs() {
    return this._docs;
  }

  get empty() {
    return this._docs.length === 0;
  }

  get metadata() {
    return this._metadata;
  }

  get query() {
    return this._query;
  }

  get size() {
    return this._docs.length;
  }

  docChanges(options) {
    // TODO validate
    // TODO use options
    return this._changes;
  }

  forEach(callback, thisArg) {
    if (!isFunction(callback)) {
      throw new Error(
        `firebase.app().firestore() QuerySnapshot.forEach(*) 'callback' expected a function.`,
      );
    }

    const cb = thisArg ? callback.bind(thisArg) : callback;

    for (let i = 0; i < this._docs.length; i++) {
      cb(this._docs[i], i);
    }
  }

  isEqual(other) {
    // TODO validate
    return false;
  }
}

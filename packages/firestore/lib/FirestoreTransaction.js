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

import { isObject } from '@react-native-firebase/app/lib/common';
import FirestoreDocumentReference from './FirestoreDocumentReference';
import FirestoreDocumentSnapshot from './FirestoreDocumentSnapshot';
import { parseSetOptions, parseUpdateArgs } from './utils';
import { buildNativeMap } from './utils/serialize';

export default class FirestoreTransaction {
  constructor(firestore, meta) {
    this._firestore = firestore;
    this._meta = meta;
  }

  /**
   * Clears the command buffer and any pending result in prep for
   * the next transaction iteration attempt.
   *
   * @private
   */
  _prepare() {
    this._calledGetCount = 0;
    this._commandBuffer = [];
    this._pendingResult = undefined;
  }

  /**
   * Reads the document referenced by the provided DocumentReference.
   */
  get(documentRef) {
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        "firebase.firestore().runTransaction() Transaction.get(*) 'documentRef' expected a DocumentReference.",
      );
    }

    this._calledGetCount++;
    return this._firestore.native
      .transactionGetDocument(this._meta.id, documentRef.path)
      .then(data => new FirestoreDocumentSnapshot(this._firestore, data));
  }

  /**
   * Writes to the document referred to by the provided DocumentReference.
   * If the document does not exist yet, it will be created. If you pass options,
   * the provided data can be merged into the existing document.
   */
  set(documentRef, data, options) {
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        "firebase.firestore().runTransaction() Transaction.set(*) 'documentRef' expected a DocumentReference.",
      );
    }

    if (!isObject(data)) {
      throw new Error(
        "firebase.firestore().runTransaction() Transaction.set(_, *) 'data' must be an object..",
      );
    }

    let setOptions;
    try {
      setOptions = parseSetOptions(options);
    } catch (e) {
      throw new Error(
        `firebase.firestore().runTransaction() Transaction.set(_, _, *) ${e.message}.`,
      );
    }

    this._commandBuffer.push({
      type: 'SET',
      path: documentRef.path,
      data: buildNativeMap(data),
      options: setOptions,
    });

    return this;
  }

  update(documentRef, ...args) {
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        "firebase.firestore().runTransaction() Transaction.update(*) 'documentRef' expected a DocumentReference.",
      );
    }

    let data;
    try {
      data = parseUpdateArgs(args);
    } catch (e) {
      throw new Error(
        `firebase.firestore().runTransaction() Transaction.update(_, *) ${e.message}`,
      );
    }

    this._commandBuffer.push({
      type: 'UPDATE',
      path: documentRef.path,
      data: buildNativeMap(data),
    });

    return this;
  }

  delete(documentRef) {
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        "firebase.firestore().runTransaction() Transaction.delete(*) 'documentRef' expected a DocumentReference.",
      );
    }

    this._commandBuffer.push({
      type: 'DELETE',
      path: documentRef.path,
    });

    return this;
  }
}

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
import { parseSetOptions, parseUpdateArgs } from './utils';
import { buildNativeMap } from './utils/serialize';

export default class FirestoreWriteBatch {
  constructor(firestore) {
    this._firestore = firestore;
    this._writes = [];
    this._committed = false;
  }

  _verifyNotCommitted(method) {
    if (this._committed) {
      throw new Error(
        `firebase.firestore.batch().${method}(*) A write batch can no longer be used after commit() has been called.`,
      );
    }
  }

  commit() {
    this._verifyNotCommitted('commit');
    this._committed = true;
    if (this._writes.length === 0) {
      return Promise.resolve();
    }
    return this._firestore.native.documentBatch(this._writes);
  }

  delete(documentRef) {
    this._verifyNotCommitted('delete');
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        "firebase.firestore.batch().delete(*) 'documentRef' expected instance of a DocumentReference.",
      );
    }

    if (documentRef.firestore.app !== this._firestore.app) {
      throw new Error(
        "firebase.firestore.batch().delete(*) 'documentRef' provided DocumentReference is from a different Firestore instance.",
      );
    }

    this._writes.push({
      path: documentRef.path,
      type: 'DELETE',
    });

    return this;
  }

  set(documentRef, data, options) {
    this._verifyNotCommitted('set');
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        "firebase.firestore.batch().set(*) 'documentRef' expected instance of a DocumentReference.",
      );
    }

    if (documentRef.firestore.app !== this._firestore.app) {
      throw new Error(
        "firebase.firestore.batch().set(*) 'documentRef' provided DocumentReference is from a different Firestore instance.",
      );
    }

    if (!isObject(data)) {
      throw new Error("firebase.firestore.batch().set(_, *) 'data' must be an object.");
    }

    let setOptions;
    try {
      setOptions = parseSetOptions(options);
    } catch (e) {
      throw new Error(`firebase.firestore().doc().set(_, *) ${e.message}.`);
    }

    this._writes.push({
      path: documentRef.path,
      type: 'SET',
      data: buildNativeMap(data, this._firestore._settings.ignoreUndefinedProperties),
      options: setOptions,
    });

    return this;
  }

  update(documentRef, ...args) {
    this._verifyNotCommitted('update');
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        "firebase.firestore.batch().update(*) 'documentRef' expected instance of a DocumentReference.",
      );
    }

    if (documentRef.firestore.app !== this._firestore.app) {
      throw new Error(
        "firebase.firestore.batch().update(*) 'documentRef' provided DocumentReference is from a different Firestore instance.",
      );
    }

    if (args.length === 0) {
      throw new Error(
        'firebase.firestore.batch().update(_, *) Invalid arguments. Expected update object or list of key/value pairs.',
      );
    }

    let data;
    try {
      data = parseUpdateArgs(args);
    } catch (e) {
      throw new Error(`firebase.firestore().batch().update(_, *) ${e.message}`);
    }

    this._writes.push({
      path: documentRef.path,
      type: 'UPDATE',
      data: buildNativeMap(data, this._firestore._settings.ignoreUndefinedProperties),
    });

    return this;
  }
}

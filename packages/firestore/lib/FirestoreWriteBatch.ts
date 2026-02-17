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

import { isObject } from '@react-native-firebase/app/dist/module/common';
import FirestoreDocumentReference from './FirestoreDocumentReference';
import { parseSetOptions, parseUpdateArgs, applyFirestoreDataConverter } from './utils';
import { buildNativeMap } from './utils/serialize';

export interface BatchWrite {
  path: string;
  type: 'DELETE' | 'SET' | 'UPDATE';
  data?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

export default class FirestoreWriteBatch {
  _firestore: any;
  _writes: BatchWrite[];
  _committed: boolean;

  constructor(firestore: any) {
    this._firestore = firestore;
    this._writes = [];
    this._committed = false;
  }

  _verifyNotCommitted(method: string): void {
    if (this._committed) {
      throw new Error(
        `firebase.firestore.batch().${method}(*) A write batch can no longer be used after commit() has been called.`,
      );
    }
  }

  commit(): Promise<void> {
    this._verifyNotCommitted('commit');
    this._committed = true;
    if (this._writes.length === 0) {
      return Promise.resolve();
    }
    return this._firestore.native.documentBatch(this._writes);
  }

  delete(documentRef: FirestoreDocumentReference): this {
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

  set(
    documentRef: FirestoreDocumentReference,
    data: Record<string, unknown>,
    options?: unknown,
  ): this {
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

    let setOptions: Record<string, unknown>;
    try {
      setOptions = parseSetOptions(options);
    } catch (e) {
      throw new Error(`firebase.firestore().batch().set(_, *) ${(e as Error).message}.`);
    }

    let converted: unknown = data;
    try {
      converted = applyFirestoreDataConverter(data, (documentRef as any)._converter, setOptions);
    } catch (e) {
      throw new Error(
        `firebase.firestore().batch().set(_, *) 'withConverter.toFirestore' threw an error: ${(e as Error).message}.`,
      );
    }

    if (!isObject(converted)) {
      throw new Error("firebase.firestore.batch().set(_, *) 'data' must be an object.");
    }

    this._writes.push({
      path: documentRef.path,
      type: 'SET',
      data: buildNativeMap(converted, this._firestore._settings.ignoreUndefinedProperties),
      options: setOptions,
    });

    return this;
  }

  update(documentRef: FirestoreDocumentReference, ...args: unknown[]): this {
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

    let data: Record<string, unknown>;
    try {
      data = parseUpdateArgs(args);
    } catch (e) {
      throw new Error(`firebase.firestore.batch().update(_, *) ${(e as Error).message}`);
    }

    this._writes.push({
      path: documentRef.path,
      type: 'UPDATE',
      data: buildNativeMap(data, this._firestore._settings.ignoreUndefinedProperties),
    });

    return this;
  }
}

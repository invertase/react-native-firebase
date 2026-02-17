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

import { isObject, createDeprecationProxy } from '@react-native-firebase/app/dist/module/common';
import FirestoreDocumentReference from './FirestoreDocumentReference';
import FirestoreDocumentSnapshot from './FirestoreDocumentSnapshot';
import { parseSetOptions, parseUpdateArgs, applyFirestoreDataConverter } from './utils';
import { buildNativeMap } from './utils/serialize';

export interface TransactionMeta {
  id: number;
  updateFunction: (transaction: FirestoreTransaction) => Promise<unknown>;
  stack?: string;
  resolve?: (result: unknown) => void;
  reject?: (error: unknown) => void;
}

export interface TransactionCommand {
  type: 'SET' | 'UPDATE' | 'DELETE';
  path: string;
  data?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

export default class FirestoreTransaction {
  _firestore: any;
  _meta: TransactionMeta;
  _calledGetCount: number;
  _commandBuffer: TransactionCommand[];
  _pendingResult: unknown;

  constructor(firestore: any, meta: TransactionMeta) {
    this._firestore = firestore;
    this._meta = meta;
    this._calledGetCount = 0;
    this._commandBuffer = [];
    this._pendingResult = undefined;
  }

  /**
   * Clears the command buffer and any pending result in prep for
   * the next transaction iteration attempt.
   */
  _prepare(): void {
    this._calledGetCount = 0;
    this._commandBuffer = [];
    this._pendingResult = undefined;
  }

  /**
   * Reads the document referenced by the provided DocumentReference.
   */
  get(documentRef: FirestoreDocumentReference): Promise<FirestoreDocumentSnapshot> {
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        "firebase.firestore().runTransaction() Transaction.get(*) 'documentRef' expected a DocumentReference.",
      );
    }

    this._calledGetCount++;
    return this._firestore.native
      .transactionGetDocument(this._meta.id, documentRef.path)
      .then((data: any) =>
        createDeprecationProxy(new FirestoreDocumentSnapshot(this._firestore, data, null)),
      );
  }

  /**
   * Writes to the document referred to by the provided DocumentReference.
   */
  set(
    documentRef: FirestoreDocumentReference,
    data: Record<string, unknown>,
    options?: unknown,
  ): this {
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        "firebase.firestore().runTransaction() Transaction.set(*) 'documentRef' expected a DocumentReference.",
      );
    }

    let setOptions: Record<string, unknown>;
    try {
      setOptions = parseSetOptions(options);
    } catch (e) {
      throw new Error(
        `firebase.firestore().runTransaction() Transaction.set(_, _, *) ${(e as Error).message}.`,
      );
    }

    let converted: unknown = data;
    try {
      converted = applyFirestoreDataConverter(data, (documentRef as any)._converter, setOptions);
    } catch (e) {
      throw new Error(
        `firebase.firestore().runTransaction() Transaction.set(_, *) 'withConverter.toFirestore' threw an error: ${(e as Error).message}.`,
      );
    }

    if (!isObject(converted)) {
      throw new Error(
        "firebase.firestore().runTransaction() Transaction.set(_, *) 'data' must be an object..",
      );
    }

    this._commandBuffer.push({
      type: 'SET',
      path: documentRef.path,
      data: buildNativeMap(converted, this._firestore._settings.ignoreUndefinedProperties),
      options: setOptions,
    });

    return this;
  }

  update(documentRef: FirestoreDocumentReference, ...args: unknown[]): this {
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        "firebase.firestore().runTransaction() Transaction.update(*) 'documentRef' expected a DocumentReference.",
      );
    }

    let data: Record<string, unknown>;
    try {
      data = parseUpdateArgs(args);
    } catch (e) {
      throw new Error(
        `firebase.firestore().runTransaction() Transaction.update(_, *) ${(e as Error).message}`,
      );
    }

    this._commandBuffer.push({
      type: 'UPDATE',
      path: documentRef.path,
      data: buildNativeMap(data, this._firestore._settings.ignoreUndefinedProperties),
    });

    return this;
  }

  delete(documentRef: FirestoreDocumentReference): this {
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

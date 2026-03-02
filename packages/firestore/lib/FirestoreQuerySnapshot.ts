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
  createDeprecationProxy,
  isBoolean,
  isFunction,
  isObject,
  isUndefined,
} from '@react-native-firebase/app/dist/module/common';
import DocumentChange from './FirestoreDocumentChange';
import DocumentSnapshot from './FirestoreDocumentSnapshot';
import SnapshotMetadata from './FirestoreSnapshotMetadata';

import type Query from './FirestoreQuery';

export interface QuerySnapshotNativeData {
  source?: string;
  excludesMetadataChanges?: boolean;
  changes: Array<{
    type: string;
    doc: { path: string; data?: unknown; metadata?: [boolean, boolean]; exists?: boolean };
    ni: number;
    oi: number;
    isMetadataChange?: boolean;
  }>;
  documents: Array<{
    path: string;
    data?: unknown;
    metadata?: [boolean, boolean];
    exists?: boolean;
  }>;
  metadata: [boolean, boolean];
}

export default class QuerySnapshot {
  _query: Query;
  _source: string | undefined;
  _excludesMetadataChanges: boolean | undefined;
  _changes: DocumentChange[];
  _docs: DocumentSnapshot[];
  _metadata: SnapshotMetadata;

  constructor(
    firestore: any,
    query: Query,
    nativeData: QuerySnapshotNativeData,
    converter: unknown,
  ) {
    this._query = query;
    this._source = nativeData.source;
    this._excludesMetadataChanges = nativeData.excludesMetadataChanges;
    this._changes = nativeData.changes.map(
      (c: QuerySnapshotNativeData['changes'][0]) => new DocumentChange(firestore, c, converter),
    );
    this._docs = nativeData.documents.map((doc: QuerySnapshotNativeData['documents'][0]) =>
      createDeprecationProxy(new DocumentSnapshot(firestore, doc, converter)),
    ) as DocumentSnapshot[];
    this._metadata = new SnapshotMetadata(nativeData.metadata ?? [false, false]);
  }

  get docs(): DocumentSnapshot[] {
    return this._docs;
  }

  get empty(): boolean {
    return this._docs.length === 0;
  }

  get metadata(): SnapshotMetadata {
    return this._metadata;
  }

  get query(): Query {
    return this._query;
  }

  get size(): number {
    return this._docs.length;
  }

  docChanges(options?: { includeMetadataChanges?: boolean }): DocumentChange[] {
    if (!isUndefined(options) && !isObject(options)) {
      throw new Error(
        "firebase.firestore() QuerySnapshot.docChanges(*) 'options' expected an object.",
      );
    }

    let includeMetaDataChanges = false;

    if (options) {
      if (!isBoolean(options.includeMetadataChanges)) {
        throw new Error(
          "firebase.firestore() QuerySnapshot.docChanges(*) 'options.includeMetadataChanges' expected a boolean.",
        );
      }

      includeMetaDataChanges = options.includeMetadataChanges ?? false;
    }

    if (this._source === 'get') {
      return this._changes;
    }

    if (includeMetaDataChanges && this._excludesMetadataChanges) {
      throw new Error(
        'firebase.firestore() QuerySnapshot.docChanges() To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().',
      );
    }

    return this._changes.filter($ => {
      if (!includeMetaDataChanges) {
        return $._isMetadataChange === false;
      }
      return true;
    });
  }

  forEach(callback: (doc: DocumentSnapshot, index: number) => void, thisArg?: unknown): void {
    if (!isFunction(callback)) {
      throw new Error(
        "firebase.firestore() QuerySnapshot.forEach(*) 'callback' expected a function.",
      );
    }

    const cb = thisArg ? callback.bind(thisArg) : callback;

    for (let i = 0; i < this._docs.length; i++) {
      cb(this._docs[i]!, i);
    }
  }

  isEqual(other: QuerySnapshot, ..._args: unknown[]): boolean {
    if (!(other instanceof QuerySnapshot)) {
      throw new Error(
        "firebase.firestore() QuerySnapshot.isEqual(*) 'other' expected a QuerySnapshot instance.",
      );
    }

    if (
      this.empty !== other.empty ||
      this.size !== other.size ||
      !this.metadata.isEqual(other.metadata)
    ) {
      return false;
    }

    for (let i = 0; i < this.docs.length; i++) {
      const thisDoc = this.docs[i]!;
      const otherDoc = other.docs[i]!;

      if (!thisDoc.isEqual(otherDoc)) {
        return false;
      }
    }

    return true;
  }
}

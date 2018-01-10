/**
 * @flow
 * QuerySnapshot representation wrapper
 */
import DocumentChange from './DocumentChange';
import DocumentSnapshot from './DocumentSnapshot';

import type Firestore from './';
import type { FirestoreNativeDocumentChange, FirestoreNativeDocumentSnapshot, FirestoreSnapshotMetadata } from '../../types';
import type Query from './Query';

type QuerySnapshotNativeData = {
  changes: FirestoreNativeDocumentChange[],
  documents: FirestoreNativeDocumentSnapshot[],
  metadata: FirestoreSnapshotMetadata,
}

/**
 * @class QuerySnapshot
 */
export default class QuerySnapshot {
  _changes: DocumentChange[];
  _docs: DocumentSnapshot[];
  _metadata: FirestoreSnapshotMetadata;
  _query: Query;

  constructor(firestore: Firestore, query: Query, nativeData: QuerySnapshotNativeData) {
    this._changes = nativeData.changes.map(change => new DocumentChange(firestore, change));
    this._docs = nativeData.documents.map(doc => new DocumentSnapshot(firestore, doc));
    this._metadata = nativeData.metadata;
    this._query = query;
  }

  get docChanges(): DocumentChange[] {
    return this._changes;
  }

  get docs(): DocumentSnapshot[] {
    return this._docs;
  }

  get empty(): boolean {
    return this._docs.length === 0;
  }

  get metadata(): FirestoreSnapshotMetadata {
    return this._metadata;
  }

  get query(): Query {
    return this._query;
  }

  get size(): number {
    return this._docs.length;
  }

  forEach(callback: DocumentSnapshot => any) {
    // TODO: Validation
    // validate.isFunction('callback', callback);

    this._docs.forEach((doc) => {
      callback(doc);
    });
  }
}

/**
 * @flow
 * QuerySnapshot representation wrapper
 */
import DocumentChange from './DocumentChange';
import DocumentSnapshot from './DocumentSnapshot';
import Query from './Query';

import type { DocumentChangeNativeData } from './DocumentChange';
import type { DocumentSnapshotNativeData } from './DocumentSnapshot';

type QuerySnapshotNativeData = {
  changes: DocumentChangeNativeData[],
  documents: DocumentSnapshotNativeData[],
  readTime: string,
}

 /**
 * @class QuerySnapshot
 */
export default class QuerySnapshot {
  _changes: DocumentChange[];
  _docs: DocumentSnapshot[];
  _query: Query;
  _readTime: string;

  constructor(firestore: Object, query: Query, nativeData: QuerySnapshotNativeData) {
    this._changes = nativeData.changes.map(change => new DocumentChange(change));
    this._docs = nativeData.documents.map(doc => new DocumentSnapshot(firestore, doc));
    this._query = query;
    this._readTime = nativeData.readTime;
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

  get query(): Query {
    return this._query;
  }

  get readTime(): string {
    return this._readTime;
  }

  get size(): number {
    return this._docs.length;
  }

  forEach(callback: DocumentSnapshot => any) {
    // TODO: Validation
    // validate.isFunction('callback', callback);

    for (const doc of this._docs) {
      callback(doc);
    }
  }
}

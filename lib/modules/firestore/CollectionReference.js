/**
 * @flow
 * CollectionReference representation wrapper
 */
import DocumentReference from './DocumentReference';
import Query from './Query';
import { firestoreAutoId } from '../../utils';

import type Firestore from './';
import type { FirestoreQueryDirection, FirestoreQueryOperator } from '../../types';
import type Path from './Path';
import type QuerySnapshot from './QuerySnapshot';

/**
 * @class CollectionReference
 */
export default class CollectionReference {
  _collectionPath: Path;
  _firestore: Firestore;
  _query: Query;

  constructor(firestore: Object, collectionPath: Path) {
    this._collectionPath = collectionPath;
    this._firestore = firestore;
    this._query = new Query(firestore, collectionPath);
  }

  get firestore(): Object {
    return this._firestore;
  }

  get id(): string | null {
    return this._collectionPath.id;
  }

  get parent(): DocumentReference | null {
    const parentPath = this._collectionPath.parent();
    return parentPath ? new DocumentReference(this._firestore, parentPath) : null;
  }

  add(data: Object): Promise<DocumentReference> {
    const documentRef = this.doc();
    return documentRef.set(data)
      .then(() => Promise.resolve(documentRef));
  }

  doc(documentPath?: string): DocumentReference {
    const newPath = documentPath || firestoreAutoId();

    const path = this._collectionPath.child(newPath);
    if (!path.isDocument) {
      throw new Error('Argument "documentPath" must point to a document.');
    }

    return new DocumentReference(this._firestore, path);
  }

  // From Query
  endAt(fieldValues: any): Query {
    return this._query.endAt(fieldValues);
  }

  endBefore(fieldValues: any): Query {
    return this._query.endBefore(fieldValues);
  }

  get(): Promise<QuerySnapshot> {
    return this._query.get();
  }

  limit(n: number): Query {
    return this._query.limit(n);
  }

  onSnapshot(onNext: () => any, onError?: () => any): () => void {
    return this._query.onSnapshot(onNext, onError);
  }

  orderBy(fieldPath: string, directionStr?: FirestoreQueryDirection): Query {
    return this._query.orderBy(fieldPath, directionStr);
  }

  startAfter(fieldValues: any): Query {
    return this._query.startAfter(fieldValues);
  }

  startAt(fieldValues: any): Query {
    return this._query.startAt(fieldValues);
  }

  where(fieldPath: string, opStr: FirestoreQueryOperator, value: any): Query {
    return this._query.where(fieldPath, opStr, value);
  }
}

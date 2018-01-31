/**
 * @flow
 * CollectionReference representation wrapper
 */
import DocumentReference from './DocumentReference';
import Query from './Query';
import Firestore from './';
import { FirestoreQueryDirection, FirestoreQueryOperator } from '../../types';
import FieldPath from './FieldPath';
import Path from './Path';
import { Observer, ObserverOnError, ObserverOnNext, QueryListenOptions } from './Query';
import QuerySnapshot from './QuerySnapshot';
/**
 * @class CollectionReference
 */
export default class CollectionReference {
    private _collectionPath;
    private _firestore;
    private _query;
    constructor(firestore: Firestore, collectionPath: Path);
    readonly firestore: Firestore;
    readonly id: string | null;
    readonly parent: DocumentReference | null;
    add(data: Object): Promise<DocumentReference>;
    doc(documentPath?: string): DocumentReference;
    endAt(...snapshotOrVarArgs: any[]): Query;
    endBefore(...snapshotOrVarArgs: any[]): Query;
    get(): Promise<QuerySnapshot>;
    limit(limit: number): Query;
    onSnapshot(optionsOrObserverOrOnNext: QueryListenOptions | Observer | ObserverOnNext, observerOrOnNextOrOnError?: Observer | ObserverOnNext | ObserverOnError, onError?: ObserverOnError): () => void;
    orderBy(fieldPath: string | FieldPath, directionStr?: FirestoreQueryDirection): Query;
    startAfter(...snapshotOrVarArgs: any[]): Query;
    startAt(...snapshotOrVarArgs: any[]): Query;
    where(fieldPath: string, opStr: FirestoreQueryOperator, value: any): Query;
}

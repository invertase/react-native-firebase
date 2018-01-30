import FieldPath from './FieldPath';
import QuerySnapshot from './QuerySnapshot';
import Firestore from './';
import { FirestoreQueryDirection, FirestoreQueryOperator } from '../../types';
import Path from './Path';
export declare type NativeFieldPath = {
    elements?: string[];
    string?: string;
    type: 'fieldpath' | 'string';
    fieldpath?: string;
};
export declare type FieldFilter = {
    fieldPath: NativeFieldPath;
    operator: string;
    value: any;
};
export declare type FieldOrder = {
    direction: string;
    fieldPath: NativeFieldPath;
};
export declare type QueryOptions = {
    endAt?: any[];
    endBefore?: any[];
    limit?: number;
    offset?: number;
    selectFields?: string[];
    startAfter?: any[];
    startAt?: any[];
};
export declare type QueryListenOptions = {
    includeDocumentMetadataChanges: boolean;
    includeQueryMetadataChanges: boolean;
};
export declare type ObserverOnError = (any) => void;
export declare type ObserverOnNext = (QuerySnapshot) => void;
export declare type Observer = {
    error?: ObserverOnError;
    next: ObserverOnNext;
};
/**
 * @class Query
 */
export default class Query {
    _fieldFilters: FieldFilter[];
    _fieldOrders: FieldOrder[];
    _firestore: Firestore;
    _iid: number;
    _queryOptions: QueryOptions;
    _referencePath: Path;
    constructor(firestore: Firestore, path: Path, fieldFilters?: FieldFilter[], fieldOrders?: FieldOrder[], queryOptions?: QueryOptions);
    readonly firestore: Firestore;
    endAt(...snapshotOrVarArgs: any[]): Query;
    endBefore(...snapshotOrVarArgs: any[]): Query;
    get(): Promise<QuerySnapshot>;
    limit(limit: number): Query;
    onSnapshot(optionsOrObserverOrOnNext: QueryListenOptions | Observer | ObserverOnNext, observerOrOnNextOrOnError?: Observer | ObserverOnNext | ObserverOnError, onError?: ObserverOnError): any;
    orderBy(fieldPath: string | FieldPath, directionStr?: FirestoreQueryDirection): Query;
    startAfter(...snapshotOrVarArgs: any[]): Query;
    startAt(...snapshotOrVarArgs: any[]): Query;
    where(fieldPath: string | FieldPath, opStr: FirestoreQueryOperator, value: any): Query;
    /**
     * INTERNALS
     */
    _buildOrderByOption(snapshotOrVarArgs: any[]): {
        type: "string" | "number" | "boolean" | "object" | "null" | "array" | "date" | "documentid" | "fieldvalue" | "geopoint" | "reference";
        value: any;
    }[];
    /**
     * Remove query snapshot listener
     * @param listener
     */
    _offCollectionSnapshot(listenerId: string, listener: Function): void;
}

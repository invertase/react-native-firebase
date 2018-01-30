/**
 * @flow
 * DocumentReference representation wrapper
 */
import CollectionReference from './CollectionReference';
import DocumentSnapshot from './DocumentSnapshot';
import Firestore from './';
import { FirestoreWriteOptions } from '../../types';
import Path from './Path';
export declare type DocumentListenOptions = {
    includeMetadataChanges: boolean;
};
export declare type ObserverOnError = (snapshot: any) => void;
export declare type ObserverOnNext = (snapshot: any) => void;
export declare type Observer = {
    next: ObserverOnNext;
    error?: ObserverOnError;
};
/**
 * @class DocumentReference
 */
export default class DocumentReference {
    _documentPath: Path;
    _firestore: Firestore;
    constructor(firestore: Firestore, documentPath: Path);
    readonly firestore: Firestore;
    readonly id: string | null;
    readonly parent: CollectionReference;
    readonly path: string;
    collection(collectionPath: string): CollectionReference;
    delete(): Promise<void>;
    get(): Promise<DocumentSnapshot>;
    onSnapshot(optionsOrObserverOrOnNext: DocumentListenOptions | Observer | ObserverOnNext, observerOrOnNextOrOnError?: Observer | ObserverOnNext | ObserverOnError, onError?: ObserverOnError): any;
    set(data: Object, writeOptions?: FirestoreWriteOptions): Promise<void>;
    update(...args: any[]): Promise<void>;
    /**
     * INTERNALS
     */
    /**
     * Remove document snapshot listener
     * @param listener
     */
    _offDocumentSnapshot(listenerId: string, listener: Function): void;
}

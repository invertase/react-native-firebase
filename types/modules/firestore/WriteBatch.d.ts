import DocumentReference from './DocumentReference';
import Firestore from './';
import { FirestoreWriteOptions } from '../../types';
export declare enum WriteType {
    DELETE = "DELETE",
    SET = "SET",
    UPDATE = "UPDATE",
}
export declare type DocumentWrite = {
    data?: any;
    options?: any;
    path: string;
    type: keyof typeof WriteType;
};
/**
 * @class WriteBatch
 */
export default class WriteBatch {
    private _firestore;
    private _writes;
    constructor(firestore: Firestore);
    commit(): Promise<void>;
    delete(docRef: DocumentReference): WriteBatch;
    set(docRef: DocumentReference, data: any, writeOptions?: FirestoreWriteOptions): this;
    update(docRef: DocumentReference, ...args: any[]): WriteBatch;
}

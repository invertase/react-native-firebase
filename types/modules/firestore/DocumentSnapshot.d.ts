/**
 * @flow
 * DocumentSnapshot representation wrapper
 */
import DocumentReference from './DocumentReference';
import FieldPath from './FieldPath';
import Firestore from './';
import { FirestoreNativeDocumentSnapshot, FirestoreSnapshotMetadata, Dict } from '../../types';
/**
 * @class DocumentSnapshot
 */
export default class DocumentSnapshot {
    private _data;
    private _metadata;
    private _ref;
    constructor(firestore: Firestore, nativeData: FirestoreNativeDocumentSnapshot);
    readonly exists: boolean;
    readonly id: string | null;
    readonly metadata: FirestoreSnapshotMetadata;
    readonly ref: DocumentReference;
    data(): Dict | void;
    get(fieldPath: string | FieldPath): any;
}

/**
 * @flow
 * DocumentSnapshot representation wrapper
 */
import DocumentReference from './DocumentReference';
import FieldPath from './FieldPath';
import Firestore from './';
import { FirestoreNativeDocumentSnapshot, FirestoreSnapshotMetadata } from '../../types';
/**
 * @class DocumentSnapshot
 */
export default class DocumentSnapshot {
    _data: Object | void;
    _metadata: FirestoreSnapshotMetadata;
    _ref: DocumentReference;
    constructor(firestore: Firestore, nativeData: FirestoreNativeDocumentSnapshot);
    readonly exists: boolean;
    readonly id: string | null;
    readonly metadata: FirestoreSnapshotMetadata;
    readonly ref: DocumentReference;
    data(): Object | void;
    get(fieldPath: string | FieldPath): any;
}

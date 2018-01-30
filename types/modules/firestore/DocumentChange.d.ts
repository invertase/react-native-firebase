/**
 * @flow
 * DocumentChange representation wrapper
 */
import DocumentSnapshot from './DocumentSnapshot';
import Firestore from './';
import { FirestoreNativeDocumentChange } from '../../types';
/**
 * @class DocumentChange
 */
export default class DocumentChange {
    _document: DocumentSnapshot;
    _newIndex: number;
    _oldIndex: number;
    _type: string;
    constructor(firestore: Firestore, nativeData: FirestoreNativeDocumentChange);
    readonly doc: DocumentSnapshot;
    readonly newIndex: number;
    readonly oldIndex: number;
    readonly type: string;
}

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
    private _document;
    private _newIndex;
    private _oldIndex;
    private _type;
    constructor(firestore: Firestore, nativeData: FirestoreNativeDocumentChange);
    readonly doc: DocumentSnapshot;
    readonly newIndex: number;
    readonly oldIndex: number;
    readonly type: string;
}

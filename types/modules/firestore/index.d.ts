import ModuleBase from '../../utils/ModuleBase';
import CollectionReference from './CollectionReference';
import DocumentReference from './DocumentReference';
import FieldPath from './FieldPath';
import FieldValue from './FieldValue';
import GeoPoint from './GeoPoint';
import WriteBatch from './WriteBatch';
import DocumentSnapshot from './DocumentSnapshot';
import App from '../core/firebase-app';
import QuerySnapshot from './QuerySnapshot';
export declare type CollectionSyncEvent = {
    appName: string;
    querySnapshot?: QuerySnapshot;
    error?: any;
    listenerId: string;
    path: string;
};
export declare type DocumentSyncEvent = {
    appName: string;
    documentSnapshot?: DocumentSnapshot;
    error?: any;
    listenerId: string;
    path: string;
};
export declare const MODULE_NAME = "RNFirebaseFirestore";
/**
 * @class Firestore
 */
export default class Firestore extends ModuleBase {
    static NAMESPACE: string;
    private _referencePath;
    constructor(app: App);
    batch(): WriteBatch;
    /**
     *
     * @param collectionPath
     * @returns {CollectionReference}
     */
    collection(collectionPath: string): CollectionReference;
    /**
     *
     * @param documentPath
     * @returns {DocumentReference}
     */
    doc(documentPath: string): DocumentReference;
    enablePersistence(): Promise<never>;
    runTransaction(): Promise<never>;
    setLogLevel(): void;
    settings(): void;
    /**
     * Internal collection sync listener
     * @param event
     * @private
     */
    private _onCollectionSyncEvent(event);
    /**
     * Internal document sync listener
     * @param event
     * @private
     */
    private _onDocumentSyncEvent(event);
}
export declare const statics: {
    FieldPath: typeof FieldPath;
    FieldValue: typeof FieldValue;
    GeoPoint: typeof GeoPoint;
    enableLogging(enabled: boolean): void;
};

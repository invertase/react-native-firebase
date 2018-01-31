import Crashlytics from '../modules/fabric/crashlytics';
import Firestore from '../modules/firestore';
export declare type FirebaseError = {
    message: string;
    name: string;
    code: string;
    stack: string;
    path: string;
    details: string;
    modifiers: string;
};
export declare type FirebaseModuleConfig = {
    events?: string[];
    moduleName: FirebaseModuleName;
    multiApp: boolean;
    namespace: FirebaseNamespace;
};
export declare type FirebaseModuleName = 'RNFirebaseAdmob' | 'RNFirebaseAnalytics' | 'RNFirebaseAuth' | 'RNFirebaseRemoteConfig' | 'RNFirebaseCrash' | 'RNFirebaseCrashlytics' | 'RNFirebaseDatabase' | 'RNFirebaseFirestore' | 'RNFirebaseLinks' | 'RNFirebaseMessaging' | 'RNFirebasePerformance' | 'RNFirebaseStorage' | 'RNFirebaseUtils';
export declare type FirebaseNamespace = 'admob' | 'analytics' | 'auth' | 'config' | 'crash' | 'crashlytics' | 'database' | 'firestore' | 'links' | 'messaging' | 'perf' | 'storage' | 'utils';
export declare type FirebaseOptions = {
    apiKey: string;
    appId: string;
    databaseURL: string;
    messagingSenderId: string;
    projectId: string;
    storageBucket: string;
};
export declare type DatabaseModifier = {
    id: string;
    type: 'orderBy' | 'limit' | 'filter';
    name?: string;
    key?: string;
    limit?: number;
    value?: any;
    valueType?: string;
};
export declare type CrashlyticsModule = Crashlytics;
export declare type FabricModule = {
    crashlytics: CrashlyticsModule;
};
export declare type FirestoreModule = Firestore;
export declare type FirestoreNativeDocumentChange = {
    document: FirestoreNativeDocumentSnapshot;
    newIndex: number;
    oldIndex: number;
    type: string;
};
export declare type FirestoreNativeDocumentSnapshot = {
    data: Dict<FirestoreTypeMap>;
    metadata: FirestoreSnapshotMetadata;
    path: string;
};
export declare type FirestoreSnapshotMetadata = {
    fromCache: boolean;
    hasPendingWrites: boolean;
};
export declare type FirestoreQueryDirection = 'DESC' | 'desc' | 'ASC' | 'asc';
export declare type FirestoreQueryOperator = '<' | '<=' | '=' | '==' | '>' | '>=';
export declare type FirestoreTypeMap = {
    type: 'array' | 'boolean' | 'date' | 'documentid' | 'fieldvalue' | 'geopoint' | 'null' | 'number' | 'object' | 'reference' | 'string';
    value: any;
};
export declare type FirestoreWriteOptions = {
    merge?: boolean;
};
export interface Dict<T = any> {
    [key: string]: T;
}

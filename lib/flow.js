/* eslint-disable */
/* Core types */
declare class FirebaseError {
  message: string,
  name: string,
  code: string,
  stack: string,
  path: string,
  details: string,
  modifiers: string
};

declare type FirebaseOptions = {
  apiKey: string,
  appId: string,
  databaseURL: string,
  messagingSenderId: string,
  projectId: string,
  storageBucket: string,
}

/* Auth types */

declare type AuthResult = {
  authenticated: boolean,
  user: Object|null
} | null;

declare type AuthCredential = {
  providerId: string,
  token: string,
  secret: string
};

/* Database types */

declare type DatabaseListener = {
  listenerId: number;
  eventName: string;
  successCallback: Function;
  failureCallback?: Function;
};

declare type DatabaseModifier = {
  type: 'orderBy' | 'limit' | 'filter';
  name?: string;
  key?: string;
  limit?: number;
  value?: any;
  valueType?: string;
};

/* Firestore types */

declare type FirestoreNativeDocumentChange = {
  document: FirestoreNativeDocumentSnapshot,
  newIndex: number,
  oldIndex: number,
  type: string,
}

declare type FirestoreNativeDocumentSnapshot = {
  data: { [string]: FirestoreTypeMap },
  metadata: FirestoreSnapshotMetadata,
  path: string,
}

declare type FirestoreSnapshotMetadata = {
  fromCache: boolean,
  hasPendingWrites: boolean,
}

declare type FirestoreQueryDirection = 'DESC' | 'desc' | 'ASC' | 'asc';
declare type FirestoreQueryOperator = '<' | '<=' | '=' | '==' | '>' | '>=';

declare type FirestoreTypeMap = {
  type: 'array' | 'boolean' | 'date' | 'fieldvalue' | 'geopoint' | 'null' | 'number' | 'object' | 'reference' | 'string',
  value: any,
}

declare type FirestoreWriteOptions = {
  merge?: boolean,
}

/* Util types */

declare type GoogleApiAvailabilityType = {
  status: number,
  isAvailable: boolean,
  isUserResolvableError?: boolean,
  hasResolution?: boolean,
  error?: string
};

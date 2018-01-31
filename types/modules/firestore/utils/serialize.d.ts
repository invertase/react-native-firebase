import Firestore from '../';
import { FirestoreTypeMap, Dict } from '../../../types';
export declare const buildNativeMap: (data: any) => Dict<FirestoreTypeMap>;
export declare const buildNativeArray: (array: any[]) => FirestoreTypeMap[];
export declare const buildTypeMap: (value: any) => FirestoreTypeMap;
export declare const parseNativeMap: (firestore: Firestore, nativeData: Dict<FirestoreTypeMap>) => void | Dict<any>;

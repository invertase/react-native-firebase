import Firestore from '../';
import { FirestoreTypeMap } from '../../../types';
export declare const buildNativeMap: (data: any) => {
    [key: string]: FirestoreTypeMap;
};
export declare const buildNativeArray: (array: any[]) => FirestoreTypeMap[];
export declare const buildTypeMap: (value: any) => FirestoreTypeMap;
export declare const parseNativeMap: (firestore: Firestore, nativeData: {
    [key: string]: FirestoreTypeMap;
}) => void | Object;

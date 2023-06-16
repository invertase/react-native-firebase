import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseFirestoreTypes } from '../index';

import FirebaseApp = ReactNativeFirebase.FirebaseApp;
import Firestore = FirebaseFirestoreTypes.Module;

/**
 * Returns the existing default {@link Firestore} instance that is associated with the
 * provided {@link @firebase/app#FirebaseApp}. If no instance exists, initializes a new
 * instance with default settings.
 *
 * @param app - The {@link @firebase/app#FirebaseApp} instance that the returned {@link Firestore}
 * instance is associated with.
 * @returns The {@link Firestore} instance of the provided app.
 */
export function getFirestore(app: FirebaseApp): Firestore;

/**
 * Returns the existing default {@link Firestore} instance that is associated with the
 * default {@link @firebase/app#FirebaseApp}. If no instance exists, initializes a new
 * instance with default settings.
 *
 * @returns The {@link Firestore} instance of the provided app.
 */
export declare function getFirestore(): Firestore;

/**
 * Returns the existing default {@link Firestore} instance that is associated with the
 * provided {@link @firebase/app#FirebaseApp}. If no instance exists, initializes a new
 * instance with default settings.
 *
 * @param app - The {@link @firebase/app#FirebaseApp} instance that the returned {@link Firestore}
 * instance is associated with.
 * @returns The {@link Firestore} instance of the provided app.
 * @internal
 */
export declare function getFirestore(app: FirebaseApp): Firestore;

export function getFirestore(app?: FirebaseApp): Firestore;

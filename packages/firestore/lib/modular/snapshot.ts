/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type {
  DocumentSnapshot,
  DocumentData,
  DocumentReference,
  Firestore,
  FirestoreDataConverter,
  Query,
  QuerySnapshot,
} from '../types/firestore';

export type Unsubscribe = () => void;
export type FirestoreError = Error;
export type {
  QueryDocumentSnapshot,
  SnapshotListenOptions,
  SnapshotOptions,
  DocumentChange,
  DocumentChangeType,
} from '../types/firestore';

export { default as DocumentSnapshot } from '../FirestoreDocumentSnapshot';
export { default as QuerySnapshot } from '../FirestoreQuerySnapshot';
export { default as SnapshotMetadata } from '../FirestoreSnapshotMetadata';

export function onSnapshot<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  reference: Query<AppModelType, DbModelType> | DocumentReference<AppModelType, DbModelType>,
  ...args: unknown[]
): Unsubscribe {
  const onSnapshotMethod = (
    reference as unknown as {
      onSnapshot: (...listenerArgs: unknown[]) => Unsubscribe;
    }
  ).onSnapshot;

  return onSnapshotMethod.call(reference, ...args, MODULAR_DEPRECATION_ARG);
}

export function snapshotEqual<AppModelType, DbModelType extends DocumentData>(
  left: DocumentSnapshot<AppModelType, DbModelType> | QuerySnapshot<AppModelType, DbModelType>,
  right: DocumentSnapshot<AppModelType, DbModelType> | QuerySnapshot<AppModelType, DbModelType>,
): boolean {
  const isEqual = (left as unknown as { isEqual: (...args: unknown[]) => boolean }).isEqual;
  return isEqual.call(left, right, MODULAR_DEPRECATION_ARG);
}

export function documentSnapshotFromJSON(_firestore: Firestore, _json: object): DocumentSnapshot;
export function documentSnapshotFromJSON<
  AppModelType,
  DbModelType extends DocumentData = DocumentData,
>(
  _firestore: Firestore,
  _json: object,
  _converter: FirestoreDataConverter<AppModelType, DbModelType>,
): DocumentSnapshot<AppModelType, DbModelType>;
export function documentSnapshotFromJSON<
  AppModelType,
  DbModelType extends DocumentData = DocumentData,
>(
  _firestore: Firestore,
  _json: object,
  _converter?: FirestoreDataConverter<AppModelType, DbModelType>,
): DocumentSnapshot<AppModelType, DbModelType> {
  throw new Error('documentSnapshotFromJSON() is not supported in React Native.');
}

export function querySnapshotFromJSON(_firestore: Firestore, _json: object): QuerySnapshot;
export function querySnapshotFromJSON<
  AppModelType,
  DbModelType extends DocumentData = DocumentData,
>(
  _firestore: Firestore,
  _json: object,
  _converter: FirestoreDataConverter<AppModelType, DbModelType>,
): QuerySnapshot<AppModelType, DbModelType>;
export function querySnapshotFromJSON<
  AppModelType,
  DbModelType extends DocumentData = DocumentData,
>(
  _firestore: Firestore,
  _json: object,
  _converter?: FirestoreDataConverter<AppModelType, DbModelType>,
): QuerySnapshot<AppModelType, DbModelType> {
  throw new Error('querySnapshotFromJSON() is not supported in React Native.');
}

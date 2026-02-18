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
import type { DocumentData, DocumentReference, Query } from '../types/firestore';
import type { FieldPath } from './FieldPath';

export type Unsubscribe = () => void;
export type FirestoreError = Error;
export type SnapshotMetadata = {
  fromCache: boolean;
  hasPendingWrites: boolean;
  isEqual(other: SnapshotMetadata): boolean;
};

export interface DocumentSnapshot<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  exists(): this is QueryDocumentSnapshot<AppModelType, DbModelType>;
  id: string;
  metadata: SnapshotMetadata;
  ref: DocumentReference<AppModelType, DbModelType>;
  data(): AppModelType | undefined;
  get<fieldType extends DbModelType[keyof DbModelType]>(
    fieldPath: keyof DbModelType | string | FieldPath,
  ): fieldType;
  isEqual(other: DocumentSnapshot): boolean;
}

export interface QueryDocumentSnapshot<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends DocumentSnapshot<AppModelType, DbModelType> {
  exists(): this is QueryDocumentSnapshot<AppModelType, DbModelType>;
  data(): AppModelType;
}

export interface QuerySnapshot<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  docs: QueryDocumentSnapshot<AppModelType, DbModelType>[];
  empty: boolean;
  metadata: SnapshotMetadata;
  query: Query<AppModelType, DbModelType>;
  size: number;
  forEach(
    callback: (result: QueryDocumentSnapshot<AppModelType, DbModelType>, index: number) => void,
    thisArg?: unknown,
  ): void;
  isEqual(other: QuerySnapshot): boolean;
}

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

export function onSnapshotsInSync(
  _firestore: Query | DocumentReference,
  ..._args: unknown[]
): Unsubscribe {
  throw new Error('onSnapshotsInSync() is not implemented');
}

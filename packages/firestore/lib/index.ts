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

/**
 * Modular Firestore API for React Native Firebase.
 *
 * @packageDocumentation
 */

import './types/internal';
import './FieldValue';
import './FirestoreModule';

export { FieldPath } from './FieldPath';
export { FieldValue } from './FieldValue';
export { GeoPoint } from './FirestoreGeoPoint';
export { Timestamp } from './FirestoreTimestamp';
export { VectorValue } from './FirestoreVectorValue';
export { Bytes } from './modular/Bytes';
export { AggregateField, AggregateQuerySnapshot } from './FirestoreAggregate';
export * from './modular';

export type {
  FirebaseApp,
  Firestore,
  LogLevel,
  ExperimentalLongPollingOptions,
  PersistenceSettings,
  MemoryLocalCache,
  PersistentLocalCache,
  FirestoreLocalCache,
  FirestoreSettings,
  AggregateType,
  AggregateFieldType,
  AggregateSpec,
  AggregateSpecData,
  EmulatorMockTokenOptions,
  TaskState,
  LoadBundleTaskProgress,
  SetOptions,
  WhereFilterOp,
  OrderByDirection,
  QueryConstraintType,
  SnapshotListenOptions,
  SnapshotOptions,
  DocumentChangeType,
  FirestoreError,
  Unsubscribe,
  DocumentChange,
  Primitive,
  DocumentData,
  PartialWithFieldValue,
  UnionToIntersection,
  AddPrefixToKeys,
  ChildUpdateFields,
  NestedUpdateFields,
  UpdateData,
  WithFieldValue,
  FirestoreDataConverter,
  CollectionReference,
  DocumentReference,
  Query,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  QuerySnapshot,
  SnapshotMetadata,
  Transaction,
  TransactionOptions,
  WriteBatch,
} from './types/firestore';

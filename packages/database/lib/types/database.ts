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

import type { ReactNativeFirebase } from '@react-native-firebase/app';

type FirebaseApp = ReactNativeFirebase.FirebaseApp;

type FirebaseSignInProvider =
  | 'custom'
  | 'email'
  | 'password'
  | 'phone'
  | 'anonymous'
  | 'google.com'
  | 'facebook.com'
  | 'github.com'
  | 'twitter.com'
  | 'microsoft.com'
  | 'apple.com';

interface FirebaseIdToken {
  iss: string;
  aud: string;
  sub: string;
  iat: number;
  exp: number;
  user_id: string;
  auth_time: number;
  provider_id?: 'anonymous';
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  name?: string;
  picture?: string;
  firebase: {
    sign_in_provider: FirebaseSignInProvider;
    identities?: { [provider in FirebaseSignInProvider]?: string[] };
  };
  [claim: string]: unknown;
  uid?: never;
}

export type EmulatorMockTokenOptions = ({ user_id: string } | { sub: string }) &
  Partial<FirebaseIdToken>;

export declare class Database {
  readonly app: FirebaseApp;
  readonly type: 'database';
}

export declare class TransactionResult {
  readonly committed: boolean;
  readonly snapshot: DataSnapshot;
  toJSON(): object;
}

export interface Query {
  readonly ref: DatabaseReference;
  isEqual(other: Query | null): boolean;
  toJSON(): string;
  toString(): string;
}

export interface DatabaseReference extends Query {
  readonly key: string | null;
  readonly parent: DatabaseReference | null;
  readonly root: DatabaseReference;
}

export interface ThenableReference
  extends DatabaseReference, Pick<Promise<DatabaseReference>, 'then' | 'catch'> {
  key: string;
  parent: DatabaseReference;
}

export type EventType = 'value' | 'child_added' | 'child_changed' | 'child_moved' | 'child_removed';

export interface IteratedDataSnapshot extends DataSnapshot {
  key: string;
}

export declare class DataSnapshot {
  readonly key: string | null;
  readonly priority: string | number | null;
  readonly ref: DatabaseReference;
  readonly size: number;
  child(path: string): DataSnapshot;
  exists(): boolean;
  exportVal(): any;
  forEach(action: (child: IteratedDataSnapshot) => boolean | void): boolean;
  hasChild(path: string): boolean;
  hasChildren(): boolean;
  toJSON(): object | null;
  val(): any;
}

export declare class OnDisconnect {
  cancel(): Promise<void>;
  remove(): Promise<void>;
  set(value: unknown): Promise<void>;
  setWithPriority(value: unknown, priority: string | number | null): Promise<void>;
  update(values: object): Promise<void>;
}

export type Unsubscribe = () => void;

export interface ListenOptions {
  readonly onlyOnce?: boolean;
}

export type QueryConstraintType =
  | 'endAt'
  | 'endBefore'
  | 'startAt'
  | 'startAfter'
  | 'limitToFirst'
  | 'limitToLast'
  | 'orderByChild'
  | 'orderByKey'
  | 'orderByPriority'
  | 'orderByValue'
  | 'equalTo';

export abstract class QueryConstraint {
  abstract readonly type: QueryConstraintType;
}

export interface TransactionOptions {
  readonly applyLocally?: boolean;
}

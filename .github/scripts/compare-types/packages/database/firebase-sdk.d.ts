/**
 * Public types snapshot from the Firebase JS SDK (@firebase/database).
 *
 * Source: firebase-js-sdk API report for "@firebase/database"
 * Modality: modular (tree-shakeable) API only
 */

import { FirebaseApp } from '@firebase/app';

export declare type EmulatorMockTokenOptions = ({ user_id: string } | { sub: string }) &
  Partial<{
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
      sign_in_provider:
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
      identities?: {
        custom?: string[];
        email?: string[];
        password?: string[];
        phone?: string[];
        anonymous?: string[];
        'google.com'?: string[];
        'facebook.com'?: string[];
        'github.com'?: string[];
        'twitter.com'?: string[];
        'microsoft.com'?: string[];
        'apple.com'?: string[];
      };
    };
    uid?: never;
    [claim: string]: unknown;
  }>;

export declare function child(parent: DatabaseReference, path: string): DatabaseReference;

export declare function connectDatabaseEmulator(
  db: Database,
  host: string,
  port: number,
  options?: {
    mockUserToken?: EmulatorMockTokenOptions | string;
  },
): void;

export declare class Database {
  readonly app: FirebaseApp;
  readonly type: 'database';
}

export declare interface DatabaseReference extends Query {
  readonly key: string | null;
  readonly parent: DatabaseReference | null;
  readonly root: DatabaseReference;
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

export declare function enableLogging(enabled: boolean, persistent?: boolean): any;
export declare function enableLogging(logger: (message: string) => unknown): any;

export declare function endAt(
  value: number | string | boolean | null,
  key?: string,
): QueryConstraint;

export declare function endBefore(
  value: number | string | boolean | null,
  key?: string,
): QueryConstraint;

export declare function equalTo(
  value: number | string | boolean | null,
  key?: string,
): QueryConstraint;

export declare type EventType =
  | 'value'
  | 'child_added'
  | 'child_changed'
  | 'child_moved'
  | 'child_removed';

export declare function forceLongPolling(): void;
export declare function forceWebSockets(): void;

export declare function get(query: Query): Promise<DataSnapshot>;
export declare function getDatabase(app?: FirebaseApp, url?: string): Database;
export declare function goOffline(db: Database): void;
export declare function goOnline(db: Database): void;
export declare function increment(delta: number): object;

export declare interface IteratedDataSnapshot extends DataSnapshot {
  key: string;
}

export declare function limitToFirst(limit: number): QueryConstraint;
export declare function limitToLast(limit: number): QueryConstraint;

export declare interface ListenOptions {
  readonly onlyOnce?: boolean;
}

export declare function off(
  query: Query,
  eventType?: EventType,
  callback?: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
): void;

export declare function onChildAdded(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;
export declare function onChildAdded(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  options: ListenOptions,
): Unsubscribe;
export declare function onChildAdded(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;

export declare function onChildChanged(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;
export declare function onChildChanged(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  options: ListenOptions,
): Unsubscribe;
export declare function onChildChanged(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;

export declare function onChildMoved(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;
export declare function onChildMoved(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  options: ListenOptions,
): Unsubscribe;
export declare function onChildMoved(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;

export declare function onChildRemoved(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;
export declare function onChildRemoved(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  options: ListenOptions,
): Unsubscribe;
export declare function onChildRemoved(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;

export declare class OnDisconnect {
  cancel(): Promise<void>;
  remove(): Promise<void>;
  set(value: unknown): Promise<void>;
  setWithPriority(value: unknown, priority: string | number | null): Promise<void>;
  update(values: object): Promise<void>;
}

export declare function onDisconnect(ref: DatabaseReference): OnDisconnect;

export declare function onValue(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;
export declare function onValue(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  options: ListenOptions,
): Unsubscribe;
export declare function onValue(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;

export declare function orderByChild(path: string): QueryConstraint;
export declare function orderByKey(): QueryConstraint;
export declare function orderByPriority(): QueryConstraint;
export declare function orderByValue(): QueryConstraint;

export declare function push(parent: DatabaseReference, value?: unknown): ThenableReference;

export declare interface Query {
  isEqual(other: Query | null): boolean;
  readonly ref: DatabaseReference;
  toJSON(): string;
  toString(): string;
}

export declare function query(query: Query, ...queryConstraints: QueryConstraint[]): Query;

export declare abstract class QueryConstraint {
  abstract readonly type: QueryConstraintType;
}

export declare type QueryConstraintType =
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

export declare function ref(db: Database, path?: string): DatabaseReference;
export declare function refFromURL(db: Database, url: string): DatabaseReference;
export declare function remove(ref: DatabaseReference): Promise<void>;

export declare function runTransaction(
  ref: DatabaseReference,
  transactionUpdate: (currentData: any) => unknown,
  options?: TransactionOptions,
): Promise<TransactionResult>;

export declare function serverTimestamp(): object;
export declare function set(ref: DatabaseReference, value: unknown): Promise<void>;
export declare function setPriority(
  ref: DatabaseReference,
  priority: string | number | null,
): Promise<void>;
export declare function setWithPriority(
  ref: DatabaseReference,
  value: unknown,
  priority: string | number | null,
): Promise<void>;

export declare function startAfter(
  value: number | string | boolean | null,
  key?: string,
): QueryConstraint;
export declare function startAt(
  value?: number | string | boolean | null,
  key?: string,
): QueryConstraint;

export declare interface ThenableReference
  extends DatabaseReference, Pick<Promise<DatabaseReference>, 'then' | 'catch'> {
  key: string;
  parent: DatabaseReference;
}

export declare interface TransactionOptions {
  readonly applyLocally?: boolean;
}

export declare class TransactionResult {
  readonly committed: boolean;
  readonly snapshot: DataSnapshot;
  toJSON(): object;
}

export declare type Unsubscribe = () => void;

export declare function update(ref: DatabaseReference, values: object): Promise<void>;

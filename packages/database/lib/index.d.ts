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

import {
  ReactNativeFirebaseModule,
  ReactNativeFirebaseNamespace,
  ReactNativeFirebaseModuleAndStatics,
} from '@react-native-firebase/app-types';

/**
 * Firebase Database package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `database` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/database';
 *
 * // firebase.database().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `database` package:
 *
 * ```js
 * import database from '@react-native-firebase/database';
 *
 * // database().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/database';
 *
 * // firebase.database().X
 * ```
 *
 * @firebase database
 */
export namespace Database {

  export interface ServerValue {
    TIMESTAMP: object;
  }

  export interface Statics {

    ServerValue: ServerValue;
  }

  export interface Reference extends Query {

    parent: Reference | null;

    root: Reference;

    child(path: string): Reference;

    set(value: any, onComplete?: Function): Promise<any>;

    update(values: { [key]: value }, onComplete?: Function): Promise<any>;

    setPriority(priority: string | number | null, onComplete?: Function): Promise<any>;

    setWithPriority(newVal: any, newPriority: string | number | null, onComplete?: Function): Promise<any>;

    toJSON(): object;

    toString(): string;

    transaction(transactionUpdate: Function, onComplete?: Function, applyLocally?: boolean): Promise<any>;

    push(value?: any, onComplete?: Function): null; // TODO Thenable

    onDisconnect(): OnDisconnect;
  }
  
  export interface ThenableReference extends Reference {}

  export interface Query {

    key: string | null;

    ref: Reference;

    endAt(value: number | string | boolean | null, key?: string): Query;

    equalTo(value: number | string | boolean | null, key?: string): Query;

    isEqual(other: Query): boolean;

    limitToFirst(limit: number): Query;

    limitToLast(limit: number): Query;

    off(eventType?: EventType, callback?: Function): void; // TODO context?

    on(eventType?: EventType, callback?: Function): Function; // TODO context?

    once(eventType: EventType, successCallback?: Function): Promise<DataSnapshot>; // TODO

    orderByChild(path: string): Query;

    orderByKey(): Query;

    orderByPriority(): Query;

    orderByValue(): Query;

    startAt(value: number | string | boolean | null, key?: string): Query;

    toJSON(): object;

    toString(): string;

    keepSynced(bool: boolean): Promise<void>;
  }

  export interface OnDisconnect {
    cancel(onComplete?: Function): Promise<any>;

    remove(onComplete?: Function): Promise<any>;

    set(value: any, onComplete?: Function): Promise<any>;

    setWithPriority(value: any, priority: string | number | null, onComplete?: Function): Promise<any>;

    update(values: { [key]: value }, onComplete?: Function): Promise<any>;

  }

  export type EventType =
    "value" |
    "child_added" |
    "child_changed" |
    "child_moved" |
    "child_removed";

  export interface DataSnapshot {

    key: string | null;

    ref: Reference;

    child(path: string): DataSnapshot;

    exists(): boolean;

    exportVal(): any;

    forEach(action: Function): boolean;

    getPriority(): string | number | null;

    hasChild(path: string): boolean;

    hasChildren(): boolean;

    numChildren: number;

    toJSON(): object | null;

    val(): any;
  }

  /**
   *
   * The Firebase Database service is available for the default app or a given app.
   *
   * #### Example 1
   *
   * Get the database instance for the **default app**:
   *
   * ```js
   * const databaseForDefaultApp = firebase.database();
   * ```
   *
   * #### Example 2
   *
   * Get the database instance for a **secondary app**:
   *
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const databaseForOtherApp = firebase.database(otherApp);
   * ```
   *
   */
  export interface Module extends ReactNativeFirebaseModule {

    ref(path?: string): Reference;

    refFromURL(url: string): Reference;

  }
}

declare module '@react-native-firebase/database' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';
  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;
  export const firebase = FirebaseNamespaceExport;
  const DatabaseDefaultExport: ReactNativeFirebaseModuleAndStatics<Database.Module,
    Database.Statics>;
  export default DatabaseDefaultExport;
}

declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    database: ReactNativeFirebaseModuleAndStatics<Database.Module, Database.Statics>;
  }

  interface FirebaseApp {
    database(): Database.Module;
  }
}

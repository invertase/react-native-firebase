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

/**
 * @deprecated Use modular API (getDatabase, ref, set, onValue, etc.) and types from '@react-native-firebase/database' instead.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseDatabaseTypes {
  type FirebaseModule = ReactNativeFirebase.FirebaseModule;

  export type DataSnapshot = import('./database').DataSnapshot;
  export type EventType = import('./database').EventType;
  export type OnDisconnect = import('./database').OnDisconnect;
  export type Query = import('./database').Query;
  export type Reference = import('./database').Reference;
  export type ServerValue = import('./database').ServerValue;
  export type ThenableReference = import('./database').ThenableReference;
  export type TransactionResult = import('./database').TransactionResult;

  /**
   * @deprecated Use Statics from modular API (ServerValue, increment, serverTimestamp) instead.
   */
  export interface Statics {
    ServerValue: ServerValue;
    SDK_VERSION: string;
  }

  /**
   * @deprecated Use getDatabase() and modular functions instead.
   */
  export interface Module extends FirebaseModule {
    app: ReactNativeFirebase.FirebaseApp;
    getServerTime(): Date;
    ref(path?: string): Reference;
    refFromURL(url: string): Reference;
    goOnline(): Promise<void>;
    goOffline(): Promise<void>;
    setPersistenceEnabled(enabled: boolean): void;
    setLoggingEnabled(enabled: boolean): void;
    setPersistenceCacheSizeBytes(bytes: number): void;
    useEmulator(host: string, port: number): void;
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

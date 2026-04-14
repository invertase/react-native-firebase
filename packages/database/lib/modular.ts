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

import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import DatabaseStatics from './DatabaseStatics';
import type { Database, EmulatorMockTokenOptions } from './types/database';
import type { AppWithDatabaseInternal, DatabaseWithMethodsInternal } from './types/internal';

const { ServerValue } = DatabaseStatics;

type FirebaseApp = ReactNativeFirebase.FirebaseApp;

export function getDatabase(app?: FirebaseApp, url?: string): Database {
  if (app) {
    return (getApp(app.name) as unknown as AppWithDatabaseInternal).database(
      url,
    ) as unknown as Database;
  }

  return (getApp() as unknown as AppWithDatabaseInternal).database(url) as unknown as Database;
}

export function connectDatabaseEmulator(
  db: Database,
  host: string,
  port: number,
  options?: {
    mockUserToken?: EmulatorMockTokenOptions | string;
  },
): void {
  (db as DatabaseWithMethodsInternal).useEmulator.call(
    db,
    host,
    port,
    options,
    MODULAR_DEPRECATION_ARG,
  );
}

export function goOffline(db: Database): void {
  (db as DatabaseWithMethodsInternal).goOffline.call(db, MODULAR_DEPRECATION_ARG);
}

export function goOnline(db: Database): void {
  (db as DatabaseWithMethodsInternal).goOnline.call(db, MODULAR_DEPRECATION_ARG);
}

export function ref(db: Database, path?: string) {
  return (db as DatabaseWithMethodsInternal).ref.call(db, path, MODULAR_DEPRECATION_ARG);
}

export function refFromURL(db: Database, url: string) {
  return (db as DatabaseWithMethodsInternal).refFromURL.call(db, url, MODULAR_DEPRECATION_ARG);
}

export function setPersistenceEnabled(db: Database, enabled: boolean): Promise<void> {
  return (db as DatabaseWithMethodsInternal).setPersistenceEnabled.call(
    db,
    enabled,
    MODULAR_DEPRECATION_ARG,
  ) as Promise<void>;
}

export function setLoggingEnabled(db: Database, enabled: boolean): Promise<void> {
  return (db as DatabaseWithMethodsInternal).setLoggingEnabled.call(
    db,
    enabled,
    MODULAR_DEPRECATION_ARG,
  ) as Promise<void>;
}

export function setPersistenceCacheSizeBytes(db: Database, bytes: number): Promise<void> {
  return (db as DatabaseWithMethodsInternal).setPersistenceCacheSizeBytes.call(
    db,
    bytes,
    MODULAR_DEPRECATION_ARG,
  ) as Promise<void>;
}

export function forceLongPolling(): void {
  throw new Error('forceLongPolling() is not implemented');
}

export function forceWebSockets(): void {
  throw new Error('forceWebSockets() is not implemented');
}

export function serverTimestamp(): object {
  return ServerValue.TIMESTAMP;
}

export function getServerTime(db: Database): Date {
  return (db as DatabaseWithMethodsInternal).getServerTime.call(db, MODULAR_DEPRECATION_ARG);
}

export function increment(delta: number): object {
  return ServerValue.increment.call(ServerValue, delta, MODULAR_DEPRECATION_ARG);
}

export { ServerValue };

export function enableLogging(enabled: boolean, persistent?: boolean): any;
export function enableLogging(logger: (message: string) => unknown): any;
export function enableLogging(
  _enabledOrLogger: boolean | ((message: string) => unknown),
  _persistent?: boolean,
): any {
  throw new Error('enableLogging() is not implemented');
}

export * from './modular/query';
export * from './modular/transaction';

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
  isAndroid,
  isBoolean,
  isNumber,
  isString,
} from '@react-native-firebase/app/dist/module/common';
import type { FirebaseApp } from '@react-native-firebase/app';
import {
  FirebaseModule,
  getOrCreateModularInstance,
} from '@react-native-firebase/app/dist/module/internal';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type {
  DatabaseInternal,
  DatabaseReferenceInternal,
  DatabaseTransactionInternal,
  DatabaseWithMethodsInternal,
  RNFBDatabaseModule,
  ServerValueStaticInternal,
} from './types/internal';
import './types/internal';
import DatabaseReferenceImpl from './DatabaseReference';
import DatabaseStatics from './DatabaseStatics';
import DatabaseTransaction from './DatabaseTransaction';
import type {
  Database,
  DatabaseReference,
  DataSnapshot,
  EmulatorMockTokenOptions,
} from './types/database';
import { version } from './version';
import fallBackModule from './web/RNFBDatabaseModule';

const nativeModuleName = 'NativeRNFBTurboDatabase';

const nativeModuleNames = [
  nativeModuleName,
  'NativeRNFBTurboDatabaseReference',
  'NativeRNFBTurboDatabaseQuery',
  'NativeRNFBTurboDatabaseOnDisconnect',
  'NativeRNFBTurboDatabaseTransaction',
] as const;

function ap(reference: DatabaseReference): DatabaseReferenceInternal {
  return reference as unknown as DatabaseReferenceInternal;
}

class FirebaseDatabaseModule extends FirebaseModule<typeof nativeModuleName> {
  readonly type = 'database' as const;
  _serverTimeOffset: number;
  _customUrlOrRegion: string | null;
  _transaction: DatabaseTransactionInternal;

  private get nativeModule(): RNFBDatabaseModule {
    return this.native as RNFBDatabaseModule;
  }

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    databaseUrl?: string | null,
  ) {
    super(app, config, databaseUrl);
    this._serverTimeOffset = 0;
    this._customUrlOrRegion = databaseUrl || this.app.options.databaseURL || null;
    this._transaction = new DatabaseTransaction(this as unknown as DatabaseInternal);
    setTimeout(() => {
      this._syncServerTimeOffset();
    }, 100);
  }

  _syncServerTimeOffset(): void {
    ap(this.ref('.info/serverTimeOffset')).on('value', (snapshot: DataSnapshot) => {
      this._serverTimeOffset = snapshot.val();
    });
  }

  getServerTime(): Date {
    return new Date(Date.now() + this._serverTimeOffset);
  }

  ref(path = '/'): DatabaseReference {
    if (!isString(path)) {
      throw new Error("firebase.app().database().ref(*) 'path' must be a string value.");
    }

    if (/[#$\[\]'?]/g.test(path)) {
      throw new Error(
        `Paths must be non-empty strings and can't contain #, $, [, ], ' or ? | path: ${path}`,
      );
    }

    return new DatabaseReferenceImpl(this, path);
  }

  refFromURL(url: string): DatabaseReference {
    if (!isString(url) || !url.startsWith('https://')) {
      throw new Error(
        "firebase.app().database().refFromURL(*) 'url' must be a valid database URL.",
      );
    }

    if (!url.includes(this._customUrlOrRegion as string)) {
      throw new Error(
        `firebase.app().database().refFromURL(*) 'url' must be the same domain as the current instance (${this._customUrlOrRegion}). To use a different database domain, create a new Firebase instance.`,
      );
    }

    let path = url.replace(this._customUrlOrRegion as string, '');
    if (path.includes('?')) {
      path = path.slice(0, path.indexOf('?'));
    }

    return new DatabaseReferenceImpl(this, path || '/');
  }

  goOnline(): Promise<void> {
    return this.nativeModule.goOnline();
  }

  goOffline(): Promise<void> {
    return this.nativeModule.goOffline();
  }

  setPersistenceEnabled(enabled: boolean): Promise<void> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.app().database().setPersistenceEnabled(*) 'enabled' must be a boolean value.",
      );
    }

    return this.nativeModule.setPersistenceEnabled(enabled);
  }

  setLoggingEnabled(enabled: boolean): Promise<void> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.app().database().setLoggingEnabled(*) 'enabled' must be a boolean value.",
      );
    }

    return this.nativeModule.setLoggingEnabled(enabled);
  }

  setPersistenceCacheSizeBytes(bytes: number): Promise<void> {
    if (!isNumber(bytes)) {
      throw new Error(
        "firebase.app().database().setPersistenceCacheSizeBytes(*) 'bytes' must be a number value.",
      );
    }

    if (bytes < 1048576) {
      throw new Error(
        "firebase.app().database().setPersistenceCacheSizeBytes(*) 'bytes' must be greater than 1048576 bytes (1MB).",
      );
    }

    if (bytes > 104857600) {
      throw new Error(
        "firebase.app().database().setPersistenceCacheSizeBytes(*) 'bytes' must be less than 104857600 bytes (100MB).",
      );
    }

    return this.nativeModule.setPersistenceCacheSizeBytes(bytes);
  }

  useEmulator(host: string, port: number): [string, number] {
    if (!host || !isString(host) || !port || !isNumber(port)) {
      throw new Error('firebase.database().useEmulator() takes a non-empty host and port');
    }
    let remappedHost = host;
    const androidBypassEmulatorUrlRemap =
      typeof this.firebaseJson.android_bypass_emulator_url_remap === 'boolean' &&
      this.firebaseJson.android_bypass_emulator_url_remap;
    if (!androidBypassEmulatorUrlRemap && isAndroid && remappedHost) {
      if (remappedHost.startsWith('localhost')) {
        remappedHost = remappedHost.replace('localhost', '10.0.2.2');
        // eslint-disable-next-line no-console
        console.log(
          'Mapping database host "localhost" to "10.0.2.2" for android emulators. Use real IP on real devices. You can bypass this behaviour with "android_bypass_emulator_url_remap" flag.',
        );
      }
      if (remappedHost.startsWith('127.0.0.1')) {
        remappedHost = remappedHost.replace('127.0.0.1', '10.0.2.2');
        // eslint-disable-next-line no-console
        console.log(
          'Mapping database host "127.0.0.1" to "10.0.2.2" for android emulators. Use real IP on real devices. You can bypass this behaviour with "android_bypass_emulator_url_remap" flag.',
        );
      }
    }
    this.nativeModule.useEmulator(remappedHost, port);
    return [remappedHost, port];
  }
}

const config: ModuleConfig = {
  namespace: 'database',
  nativeModuleName: [...nativeModuleNames],
  nativeEvents: ['database_transaction_event', 'database_sync_event'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  turboModule: true,
};

export const SDK_VERSION = version;

const { ServerValue } = DatabaseStatics;

export function getDatabase(app?: FirebaseApp, url?: string): Database {
  return getOrCreateModularInstance(
    FirebaseDatabaseModule,
    config,
    app,
    url,
  ) as unknown as Database;
}

export function connectDatabaseEmulator(
  db: Database,
  host: string,
  port: number,
  options?: {
    mockUserToken?: EmulatorMockTokenOptions | string;
  },
): void {
  (db as DatabaseWithMethodsInternal).useEmulator(host, port, options);
}

/**
 * Manually disconnects the Realtime Database client from the server.
 *
 * @remarks On React Native Firebase the underlying native call is **async** (`Promise<void>`),
 * but this modular helper matches the firebase-js-sdk fire-and-forget `void` signature — the
 * promise is not returned. Prefer awaiting the instance method when you need completion.
 */
export function goOffline(db: Database): void {
  (db as DatabaseWithMethodsInternal).goOffline();
}

/**
 * Manually re-establishes the Realtime Database connection.
 *
 * @remarks On React Native Firebase the underlying native call is **async** (`Promise<void>`),
 * but this modular helper matches the firebase-js-sdk fire-and-forget `void` signature — the
 * promise is not returned. Prefer awaiting the instance method when you need completion.
 */
export function goOnline(db: Database): void {
  (db as DatabaseWithMethodsInternal).goOnline();
}

export function ref(db: Database, path?: string): DatabaseReference {
  return (db as DatabaseWithMethodsInternal).ref(path);
}

export function refFromURL(db: Database, url: string): DatabaseReference {
  return (db as DatabaseWithMethodsInternal).refFromURL(url);
}

/**
 * Enables or disables disk persistence for the Realtime Database instance.
 *
 * @remarks React Native Firebase-specific API with no firebase-js-sdk modular equivalent.
 * Must be called before any database references are used. Persistence is provided by the
 * native iOS/Android SDK, not the web IndexedDB stack.
 */
export function setPersistenceEnabled(db: Database, enabled: boolean): Promise<void> {
  return (db as DatabaseWithMethodsInternal).setPersistenceEnabled(enabled) as Promise<void>;
}

export function setLoggingEnabled(db: Database, enabled: boolean): Promise<void> {
  return (db as DatabaseWithMethodsInternal).setLoggingEnabled(enabled) as Promise<void>;
}

/**
 * Sets the on-disk persistence cache size in bytes.
 *
 * @remarks React Native Firebase-specific API with no firebase-js-sdk modular equivalent.
 * Valid range is 1 MB–100 MB. Must be called before any database references are used.
 */
export function setPersistenceCacheSizeBytes(db: Database, bytes: number): Promise<void> {
  return (db as DatabaseWithMethodsInternal).setPersistenceCacheSizeBytes(bytes) as Promise<void>;
}

/**
 * @remarks **Not implemented on React Native Firebase.** Always throws — transport mode is
 * controlled by the native Realtime Database SDK.
 */
export function forceLongPolling(): void {
  throw new Error('forceLongPolling() is not implemented');
}

/**
 * @remarks **Not implemented on React Native Firebase.** Always throws — transport mode is
 * controlled by the native Realtime Database SDK.
 */
export function forceWebSockets(): void {
  throw new Error('forceWebSockets() is not implemented');
}

export function serverTimestamp(): object {
  return ServerValue.TIMESTAMP;
}

/**
 * Returns the current server time as a `Date`, adjusted for clock skew.
 *
 * @remarks React Native Firebase-specific helper with no firebase-js-sdk modular equivalent.
 * Reads the native `.info/serverTimeOffset` listener maintained by the database module.
 */
export function getServerTime(db: Database): Date {
  return (db as DatabaseWithMethodsInternal).getServerTime();
}

export function increment(delta: number): object {
  return (ServerValue as ServerValueStaticInternal).increment(delta);
}

export function enableLogging(enabled: boolean, persistent?: boolean): any;
export function enableLogging(logger: (message: string) => unknown): any;
export function enableLogging(
  _enabledOrLogger: boolean | ((message: string) => unknown),
  _persistent?: boolean,
): any {
  throw new Error('enableLogging() is not implemented');
}

export type * from './types/database';
export * from './modular/query';
export * from './modular/transaction';

for (const moduleName of nativeModuleNames) {
  setReactNativeModule(moduleName, fallBackModule as unknown as Record<string, unknown>);
}

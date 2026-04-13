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
  MODULAR_DEPRECATION_ARG,
  createDeprecationProxy,
} from '@react-native-firebase/app/dist/module/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/dist/module/internal';
import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
// @ts-expect-error Legacy JS module without declarations until type split step.
import DatabaseReference from './DatabaseReference';
// @ts-expect-error Legacy JS module without declarations until type split step.
import DatabaseStatics from './DatabaseStatics';
// @ts-expect-error Legacy JS module without declarations until type split step.
import DatabaseTransaction from './DatabaseTransaction';
// @ts-expect-error Legacy JS module without declarations until type split step.
import version from './version';
// @ts-expect-error Legacy JS module without declarations until type split step.
import fallBackModule from './web/RNFBDatabaseModule';

const namespace = 'database';

const nativeModuleName: string[] = [
  'RNFBDatabaseModule',
  'RNFBDatabaseReferenceModule',
  'RNFBDatabaseQueryModule',
  'RNFBDatabaseOnDisconnectModule',
  'RNFBDatabaseTransactionModule',
] as const;

class FirebaseDatabaseModule extends FirebaseModule {
  _serverTimeOffset: number;
  _customUrlOrRegion: string | null;
  _transaction: DatabaseTransaction;

  constructor(app: any, config: any, databaseUrl?: string | null) {
    super(app, config, databaseUrl);
    this._serverTimeOffset = 0;
    this._customUrlOrRegion = databaseUrl || this.app.options.databaseURL || null;
    this._transaction = new DatabaseTransaction(this);
    setTimeout(() => {
      this._syncServerTimeOffset();
    }, 100);
  }

  _syncServerTimeOffset(): void {
    this.ref('.info/serverTimeOffset').on(
      'value',
      (snapshot: { val(): number }) => {
        this._serverTimeOffset = snapshot.val();
      },
      MODULAR_DEPRECATION_ARG,
    );
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

    return createDeprecationProxy(new DatabaseReference(this, path));
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

    return createDeprecationProxy(new DatabaseReference(this, path || '/'));
  }

  goOnline(): Promise<void> {
    return this.native.goOnline();
  }

  goOffline(): Promise<void> {
    return this.native.goOffline();
  }

  setPersistenceEnabled(enabled: boolean): Promise<void> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.app().database().setPersistenceEnabled(*) 'enabled' must be a boolean value.",
      );
    }

    return this.native.setPersistenceEnabled(enabled);
  }

  setLoggingEnabled(enabled: boolean): Promise<void> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.app().database().setLoggingEnabled(*) 'enabled' must be a boolean value.",
      );
    }

    return this.native.setLoggingEnabled(enabled);
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

    return this.native.setPersistenceCacheSizeBytes(bytes);
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
    this.native.useEmulator(remappedHost, port);
    return [remappedHost, port];
  }
}

export const SDK_VERSION = version;

const databaseNamespace = createModuleNamespace({
  statics: DatabaseStatics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: ['database_transaction_event', 'database_sync_event'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  ModuleClass: FirebaseDatabaseModule,
});

export default databaseNamespace;

export const firebase = getFirebaseRoot();

for (const moduleName of nativeModuleName) {
  setReactNativeModule(moduleName, fallBackModule);
}

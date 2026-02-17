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
  createDeprecationProxy,
  isAndroid,
  isBoolean,
  isFunction,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from '@react-native-firebase/app/dist/module/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
  type ModuleConfig,
} from '@react-native-firebase/app/dist/module/internal';
import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import FirestoreCollectionReference from './FirestoreCollectionReference';
import FirestoreDocumentReference from './FirestoreDocumentReference';
import FirestorePath from './FirestorePath';
import FirestorePersistentCacheIndexManager from './FirestorePersistentCacheIndexManager';
import FirestoreQuery from './FirestoreQuery';
import FirestoreQueryModifiers from './FirestoreQueryModifiers';
import FirestoreStatics from './FirestoreStatics';
import FirestoreTransactionHandler from './FirestoreTransactionHandler';
import FirestoreWriteBatch from './FirestoreWriteBatch';
import version from './version';
import type { FirebaseWithFirestore, FirestoreNamespace } from './types/namespaced';
import fallBackModule from './web/RNFBFirestoreModule';

// react-native at least through 0.77 does not correctly support URL.host, which
// is needed by firebase-js-sdk. It appears that in 0.80+ it is supported, so this
// (and the package.json entry for this package) should be removed when the minimum
// supported version of react-native is 0.80 or higher.
import 'react-native-url-polyfill/auto';

const namespace = 'firestore';

const nativeModuleName = [
  'RNFBFirestoreModule',
  'RNFBFirestoreCollectionModule',
  'RNFBFirestoreDocumentModule',
  'RNFBFirestoreTransactionModule',
] as const;

const nativeEvents = [
  'firestore_collection_sync_event',
  'firestore_document_sync_event',
  'firestore_transaction_event',
  'firestore_snapshots_in_sync_event',
] as const;

type FirestoreModuleSettingsState = {
  ignoreUndefinedProperties: boolean;
  persistence: boolean;
};

class FirebaseFirestoreModule extends FirebaseModule {
  _referencePath: FirestorePath;
  _transactionHandler: FirestoreTransactionHandler;
  _settings: FirestoreModuleSettingsState;

  constructor(app: ReactNativeFirebase.FirebaseAppBase, config: ModuleConfig, databaseId?: string) {
    super(app, config);

    if (isString(databaseId) || databaseId === undefined) {
      this._customUrlOrRegion = databaseId || '(default)';
    } else {
      throw new Error('firebase.app().firestore(*) database ID must be a string');
    }

    this._referencePath = new FirestorePath();
    this._transactionHandler = new FirestoreTransactionHandler(this);

    // Fan out native events
    this.emitter.addListener(this.eventNameForApp('firestore_collection_sync_event'), event => {
      const syncEvent = event as { listenerId: string | number };
      this.emitter.emit(
        this.eventNameForApp(`firestore_collection_sync_event:${syncEvent.listenerId}`),
        event,
      );
    });

    this.emitter.addListener(this.eventNameForApp('firestore_document_sync_event'), event => {
      const syncEvent = event as { listenerId: string | number };
      this.emitter.emit(
        this.eventNameForApp(`firestore_document_sync_event:${syncEvent.listenerId}`),
        event,
      );
    });

    this.emitter.addListener(this.eventNameForApp('firestore_snapshots_in_sync_event'), event => {
      const syncEvent = event as { listenerId: string | number };
      this.emitter.emit(
        this.eventNameForApp(`firestore_snapshots_in_sync_event:${syncEvent.listenerId}`),
        event,
      );
    });

    this._settings = {
      ignoreUndefinedProperties: false,
      persistence: true,
    };
  }

  get customUrlOrRegion(): string {
    return this._customUrlOrRegion as string;
  }

  // We override the FirebaseModule's eventNameForApp() method to include the customUrlOrRegion
  eventNameForApp(...args: Array<string | number>): string {
    return `${this.app.name}-${this._customUrlOrRegion}-${args.join('-')}`;
  }

  batch(): FirestoreWriteBatch {
    return new FirestoreWriteBatch(this);
  }

  loadBundle(bundle: string): Promise<unknown> {
    if (!isString(bundle)) {
      throw new Error("firebase.firestore().loadBundle(*) 'bundle' must be a string value.");
    }

    if (bundle === '') {
      throw new Error("firebase.firestore().loadBundle(*) 'bundle' must be a non-empty string.");
    }

    return this.native.loadBundle(bundle);
  }

  namedQuery(queryName: string): FirestoreQuery | null {
    if (!isString(queryName)) {
      throw new Error("firebase.firestore().namedQuery(*) 'queryName' must be a string value.");
    }

    if (queryName === '') {
      throw new Error("firebase.firestore().namedQuery(*) 'queryName' must be a non-empty string.");
    }

    return new FirestoreQuery(this, this._referencePath, new FirestoreQueryModifiers(), queryName);
  }

  async clearPersistence(): Promise<void> {
    await this.native.clearPersistence();
  }

  async waitForPendingWrites(): Promise<void> {
    await this.native.waitForPendingWrites();
  }

  async terminate(): Promise<void> {
    await this.native.terminate();
  }

  useEmulator(host: string, port: number): [string, number] {
    if (!host || !isString(host) || !port || !isNumber(port)) {
      throw new Error('firebase.firestore().useEmulator() takes a non-empty host and port');
    }

    let mappedHost = host;
    const androidBypassEmulatorUrlRemap =
      typeof this.firebaseJson.android_bypass_emulator_url_remap === 'boolean' &&
      this.firebaseJson.android_bypass_emulator_url_remap;

    if (!androidBypassEmulatorUrlRemap && isAndroid && mappedHost) {
      if (mappedHost === 'localhost' || mappedHost === '127.0.0.1') {
        mappedHost = '10.0.2.2';
        // eslint-disable-next-line no-console
        console.log(
          'Mapping firestore host to "10.0.2.2" for android emulators. Use real IP on real devices. You can bypass this behaviour with "android_bypass_emulator_url_remap" flag.',
        );
      }
    }

    this.native.useEmulator(mappedHost, port);
    return [mappedHost, port]; // undocumented return, just used to unit test android host remapping
  }

  collection(collectionPath: string): FirestoreCollectionReference {
    if (!isString(collectionPath)) {
      throw new Error(
        "firebase.firestore().collection(*) 'collectionPath' must be a string value.",
      );
    }

    if (collectionPath === '') {
      throw new Error(
        "firebase.firestore().collection(*) 'collectionPath' must be a non-empty string.",
      );
    }

    const path = this._referencePath.child(collectionPath);

    if (!path.isCollection) {
      throw new Error(
        "firebase.firestore().collection(*) 'collectionPath' must point to a collection.",
      );
    }

    return createDeprecationProxy(new FirestoreCollectionReference(this, path));
  }

  collectionGroup(collectionId: string): FirestoreQuery {
    if (!isString(collectionId)) {
      throw new Error(
        "firebase.firestore().collectionGroup(*) 'collectionId' must be a string value.",
      );
    }

    if (collectionId === '') {
      throw new Error(
        "firebase.firestore().collectionGroup(*) 'collectionId' must be a non-empty string.",
      );
    }

    if (collectionId.includes('/')) {
      throw new Error(
        "firebase.firestore().collectionGroup(*) 'collectionId' must not contain '/'.",
      );
    }

    return createDeprecationProxy(
      new FirestoreQuery(
        this,
        this._referencePath.child(collectionId),
        new FirestoreQueryModifiers().asCollectionGroupQuery(),
        undefined,
      ),
    );
  }

  async disableNetwork(): Promise<void> {
    await this.native.disableNetwork();
  }

  doc(documentPath: string): FirestoreDocumentReference {
    if (!isString(documentPath)) {
      throw new Error("firebase.firestore().doc(*) 'documentPath' must be a string value.");
    }

    if (documentPath === '') {
      throw new Error("firebase.firestore().doc(*) 'documentPath' must be a non-empty string.");
    }

    const path = this._referencePath.child(documentPath);

    if (!path.isDocument) {
      throw new Error("firebase.firestore().doc(*) 'documentPath' must point to a document.");
    }

    return createDeprecationProxy(new FirestoreDocumentReference(this, path));
  }

  async enableNetwork(): Promise<void> {
    await this.native.enableNetwork();
  }

  runTransaction(updateFunction: (transaction: unknown) => Promise<unknown>): Promise<unknown> {
    if (!isFunction(updateFunction)) {
      return Promise.reject(
        new Error("firebase.firestore().runTransaction(*) 'updateFunction' must be a function."),
      );
    }

    return this._transactionHandler._add(updateFunction);
  }

  settings(settings: Record<string, unknown>): Promise<void> {
    if (!isObject(settings)) {
      return Promise.reject(
        new Error("firebase.firestore().settings(*) 'settings' must be an object."),
      );
    }

    const keys = Object.keys(settings);
    const opts = [
      'cacheSizeBytes',
      'host',
      'persistence',
      'ssl',
      'ignoreUndefinedProperties',
      'serverTimestampBehavior',
    ];

    for (const key of keys) {
      if (!opts.includes(key)) {
        return Promise.reject(
          new Error(
            `firebase.firestore().settings(*) 'settings.${key}' is not a valid settings field.`,
          ),
        );
      }
    }

    if (!isUndefined(settings.cacheSizeBytes)) {
      if (!isNumber(settings.cacheSizeBytes)) {
        return Promise.reject(
          new Error(
            "firebase.firestore().settings(*) 'settings.cacheSizeBytes' must be a number value.",
          ),
        );
      }

      if (
        settings.cacheSizeBytes !== FirestoreStatics.CACHE_SIZE_UNLIMITED &&
        settings.cacheSizeBytes < 1048576
      ) {
        return Promise.reject(
          new Error(
            "firebase.firestore().settings(*) 'settings.cacheSizeBytes' the minimum cache size is 1048576 bytes (1MB).",
          ),
        );
      }
    }

    if (!isUndefined(settings.host)) {
      if (!isString(settings.host)) {
        return Promise.reject(
          new Error("firebase.firestore().settings(*) 'settings.host' must be a string value."),
        );
      }

      if (settings.host === '') {
        return Promise.reject(
          new Error(
            "firebase.firestore().settings(*) 'settings.host' must not be an empty string.",
          ),
        );
      }

      if (isAndroid) {
        if (settings.host.startsWith('localhost')) {
          settings.host = settings.host.replace('localhost', '10.0.2.2');
          // eslint-disable-next-line no-console
          console.log(
            'Mapping firestore host "localhost" to "10.0.2.2" for android emulators. Use real IP on real devices.',
          );
        }
        if (settings.host.startsWith('127.0.0.1')) {
          settings.host = settings.host.replace('127.0.0.1', '10.0.2.2');
          // eslint-disable-next-line no-console
          console.log(
            'Mapping firestore host "127.0.0.1" to "10.0.2.2" for android emulators. Use real IP on real devices.',
          );
        }
      }
    }

    if (!isUndefined(settings.persistence) && !isBoolean(settings.persistence)) {
      return Promise.reject(
        new Error(
          "firebase.firestore().settings(*) 'settings.persistence' must be a boolean value.",
        ),
      );
    }

    if (!isUndefined(settings.ssl) && !isBoolean(settings.ssl)) {
      throw new Error("firebase.firestore().settings(*) 'settings.ssl' must be a boolean value.");
    }

    if (
      !isUndefined(settings.serverTimestampBehavior) &&
      !['estimate', 'previous', 'none'].includes(settings.serverTimestampBehavior as string)
    ) {
      return Promise.reject(
        new Error(
          "firebase.firestore().settings(*) 'settings.serverTimestampBehavior' must be one of 'estimate', 'previous', 'none'.",
        ),
      );
    }

    if (!isUndefined(settings.ignoreUndefinedProperties)) {
      if (!isBoolean(settings.ignoreUndefinedProperties)) {
        return Promise.reject(
          new Error(
            "firebase.firestore().settings(*) 'settings.ignoreUndefinedProperties' must be a boolean value.",
          ),
        );
      }
      this._settings.ignoreUndefinedProperties = settings.ignoreUndefinedProperties;
      delete settings.ignoreUndefinedProperties;
    }

    if (settings.persistence === false) {
      // Required for persistentCacheIndexManager(), if this setting is `false`, it returns `null`
      this._settings.persistence = false;
    }

    return this.native.settings(settings);
  }

  persistentCacheIndexManager(): FirestorePersistentCacheIndexManager | null {
    if (this._settings.persistence === false) {
      return null;
    }
    return createDeprecationProxy(new FirestorePersistentCacheIndexManager(this));
  }
}

// import { SDK_VERSION } from '@react-native-firebase/firestore';
export const SDK_VERSION = version;

const firestoreNamespace = createModuleNamespace({
  statics: FirestoreStatics,
  version,
  namespace,
  nativeModuleName: [...nativeModuleName],
  nativeEvents: [...nativeEvents],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  ModuleClass: FirebaseFirestoreModule,
});

// import firestore from '@react-native-firebase/firestore';
// firestore().X(...);
export default firestoreNamespace as unknown as FirestoreNamespace;

// import firestore, { firebase } from '@react-native-firebase/firestore';
// firestore().X(...);
// firebase.firestore().X(...);
export const firebase = getFirebaseRoot() as unknown as FirebaseWithFirestore;

// Register the interop module for non-native platforms.
for (const moduleName of nativeModuleName) {
  setReactNativeModule(moduleName, fallBackModule);
}

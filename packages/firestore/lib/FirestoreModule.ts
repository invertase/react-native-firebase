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
  isFunction,
  isNumber,
  isObject,
  isString,
  isUndefined,
  isOther,
} from '@react-native-firebase/app/dist/module/common';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseModule, type ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import CollectionReferenceClass from './FirestoreCollectionReference';
import DocumentReferenceClass from './FirestoreDocumentReference';
import FirestorePath from './FirestorePath';
import FirestorePersistentCacheIndexManagerClass from './FirestorePersistentCacheIndexManager';
import QueryClass from './FirestoreQuery';
import QueryModifiers from './FirestoreQueryModifiers';
import FirestoreStatics from './FirestoreStatics';
import FirestoreTransactionHandler from './FirestoreTransactionHandler';
import FirestoreWriteBatch from './FirestoreWriteBatch';
import { LoadBundleTask } from './LoadBundleTask';
import type { LoadBundleTaskProgress } from './types/firestore';
import type { FirestoreInternal } from './types/internal';
import fallBackModule from './web/RNFBFirestoreModule';

const namespace = 'firestore';

export const nativeModuleNames = [
  'NativeRNFBTurboFirestore',
  'NativeRNFBTurboFirestoreCollection',
  'NativeRNFBTurboFirestoreDocument',
  'NativeRNFBTurboFirestoreTransaction',
] as const;

const nativeEvents = [
  'firestore_collection_sync_event',
  'firestore_document_sync_event',
  'firestore_transaction_event',
  'firestore_snapshots_in_sync_event',
] as const;

export const config: ModuleConfig = {
  namespace,
  nativeModuleName: [...nativeModuleNames],
  nativeEvents: [...nativeEvents],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  turboModule: true,
};

type FirestoreModuleSettingsState = {
  ignoreUndefinedProperties: boolean;
  persistence: boolean;
};

/** Sync event payload from emitter when fanning out collection/document/snapshots-in-sync events. */
type FirestoreSyncEventWithListenerId = { listenerId: string | number };

export class FirebaseFirestoreModule extends FirebaseModule<'NativeRNFBTurboFirestore'> {
  type = 'firestore' as const;
  _referencePath: FirestorePath;
  _transactionHandler: FirestoreTransactionHandler;
  _settings: FirestoreModuleSettingsState;
  _databaseId: string | null;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    databaseId?: string | null,
  ) {
    super(app, config);

    if (isString(databaseId) || databaseId === undefined) {
      this._databaseId = databaseId || '(default)';
      // Kept for backwards compatibility with the modular API
      this._customUrlOrRegion = this._databaseId;
    } else {
      throw new Error('firebase.app().firestore(*) database ID must be a string');
    }

    this._referencePath = new FirestorePath();
    this._transactionHandler = new FirestoreTransactionHandler(
      this as unknown as FirestoreInternal,
    );

    // Fan out native events
    this.emitter.addListener(this.eventNameForApp('firestore_collection_sync_event'), event => {
      const syncEvent = event as FirestoreSyncEventWithListenerId;
      this.emitter.emit(
        this.eventNameForApp(`firestore_collection_sync_event:${syncEvent.listenerId}`),
        event,
      );
    });

    this.emitter.addListener(this.eventNameForApp('firestore_document_sync_event'), event => {
      const syncEvent = event as FirestoreSyncEventWithListenerId;
      this.emitter.emit(
        this.eventNameForApp(`firestore_document_sync_event:${syncEvent.listenerId}`),
        event,
      );
    });

    this.emitter.addListener(this.eventNameForApp('firestore_snapshots_in_sync_event'), event => {
      const syncEvent = event as FirestoreSyncEventWithListenerId;
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

  toJSON(): object {
    return {
      app: this.app,
      databaseId: this._databaseId,
      settings: this._settings,
    };
  }
  // Kept for backwards compatibility with the modular API
  get customUrlOrRegion(): string {
    return this._databaseId as string;
  }

  // We override the FirebaseModule's eventNameForApp() method to include the customUrlOrRegion
  eventNameForApp(...args: Array<string | number>): string {
    return `${this.app.name}-${this._databaseId}-${args.join('-')}`;
  }

  batch(): FirestoreWriteBatch {
    return new FirestoreWriteBatch(this as unknown as FirestoreInternal);
  }

  loadBundle(bundle: string): LoadBundleTask {
    if (!isString(bundle)) {
      throw new Error("firebase.firestore().loadBundle(*) 'bundle' must be a string value.");
    }

    if (bundle === '') {
      throw new Error("firebase.firestore().loadBundle(*) 'bundle' must be a non-empty string.");
    }

    const task = new LoadBundleTask();
    this.native
      .loadBundle(bundle)
      .then((progress: LoadBundleTaskProgress) => task._completeWith(progress))
      .catch((error: Error) => task._failWith(error));
    return task;
  }

  namedQuery(queryName: string): QueryClass | null {
    if (!isString(queryName)) {
      throw new Error("firebase.firestore().namedQuery(*) 'queryName' must be a string value.");
    }

    if (queryName === '') {
      throw new Error("firebase.firestore().namedQuery(*) 'queryName' must be a non-empty string.");
    }

    return new QueryClass(
      this as unknown as FirestoreInternal,
      this._referencePath,
      new QueryModifiers(),
      queryName,
    );
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

  useEmulator(host: string, port: number): void {
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
    // @ts-ignore - undocumented return, just used to unit test android host remapping
    return [mappedHost, port];
  }

  collection(collectionPath: string): CollectionReferenceClass {
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

    return new CollectionReferenceClass(this as unknown as FirestoreInternal, path);
  }

  collectionGroup(collectionId: string): QueryClass {
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

    return new QueryClass(
      this as unknown as FirestoreInternal,
      this._referencePath.child(collectionId),
      new QueryModifiers().asCollectionGroupQuery(),
      undefined,
    );
  }

  async disableNetwork(): Promise<void> {
    await this.native.disableNetwork();
  }

  doc(documentPath: string): DocumentReferenceClass {
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

    return new DocumentReferenceClass(this as unknown as FirestoreInternal, path);
  }

  async enableNetwork(): Promise<void> {
    await this.native.enableNetwork();
  }

  runTransaction(
    updateFunction: (transaction: unknown) => Promise<unknown>,
    options?: { maxAttempts?: number },
  ): Promise<unknown> {
    if (!isFunction(updateFunction)) {
      return Promise.reject(
        new Error("firebase.firestore().runTransaction(*) 'updateFunction' must be a function."),
      );
    }

    return this._transactionHandler._add(updateFunction, options);
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
      'localCache',
      'persistence',
      'ssl',
      'ignoreUndefinedProperties',
      'serverTimestampBehavior',
      'experimentalForceLongPolling',
      'experimentalAutoDetectLongPolling',
      'experimentalLongPollingOptions',
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
        const host = settings.host as string;
        if (host.startsWith('localhost')) {
          settings.host = host.replace('localhost', '10.0.2.2');
          // eslint-disable-next-line no-console
          console.log(
            'Mapping firestore host "localhost" to "10.0.2.2" for android emulators. Use real IP on real devices.',
          );
        }
        if ((settings.host as string).startsWith('127.0.0.1')) {
          settings.host = (settings.host as string).replace('127.0.0.1', '10.0.2.2');
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

    const settingsToApply = isOther ? settings : { ...settings };

    if (!isOther) {
      delete settingsToApply.localCache;
      delete settingsToApply.experimentalForceLongPolling;
      delete settingsToApply.experimentalAutoDetectLongPolling;
      delete settingsToApply.experimentalLongPollingOptions;
    }

    return this.native.settings(settingsToApply);
  }

  persistentCacheIndexManager(): FirestorePersistentCacheIndexManagerClass | null {
    if (this._settings.persistence === false) {
      return null;
    }
    return new FirestorePersistentCacheIndexManagerClass(this as unknown as FirestoreInternal);
  }
}

// Register the interop module for non-native platforms.
for (const moduleName of nativeModuleNames) {
  setReactNativeModule(moduleName, fallBackModule);
}

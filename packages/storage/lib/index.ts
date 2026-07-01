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

import { isAndroid, isNumber, isString } from '@react-native-firebase/app/dist/module/common';
import type { FirebaseApp } from '@react-native-firebase/app';
import {
  FirebaseModule,
  getOrCreateModularInstance,
} from '@react-native-firebase/app/dist/module/internal';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import Reference from './StorageReference';
import { getGsUrlParts, getHttpUrlParts, handleStorageEvent } from './utils';
import { version } from './version';
import fallBackModule from './web/RNFBStorageModule';
import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import './types/internal';
import type {
  EmulatorMockTokenOptions,
  FirebaseStorage,
  FullMetadata,
  ListOptions,
  ListResult,
  SettableMetadata,
  StorageReference,
  Task,
  TaskResult,
  UploadMetadata,
} from './types/storage';
import type { StorageInternal, StorageReferenceInternal } from './types/internal';

const nativeEvents = ['storage_event'];
const nativeModuleName = 'NativeRNFBTurboStorage';

const config: ModuleConfig = {
  namespace: 'storage',
  nativeEvents,
  nativeModuleName,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  disablePrependCustomUrlOrRegion: true,
  turboModule: true,
};

class FirebaseStorageModule extends FirebaseModule<typeof nativeModuleName> {
  emulatorHost: string | undefined;
  emulatorPort: number;
  _maxUploadRetryTime: number;
  _maxDownloadRetryTime: number;
  _maxOperationRetryTime: number;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    bucketUrl?: string | null,
  ) {
    super(app, config, bucketUrl ?? undefined);
    if (bucketUrl == null) {
      this._customUrlOrRegion = `gs://${app.options.storageBucket}`;
    } else if (!isString(bucketUrl) || !bucketUrl.startsWith('gs://')) {
      throw new Error(
        "firebase.app().storage(*) bucket url must be a string and begin with 'gs://'",
      );
    }

    const storageEvent = nativeEvents[0];

    if (!storageEvent) {
      throw new Error('storage_event is not defined in nativeEvents');
    }

    this.emitter.addListener(
      this.eventNameForApp(storageEvent),
      handleStorageEvent.bind(null, this),
    );

    // Emulator instance vars needed to send through on iOS, iOS does not persist emulator state between calls
    this.emulatorHost = undefined;
    this.emulatorPort = 0;
    this._maxUploadRetryTime = this.native.maxUploadRetryTime || 0;
    this._maxDownloadRetryTime = this.native.maxDownloadRetryTime || 0;
    this._maxOperationRetryTime = this.native.maxOperationRetryTime || 0;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setmaxuploadretrytime
   */
  get maxUploadRetryTime(): number {
    return this._maxUploadRetryTime;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setmaxdownloadretrytime
   */
  get maxDownloadRetryTime(): number {
    return this._maxDownloadRetryTime;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#maxoperationretrytime
   */
  get maxOperationRetryTime(): number {
    return this._maxOperationRetryTime;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#ref
   */
  ref(path: string = '/'): Reference {
    if (!isString(path)) {
      throw new Error("firebase.storage().ref(*) 'path' must be a string value.");
    }
    return new Reference(this, path) as Reference;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#refFromURL
   */
  refFromURL(url: string): Reference {
    if (!isString(url) || (!url.startsWith('gs://') && !url.startsWith('http'))) {
      throw new Error(
        "firebase.storage().refFromURL(*) 'url' must be a string value and begin with 'gs://' or 'https://'.",
      );
    }

    let path: string;
    let bucket: string;

    if (url.startsWith('http')) {
      const parts = getHttpUrlParts(url);
      if (!parts) {
        throw new Error(
          "firebase.storage().refFromURL(*) unable to parse 'url', ensure it's a valid storage url'.",
        );
      }
      ({ bucket, path } = parts);
    } else {
      ({ bucket, path } = getGsUrlParts(url));
    }

    const storageInstance = getOrCreateModularInstance(
      FirebaseStorageModule,
      config,
      this.app,
      bucket,
    ) as unknown as StorageInternal;
    return new Reference(storageInstance, path);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxOperationRetryTime
   */
  setMaxOperationRetryTime(time: number): Promise<void> {
    if (!isNumber(time)) {
      throw new Error(
        "firebase.storage().setMaxOperationRetryTime(*) 'time' must be a number value.",
      );
    }

    this._maxOperationRetryTime = time;
    return this.native.setMaxOperationRetryTime(time);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxUploadRetryTime
   */
  setMaxUploadRetryTime(time: number): Promise<void> {
    if (!isNumber(time)) {
      throw new Error("firebase.storage().setMaxUploadRetryTime(*) 'time' must be a number value.");
    }

    this._maxUploadRetryTime = time;
    return this.native.setMaxUploadRetryTime(time);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxDownloadRetryTime
   */
  setMaxDownloadRetryTime(time: number): Promise<void> {
    if (!isNumber(time)) {
      throw new Error(
        "firebase.storage().setMaxDownloadRetryTime(*) 'time' must be a number value.",
      );
    }

    this._maxDownloadRetryTime = time;
    return this.native.setMaxDownloadRetryTime(time);
  }

  useEmulator(host: string, port: number, _options?: EmulatorMockTokenOptions): void {
    if (!host || !isString(host) || !port || !isNumber(port)) {
      throw new Error('firebase.storage().useEmulator() takes a non-empty host and port');
    }

    let _host = host;

    const androidBypassEmulatorUrlRemap =
      typeof this.firebaseJson.android_bypass_emulator_url_remap === 'boolean' &&
      this.firebaseJson.android_bypass_emulator_url_remap;
    if (!androidBypassEmulatorUrlRemap && isAndroid && _host) {
      if (_host === 'localhost' || _host === '127.0.0.1') {
        _host = '10.0.2.2';
        // eslint-disable-next-line no-console
        console.log(
          'Mapping storage host to "10.0.2.2" for android emulators. Use real IP on real devices. You can bypass this behaviour with "android_bypass_emulator_url_remap" flag.',
        );
      }
    }
    this.emulatorHost = host;
    this.emulatorPort = port;
    this.native.useEmulator(_host, port, this._customUrlOrRegion);
    // @ts-ignore undocumented return, just used to unit test android host remapping
    return [_host, port];
  }
}

export const SDK_VERSION = version;

export function getStorage(app?: FirebaseApp, bucketUrl?: string): FirebaseStorage {
  return getOrCreateModularInstance(
    FirebaseStorageModule,
    config,
    app,
    bucketUrl,
  ) as unknown as FirebaseStorage;
}

export type * from './types/storage';
export { StringFormat, TaskEvent, TaskState } from './StorageStatics';

function isUrl(path?: string): boolean {
  if (typeof path !== 'string') {
    return false;
  }

  return /^[A-Za-z]+:\/\//.test(decodeURIComponent(path));
}

/**
 * Modify this Storage instance to communicate with the Firebase Storage emulator.
 * @param storage - Storage instance.
 * @param host - emulator host (e.g. - 'localhost')
 * @param port - emulator port (e.g. -  9199)
 * @param options - `EmulatorMockTokenOptions` instance. Optional. Web only.
 * @returns {void}
 */
export function connectStorageEmulator(
  storage: FirebaseStorage,
  host: string,
  port: number,
  options?: EmulatorMockTokenOptions,
): void {
  return (storage as StorageInternal).useEmulator(host, port, options);
}

/**
 * Returns a StorageReference for the given URL or path in the default bucket.
 * @param storage - FirebaseStorage instance.
 * @param url - Optional gs:// or https:// URL, or path. If empty, returns root reference.
 * @returns {StorageReference}
 */
export function ref(storage: FirebaseStorage, url?: string): StorageReference;
/**
 * Returns a StorageReference for the given path, or the same reference if path is omitted.
 * @param storageRef - StorageReference instance.
 * @param path - Optional child path. If omitted, returns the same reference.
 * @returns {StorageReference}
 */
export function ref(storageRef: StorageReference, path?: string): StorageReference;
export function ref(
  storageOrRef: FirebaseStorage | StorageReference,
  path?: string,
): StorageReference {
  // ref(parentRef, path) → child reference; ref(parentRef) → same reference (firebase-js-sdk overload)
  if (typeof (storageOrRef as StorageReference).fullPath === 'string') {
    if (path === undefined) {
      return storageOrRef as StorageReference;
    }
    return (storageOrRef as StorageReferenceInternal).child(path);
  }

  const storage = storageOrRef as FirebaseStorage;

  if (path != null && isUrl(path)) {
    return (storage as StorageInternal).refFromURL(path);
  }
  return (storage as StorageInternal).ref(path);
}

/**
 * Deletes the object at this reference's location.
 * @param storageRef - Storage `Reference` instance.
 * @returns {Promise<void>}
 */
export function deleteObject(storageRef: StorageReference): Promise<void> {
  return (storageRef as StorageReferenceInternal).delete();
}

/**
 * Downloads the data at the object's location. Returns an error if the object is not found.
 * @param _storageRef - Storage `Reference` instance.
 * @param _maxDownloadSizeBytes - The maximum allowed size in bytes to retrieve. Web only.
 * @returns {Promise<Blob>}
 */
export function getBlob(
  _storageRef: StorageReference,
  _maxDownloadSizeBytes?: number,
): Promise<Blob> {
  throw new Error('`getBlob()` is not implemented');
}

/**
 * Downloads the data at the object's location. Returns an error if the object is not found.
 * @param _storageRef - Storage `Reference` instance.
 * @param _maxDownloadSizeBytes - The maximum allowed size in bytes to retrieve. Web only.
 * @returns {Promise<ArrayBuffer>}
 */
export function getBytes(
  _storageRef: StorageReference,
  _maxDownloadSizeBytes?: number,
): Promise<ArrayBuffer> {
  throw new Error('`getBytes()` is not implemented');
}

/**
 * Deletes the object at this reference's location.
 * @param storageRef - Storage `Reference` instance.
 * @returns {Promise<string>}
 */
export function getDownloadURL(storageRef: StorageReference): Promise<string> {
  return (storageRef as StorageReferenceInternal).getDownloadURL();
}

/**
 * Fetches metadata for the object at this location, if one exists.
 * @param storageRef - Storage `Reference` instance.
 * @returns {Promise<FullMetadata>}
 */
export function getMetadata(storageRef: StorageReference): Promise<FullMetadata> {
  return (storageRef as StorageReferenceInternal).getMetadata();
}

/**
 * Downloads the data at the object's location. This API is only available in Nodejs.
 * @param _storageRef - Storage `Reference` instance.
 * @param _maxDownloadSizeBytes - The maximum allowed size in bytes to retrieve. Web only.
 * @returns {NodeJS.ReadableStream;}
 */
export function getStream(
  _storageRef: StorageReference,
  _maxDownloadSizeBytes?: number,
): NodeJS.ReadableStream {
  throw new Error('`getStream()` is not implemented');
}

/**
 * List items (files) and prefixes (folders) under this storage reference
 * @param storageRef - Storage `Reference` instance.
 * @param options - Storage `ListOptions` instance. The options list() accepts.
 * @returns {Promise<ListResult>}
 */
export async function list(
  storageRef: StorageReference,
  options?: ListOptions,
): Promise<ListResult> {
  const result = await (storageRef as StorageReferenceInternal).list(options);

  if (result.nextPageToken === null) {
    delete result.nextPageToken;
  }
  return result;
}

/**
 * List all items (files) and prefixes (folders) under this storage reference.
 * @param storageRef - Storage `Reference` instance.
 * @returns {Promise<ListResult>}
 */
export async function listAll(storageRef: StorageReference): Promise<ListResult> {
  const result = await (storageRef as StorageReferenceInternal).listAll();

  if (result.nextPageToken === null) {
    delete result.nextPageToken;
  }
  return result;
}

/**
 * Updates the metadata for this object.
 * @param storageRef - Storage `Reference` instance.
 * @param metadata - A Storage `SettableMetadata` instance to update.
 * @returns {Promise<FullMetadata>}
 */
export function updateMetadata(
  storageRef: StorageReference,
  metadata: SettableMetadata,
): Promise<FullMetadata> {
  return (storageRef as StorageReferenceInternal).updateMetadata(metadata);
}

/**
 * Uploads data to this object's location. The upload is not resumable.
 * @param _storageRef - Storage `Reference` instance.
 * @param _data - The data (Blob | Uint8Array | ArrayBuffer) to upload to the storage bucket at the reference location.
 * @param _metadata - A Storage `UploadMetadata` instance to update. Optional.
 * @returns {Promise<TaskResult>}
 */
export async function uploadBytes(
  _storageRef: StorageReference,
  _data: Blob | Uint8Array | ArrayBuffer,
  _metadata?: UploadMetadata,
): Promise<TaskResult> {
  throw new Error('`uploadBytes()` is not implemented');
}

/**
 * Uploads data to this object's location. The upload is not resumable.
 * @param storageRef - Storage `Reference` instance.
 * @param data - The data (Blob | Uint8Array | ArrayBuffer) to upload to the storage bucket at the reference location.
 * @param metadata - A Storage `UploadMetadata` instance to update. Optional.
 * @returns {Task}
 */
export function uploadBytesResumable(
  storageRef: StorageReference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: UploadMetadata,
): Task {
  return (storageRef as StorageReferenceInternal).put(data, metadata);
}

/**
 * Uploads data to this object's location. The upload is not resumable.
 * @param storageRef - Storage `Reference` instance.
 * @param data - The string to upload.
 * @param format - The format of the string to upload ('raw' | 'base64' | 'base64url' | 'data_url'). Optional.
 * @param metadata - A Storage `UploadMetadata` instance to update. Optional.
 * @returns {Task}
 */
export function uploadString(
  storageRef: StorageReference,
  data: string,
  format?: 'raw' | 'base64' | 'base64url' | 'data_url',
  metadata?: UploadMetadata,
): Task {
  return (storageRef as StorageReferenceInternal).putString(data, format, metadata);
}

// Methods not on the Firebase JS SDK below

/**
 * Sets the maximum time in milliseconds to retry a download if a failure occurs.. android & iOS only.
 * @param storage - Storage instance.
 * @param time - The new maximum operation retry time in milliseconds.
 * @returns {Promise<void>}
 */
export function setMaxOperationRetryTime(storage: FirebaseStorage, time: number): Promise<void> {
  return (storage as StorageInternal).setMaxOperationRetryTime(time);
}

/**
 * Sets the maximum time in milliseconds to retry an upload if a failure occurs. android & iOS only.
 * @param storage - Storage instance.
 * @param time - The new maximum operation retry time in milliseconds.
 * @returns {Promise<void>}
 */
export function setMaxUploadRetryTime(storage: FirebaseStorage, time: number): Promise<void> {
  return (storage as StorageInternal).setMaxUploadRetryTime(time);
}

/**
 * Puts a file from local disk onto the storage bucket.
 * @param storageRef - Storage Reference instance.
 * @param filePath The local file path to upload to the bucket at the reference location.
 * @param metadata Any additional `UploadMetadata` for this task.
 * @returns {Task}
 */
export function putFile(
  storageRef: StorageReference,
  filePath: string,
  metadata?: UploadMetadata,
): Task {
  return (storageRef as StorageReferenceInternal).putFile(filePath, metadata);
}

/**
 * Downloads a file to the specified local file path on the device.
 * @param storageRef - Storage Reference instance.
 * @param filePath The local file path to upload to on the device.
 * @returns {Task}
 */
export function writeToFile(storageRef: StorageReference, filePath: string): Task {
  return (storageRef as StorageReferenceInternal).writeToFile(filePath);
}

/**
 * Sets the maximum time in milliseconds to retry a download if a failure occurs.
 * @param storage - Storage instance.
 * @param time - The new maximum download retry time in milliseconds.
 * @returns {Promise<void>}
 */
export function setMaxDownloadRetryTime(storage: FirebaseStorage, time: number): Promise<void> {
  return (storage as StorageInternal).setMaxDownloadRetryTime(time);
}

setReactNativeModule(nativeModuleName, fallBackModule);

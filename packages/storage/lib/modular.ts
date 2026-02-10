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
import type { FirebaseApp } from '@react-native-firebase/app';
import type {
  Storage,
  StorageReference,
  FullMetadata,
  ListResult,
  ListOptions,
  TaskResult,
  Task,
  SettableMetadata,
  UploadMetadata,
  EmulatorMockTokenOptions,
} from './types/storage';
import type { StorageReferenceInternal, StorageInternal } from './types/internal';

type WithModularDeprecationArg<F> = F extends (...args: infer P) => infer R
  ? (...args: [...P, typeof MODULAR_DEPRECATION_ARG]) => R
  : never;

/**
 * Returns a Storage instance for the given app.
 * @param app - FirebaseApp. Optional.
 * @param bucketUrl - Storage bucket URL. Optional.
 * @returns {Storage}
 */
export function getStorage(app?: FirebaseApp, bucketUrl?: string): Storage {
  if (app) {
    if (bucketUrl != null) {
      return getApp(app.name).storage(bucketUrl);
    }

    return getApp(app.name).storage();
  }

  if (bucketUrl != null) {
    return getApp().storage(bucketUrl);
  }

  return getApp().storage();
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
  storage: Storage,
  host: string,
  port: number,
  options?: EmulatorMockTokenOptions,
): void {
  return (
    (storage as StorageInternal).useEmulator as unknown as WithModularDeprecationArg<
      StorageInternal['useEmulator']
    >
  ).call(storage, host, port, options, MODULAR_DEPRECATION_ARG);
}

/**
 * Modify this Storage instance to communicate with the Firebase Storage emulator.
 * @param storage - Storage instance.
 * @param path An optional string pointing to a location on the storage bucket. If no path
 * is provided, the returned reference will be the bucket root path. Optional.
 * @returns {StorageReference}
 */
export function ref(storage: Storage, path?: string): StorageReference {
  return (
    (storage as StorageInternal).ref as unknown as WithModularDeprecationArg<StorageInternal['ref']>
  ).call(storage, path, MODULAR_DEPRECATION_ARG);
}

/**
 * Deletes the object at this reference's location.
 * @param storageRef - Storage `Reference` instance.
 * @returns {Promise<void>}
 */
export function deleteObject(storageRef: StorageReference): Promise<void> {
  return (
    (storageRef as StorageReferenceInternal).delete as unknown as WithModularDeprecationArg<
      StorageReferenceInternal['delete']
    >
  ).call(storageRef, MODULAR_DEPRECATION_ARG);
}

/**
 * Downloads the data at the object's location. Returns an error if the object is not found.
 * @param storageRef - Storage `Reference` instance.
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
 * @param storageRef - Storage `Reference` instance.
 * @param maxDownloadSizeBytes - The maximum allowed size in bytes to retrieve. Web only.
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
  return (
    (storageRef as StorageReferenceInternal).getDownloadURL as unknown as WithModularDeprecationArg<
      StorageReferenceInternal['getDownloadURL']
    >
  ).call(storageRef, MODULAR_DEPRECATION_ARG);
}

/**
 * Fetches metadata for the object at this location, if one exists.
 * @param storageRef - Storage `Reference` instance.
 * @returns {Promise<FullMetadata>}
 */
export function getMetadata(storageRef: StorageReference): Promise<FullMetadata> {
  return (
    (storageRef as StorageReferenceInternal).getMetadata as unknown as WithModularDeprecationArg<
      StorageReferenceInternal['getMetadata']
    >
  ).call(storageRef, MODULAR_DEPRECATION_ARG);
}

/**
 * Downloads the data at the object's location. This API is only available in Nodejs.
 * @param storageRef - Storage `Reference` instance.
 * @param maxDownloadSizeBytes - The maximum allowed size in bytes to retrieve. Web only.
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
  const result = await (
    (storageRef as StorageReferenceInternal).list as unknown as WithModularDeprecationArg<
      StorageReferenceInternal['list']
    >
  ).call(storageRef, options, MODULAR_DEPRECATION_ARG);

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
  const result = await (
    (storageRef as StorageReferenceInternal).listAll as unknown as WithModularDeprecationArg<
      StorageReferenceInternal['listAll']
    >
  ).call(storageRef, MODULAR_DEPRECATION_ARG);

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
  return (
    (storageRef as StorageReferenceInternal).updateMetadata as unknown as WithModularDeprecationArg<
      StorageReferenceInternal['updateMetadata']
    >
  ).call(storageRef, metadata, MODULAR_DEPRECATION_ARG);
}

/**
 * Uploads data to this object's location. The upload is not resumable.
 * @param storageRef - Storage `Reference` instance.
 * @param data - The data (Blob | Uint8Array | ArrayBuffer) to upload to the storage bucket at the reference location.
 * @param metadata - A Storage `SettableMetadata` instance to update. Optional.
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
 * @param metadata - A Storage `SettableMetadata` instance to update. Optional.
 * @returns {Task}
 */
export function uploadBytesResumable(
  storageRef: StorageReference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: UploadMetadata,
): Task {
  return (
    (storageRef as StorageReferenceInternal).put as unknown as WithModularDeprecationArg<
      StorageReferenceInternal['put']
    >
  ).call(storageRef, data, metadata, MODULAR_DEPRECATION_ARG);
}

/**
 * Uploads data to this object's location. The upload is not resumable.
 * @param storageRef - Storage `Reference` instance.
 * @param value - The string to upload.
 * @param format - The format of the string to upload ('raw' | 'base64' | 'base64url' | 'data_url'). Optional.
 * @param metadata - A Storage `SettableMetadata` instance to update. Optional.
 * @returns {Task}
 */
export function uploadString(
  storageRef: StorageReference,
  data: string,
  format?: 'raw' | 'base64' | 'base64url' | 'data_url',
  metadata?: UploadMetadata,
): Task {
  return (
    (storageRef as StorageReferenceInternal).putString as unknown as WithModularDeprecationArg<
      StorageReferenceInternal['putString']
    >
  ).call(storageRef, data, format, metadata, MODULAR_DEPRECATION_ARG);
}

// Methods not on the Firebase JS SDK below

/**
 *  Returns a new Storage `Reference` instance from a storage bucket URL.
 * @param storage - Storage instance.
 * @param url - A storage bucket URL pointing to a single file or location. Must be either a `gs://` url or an `http` url. Not available on web.
 * @returns {StorageReference}
 */
export function refFromURL(storage: Storage, url: string): StorageReference {
  return (
    (storage as StorageInternal).refFromURL as unknown as WithModularDeprecationArg<
      StorageInternal['refFromURL']
    >
  ).call(storage, url, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the maximum time in milliseconds to retry a download if a failure occurs.. android & iOS only.
 * @param storage - Storage instance.
 * @param time - The new maximum operation retry time in milliseconds.
 * @returns {Promise<void>}
 */
export function setMaxOperationRetryTime(storage: Storage, time: number): Promise<void> {
  return (
    (storage as StorageInternal).setMaxOperationRetryTime as unknown as WithModularDeprecationArg<
      StorageInternal['setMaxOperationRetryTime']
    >
  ).call(storage, time, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the maximum time in milliseconds to retry an upload if a failure occurs. android & iOS only.
 * @param storage - Storage instance.
 * @param time - The new maximum operation retry time in milliseconds.
 * @returns {Promise<void>}
 */
export function setMaxUploadRetryTime(storage: Storage, time: number): Promise<void> {
  return (
    (storage as StorageInternal).setMaxUploadRetryTime as unknown as WithModularDeprecationArg<
      StorageInternal['setMaxUploadRetryTime']
    >
  ).call(storage, time, MODULAR_DEPRECATION_ARG);
}

/**
 * Puts a file from local disk onto the storage bucket.
 * @param storageRef - Storage Reference instance.
 * @param localFilePath The local file path to upload to the bucket at the reference location.
 * @param metadata Any additional `SettableMetadata` for this task.
 * @returns {Task}
 */
export function putFile(
  storageRef: StorageReference,
  filePath: string,
  metadata?: SettableMetadata,
): Task {
  return (
    (storageRef as StorageReferenceInternal).putFile as unknown as WithModularDeprecationArg<
      StorageReferenceInternal['putFile']
    >
  ).call(storageRef, filePath, metadata, MODULAR_DEPRECATION_ARG);
}

/**
 * Downloads a file to the specified local file path on the device.
 * @param storageRef - Storage Reference instance.
 * @param localFilePath The local file path to upload to on the device.
 * @returns {Task}
 */
export function writeToFile(storageRef: StorageReference, filePath: string): Task {
  return (
    (storageRef as StorageReferenceInternal).writeToFile as unknown as WithModularDeprecationArg<
      StorageReferenceInternal['writeToFile']
    >
  ).call(storageRef, filePath, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a gs:// URL for this object in the form `gs://<bucket>/<path>/<to>/<object>`.
 * @param storageRef - Storage Reference instance.
 * @returns {String}
 */
export function toString(storageRef: StorageReference): string {
  return (
    storageRef.toString as unknown as WithModularDeprecationArg<typeof storageRef.toString>
  ).call(storageRef, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a reference to a relative path from this reference.
 * @param storageRef - Storage Reference instance.
 * @param path - The relative path from this reference. Leading, trailing, and consecutive slashes are removed.
 * @returns {String}
 */
export function child(storageRef: StorageReference, path: string): StorageReference {
  return (
    (storageRef as StorageReferenceInternal).child as unknown as WithModularDeprecationArg<
      StorageReferenceInternal['child']
    >
  ).call(storageRef, path, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the maximum time in milliseconds to retry a download if a failure occurs.
 * @param storage - Storage instance.
 * @param time - The new maximum download retry time in milliseconds.
 * @returns {Promise<void>}
 */
export function setMaxDownloadRetryTime(storage: Storage, time: number): Promise<void> {
  return (
    (storage as StorageInternal).setMaxDownloadRetryTime as unknown as WithModularDeprecationArg<
      StorageInternal['setMaxDownloadRetryTime']
    >
  ).call(storage, time, MODULAR_DEPRECATION_ARG);
}

export { StringFormat, TaskEvent, TaskState } from './StorageStatics';

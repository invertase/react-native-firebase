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

import { FirebaseApp } from '@firebase/app-types';
import { FirebaseStorageTypes } from '../index';

import Storage = FirebaseStorageTypes.Module;
import Reference = FirebaseStorageTypes.Reference;
import FullMetadata = FirebaseStorageTypes.FullMetadata;
import ListResult = FirebaseStorageTypes.ListResult;
import TaskResult = FirebaseStorageTypes.TaskResult;
import Task = FirebaseStorageTypes.Task;
import ListOptions = FirebaseStorageTypes.ListOptions;
import SettableMetadata = FirebaseStorageTypes.SettableMetadata;
import EmulatorMockTokenOptions = FirebaseStorageTypes.EmulatorMockTokenOptions;

/**
 * Returns the existing default {@link Storage} instance that is associated with the
 * default {@link FirebaseApp}. The default storage bucket is used. If no instance exists, initializes a new
 * instance with default settings.
 *
 * @returns The {@link Storage} instance of the provided app.
 */
export declare function getStorage(): Storage;

/**
 * Returns the existing default {@link Storage} instance that is associated with the
 * provided {@link FirebaseApp}. The default storage bucket is used. If no instance exists, initializes a new
 * instance with default settings.
 *
 * @param app - The {@link FirebaseApp} instance that the returned {@link Storage}
 * instance is associated with.
 * @returns The {@link Firestore} instance of the provided app.
 */
export declare function getStorage(app?: FirebaseApp): Storage;

/**
 * Returns the existing default {@link Storage} instance that is associated with the
 * provided {@link FirebaseApp}. If no instance exists, initializes a new
 * instance with default settings.
 *
 * @param app - The {@link FirebaseApp} instance that the returned {@link Storage}
 * instance is associated with. If `null` the default app is used.
 * @param bucketUrl - The gs:// url to the Firebase Storage Bucket. If `null` the default bucket is used.
 * @returns The {@link Firestore} instance of the provided app.
 */
export declare function getStorage(app?: FirebaseApp, bucketUrl?: string): Storage;

export function getStorage(app?: FirebaseApp, bucketUrl?: string): Storage;
/**
 * Modify this Storage instance to communicate with the Firebase Storage emulator.
 * This must be called synchronously immediately following the first call to firebase.storage().
 * Do not use with production credentials as emulator traffic is not encrypted.
 *
 * Note: on android, hosts 'localhost' and '127.0.0.1' are automatically remapped to '10.0.2.2' (the
 * "host" computer IP address for android emulators) to make the standard development experience easy.
 * If you want to use the emulator on a real android device, you will need to specify the actual host
 * computer IP address.
 *
 * @param storage: A reference to the `Storage` instance.
 * @param host: emulator host (eg, 'localhost')
 * @param port: emulator port (eg, 9199)
 * @param options: Storage Emulator options. Web only.
 */
export function connectStorageEmulator(
  storage: Storage,
  host: string,
  port: number,
  options?: EmulatorMockTokenOptions,
): void;
/**
 * Returns a new {@link Reference} instance.
 *
 * #### Example
 *
 * ```js
 * const ref = firebase.storage().ref('cats.gif');
 * ```
 *
 * @param path An optional string pointing to a location on the storage bucket. If no path
 * is provided, the returned reference will be the bucket root path.
 */
export function ref(storage: Storage, path?: string): Reference;
/**
 * Deletes the object at this reference's location.
 *
 * #### Example
 *
 * ```js
 * const ref = firebase.storage().ref('invertase/logo.png');
 * await ref.delete();
 * ```
 */
export function deleteObject(storageRef: Reference): Promise<void>;

export function getBlob(storageRef: Reference): Promise<Blob>;

export function getBytes(storageRef: Reference, maxDownloadSizeBytes: number): Promise<ArrayBuffer>;

export function getDownloadURL(storageRef: Reference): Promise<string>;

export function getMetadata(storageRef: Reference): Promise<FullMetadata>;

export function getStream(
  storageRef: Reference,
  maxDownloadSizeBytes: number,
): NodeJS.ReadableStream;

export function list(storageRef: Reference, options?: ListOptions): Promise<ListResult>;

export function listAll(storageRef: Reference): Promise<ListResult>;

export function updateMetadata(
  storageRef: Reference,
  metadata: SettableMetadata,
): Promise<FullMetadata>;

export function uploadBytes(
  storageRef: Reference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: SettableMetadata,
): Promise<TaskResult>;

export function uploadBytesResumable(
  storageRef: Reference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: SettableMetadata,
): Task;

export function uploadString(
  storageRef: Reference,
  data: string,
  format?: 'raw' | 'base64' | 'base64url' | 'data_url',
  metadata?: SettableMetadata,
): Task;

export function refFromURL(storage: Storage, url: string): Reference;

export function setMaxOperationRetryTime(storage: Storage, time: number): Promise<void>;

export function setMaxUploadRetryTime(storage: Storage, time: number): Promise<void>;

export function putFile(storageRef: Reference, filePath: string, metadata?: SettableMetadata): Task;

export function writeToFile(storageRef: Reference, filePath: string): Task;

export function toString(storageRef: Reference): string;

export function child(storageRef: Reference, path: string): Reference;

export function setMaxDownloadRetryTime(storage: Storage, time: number): Promise<void>;

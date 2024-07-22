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
 * Connects a {@link Storage} instance to the Firebase Storage emulator.
 * @param storage - A reference to the `Storage` instance.
 * @param host - Emulator host, e.g., 'localhost'.
 * @param port - Emulator port, e.g., 9199.
 * @param options - Optional. {@link EmulatorMockTokenOptions} instance.
 */
export function connectStorageEmulator(
  storage: Storage,
  host: string,
  port: number,
  options?: EmulatorMockTokenOptions,
): void;

/**
 * Creates a {@link Reference} from a given path or URL.
 * @param storage - The {@link Storage} instance.
 * @param path - Optional. A string pointing to a location within the storage bucket.
 * @returns A new {@link Reference}.
 */
export function ref(storage: Storage, path?: string): Reference;

/**
 * Deletes the object at the given reference's location.
 * @param storageRef - The {@link Reference} to the object to delete.
 * @returns A promise that resolves when the delete is complete.
 */
export function deleteObject(storageRef: Reference): Promise<void>;

/**
 * Retrieves the blob at the given reference's location. Throws an error if the object is not found.
 * @param storageRef - The {@link Reference} to the object.
 * @returns A promise resolving to the Blob.
 */
export function getBlob(storageRef: Reference): Promise<Blob>;

/**
 * Retrieves bytes (up to the specified max size) from an object at the given reference's location.
 * Throws an error if the object is not found or if the size exceeds the maximum allowed.
 * @param storageRef - The {@link Reference} to the object.
 * @param maxDownloadSizeBytes - Maximum size in bytes to retrieve.
 * @returns A promise resolving to an ArrayBuffer.
 */
export function getBytes(storageRef: Reference, maxDownloadSizeBytes: number): Promise<ArrayBuffer>;

/**
 * Retrieves a long-lived download URL for the object at the given reference's location.
 * @param storageRef - The {@link Reference} to the object.
 * @returns A promise resolving to the URL string.
 */
export function getDownloadURL(storageRef: Reference): Promise<string>;

/**
 * Retrieves metadata for the object at the given reference's location.
 * @param storageRef - The {@link Reference} to the object.
 * @returns A promise resolving to the object's {@link FullMetadata}.
 */
export function getMetadata(storageRef: Reference): Promise<FullMetadata>;

/**
 * Retrieves a readable stream for the object at the given reference's location. This API is only available in Node.js.
 * @param storageRef - The {@link Reference} to the object.
 * @param maxDownloadSizeBytes - Maximum size in bytes to retrieve.
 * @returns A NodeJS ReadableStream.
 */
export function getStream(
  storageRef: Reference,
  maxDownloadSizeBytes: number,
): NodeJS.ReadableStream;

/**
 * Lists items and prefixes under the given reference.
 * @param storageRef - The {@link Reference} under which to list items.
 * @param options - Optional. Configuration for listing.
 * @returns A promise resolving to a {@link ListResult}.
 */
export function list(storageRef: Reference, options?: ListOptions): Promise<ListResult>;

/**
 * Lists all items and prefixes under the given reference.
 * @param storageRef - The {@link Reference} under which to list items.
 * @returns A promise resolving to a {@link ListResult}.
 */
export function listAll(storageRef: Reference): Promise<ListResult>;

/**
 * Updates metadata for the object at the given reference.
 * @param storageRef - The {@link Reference} to the object.
 * @param metadata - The metadata to update.
 * @returns A promise resolving to the updated {@link FullMetadata}.
 */
export function updateMetadata(
  storageRef: Reference,
  metadata: SettableMetadata,
): Promise<FullMetadata>;

/**
 * Uploads data to the object's location at the given reference. The upload is not resumable.
 * @param storageRef - The {@link Reference} where the data should be uploaded.
 * @param data - The data to upload.
 * @param metadata - Optional. Metadata to associate with the uploaded object.
 * @returns A promise resolving to a {@link TaskResult}.
 */
export function uploadBytes(
  storageRef: Reference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: SettableMetadata,
): Promise<TaskResult>;

/**
 * Initiates a resumable upload session for the data to the object's location at the given reference.
 * @param storageRef - The {@link Reference} where the data should be uploaded.
 * @param data - The data to upload.
 * @param metadata - Optional. Metadata to associate with the uploaded object.
 * @returns A {@link Task} associated with the upload process.
 */
export function uploadBytesResumable(
  storageRef: Reference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: SettableMetadata,
): Task;

/**
 * Uploads a string to the object's location at the given reference. The string format must be specified.
 * @param storageRef - The {@link Reference} where the string should be uploaded.
 * @param data - The string data to upload.
 * @param format - Optional. The format of the string ('raw', 'base64', 'base64url', 'data_url').
 * @param metadata - Optional. Metadata to associate with the uploaded object.
 * @returns A {@link Task} associated with the upload process.
 */
export function uploadString(
  storageRef: Reference,
  data: string,
  format?: 'raw' | 'base64' | 'base64url' | 'data_url',
  metadata?: SettableMetadata,
): Task;

/**
 * Creates a {@link Reference} from a storage bucket URL.
 * @param storage - The {@link Storage} instance.
 * @param url - A URL pointing to a file or location in a storage bucket.
 * @returns A {@link Reference} pointing to the specified URL.
 */
export function refFromURL(storage: Storage, url: string): Reference;

/**
 * Sets the maximum time in milliseconds to retry operations other than upload and download if a failure occurs.
 * @param storage - The {@link Storage} instance.
 * @param time - The new maximum operation retry time in milliseconds.
 */
export function setMaxOperationRetryTime(storage: Storage, time: number): Promise<void>;

/**
 * Sets the maximum time in milliseconds to retry upload operations if a failure occurs.
 * @param storage - The {@link Storage} instance.
 * @param time - The new maximum upload retry time in milliseconds.
 */
export function setMaxUploadRetryTime(storage: Storage, time: number): Promise<void>;

/**
 * Puts a file from a local disk onto the storage bucket at the given reference.
 * @param storageRef - The {@link Reference} where the file should be uploaded.
 * @param filePath - The local file path of the file to upload.
 * @param metadata - Optional. Metadata to associate with the uploaded file.
 * @returns A {@link Task} associated with the upload process.
 */
export function putFile(storageRef: Reference, filePath: string, metadata?: SettableMetadata): Task;

/**
 * Downloads a file to the specified local file path on the device.
 * @param storageRef - The {@link Reference} from which the file should be downloaded.
 * @param filePath - The local file path where the file should be written.
 * @returns A {@link Task} associated with the download process.
 */
export function writeToFile(storageRef: Reference, filePath: string): Task;

/**
 * Returns a gs:// URL for the object at the given reference.
 * @param storageRef - The {@link Reference} to the object.
 * @returns The URL as a string.
 */
export function toString(storageRef: Reference): string;

/**
 * Returns a reference to a relative path from the given reference.
 * @param storageRef - The {@link Reference} as the base.
 * @param path - The relative path from the base reference.
 * @returns A new {@link Reference}.
 */
export function child(storageRef: Reference, path: string): Reference;

/**
 * Sets the maximum time in milliseconds to retry download operations if a failure occurs.
 * @param storage - The {@link Storage} instance.
 * @param time - The new maximum download retry time in milliseconds.
 */
export function setMaxDownloadRetryTime(storage: Storage, time: number): Promise<void>;

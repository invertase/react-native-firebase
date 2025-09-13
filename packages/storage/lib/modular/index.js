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
/**
 * @typedef {import('..').FirebaseStorageTypes} FirebaseStorageTypes
 * @typedef {import('..').FirebaseStorageTypes.Module} Storage
 * @typedef {import('..').FirebaseStorageTypes.Reference} Reference
 * @typedef {import('..').FirebaseStorageTypes.FullMetadata} FullMetadata
 * @typedef {import('..').FirebaseStorageTypes.ListResult} ListResult
 * @typedef {import('..').FirebaseStorageTypes.TaskResult} TaskResult
 * @typedef {import('..').FirebaseStorageTypes.Task} Task
 * @typedef {import('..').FirebaseStorageTypes.ListOptions} ListOptions
 * @typedef {import('..').FirebaseStorageTypes.SettableMetadata} SettableMetadata
 * @typedef {import('..').FirebaseStorageTypes.EmulatorMockTokenOptions} EmulatorMockTokenOptions
 * @typedef {import('@firebase/app').FirebaseApp} FirebaseApp
 */

import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/lib/common';

/**
 * Returns a Storage instance for the given app.
 * @param app - FirebaseApp. Optional.
 * @param bucketUrl - Storage bucket URL. Optional.
 * @returns {Storage}
 */
export function getStorage(app, bucketUrl) {
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
export function connectStorageEmulator(storage, host, port, options) {
  return storage.useEmulator.call(storage, host, port, options, MODULAR_DEPRECATION_ARG);
}

/**
 * Modify this Storage instance to communicate with the Firebase Storage emulator.
 * @param storage - Storage instance.
 * @param path An optional string pointing to a location on the storage bucket. If no path
 * is provided, the returned reference will be the bucket root path. Optional.
 * @returns {Reference}
 */
export function ref(storage, path) {
  return storage.ref.call(storage, path, MODULAR_DEPRECATION_ARG);
}

/**
 * Deletes the object at this reference's location.
 * @param storageRef - Storage `Reference` instance.
 * @returns {Promise<void>}
 */
export function deleteObject(storageRef) {
  return storageRef.delete.call(storageRef, MODULAR_DEPRECATION_ARG);
}

/**
 * Downloads the data at the object's location. Returns an error if the object is not found.
 * @param storageRef - Storage `Reference` instance.
 * @returns {Promise<Blob>}
 */
// eslint-disable-next-line
export function getBlob(storageRef, maxDownloadSizeBytes) {
  throw new Error('`getBlob()` is not implemented');
}

/**
 * Downloads the data at the object's location. Returns an error if the object is not found.
 * @param storageRef - Storage `Reference` instance.
 * @param maxDownloadSizeBytes - The maximum allowed size in bytes to retrieve. Web only.
 * @returns {Promise<ArrayBuffer>}
 */
// eslint-disable-next-line
export function getBytes(storageRef, maxDownloadSizeBytes) {
  throw new Error('`getBytes()` is not implemented');
}

/**
 * Deletes the object at this reference's location.
 * @param storageRef - Storage `Reference` instance.
 * @returns {Promise<string>}
 */
export function getDownloadURL(storageRef) {
  return storageRef.getDownloadURL.call(storageRef, MODULAR_DEPRECATION_ARG);
}

/**
 * Fetches metadata for the object at this location, if one exists.
 * @param storageRef - Storage `Reference` instance.
 * @returns {Promise<FullMetadata>}
 */
export function getMetadata(storageRef) {
  return storageRef.getMetadata.call(storageRef, MODULAR_DEPRECATION_ARG);
}

/**
 * Downloads the data at the object's location. This API is only available in Nodejs.
 * @param storageRef - Storage `Reference` instance.
 * @param maxDownloadSizeBytes - The maximum allowed size in bytes to retrieve. Web only.
 * @returns {NodeJS.ReadableStream;}
 */
// eslint-disable-next-line
export function getStream(storageRef, maxDownloadSizeBytes) {
  throw new Error('`getStream()` is not implemented');
}

/**
 * List items (files) and prefixes (folders) under this storage reference
 * @param storageRef - Storage `Reference` instance.
 * @param options - Storage `ListOptions` instance. The options list() accepts.
 * @returns {Promise<ListResult>}
 */
export function list(storageRef, options) {
  return storageRef.list.call(storageRef, options, MODULAR_DEPRECATION_ARG);
}

/**
 * List all items (files) and prefixes (folders) under this storage reference.
 * @param storageRef - Storage `Reference` instance.
 * @returns {Promise<ListResult>}
 */
export function listAll(storageRef) {
  return storageRef.listAll.call(storageRef, MODULAR_DEPRECATION_ARG);
}

/**
 * Updates the metadata for this object.
 * @param storageRef - Storage `Reference` instance.
 * @param metadata - A Storage `SettableMetadata` instance to update.
 * @returns {Promise<FullMetadata>}
 */
export function updateMetadata(storageRef, metadata) {
  return storageRef.updateMetadata.call(storageRef, metadata, MODULAR_DEPRECATION_ARG);
}

/**
 * Uploads data to this object's location. The upload is not resumable.
 * @param storageRef - Storage `Reference` instance.
 * @param data - The data (Blob | Uint8Array | ArrayBuffer) to upload to the storage bucket at the reference location.
 * @param metadata - A Storage `SettableMetadata` instance to update. Optional.
 * @returns {Promise<TaskResult>}
 */
export async function uploadBytes(storageRef, data, metadata) {
  const task = uploadBytesResumable(storageRef, data, metadata);
  return new Promise((resolve, reject) => {
    task.on('state_changed', taskSnapshot => {
      switch (taskSnapshot.state) {
        case 'running':
          break;
        case 'paused':
          task.resume();
          break;
        case 'success':
          resolve({ ref: taskSnapshot.ref, metadata: taskSnapshot.metadata });
          break;
        case 'cancelled':
        case 'error':
          reject(taskSnapshot.error);
          break;
        default:
          throw new Error(`Unhandled task state in uploadBytes: ${taskSnapshot.state}`);
      }
    });
  });
}

/**
 * Uploads data to this object's location. The upload is not resumable.
 * @param storageRef - Storage `Reference` instance.
 * @param data - The data (Blob | Uint8Array | ArrayBuffer) to upload to the storage bucket at the reference location.
 * @param metadata - A Storage `SettableMetadata` instance to update. Optional.
 * @returns {Task}
 */
export function uploadBytesResumable(storageRef, data, metadata) {
  return storageRef.put.call(storageRef, data, metadata, MODULAR_DEPRECATION_ARG);
}

/**
 * Uploads data to this object's location. The upload is not resumable.
 * @param storageRef - Storage `Reference` instance.
 * @param value - The string to upload.
 * @param format - The format of the string to upload ('raw' | 'base64' | 'base64url' | 'data_url'). Optional.
 * @param metadata - A Storage `SettableMetadata` instance to update. Optional.
 * @returns {Task}
 */
export function uploadString(storageRef, data, format, metadata) {
  return storageRef.putString.call(storageRef, data, format, metadata, MODULAR_DEPRECATION_ARG);
}

// Methods not on the Firebase JS SDK below

/**
 *  Returns a new Storage `Reference` instance from a storage bucket URL.
 * @param storage - Storage instance.
 * @param url - A storage bucket URL pointing to a single file or location. Must be either a `gs://` url or an `http` url. Not available on web.
 * @returns {Reference}
 */
export function refFromURL(storage, url) {
  return storage.refFromURL.call(storage, url, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the maximum time in milliseconds to retry a download if a failure occurs.. android & iOS only.
 * @param storage - Storage instance.
 * @param time - The new maximum operation retry time in milliseconds.
 * @returns {Promise<void>}
 */
export function setMaxOperationRetryTime(storage, time) {
  return storage.setMaxOperationRetryTime.call(storage, time, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the maximum time in milliseconds to retry an upload if a failure occurs. android & iOS only.
 * @param storage - Storage instance.
 * @param time - The new maximum operation retry time in milliseconds.
 * @returns {Promise<void>}
 */
export function setMaxUploadRetryTime(storage, time) {
  return storage.setMaxUploadRetryTime.call(storage, time, MODULAR_DEPRECATION_ARG);
}

/**
 * Puts a file from local disk onto the storage bucket.
 * @param storageRef - Storage Reference instance.
 * @param localFilePath The local file path to upload to the bucket at the reference location.
 * @param metadata Any additional `SettableMetadata` for this task.
 * @returns {Task}
 */
export function putFile(storageRef, filePath, metadata) {
  return storageRef.putFile.call(storageRef, filePath, metadata, MODULAR_DEPRECATION_ARG);
}

/**
 * Downloads a file to the specified local file path on the device.
 * @param storageRef - Storage Reference instance.
 * @param localFilePath The local file path to upload to on the device.
 * @returns {Task}
 */
export function writeToFile(storageRef, filePath) {
  return storageRef.writeToFile.call(storageRef, filePath, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a gs:// URL for this object in the form `gs://<bucket>/<path>/<to>/<object>`.
 * @param storageRef - Storage Reference instance.
 * @returns {String}
 */
export function toString(storageRef) {
  return storageRef.toString.call(storageRef, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a reference to a relative path from this reference.
 * @param storageRef - Storage Reference instance.
 * @param path - The relative path from this reference. Leading, trailing, and consecutive slashes are removed.
 * @returns {String}
 */
export function child(storageRef, path) {
  return storageRef.child.call(storageRef, path, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the maximum time in milliseconds to retry a download if a failure occurs.
 * @param storage - Storage instance.
 * @param time - The new maximum download retry time in milliseconds.
 * @returns {Promise<void>}
 */
export function setMaxDownloadRetryTime(storage, time) {
  return storage.setMaxDownloadRetryTime.call(storage, time, MODULAR_DEPRECATION_ARG);
}

export { StringFormat, TaskEvent, TaskState } from '../StorageStatics';

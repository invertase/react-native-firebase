import { FirebaseApp, getApp } from '@react-native-firebase/app-exp';
import {
  isFirebaseApp,
  isUndefined,
  ArgumentError,
  isInteger,
  isOptionalNumber,
  isPositiveNumber,
  Mutable,
  pathJoin,
  isOptionalString,
  isString,
} from '@react-native-firebase/app-exp/internal';
import * as impl from './impl';
import {
  StorageService,
  StorageReference,
  ListResult,
  ListOptions,
  FullMetadata,
  SettableMetadata,
  UploadMetadata,
  UploadResult,
  UploadTask,
} from './types';
import StorageServiceImpl, { StorageServiceInternal } from './implementations/storageService';
import StorageReferenceImpl from './implementations/storageReference';
import {
  isStorageReference,
  isStorageService,
  toSettableMetadata,
  toUploadMetadata,
} from './validation';
import { partsFromGsUrl, partsFromHttpUrl } from './utils';

export * from './types';

/**
 * Deletes the object at this location.
 *
 * @param ref StorageReference for object to delete.
 * @returns Promise<void>
 */
export function deleteObject(ref: StorageReference): Promise<void> {
  if (!isStorageReference(ref)) {
    throw new ArgumentError('ref', 'Expected a StorageReference instance');
  }

  return impl.deleteObject(ref);
}

/**
 * Returns the download URL for the given Reference.
 *
 * @param ref
 * @returns Promise<string>
 */
export function getDownloadURL(ref: StorageReference): Promise<string> {
  if (!isStorageReference(ref)) {
    throw new ArgumentError('ref', 'Expected a StorageReference instance');
  }

  return impl.getDownloadURL(ref);
}

/**
 * A promise that resolves with the metadata for this object. If this object doesn't exist or metadata cannot be retreived, the promise is rejected.
 *
 * @param ref StorageReference to get metadata from.
 * @returns Promise<FullMetadata>
 */
export function getMetadata(ref: StorageReference): Promise<FullMetadata> {
  if (!isStorageReference(ref)) {
    throw new ArgumentError('ref', 'Expected a StorageReference instance');
  }

  return impl.getMetadata(ref);
}

/**
 * Gets a Firebase StorageService instance for the given Firebase app.
 *
 * @param app Firebase app to get Storage instance for.
 * @param bucketUrl The gs:// url to your Firebase Storage Bucket. If not passed, uses the app's default Storage Bucket.
 * @returns StorageService
 */
export function getStorage(app?: FirebaseApp, bucketUrl?: string): StorageService {
  if (!isUndefined(app) && !isFirebaseApp(app)) {
    throw new ArgumentError('app', 'Expected a valid FirebaseApp instance.');
  }

  return impl.getStorage(app ?? getApp(), bucketUrl);
}

/**
 * List items (files) and prefixes (folders) under this storage reference.
 *
 * List API is only available for Firebase Rules Version 2.
 *
 * GCS is a key-blob store. Firebase Storage imposes the semantic of '/' delimited folder structure. Refer to GCS's List API if you want to learn more.
 *
 * To adhere to Firebase Rules's Semantics, Firebase Storage does not support objects whose paths end with "/" or contain two consecutive "/"s. Firebase Storage List API will filter these unsupported objects.
 * `list()` may fail if there are too many unsupported objects in the bucket.
 *
 * @param ref StorageReference to get list from.
 * @param options See ListOptions for details.
 * @returns Promise<ListResult> A Promise that resolves with the items and prefixes. `prefixes` contains references to sub-folders and items contains references to objects in this folder. `nextPageToken` can be used to get the rest of the results.
 */
export function list(ref: StorageReference, options?: ListOptions): Promise<ListResult> {
  if (!isStorageReference(ref)) {
    throw new ArgumentError('ref', 'Expected a StorageReference instance');
  }

  if (!isOptionalNumber(options?.maxResults)) {
    throw new ArgumentError('options.maxResults', 'Expected a number value');
  }

  if (!isOptionalString(options?.pageToken)) {
    throw new ArgumentError('options.pageToken', 'Expected a string value');
  }

  return impl.list(ref, {
    maxResults: options?.maxResults,
    pageToken: options?.pageToken,
  });
}

/**
 * List all items (files) and prefixes (folders) under this storage reference.
 *
 * This is a helper method for calling list() repeatedly until there are no more results. The default pagination size is 1000.
 *
 * @param ref StorageReference to get list from.
 * @returns Promise<ListResult> A Promise that resolves with the items and prefixes. `prefixes` contains references to sub-folders and items contains references to objects in this folder. `nextPageToken` can be used to get the rest of the results.
 */
export function listAll(ref: StorageReference): Promise<ListResult> {
  if (!isStorageReference(ref)) {
    throw new ArgumentError('ref', 'Expected a StorageReference instance');
  }

  return impl.listAll(ref);
}

/**
 * Returns a StorageReference for the given url.
 *
 * @param storage StorageService instance.
 * @param url URL. If empty, returns root reference.
 * @returns StorageReference
 */
export function ref(storage: StorageService, url?: string): StorageReference;

/**
 * Returns a StorageReference for the given path in the default bucket.
 *
 * @param storageOrRef StorageService or StorageReference.
 * @param path
 * @returns StorageReference
 */
export function ref(
  storageOrRef: StorageService | StorageReference,
  path?: string,
): StorageReference;

/**
 * Implementation of the `ref()` function.
 *
 * @param storageOrRef StorageService or StorageReference
 * @param urlOrPath optional url or path
 * @returns StorageReference
 */
export function ref(
  storageOrRef: StorageService | StorageReference,
  urlOrPath?: string,
): StorageReference {
  let _storage: StorageService;
  let _path = urlOrPath ?? '/';
  let _bucket: string | null = null;

  if (urlOrPath) {
    if (_path.startsWith('gs://') || _path.startsWith('http')) {
      if (!isStorageService(storageOrRef) || !isStorageReference(storageOrRef)) {
        throw new ArgumentError(
          'storageOrRef',
          'Expected either a StorageService or StorageReference instance',
        );
      }

      if (_path.startsWith('http')) {
        const parts = partsFromHttpUrl(_path);

        if (!parts) {
          throw new ArgumentError(
            'url',
            `Unable to parse provided URL, ensure it's a valid storage url`,
          );
        }

        _bucket = parts.bucket;
        _path = parts.path;
      } else {
        const parts = partsFromGsUrl(_path);

        if (!parts) {
          throw new ArgumentError(
            'url',
            `Unable to parse provided URL, ensure it's a valid Google Storage url`,
          );
        }

        _bucket = parts.bucket;
        _path = parts.path;
      }
    } else {
      if (!isStorageService(storageOrRef)) {
        throw new ArgumentError('storage', 'Expected a StorageService instance');
      }
    }
  }

  console.log('>>>>>');
  if (isStorageReference(storageOrRef)) {
    console.log('is REF');
    _storage = new StorageServiceImpl(storageOrRef.storage.app, {
      bucket: _bucket ?? storageOrRef.bucket,
    });

    _path = pathJoin(storageOrRef.fullPath, _path);
  } else {
    _storage = new StorageServiceImpl(storageOrRef.app, {
      bucket: _bucket ?? storageOrRef.bucket,
      maxOperationRetryTime: storageOrRef.maxOperationRetryTime,
      maxDownloadRetryTime: storageOrRef.maxDownloadRetryTime,
      maxUploadRetryTime: storageOrRef.maxUploadRetryTime,
    });
  }

  return new StorageReferenceImpl(_storage, _path);
}

/**
 * Sets the maximum time in milliseconds to retry operations other than upload and download if a failure occurs.
 *
 * @param storage StorageService instance.
 * @param time Time in milliseconds.
 * @returns Promise<void>
 */
export async function setMaxOperationRetryTime(
  storage: StorageService,
  time: number,
): Promise<void> {
  if (!isStorageService(storage)) {
    throw new ArgumentError('storage', 'Expected a StorageService instance');
  }

  if (!isPositiveNumber(time) || !isInteger(time)) {
    throw new ArgumentError('time', 'Expected a positive integer value');
  }

  await impl.setMaxOperationRetryTime(storage, time);

  const instance = storage as Mutable<StorageService>;
  instance.maxOperationRetryTime = time;
}

/**
 * Sets the maximum time in milliseconds to retry an upload if a failure occurs.
 *
 * @param storage StorageService instance.
 * @param time Time in milliseconds.
 * @returns Promise<void>
 */
export async function setMaxUploadRetryTime(storage: StorageService, time: number): Promise<void> {
  if (!isStorageService(storage)) {
    throw new ArgumentError('storage', 'Expected a StorageService instance');
  }

  if (!isPositiveNumber(time) || !isInteger(time)) {
    throw new ArgumentError('time', 'Expected a positive integer value');
  }

  await impl.setMaxUploadRetryTime(storage, time);

  const instance = storage as Mutable<StorageService>;
  instance.maxUploadRetryTime = time;
}

/**
 * Sets the maximum time in milliseconds to retry a download if a failure occurs.
 *
 * This operation is a noop on Web.
 *
 * @param storage StorageService instance.
 * @param time Time in milliseconds.
 * @returns Promise<void>
 */
export async function setMaxDownloadRetryTime(
  storage: StorageService,
  time: number,
): Promise<void> {
  if (!isStorageService(storage)) {
    throw new ArgumentError('storage', 'Expected a StorageService instance');
  }

  if (!isPositiveNumber(time) || !isInteger(time)) {
    throw new ArgumentError('time', 'Expected a positive integer value');
  }

  await impl.setMaxDownloadRetryTime(storage, time);

  const instance = storage as Mutable<StorageService>;
  instance.maxDownloadRetryTime = time;
}

/**
 * Updates the metadata for this object.
 *
 * @param ref StorageReference to update metadata for.
 * @param metadata The new metadata for the object. Only values that have been explicitly set will be changed. Explicitly setting a value to null will remove the metadata.
 * @returns Promise<FullMetadata>
 */
export function updateMetadata(
  ref: StorageReference,
  metadata: SettableMetadata,
): Promise<FullMetadata> {
  if (!isStorageReference(ref)) {
    throw new ArgumentError('ref', 'Expected a StorageReference instance');
  }

  return impl.updateMetadata(ref, toSettableMetadata(metadata));
}

/**
 * Uploads data to this object's location. The upload is not resumable.
 *
 * @param ref StorageReference where data should be uploaded.
 * @param data The data to upload.
 * @param metadata Metadata for the data to upload.
 * @returns Promise<UploadResult>
 */
export function uploadBytes(
  ref: StorageReference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: UploadMetadata,
): Promise<UploadResult> {
  if (!isStorageReference(ref)) {
    throw new ArgumentError('ref', 'Expected a StorageReference instance');
  }

  if (!(data instanceof Blob) || !(data instanceof Uint8Array) || !(data instanceof ArrayBuffer)) {
    throw new ArgumentError('data', 'Expected a Blob, Uint8Array or ArrayBuffer value');
  }

  return impl.uploadBytes(ref, data, toUploadMetadata(metadata));
}

/**
 * Uploads data to this object's location. The upload can be paused and resumed, and exposes progress updates.
 *
 * @param ref StorageReference where data should be uploaded.
 * @param data The data to upload.
 * @param metadata Metadata for the data to upload.
 * @returns UploadTask
 */
export function uploadBytesResumable(
  ref: StorageReference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: UploadMetadata,
): UploadTask {
  if (!isStorageReference(ref)) {
    throw new ArgumentError('ref', 'Expected a StorageReference instance');
  }

  if (!(data instanceof Blob) || !(data instanceof Uint8Array) || !(data instanceof ArrayBuffer)) {
    throw new ArgumentError('data', 'Expected a Blob, Uint8Array or ArrayBuffer value');
  }

  return impl.uploadBytesResumable(ref, data, toUploadMetadata(metadata));
}

/**
 * Uploads a string to this object's location. The upload is not resumable.
 *
 * @param ref StorageReference where string should be uploaded.
 * @param value The string to upload.
 * @param format The format of the string to upload.
 * @param metadata Metadata for the string to upload.
 * @returns Promise<UploadResult>
 */
export function uploadString(
  ref: StorageReference,
  value: string,
  format?: string,
  metadata?: UploadMetadata,
): Promise<UploadResult> {
  if (!isStorageReference(ref)) {
    throw new ArgumentError('ref', 'Expected a StorageReference instance');
  }

  if (!isString(value)) {
    throw new ArgumentError('value', 'Expected a string value');
  }

  if (!isOptionalString(format)) {
    throw new ArgumentError('format', 'Expected a string value');
  }

  return impl.uploadString(ref, value, format, toUploadMetadata(metadata));
}

/**
 * Modify this StorageService instance to communicate with the Cloud Storage emulator.
 *
 * @param storage The StorageService instance
 * @param host The emulator host (ex: localhost)
 * @param port The emulator port (ex: 5001)
 */
export function useStorageEmulator(storage: StorageService, host: string, port: number): void {
  const instance = storage as StorageServiceInternal;

  instance.host = host;
  instance.port = port;
}

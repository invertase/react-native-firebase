import { FirebaseApp, getApp } from '@react-native-firebase-modular/app';
import {
  isFirebaseApp,
  isUndefined,
  ArgumentError,
  isInteger,
  isPositiveNumber,
  Mutable,
} from '@react-native-firebase-modular/app/internal';
import * as impl from './impl';
import { StorageService, StorageReference, ListResult } from './types';
import StorageServiceImpl from './implementations/storageService';
import StorageReferenceImpl from './implementations/storageReference';
import { isStorageReference, isStorageService } from 'validation';

export * from './types';

export function getStorage(app?: FirebaseApp, bucketUrl?: string): StorageService {
  if (!isUndefined(app) && !isFirebaseApp(app)) {
    throw new ArgumentError('app', 'Expected a valid FirebaseApp instance.');
  }

  return impl.getStorage(app ?? getApp(), bucketUrl);
}

export function ref(storage: StorageService, url?: string): StorageReference;
export function ref(
  storageOrRef: StorageService | StorageReference,
  path?: string,
): StorageReference;

export function ref(
  storageOrRef: StorageService | StorageReference,
  urlOrPath?: string,
): StorageReference {
  let _storage: StorageService;
  let _bucket: string;
  const _path = urlOrPath ?? '/';

  // ref(storageOrRef, urlOrPath)
  if (_path.startsWith('gs://') || _path.startsWith('http')) {
    if (!isStorageService(storageOrRef) || !isStorageReference(storageOrRef)) {
      throw new ArgumentError(
        'storageOrRef',
        'Expected either a StorageService or StorageReference instance',
      );
    }

    // TODO validate URL
  } else {
    if (!isStorageService(storageOrRef)) {
      throw new ArgumentError('storage', 'Expected a StorageService instance');
    }
  }

  // TODO parse path

  // TODO override bucket if provided from URL
  if (isStorageReference(storageOrRef)) {
    _storage = new StorageServiceImpl(storageOrRef.storage.app, {
      bucket: storageOrRef.bucket,
    });
  } else {
    _storage = storageOrRef;
  }

  return new StorageReferenceImpl(_storage, _path);
}

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

export function listAll(ref: StorageReference): Promise<ListResult> {
  if (!isStorageReference(ref)) {
    throw new ArgumentError('ref', 'Expected a StorageReference instance');
  }

  // TODO validate
  return impl.listAll(ref);
}

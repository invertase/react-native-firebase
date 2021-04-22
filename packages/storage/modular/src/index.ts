import { FirebaseApp, getApp } from '@react-native-firebase-modular/app';
import {
  isFirebaseApp,
  isUndefined,
  ArgumentError,
} from '@react-native-firebase-modular/app/internal';
import * as impl from './impl';
import { StorageService, StorageReference, ListResult } from './types';
import StorageServiceImpl from './implementations/storageService';
import StorageReferenceImpl from './implementations/storageReference';

export * from './types';

export function getStorage(app?: FirebaseApp, bucketUrl?: string): StorageService {
  if (!isUndefined(app) && !isFirebaseApp(app)) {
    throw new ArgumentError('app', 'Expected a valid FirebaseApp instance.');
  }

  const _app = app ?? getApp();

  return new StorageServiceImpl(_app, {
    bucket: bucketUrl,
  });
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
  return StorageReferenceImpl.fromPath(storageOrRef as StorageService, '');
}

export function listAll(ref: StorageReference): Promise<ListResult> {
  // TODO validate
  return impl.listAll(ref);
}

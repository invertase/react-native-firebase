import { FirebaseApp } from '@react-native-firebase/app-exp';
import { Mutable } from '@react-native-firebase/app-exp/internal';
import * as app from 'firebase/app';
import * as delegate from 'firebase/storage';
import { toFullMetadata, toUploadResult } from 'validation';
import StorageServiceImpl, { StorageServiceInternal } from './implementations/storageService';
import UploadTaskImpl from './implementations/uploadTask';
import StorageReferenceImpl from './implementations/storageReference';
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

function getStorageService(storage: StorageService): delegate.StorageService {
  const service = delegate.getStorage(app.getApp(storage.app.name));
  const instance = storage as StorageServiceInternal;

  if (instance.host && instance.port) {
    delegate.useStorageEmulator(service, instance.host, instance.port);
  }

  return service;
}

function getStorageReference(ref: StorageReference): delegate.StorageReference {
  return delegate.ref(getStorageService(ref.storage), ref.fullPath);
}

function convertListResult(storage: StorageService, result: delegate.ListResult): ListResult {
  return {
    nextPageToken: result.nextPageToken,
    items: result.items.map(item => new StorageReferenceImpl(storage, item.fullPath)),
    prefixes: result.prefixes.map(item => new StorageReferenceImpl(storage, item.fullPath)),
  };
}

export function deleteObject(ref: StorageReference): Promise<void> {
  return delegate.deleteObject(getStorageReference(ref));
}

export function getDownloadURL(ref: StorageReference): Promise<string> {
  return delegate.getDownloadURL(getStorageReference(ref));
}

export async function getMetadata(ref: StorageReference): Promise<FullMetadata> {
  const result = await delegate.getMetadata(getStorageReference(ref));
  return toFullMetadata(result);
}

export function getStorage(app: FirebaseApp, bucketUrl?: string): StorageService {
  const storage = new StorageServiceImpl(app, {
    bucket: bucketUrl,
  }) as Mutable<StorageService>;

  const delegate = getStorageService(storage);

  storage.maxOperationRetryTime = delegate.maxOperationRetryTime;
  storage.maxUploadRetryTime = delegate.maxUploadRetryTime;

  return storage;
}

export async function list(ref: StorageReference, options: ListOptions): Promise<ListResult> {
  return convertListResult(ref.storage, await delegate.list(getStorageReference(ref), options));
}

export async function listAll(ref: StorageReference): Promise<ListResult> {
  return convertListResult(ref.storage, await delegate.listAll(getStorageReference(ref)));
}

export async function setMaxOperationRetryTime(
  storage: StorageService,
  time: number,
): Promise<void> {
  getStorageService(storage).maxOperationRetryTime = time;
}

export async function setMaxUploadRetryTime(storage: StorageService, time: number): Promise<void> {
  getStorageService(storage).maxUploadRetryTime = time;
}

export async function setMaxDownloadRetryTime(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _storage: StorageService,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _time: number,
): Promise<void> {
  // Noop on web
}

export async function updateMetadata(
  ref: StorageReference,
  metadata: SettableMetadata,
): Promise<FullMetadata> {
  const result = await delegate.updateMetadata(getStorageReference(ref), metadata);
  return toFullMetadata(result);
}

export async function uploadBytes(
  ref: StorageReference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata: UploadMetadata,
): Promise<UploadResult> {
  const result = await delegate.uploadBytes(getStorageReference(ref), data, metadata);
  return toUploadResult(ref, result.metadata);
}

export function uploadBytesResumable(
  ref: StorageReference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: UploadMetadata,
): UploadTask {
  return new UploadTaskImpl(
    ref,
    delegate.uploadBytesResumable(getStorageReference(ref), data, metadata),
  );
}

export async function uploadString(
  ref: StorageReference,
  value: string,
  format?: string,
  metadata?: UploadMetadata,
): Promise<UploadResult> {
  const result = await delegate.uploadString(getStorageReference(ref), value, format, metadata);
  return toUploadResult(ref, result.metadata);
}

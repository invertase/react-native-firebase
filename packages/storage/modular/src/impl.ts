import * as app from 'firebase/app';
import * as delegate from 'firebase/storage';
import StorageReferenceImpl from './implementations/storageReference';
import {
  StorageService,
  StorageReference,
  ListResult,
  ListOptions,
  FullMetadata,
  SettableMetadata,
} from './types';

function getStorageService(storage: StorageService): delegate.StorageService {
  return delegate.getStorage(app.getApp(storage.app.name));
}

function getStorageReference(ref: StorageReference): delegate.StorageReference {
  return delegate.ref(getStorageService(ref.storage));
}

function convertListResult(storage: StorageService, result: delegate.ListResult): ListResult {
  return {
    nextPageToken: result.nextPageToken,
    items: result.items.map(item => new StorageReferenceImpl(storage, item.fullPath)),
    prefixes: result.prefixes.map(item => new StorageReferenceImpl(storage, item.fullPath)),
  };
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
  _storage: StorageService,
  _time: number,
): Promise<void> {
  // Noop on web
}

export function deleteObject(ref: StorageReference): Promise<void> {
  return delegate.deleteObject(getStorageReference(ref));
}

export function getDownloadURL(ref: StorageReference): Promise<string> {
  return delegate.getDownloadURL(getStorageReference(ref));
}

// TODO return type
export async function getMetadata(ref: StorageReference): Promise<FullMetadata> {
  return delegate.getMetadata(getStorageReference(ref));
}

export async function list(ref: StorageReference, options: ListOptions): Promise<ListResult> {
  return convertListResult(ref.storage, await delegate.list(getStorageReference(ref), options));
}

export async function listAll(ref: StorageReference): Promise<ListResult> {
  return convertListResult(ref.storage, await delegate.listAll(getStorageReference(ref)));
}

export function updateMetadata(
  ref: StorageReference,
  metadata: SettableMetadata,
): Promise<FullMetadata> {
  return delegate.updateMetadata(getStorageReference(ref), metadata);
}

export function uploadBytes() {}

export function uploadBytesResumable() {}

export function uploadString() {}

export function useStorageEmulator(storage: StorageService, host: string, port: number): void {
  const service = getStorageService(storage);
  delegate.useStorageEmulator(service, host, port);
}

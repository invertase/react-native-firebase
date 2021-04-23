import { FirebaseApp } from '@react-native-firebase-modular/app';
import { getNativeModule } from '@react-native-firebase-modular/app/internal';
import StorageServiceImpl from 'implementations/storageService';
import StorageReferenceImpl from './implementations/storageReference';
import {
  StorageService,
  StorageReference,
  ListResult,
  ListOptions,
  FullMetadata,
  SettableMetadata,
} from './types';

interface StorageModule {
  readonly maxOperationRetryTime?: number;
  readonly maxUploadRetryTime?: number;
  readonly maxDownloadRetryTime?: number;
  delete(appName: string, url: string): Promise<void>;
  getDownloadURL(appName: string, url: string): Promise<string>;
  getMetadata(appName: string, url: string): Promise<void>;
  list(appName: string, url: string, options: ListOptions): Promise<NativeListResult>;
  listAll(appName: string, url: string): Promise<NativeListResult>;
  // updateMetadata(appName: string, url: string, metadata: any): Promise<Metadata>;
  setMaxDownloadRetryTime(appName: string, time: number): Promise<void>;
  setMaxOperationRetryTime(appName: string, time: number): Promise<void>;
  setMaxUploadRetryTime(appName: string, time: number): Promise<void>;
  // writeToFile(appName: string, time: number): Promise<void>;
  // putString(appName: string, time: number): Promise<void>;
  // putFile(appName: string, time: number): Promise<void>;
  // setTaskStatus(appName: string, taskId: number, status: number): Promise<boolean>;
}

type NativeListResult = {
  readonly nextPageToken?: string;
  readonly items: ReadonlyArray<string>;
  readonly prefixes: ReadonlyArray<string>;
};

const delegate = () =>
  getNativeModule<StorageModule>({
    namespace: 'storage',
    nativeModule: 'RNFBStorageModule',
    config: {
      events: ['storage_event'],
    },
  });

export function getStorage(app: FirebaseApp, bucketUrl?: string): StorageService {
  const module = delegate().module;

  return new StorageServiceImpl(app, {
    bucket: bucketUrl,
    maxDownloadRetryTime: module.maxDownloadRetryTime,
    maxOperationRetryTime: module.maxOperationRetryTime,
    maxUploadRetryTime: module.maxUploadRetryTime,
  });
}

export async function setMaxOperationRetryTime(
  storage: StorageService,
  time: number,
): Promise<void> {
  return delegate().module.setMaxOperationRetryTime(storage.app.name, time);
}

export async function setMaxUploadRetryTime(storage: StorageService, time: number): Promise<void> {
  return delegate().module.setMaxUploadRetryTime(storage.app.name, time);
}

export async function setMaxDownloadRetryTime(
  storage: StorageService,
  time: number,
): Promise<void> {
  return delegate().module.setMaxDownloadRetryTime(storage.app.name, time);
}

export function deleteObject(ref: StorageReference): Promise<void> {
  // TODO correct path?
  return delegate().module.delete(ref.storage.app.name, ref.fullPath);
}

export function getDownloadURL(ref: StorageReference): Promise<string> {
  return delegate().module.getDownloadURL(ref.storage.app.name, ref.fullPath);
}

// // TODO return type
// export async function getMetadata(ref: StorageReference): Promise<FullMetadata> {
//   return delegate.getMetadata(getStorageReference(ref));
// }

// export async function list(ref: StorageReference, options: ListOptions): Promise<ListResult> {
//   return convertListResult(ref.storage, await delegate.list(getStorageReference(ref), options));
// }

// export async function listAll(ref: StorageReference): Promise<ListResult> {
//   return convertListResult(ref.storage, await delegate.listAll(getStorageReference(ref)));
// }

// export function updateMetadata(
//   ref: StorageReference,
//   metadata: SettableMetadata,
// ): Promise<FullMetadata> {
//   return delegate.updateMetadata(getStorageReference(ref), metadata);
// }

// export function uploadBytes() {}

// export function uploadBytesResumable() {}

// export function uploadString() {}

// export function useStorageEmulator(storage: StorageService, host: string, port: number): void {
//   const service = getStorageService(storage);
//   delegate.useStorageEmulator(service, host, port);
// }

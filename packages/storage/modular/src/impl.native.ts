import { EmitterSubscription } from 'react-native';
import { FirebaseApp } from '@react-native-firebase/app-exp';
import {
  eventNameForApp,
  getNativeModule,
  toBase64String,
} from '@react-native-firebase/app-exp/internal';
import StorageServiceImpl from './implementations/storageService';
import UploadTaskImpl from './implementations/uploadTask.native';
import { toFullMetadata, toUploadResult } from './validation';
import StorageReferenceImpl from './implementations/storageReference';
import {
  StorageService,
  StorageReference,
  ListResult,
  ListOptions,
  FullMetadata,
  SettableMetadata,
  UploadResult,
  UploadMetadata,
  UploadTask,
  TaskEvent,
  TaskState,
} from './types';

interface StorageModule {
  readonly maxOperationRetryTime?: number;
  readonly maxUploadRetryTime?: number;
  readonly maxDownloadRetryTime?: number;
  delete(appName: string, url: string): Promise<void>;
  getDownloadURL(appName: string, url: string): Promise<string>;
  getMetadata(appName: string, url: string): Promise<Record<string, unknown>>;
  list(appName: string, url: string, options: ListOptions): Promise<NativeListResult>;
  listAll(appName: string, url: string): Promise<NativeListResult>;
  updateMetadata(
    appName: string,
    url: string,
    metadata: SettableMetadata,
  ): Promise<Record<string, unknown>>;
  setMaxDownloadRetryTime(appName: string, time: number): Promise<void>;
  setMaxOperationRetryTime(appName: string, time: number): Promise<void>;
  setMaxUploadRetryTime(appName: string, time: number): Promise<void>;
  // writeToFile(appName: string, time: number): Promise<void>;
  putString(
    appName: string,
    url: string,
    value: string,
    format: string,
    metadata: UploadMetadata,
    taskId: number,
  ): Promise<NativeTaskSnapshot>;
  // putFile(appName: string, time: number): Promise<void>;
  setTaskStatus(appName: string, taskId: number, status: number): Promise<boolean>;
}

type NativeListResult = {
  readonly nextPageToken?: string;
  readonly items: ReadonlyArray<string>;
  readonly prefixes: ReadonlyArray<string>;
};

export type NativeTaskSnapshot = {
  totalBytes: number;
  bytesTransferred: number;
  state: TaskState; // TODO
  metadata: FullMetadata;
};

const delegate = () =>
  getNativeModule<StorageModule>({
    namespace: 'storage',
    nativeModule: 'RNFBStorageModule',
    config: {
      events: ['storage_event'],
    },
  });

function convertListResult(storage: StorageService, result: NativeListResult): ListResult {
  return {
    nextPageToken: result.nextPageToken,
    items: result.items.map(path => new StorageReferenceImpl(storage, path)),
    prefixes: result.prefixes.map(path => new StorageReferenceImpl(storage, path)),
  };
}

export function deleteObject(ref: StorageReference): Promise<void> {
  return delegate().module.delete(ref.storage.app.name, ref.fullPath);
}

export function getDownloadURL(ref: StorageReference): Promise<string> {
  return delegate().module.getDownloadURL(ref.storage.app.name, ref.fullPath);
}

export async function getMetadata(ref: StorageReference): Promise<FullMetadata> {
  const record = await delegate().module.getMetadata(ref.storage.app.name, ref.fullPath);
  return toFullMetadata(record, ref);
}

export function getStorage(app: FirebaseApp, bucketUrl?: string): StorageService {
  const { maxDownloadRetryTime, maxOperationRetryTime, maxUploadRetryTime } = delegate().module;

  return new StorageServiceImpl(app, {
    bucket: bucketUrl,
    maxDownloadRetryTime,
    maxOperationRetryTime,
    maxUploadRetryTime,
  });
}

export async function list(ref: StorageReference, options: ListOptions): Promise<ListResult> {
  return convertListResult(
    ref.storage,
    await delegate().module.list(ref.storage.app.name, ref.fullPath, options),
  );
}

export async function listAll(ref: StorageReference): Promise<ListResult> {
  return convertListResult(
    ref.storage,
    await delegate().module.listAll(ref.storage.app.name, ref.fullPath),
  );
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

export async function updateMetadata(
  ref: StorageReference,
  metadata: SettableMetadata,
): Promise<FullMetadata> {
  const record = await delegate().module.updateMetadata(
    ref.storage.app.name,
    ref.fullPath,
    metadata,
  );
  return toFullMetadata(record, ref);
}

export async function uploadBytes(
  ref: StorageReference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata: UploadMetadata,
): Promise<UploadResult> {
  const { value, format } = await toBase64String(data);
  const result = await delegate().module.putString(
    ref.storage.app.name,
    ref.fullPath,
    value,
    format,
    metadata,
    -1, // TODO is this right?
  );

  return {
    ref,
    metadata: result.metadata,
  };
}

export function uploadBytesResumable(
  ref: StorageReference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata: UploadMetadata,
): UploadTask {
  return new UploadTaskImpl(ref, {
    async onTaskCreate(taskId) {
      const { value, format } = await toBase64String(data);
      return delegate().module.putString(
        ref.storage.app.name,
        ref.fullPath,
        value,
        format,
        metadata,
        taskId,
      );
    },
    onSetTaskStatus(taskId, status) {
      return delegate().module.setTaskStatus(ref.storage.app.name, taskId, status);
    },
    onTaskEvent(taskId, callbacks) {
      const listeners: EmitterSubscription[] = [];

      listeners.push(
        delegate().emitter.addListener(
          `${eventNameForApp(ref.storage.app, taskId.toString(), 'failure')}`,
          callbacks.onStateChanged,
        ),
      );

      listeners.push(
        delegate().emitter.addListener(
          `${eventNameForApp(ref.storage.app, taskId.toString(), 'success')}`,
          callbacks.onSuccess,
        ),
      );

      listeners.push(
        delegate().emitter.addListener(
          `${eventNameForApp(ref.storage.app, taskId.toString(), TaskEvent)}`,
          callbacks.onStateChanged,
        ),
      );

      return () => {
        for (const listener of listeners) {
          listener.remove();
        }
      };
    },
  });
}

export async function uploadString(
  ref: StorageReference,
  value: string,
  format: string,
  metadata: UploadMetadata,
): Promise<UploadResult> {
  const result = await delegate().module.putString(
    ref.storage.app.name,
    ref.fullPath,
    value,
    format ?? '',
    metadata,
    -1, // TODO is this right
  );

  return toUploadResult(ref, result.metadata);
}

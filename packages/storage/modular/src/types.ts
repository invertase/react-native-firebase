import * as web from 'firebase/storage';
import { FirebaseApp } from '@react-native-firebase-modular/app';

import type {
  UploadTaskCommand,
  OnUploadTaskError,
  OnUploadTaskSuccess,
} from './implementations/uploadTask.native';

export interface StorageService extends web.StorageService {
  readonly app: FirebaseApp;
  readonly maxOperationRetryTime: number;
  readonly maxDownloadRetryTime: number;
  readonly maxUploadRetryTime: number;
  readonly bucket: string;
}

export interface StorageReference extends web.StorageReference {
  readonly parent: StorageReference | null;
  readonly root: StorageReference;
  readonly storage: StorageService;
}

export interface ListResult extends web.ListResult {
  readonly items: StorageReference[];
  readonly nextPageToken?: string;
  readonly prefixes: StorageReference[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FullMetadata extends web.FullMetadata {
  // readonly contentDisposition?: string;
  // readonly contentEncoding?: string;
  // readonly contentLanguage?: string;
  // readonly contentType?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SettableMetadata extends web.SettableMetadata {}

export interface UploadMetadata extends SettableMetadata {
  /**
   * A Base64-encoded MD5 hash of the object being uploaded.
   */
  md5Hash?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ListOptions extends web.ListOptions {}

export interface UploadResult extends web.UploadResult {
  readonly metadata: FullMetadata;
}

export interface UploadTask {
  readonly snapshot: UploadTaskSnapshot;
  cancel(): Promise<boolean>;
  resume(): Promise<boolean>;
  pause(): Promise<boolean>;
  on(
    event: web.TaskEvent,
    observer?: (snapshot: UploadTaskSnapshot) => unknown,
    error?: (error: any) => unknown,
  ): () => void;
  then(onFulfilled?: (snapshot: UploadTaskSnapshot) => unknown): Promise<unknown>;
  catch(onRejected?: (error: any) => unknown): Promise<unknown>;
}

export interface UploadTaskSnapshot {
  readonly bytesTransferred: number;
  readonly metadata: FullMetadata;
  readonly ref: StorageReference;
  readonly state: web.TaskState;
  readonly task: UploadTask;
  readonly totalBytes: number;
}

// export type UploadTask = {
//   readonly snapshot: any;
//   cancel: UploadTaskCommand;
//   pause: UploadTaskCommand;
//   resume: UploadTaskCommand;
//   then: UploadTaskCommand;
//   catch: OnUploadTaskError;
//   on(event: 'state_changed', nextOrObserver: any, error?: any): () => void;
// };

import * as web from 'firebase/storage';
import { FirebaseApp } from '@react-native-firebase/app-exp';

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

/**
 * Possible string formats used whilst uploading data.
 */
export enum StringFormat {
  /**
   * Represents a raw string format.
   */
  RAW = 'raw',
  /**
   * Represents Base64 string format.
   *
   * Learn more about Base64 [on the Mozilla Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding)
   */
  BASE64 = 'base64',
  /**
   * Represents Base64Url string format.
   */
  BASE64URL = 'base64url',
  /**
   * Represents data URL string format.
   */
  DATA_URL = 'data_url',
}

export interface ListResult extends web.ListResult {
  readonly items: StorageReference[];
  readonly nextPageToken?: string;
  readonly prefixes: StorageReference[];
}

export interface FullMetadata extends web.FullMetadata {}

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

/**
 * Represents the process of uploading an object. Allows you to monitor and manage the upload.
 */
export interface UploadTask {
  /**
   * A snapshot of the current task state.
   */
  readonly snapshot: UploadTaskSnapshot;
  /**
   * Cancels a running task. Has no effect on a complete or failed task.
   */
  cancel(): Promise<boolean>;
  /**
   * Resumes a paused task. Has no effect on a currently running or failed task.
   */
  resume(): Promise<boolean>;
  /**
   * Pauses a currently running task. Has no effect on a paused or failed task.
   */
  pause(): Promise<boolean>;
  /**
   * Listens for events on this task.
   *
   * In addition, when you add your callbacks, you get a function back. You can call this function to unregister the associated callbacks.
   * @param event
   * @param observer
   * @param error
   */
  on(
    event: typeof TaskEvent,
    observer?: (snapshot: UploadTaskSnapshot) => unknown,
    error?: (error: any) => unknown,
    complete?: () => unknown,
  ): () => void;
  /**
   * This object behaves like a Promise, and resolves with its snapshot data when the upload completes.
   * @param onFulfilled
   */
  then(onFulfilled?: (snapshot: UploadTaskSnapshot) => unknown): Promise<unknown>;
  /**
   * Called if the upload task fails.
   * @param onRejected
   */
  catch(onRejected?: (error: any) => unknown): Promise<unknown>;
}

export interface UploadTaskSnapshot {
  readonly bytesTransferred: number;
  readonly metadata: FullMetadata;
  readonly ref: StorageReference;
  readonly state: TaskState;
  readonly task: UploadTask;
  readonly totalBytes: number;
}

export const TaskEvent = 'state_changed';

export type TaskState = web.TaskState;

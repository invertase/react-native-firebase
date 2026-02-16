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
import type { FirebaseApp, ReactNativeFirebase } from '@react-native-firebase/app';
import type {
  CompleteFn,
  NextFn,
  Unsubscribe,
} from '@react-native-firebase/app/dist/module/types/common';
export type { CompleteFn, NextFn, Unsubscribe };
export type NativeFirebaseError = ReactNativeFirebase.NativeFirebaseError;
/**
 * Storage module instance
 */
export interface Storage {
  /** The FirebaseApp this module is associated with */
  app: FirebaseApp;

  /**
   * The maximum time in milliseconds to retry an upload if a failure occurs.
   */
  readonly maxUploadRetryTime: number;

  /**
   * The maximum time in milliseconds to retry a download if a failure occurs.
   */
  readonly maxDownloadRetryTime: number;

  /**
   * The maximum time in milliseconds to retry operations if a failure occurs.
   */
  readonly maxOperationRetryTime: number;
}

/**
 * Storage reference to a file or folder location.
 */
export interface StorageReference {
  /**
   * A reference to the root of this object's bucket.
   */
  root: StorageReference;
  /**
   * The name of the bucket containing this reference's object.
   */
  bucket: string;
  /**
   * The full path of this object.
   */
  fullPath: string;
  /**
   * The short name of this object, which is the last component of the full path.
   * For example, if fullPath is 'full/path/image.png', name is 'image.png'.
   */
  name: string;
  /**
   * The {@link FirebaseStorage} instance associated with this reference.
   */
  storage: Storage;
  /**
   * A reference pointing to the parent location of this reference, or null if
   * this reference is the root.
   */
  parent: StorageReference | null;
  /**
   * Returns the full URL string for this object in the form
   * @returns The full URL string.
   */
  toString(): string;
}

/**
 * Options for listing files and folders.
 */
export interface ListOptions {
  /**
   * If set, limits the total number of `prefixes` and `items` to return.
   * The default and maximum maxResults is 1000.
   */
  maxResults?: number | null;
  /**
   * The `nextPageToken` from a previous call to `list()`. If provided,
   * listing is resumed from the previous position.
   */
  pageToken?: string;
}

/**
 * Result of listing files and folders.
 */
export interface ListResult {
  /**
   * References to prefixes (sub-folders). You can call list() on them to
   * get its contents.
   *
   * Folders are implicit based on '/' in the object paths.
   * For example, if a bucket has two objects '/a/b/1' and '/a/b/2', list('/a')
   * will return '/a/b' as a prefix.
   */
  prefixes: StorageReference[];
  /**
   * Objects in this directory.
   * You can call getMetadata() and getDownloadUrl() on them.
   */
  items: StorageReference[];
  /**
   * If set, there might be more results for this list. Use this token to resume the list.
   */
  nextPageToken?: string;
}

/**
 * Object metadata that can be set at any time.
 */
export interface SettableMetadata {
  cacheControl?: string | undefined;
  contentDisposition?: string | undefined;
  contentEncoding?: string | undefined;
  contentLanguage?: string | undefined;
  contentType?: string | undefined;
  customMetadata?: { [key: string]: string } | undefined;
}

/**
 * Object metadata that can be set at upload.
 * @public
 */
export interface UploadMetadata extends SettableMetadata {
  /**
   * A Base64-encoded MD5 hash of the object being uploaded.
   */
  md5Hash?: string | undefined;
}

/**
 * The full set of object metadata, including read-only properties.
 */
export interface FullMetadata extends UploadMetadata {
  /**
   * The bucket this object is contained in.
   */
  bucket: string;

  /**
   * The full path of this object.
   */
  fullPath: string;

  /**
   * The object's generation.
   * {@link https://cloud.google.com/storage/docs/metadata#generation-number}
   */
  generation: string;

  /**
   * The object's metageneration.
   * {@link https://cloud.google.com/storage/docs/metadata#generation-number}
   */
  metageneration: string;

  /**
   * The short name of this object, which is the last component of the full path.
   * For example, if fullPath is 'full/path/image.png', name is 'image.png'.
   */
  name: string;

  /**
   * The size of this object, in bytes.
   */
  size: number;

  /**
   * A date string representing when this object was created.
   */
  timeCreated: string;

  /**
   * A date string representing when this object was last updated.
   */
  updated: string;

  /**
   * Tokens to allow access to the download URL.
   */
  downloadTokens: string[] | undefined;

  /**
   * `StorageReference` associated with this upload.
   */
  ref?: StorageReference | undefined;
}

/**
 * An event that is triggered on a task.
 * @public
 */
export type TaskEvent = 'state_changed';

/**
 * Represents the current state of a running upload/download.
 *
 * Note: The Firebase JS SDK uses "canceled" (one L). React Native Firebase historically used
 * "cancelled" (two L) in docs, but the runtime value is "canceled".
 *
 * @public
 */
export type TaskState = 'running' | 'paused' | 'success' | 'canceled' | 'error';

/**
 * A stream observer for Firebase Storage.
 * @public
 */
export interface StorageObserver<T> {
  next?: NextFn<T> | null;
  error?: ((error: NativeFirebaseError) => void) | null;
  complete?: CompleteFn | null;
}

/**
 * Represents the process of uploading an object. Allows you to monitor and manage the upload.
 *
 * Note: React Native Firebase returns Promises for pause/resume/cancel to communicate with native iOS/Android.
 *
 * @public
 */
export interface UploadTask {
  /**
   * Cancels a running task. Has no effect on a complete or failed task.
   * @returns True if the cancel had an effect.
   */
  cancel(): Promise<boolean>;

  /**
   * Equivalent to calling `then(null, onRejected)`.
   */
  catch(onRejected: (error: NativeFirebaseError) => unknown): Promise<unknown>;

  /**
   * Listens for events on this task.
   *
   * @returns If only the event argument is passed, returns a function you can use to add callbacks.
   * Otherwise returns a function you can call to unregister the callbacks.
   */
  on(
    event: TaskEvent,
    nextOrObserver?:
      | StorageObserver<UploadTaskSnapshot>
      | null
      | ((snapshot: UploadTaskSnapshot) => unknown),
    error?: ((error: NativeFirebaseError) => unknown) | null,
    complete?: CompleteFn | null,
  ): Unsubscribe | Subscribe<UploadTaskSnapshot>;

  /**
   * Pauses a currently running task. Has no effect on a paused or failed task.
   * @returns True if the operation took effect, false if ignored.
   */
  pause(): Promise<boolean>;

  /**
   * Resumes a paused task. Has no effect on a currently running or failed task.
   * @returns True if the operation took effect, false if ignored.
   */
  resume(): Promise<boolean>;

  /**
   * A snapshot of the current task state.
   */
  snapshot: UploadTaskSnapshot;

  /**
   * This object behaves like a Promise, and resolves with its snapshot data when the upload completes.
   */
  then(
    onFulfilled?: ((snapshot: UploadTaskSnapshot) => unknown) | null,
    onRejected?: ((error: NativeFirebaseError) => unknown) | null,
  ): Promise<unknown>;
}

/**
 * Holds data about the current state of the upload task.
 * @public
 */
export interface UploadTaskSnapshot {
  /**
   * The number of bytes that have been successfully uploaded so far.
   */
  bytesTransferred: number;

  /**
   * Before the upload completes, contains the metadata sent to the server.
   * After the upload completes, contains the metadata sent back from the server.
   */
  metadata: FullMetadata;

  /**
   * The reference that spawned this snapshot's upload task.
   */
  ref: StorageReference;

  /**
   * The current state of the task.
   */
  state: TaskState;

  /**
   * The task of which this is a snapshot.
   */
  task: UploadTask;

  /**
   * The total number of bytes to be uploaded.
   */
  totalBytes: number;
}

/**
 * Result returned from a non-resumable upload.
 * @public
 */
export interface UploadResult {
  /**
   * Contains the metadata sent back from the server.
   */
  readonly metadata: FullMetadata;

  /**
   * The reference that spawned this upload.
   */
  readonly ref: StorageReference;
}

export type Subscribe<T> = (
  nextOrObserver?: StorageObserver<T> | null | NextFn<T>,
  error?: ((error: NativeFirebaseError) => unknown) | null,
  complete?: CompleteFn | null,
) => Unsubscribe;

/**
 * Snapshot of a storage task (upload or download).
 */
export interface TaskSnapshot extends UploadTaskSnapshot {
  /**
   * If the state is `error`, returns a JavaScript error of the current task snapshot.
   */
  error?: NativeFirebaseError;
}

/**
 * Result of a completed task.
 */
export type TaskResult = UploadResult;

/**
 * Observer object for task state changes.
 */
export type TaskSnapshotObserver = StorageObserver<TaskSnapshot>;

/**
 * Storage task for uploads or downloads.
 */
export type Task = UploadTask;

/**
 * Options for connecting to the storage emulator (web only).
 */
export interface EmulatorMockTokenOptions {
  mockUserToken?: string | null;
}

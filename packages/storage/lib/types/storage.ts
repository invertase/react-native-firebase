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

// ============ Options & Result Types ============

export type NativeFirebaseError = ReactNativeFirebase.NativeFirebaseError;
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
 * Snapshot of a storage task (upload or download).
 */
export interface TaskSnapshot {
  bytesTransferred: number;
  totalBytes: number;
  state: TaskState;
  metadata: FullMetadata;
  task: Task;
  ref: StorageReference;
  /**
   * If the state is `error`, returns a JavaScript error of the current task snapshot.
   */
  error?: NativeFirebaseError;
}

/**
 * Result of a completed task.
 */
export interface TaskResult {
  /**
   * The metadata of the tasks via a {@link FullMetadata} interface.
   */
  metadata: FullMetadata;

  /**
   * The {@link StorageReference} of the task.
   */
  ref: StorageReference;
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
 * Observer object for task state changes.
 */
export interface TaskSnapshotObserver {
  /**
   * Called when the task state changes.
   */
  next?: (snapshot: TaskSnapshot) => void;

  /**
   * Called when the task errors.
   */
  error?: (error: NativeFirebaseError) => void;

  /**
   * Called when the task has completed successfully.
   */
  complete?: () => void;
}

/**
 * Storage task for uploads or downloads.
 */
export interface Task {
  /**
   * Initial state of Task.snapshot is `null`. Once uploading begins, it updates to a `TaskSnapshot` object.
   */
  snapshot: TaskSnapshot | null;

  /**
   * Pause the current Download or Upload task.
   */
  pause(): Promise<boolean>;

  /**
   * Resume the current Download or Upload task.
   */
  resume(): Promise<boolean>;

  /**
   * Cancel the current Download or Upload task.
   */
  cancel(): Promise<boolean>;

  /**
   * Subscribe to task state changes.
   *
   * @param event The event name to handle, always `state_changed`.
   * @param nextOrObserver The optional event observer function or object.
   * @param error An optional JavaScript error handler.
   * @param complete An optional complete handler function.
   */
  on(
    event: 'state_changed',
    nextOrObserver?: TaskSnapshotObserver | null | ((snapshot: TaskSnapshot) => void),
    error?: ((error: NativeFirebaseError) => void) | null,
    complete?: (() => void) | null,
  ): () => void;

  /**
   * Attaches callbacks for the resolution and/or rejection of the Task.
   *
   * @param onFulfilled Optional callback for when the task completes successfully.
   * @param onRejected Optional callback for when the task fails.
   */
  then(
    onFulfilled?: ((snapshot: TaskSnapshot) => any) | null,
    onRejected?: ((error: NativeFirebaseError) => any) | null,
  ): Promise<unknown>;

  /**
   * Attaches a callback for only the rejection of the Task.
   *
   * @param onRejected Callback for when the task fails.
   */
  catch(onRejected: (error: NativeFirebaseError) => any): Promise<any>;
}

/**
 * Options for connecting to the storage emulator (web only).
 */
export interface EmulatorMockTokenOptions {
  mockUserToken?: string | null;
}

// ============ Module Interface ============

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

// ============ Statics Interface ============

/**
 * String formats for uploading data.
 */
export interface StringFormat {
  RAW: 'raw';
  BASE64: 'base64';
  BASE64URL: 'base64url';
  DATA_URL: 'data_url';
}

/**
 * An event that is triggered on a task.
 */
export type TaskEvent = 'state_changed';

/**
 * Represents the current state of a running upload.
 */
export type TaskState = 'running' | 'paused' | 'success' | 'canceled' | 'cancelled' | 'error';

/**
 * Static properties available on firebase.storage
 */
export interface StorageStatics {
  StringFormat: StringFormat;
  TaskEvent: typeof import('../StorageStatics').TaskEvent;
  TaskState: typeof import('../StorageStatics').TaskState;
}

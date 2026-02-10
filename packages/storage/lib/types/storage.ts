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

import type { FirebaseApp } from '@react-native-firebase/app';

// ============ Options & Result Types ============

/**
 * Metadata that can be set when uploading or updating a file.
 */
export interface SettableMetadata {
  cacheControl?: string | null;
  contentDisposition?: string | null;
  contentEncoding?: string | null;
  contentLanguage?: string | null;
  contentType?: string | null;
  customMetadata?: { [key: string]: string } | null;
  md5hash?: string | null;
}

/**
 * Full metadata for a file, including read-only properties.
 */
export interface FullMetadata extends SettableMetadata {
  bucket: string;
  generation: string;
  metageneration: string;
  fullPath: string;
  name: string;
  size: number;
  timeCreated: string;
  updated: string;
  md5Hash: string | null;
  metadata?: { [key: string]: string };
}

/**
 * Options for listing files and folders.
 */
export interface ListOptions {
  maxResults?: number;
  pageToken?: string;
}

/**
 * Result of listing files and folders.
 */
export interface ListResult {
  items: Reference[];
  prefixes: Reference[];
  nextPageToken: string | null;
}

/**
 * Snapshot of a storage task (upload or download).
 */
export interface TaskSnapshot {
  bytesTransferred: number;
  totalBytes: number;
  state: string;
  metadata: FullMetadata | null;
  task: Task;
  ref: Reference;
  /**
   * If the state is `error`, returns a JavaScript error of the current task snapshot.
   */
  error?: Error;
}

/**
 * Result of a completed task.
 */
export interface TaskResult {
  bytesTransferred: number;
  totalBytes: number;
  state: string;
  metadata: FullMetadata | null;
}

/**
 * Storage reference to a file or folder location.
 */
export interface Reference {
  /**
   * A reference to the root of this object's bucket.
   */
  root: Reference;
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
  parent: Reference | null;
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
  error?: (error: Error) => void;

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
    error?: ((error: Error) => void) | null,
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
    onRejected?: ((error: Error) => any) | null,
  ): Promise<unknown>;

  /**
   * Attaches a callback for only the rejection of the Task.
   *
   * @param onRejected Callback for when the task fails.
   */
  catch(onRejected: (error: Error) => any): Promise<any>;
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
 * Task events.
 */
export interface TaskEvent {
  STATE_CHANGED: 'state_changed';
}

/**
 * Task states.
 */
export interface TaskState {
  RUNNING: 'running';
  PAUSED: 'paused';
  SUCCESS: 'success';
  CANCELLED: 'cancelled';
  ERROR: 'error';
}

/**
 * Static properties available on firebase.storage
 */
export interface StorageStatics {
  StringFormat: StringFormat;
  TaskEvent: TaskEvent;
  TaskState: TaskState;
}

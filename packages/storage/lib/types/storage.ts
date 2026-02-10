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

import type { ReactNativeFirebase } from '@react-native-firebase/app';

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
  bucket: string;
  fullPath: string;
  name: string;
  parent: Reference | null;
  root: Reference;
  storage: Storage;

  child(path: string): Reference;
  delete(): Promise<void>;
  getDownloadURL(): Promise<string>;
  getMetadata(): Promise<FullMetadata>;
  list(options?: ListOptions): Promise<ListResult>;
  listAll(): Promise<ListResult>;
  put(data: Blob | Uint8Array | ArrayBuffer, metadata?: SettableMetadata): Task;
  putString(
    string: string,
    format?: 'raw' | 'base64' | 'base64url' | 'data_url',
    metadata?: SettableMetadata,
  ): Task;
  toString(): string;
  updateMetadata(metadata: SettableMetadata): Promise<FullMetadata>;
  writeToFile(filePath: string): Task;
  putFile(filePath: string, metadata?: SettableMetadata): Task;
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
 * Storage module instance - returned from firebase.storage() or firebase.app().storage()
 */
export interface Storage extends ReactNativeFirebase.FirebaseModule {
  /** The FirebaseApp this module is associated with */
  app: ReactNativeFirebase.FirebaseApp;

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

/**
 * FirebaseApp type with storage() method.
 * @deprecated Import FirebaseApp from '@react-native-firebase/app' instead.
 * The storage() method is added via module augmentation.
 */
export type FirebaseApp = ReactNativeFirebase.FirebaseApp;

// ============ Module Augmentation ============

/* eslint-disable @typescript-eslint/no-namespace */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    interface Module {
      storage: FirebaseModuleWithStaticsAndApp<Storage, StorageStatics>;
    }
    interface FirebaseApp {
      storage(bucketUrl?: string): Storage;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// ============ Backwards Compatibility Namespace - to be removed with namespaced exports ============

// Helper types to reference outer scope types within the namespace
// These are needed because TypeScript can't directly alias types with the same name
type _Storage = Storage;
type _StorageStatics = StorageStatics;
type _Reference = Reference;
type _FullMetadata = FullMetadata;
type _SettableMetadata = SettableMetadata;
type _ListResult = ListResult;
type _ListOptions = ListOptions;
type _TaskSnapshot = TaskSnapshot;
type _TaskResult = TaskResult;
type _Task = Task;
type _EmulatorMockTokenOptions = EmulatorMockTokenOptions;

/**
 * @deprecated Use the exported types directly instead.
 * FirebaseStorageTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseStorageTypes {
  // Short name aliases referencing top-level types
  export type Module = _Storage;
  export type Statics = _StorageStatics;
  export type Reference = _Reference;
  export type FullMetadata = _FullMetadata;
  export type SettableMetadata = _SettableMetadata;
  export type ListResult = _ListResult;
  export type ListOptions = _ListOptions;
  export type TaskSnapshot = _TaskSnapshot;
  export type TaskResult = _TaskResult;
  export type Task = _Task;
  export type EmulatorMockTokenOptions = _EmulatorMockTokenOptions;
}
/* eslint-enable @typescript-eslint/no-namespace */

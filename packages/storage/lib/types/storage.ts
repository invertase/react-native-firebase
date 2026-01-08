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
  md5Hash: string;
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
  putString(string: string, format?: string, metadata?: SettableMetadata): Task;
  toString(): string;
  updateMetadata(metadata: SettableMetadata): Promise<FullMetadata>;
  writeToFile(filePath: string): Task;
  putFile(filePath: string, metadata?: SettableMetadata): Task;
}

/**
 * Storage task for uploads or downloads.
 */
export interface Task extends Promise<TaskSnapshot> {
  snapshot: TaskSnapshot | null;
  on(
    event: string,
    nextOrObserver?: ((snapshot: TaskSnapshot) => void) | null,
    error?: ((error: Error) => void) | null,
    complete?: ((snapshot: TaskSnapshot) => void) | null,
  ): () => void;
  pause(): Promise<void>;
  resume(): Promise<boolean>;
  cancel(): Promise<boolean>;
  catch(onRejected: (error: Error) => void | PromiseLike<void>): Promise<void>;
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

  /**
   * Returns a reference to the object at the specified path.
   *
   * @param path - An optional string pointing to a location on the storage bucket. If no path
   * is provided, the returned reference will be the bucket root path.
   */
  ref(path?: string): Reference;

  /**
   * Returns a reference to the object at the specified URL.
   *
   * @param url - A storage bucket URL pointing to a single file or location. Must be either a `gs://` url or an `http` url.
   */
  refFromURL(url: string): Reference;

  /**
   * Sets the maximum time in milliseconds to retry operations if a failure occurs.
   *
   * @param time - The new maximum operation retry time in milliseconds.
   */
  setMaxOperationRetryTime(time: number): Promise<void>;

  /**
   * Sets the maximum time in milliseconds to retry an upload if a failure occurs.
   *
   * @param time - The new maximum upload retry time in milliseconds.
   */
  setMaxUploadRetryTime(time: number): Promise<void>;

  /**
   * Sets the maximum time in milliseconds to retry a download if a failure occurs.
   *
   * @param time - The new maximum download retry time in milliseconds.
   */
  setMaxDownloadRetryTime(time: number): Promise<void>;

  /**
   * Changes this instance to point to a Cloud Storage emulator running locally.
   *
   * @param host - The host of the emulator, e.g. "localhost" or "10.0.2.2" for Android.
   * @param port - The port of the emulator, e.g. 9199.
   * @param options - Optional settings for the emulator connection (web only).
   */
  useEmulator(host: string, port: number, options?: EmulatorMockTokenOptions): void;
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

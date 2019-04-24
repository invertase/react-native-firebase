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

import {
  ReactNativeFirebaseModule,
  ReactNativeFirebaseModuleAndStatics,
  ReactNativeFirebaseNamespace,
} from '@react-native-firebase/app-types';

/**
 * Firebase Cloud Storage package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `storage` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/storage';
 *
 * // firebase.storage().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `storage` package:
 *
 * ```js
 * import storage from '@react-native-firebase/storage';
 *
 * // storage().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/storage';
 *
 * // firebase.storage().X
 * ```
 *
 * @firebase storage
 */
export namespace Storage {
  /**
   * Possible string formats used for uploading via `StorageReference.putString()`
   *
   * ```js
   * firebase.storage.StringFormat;
   * ```
   */
  export interface StringFormat {
    /**
     * Raw string format.
     *
     * #### Usage
     *
     * ```js
     * firebase.storage.StringFormat.RAW;
     * ```
     *
     * #### Example String Format
     *
     * ```js
     * const sampleString = '<Foo Bar>';
     * ```
     */
    RAW: 'raw';

    /**
     * Base64 string format.
     *
     * Learn more about Base64 [on the Mozilla Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding)
     *
     * #### Usage
     *
     * ```js
     * firebase.storage.StringFormat.BASE64;
     * ```
     *
     * #### Example String Format
     *
     * ```js
     * const sampleString = 'PEZvbyBCYXI+';
     * ```
     *
     */
    BASE64: 'base64';

    /**
     * Base64Url string format.
     *
     * #### Usage
     *
     * ```js
     * firebase.storage.StringFormat.BASE64URL;
     * ```
     *
     * #### Example String Format
     *
     * ```js
     * const sampleString = 'PEZvbyBCYXI-';
     * ```
     *
     */
    BASE64URL: 'base64url';

    /**
     * Data URL string format.
     *
     * #### Usage
     *
     * ```js
     * firebase.storage.StringFormat.DATA_URL;
     * ```
     *
     * #### Example String Format
     *
     * ```js
     * const sampleString = 'data:text/plain;base64,PEZvbyBCYXI+';
     * ```
     */
    DATA_URL: 'data_url';
  }

  /**
   * An event to subscribe to that is triggered on a Upload or Download task.
   *
   * Event subscription is created via `StorageTask.on()`.
   *
   * ```js
   * firebase.storage.TaskEvent;
   * ```
   */
  export interface TaskEvent {
    /**
     * An event that indicates that the tasks state has changed.
     *
     * ```js
     * firebase.storage.TaskEvent.STATE_CHANGED;
     * ```
     */
    STATE_CHANGED: 'state_changed';
  }

  /**
   * A collection of properties that indicates the current tasks state.
   *
   * An event subscription is created via `StorageTask.on()`.
   *
   * ```js
   * firebase.storage.TaskEvent;
   * ```
   */
  export interface TaskState {
    /**
     * Task has been cancelled.
     */
    CANCELLED: 'cancelled';
    ERROR: 'error';
    PAUSED: 'paused';
    /**
     * Task is running.
     */
    RUNNING: 'running';
    SUCCESS: 'success';
  }

  export interface Statics {
    StringFormat: StringFormat;

    TaskState: TaskState;

    TaskEvent: TaskEvent;

    Native: {
      /**
       * Main Bundle Path
       */
      MAIN_BUNDLE_PATH: string;

      CACHES_DIRECTORY_PATH: string;

      /**
       * Document Directory Path
       */
      DOCUMENT_DIRECTORY_PATH: string;
      EXTERNAL_DIRECTORY_PATH: string;
      EXTERNAL_STORAGE_DIRECTORY_PATH: string;
      /**
       * Store Temp Files here
       */
      TEMP_DIRECTORY_PATH: string;
      LIBRARY_DIRECTORY_PATH: string;
      FILE_TYPE_REGULAR: string;
      FILE_TYPE_DIRECTORY: string;
    };
  }

  export interface SettableMetadata {
    cacheControl?: string | null;

    contentDisposition?: string | null;

    contentEncoding?: string | null;

    contentLanguage?: string | null;

    contentType?: string | null;

    customMetadata?: {
      [key: string]: string;
    } | null;
  }

  export interface UploadMetadata extends SettableMetadata {
    md5Hash?: string | null;
  }

  export interface FullMetadata extends UploadMetadata {
    bucket: string;

    fullPath: string;

    generation: string;

    metageneration: string;

    name: string;

    size: number;

    timeCreated: string;

    updated: string;
  }

  export interface Reference {
    bucket: string;

    parent: Reference | null;

    fullPath: string;

    name: string;

    root: Reference;

    storage: Module;

    toString(): string;

    child(path: string): Reference;

    delete(): Promise<void>;

    getDownloadURL(): Promise<string>;

    getMetadata(): Promise<FullMetadata>;

    putFile(localFilePath: string, metadata?: UploadMetadata): Task;

    put(data: Blob | Uint8Array | ArrayBuffer, metadata?: UploadMetadata): Task;

    putString(data: string, format?: StringFormat, metadata?: UploadMetadata): Task;

    updateMetadata(metadata: SettableMetadata): Promise<FullMetadata>;
  }

  export interface TaskSnapshotObserver {
    next: (taskSnapshot: TaskSnapshot) => void;

    error: (error: Error) => void;

    complete: () => void;
  }

  export interface Task {
    pause(): boolean;

    resume(): boolean;

    cancel(): boolean;

    on(
      event: 'state_changed',
      nextOrObserver?: TaskSnapshotObserver | null | ((a: TaskSnapshot) => any),
      error?: ((a: Error) => any) | null,
      complete?: (() => void) | null,
    ): Function;

    // TODO not supported
    // snapshot: TaskSnapshot;

    then(
      onFulfilled?: ((a: TaskSnapshot) => any) | null,
      onRejected?: ((a: Error) => any) | null,
    ): Promise<any>;

    catch(onRejected: (a: Error) => any): Promise<any>;
  }

  export interface TaskSnapshot {
    bytesTransferred: number;

    metadata: FullMetadata;

    ref: Reference;

    state: 'cancelled' | 'error' | 'paused' | 'running' | 'success';

    task: Task;

    totalBytes: number;
  }

  /**
   * The Cloud Storage service is available for the default app, a given app or a specific storage bucket.
   *
   * #### Example 1
   *
   * Get the storage instance for the **default app**:
   *
   * ```js
   * const storageForDefaultApp = firebase.storage();
   * ```
   *
   * #### Example 2
   *
   * Get the storage instance for a **secondary app**:
   *
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const storageForOtherApp = firebase.storage(otherApp);
   * ```
   *
   * #### Example 3
   *
   * Get the storage instance for a **specific storage bucket**:
   *
   * ```js
   * const defaultApp = firebase.app();
   * const storageForBucket = defaultApp.storage('gs://another-bucket-url');
   *
   * const otherApp = firebase.app('otherApp');
   * const storageForOtherAppBucket = otherApp.storage('gs://another-bucket-url');
   * ```
   *
   */
  export class Module extends ReactNativeFirebaseModule {
    maxUploadRetryTime: number;

    setMaxUploadRetryTime(time: number): Promise<null>;

    maxDownloadRetryTime: number;

    setMaxDownloadRetryTime(time: number): Promise<null>;

    maxOperationRetryTime: number;

    setMaxOperationRetryTime(time: number): Promise<null>;

    ref(path?: string): Reference;

    refFromURL(url: string): Reference;
  }
}

declare module '@react-native-firebase/storage' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  export const firebase = FirebaseNamespaceExport;

  const StorageDefaultExport: ReactNativeFirebaseModuleAndStatics<Storage.Module, Storage.Statics>;

  export default StorageDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    storage: ReactNativeFirebaseModuleAndStatics<Storage.Module, Storage.Statics>;
  }

  interface FirebaseApp {
    storage?(bucket?: string): Storage.Module;
  }
}

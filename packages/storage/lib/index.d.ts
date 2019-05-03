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
  NativeFirebaseError,
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
     * Task has been cancelled by the user.
     */
    CANCELLED: 'cancelled';

    /**
     * An Error occurred, see TaskSnapshot.error for details.
     */
    ERROR: 'error';

    /**
     * Task has been paused. Resume the task via `StorageTask.resume()`.
     */
    PAUSED: 'paused';

    /**
     * Task is running. Pause the task via `StorageTask.pause()`
     */
    RUNNING: 'running';

    /**
     * Task has completed successfully.
     */
    SUCCESS: 'success';
  }

  /**
   * A collection of native device file paths to aid in the usage of file path based storage methods.
   *
   * Concatenate a file path with your target file name when using `putFile` or `getFile`.
   *
   * ```js
   * firebase.storage.Path;
   * ```
   */
  export interface Path {
    /**
     * Returns an absolute path to the applications main bundle.
     *
     * ```js
     * firebase.storage.Path.MainBundle;
     * ```
     *
     * @ios iOS only
     */
    MainBundle: string;

    /**
     * Returns an absolute path to the application specific cache directory on the filesystem.
     *
     * The system will automatically delete files in this directory when disk space is needed elsewhere on the device, starting with the oldest files first.
     *
     * ```js
     * firebase.storage.Path.CachesDirectory;
     * ```
     */
    CachesDirectory: string;

    /**
     * Returns an absolute path to the users Documents directory.
     *
     * Use this directory to place documents that have been created by the user.
     *
     * ```js
     * firebase.storage.Path.DocumentDirectory;
     * ```
     */
    DocumentDirectory: string;

    /**
     * Returns an absolute path to a temporary directory.
     *
     * Use this directory to create temporary files. The system will automatically delete files in this directory when disk space is needed elsewhere on the device, starting with the oldest files first.
     *
     * ```js
     * firebase.storage.Path.TempDirectory;
     * ```
     */
    TempDirectory: string;

    /**
     * Returns an absolute path to the apps library/resources directory.
     *
     * E.g. this can be used for things like documentation, support files, and configuration files and generic resources.
     *
     * ```js
     * firebase.storage.Path.LibraryDirectory;
     * ```
     */
    LibraryDirectory: string;

    /**
     * Returns an absolute path to the directory on the primary shared/external storage device.
     *
     * Here your application can place persistent files it owns. These files are internal to the application, and not typically visible to the user as media.
     *
     * Returns null if no external storage directory found, e.g. removable media has been ejected by the user.
     *
     * ```js
     * firebase.storage.Path.ExternalDirectory;
     * ```
     *
     * @android Android only - iOS returns null
     */
    ExternalDirectory: string | null;

    /**
     * Returns an absolute path to the primary shared/external storage directory.
     *
     * Traditionally this is an SD card, but it may also be implemented as built-in storage on a device.
     *
     * Returns null if no external storage directory found, e.g. removable media has been ejected by the user.
     *
     * ```js
     * firebase.storage.Path.ExternalStorageDirectory;
     * ```
     *
     * @android Android only - iOS returns null
     */
    ExternalStorageDirectory: string | null;

    /**
     * Returns an absolute path to a directory in which to place pictures that are available to the user.
     *
     * ```js
     * firebase.storage.Path.PicturesDirectory;
     * ```
     */
    PicturesDirectory: string;

    /**
     * Returns an absolute path to a directory in which to place movies that are available to the user.
     *
     * ```js
     * firebase.storage.Path.MoviesDirectory;
     * ```
     */
    MoviesDirectory: string;
  }

  /**
   * Cloud Storage statics.
   *
   * #### Example
   *
   * ```js
   * firebase.storage;
   * ```
   */
  export interface Statics {
    /**
     * Possible string formats used for uploading via `StorageReference.putString()`
     *
     * #### Example
     *
     * ```js
     * firebase.storage.StringFormat;
     * ```
     */
    StringFormat: StringFormat;

    /**
     * A collection of properties that indicates the current tasks state.
     *
     * #### Example
     *
     * ```js
     * firebase.storage.TaskState;
     * ```
     */
    TaskState: TaskState;

    /**
     * An event to subscribe to that is triggered on a Upload or Download task.
     *
     * #### Example
     *
     * ```js
     * firebase.storage.TaskEvent;
     * ```
     */
    TaskEvent: TaskEvent;

    /**
     * A collection of native device file paths to aid in the usage of file path based storage methods.
     *
     * #### Example
     *
     * ```js
     * firebase.storage.Path;
     * ```
     */
    Path: Path;
  }

  /**
   * An interface representing all the metadata properties that can be set.
   *
   * This is used in updateMetadata, put, putString & putFile.
   */
  export interface SettableMetadata {
    /**
     * The 'Cache-Control' HTTP header that will be set on the storage object when it's requested.
     *
     * #### Example 1
     *
     * To turn off caching, you can set the following cacheControl value.
     *
     * ```js
     * {
     *   cacheControl: 'no-store',
     * }
     * ```
     *
     * #### Example 2
     *
     * To aggressively cache an object, e.g. static assets, you can set the following cacheControl value.
     *
     * ```js
     * {
     *   cacheControl: 'public, max-age=31536000',
     * }
     * ```
     *
     * [Learn more about this header on Mozilla.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition)
     */
    cacheControl?: string | null;

    /**
     * The 'Content-Disposition' HTTP header that will be set on the storage object when it's requested.
     *
     * [Learn more about this header on Mozilla.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition)
     */
    contentDisposition?: string | null;

    /**
     * The 'Content-Encoding' HTTP header that will be used on the storage object when it's requested.
     *
     * [Learn more about this header on Mozilla.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding)
     */
    contentEncoding?: string | null;

    /**
     * The 'Content-Language' HTTP header that will be set on the storage object when it's requested.
     *
     * [Learn more about this header on Mozilla.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Language)
     */
    contentLanguage?: string | null;

    /**
     * The 'Content-Type' HTTP header that will be set on the object when it's requested.
     *
     * This is used to indicate the media type (or MIME type) of the object. When uploading a file
     * Firebase Cloud Storage for React Native will attempt to automatically detect this if `contentType`
     * is not already set, if it fails to detect a media type it will default to `application/octet-stream`.
     *
     * For `DATA_URL` string formats uploaded via `putString` this will also be automatically extracted if available.
     *
     * #### Example
     *
     * Setting the content type as JSON, e.g. for when uploading a JSON string via `putString`.
     *
     * ```js
     * {
     *   contentType: 'application/json',
     * }
     * ```
     *
     * [Learn more about this header on Mozilla.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)
     */
    contentType?: string | null;

    /**
     * Additional user-defined custom metadata for this storage object.
     *
     * String values only are supported for custom metadata property values.
     *
     * #### Example
     *
     * Adding a user controlled NSFW meta data field.
     *
     * ```js
     * {
     *   customMetadata: {
     *     'nsfw': 'true'
     *   },
     * }
     */
    customMetadata?: {
      [key: string]: string;
    } | null;
  }

  /**
   * The full readable metadata returned by `TaskSnapshot.metadata` or `StorageReference.getMetadata()`.
   */
  export interface FullMetadata extends SettableMetadata {
    /**
     * A Base64-encoded MD5 hash of the storage object being uploaded.
     */
    md5Hash: string | null;

    /**
     * The bucket this storage object is contained in.
     *
     * #### Example Value
     *
     * ```
     * gs://my-project-storage-bucket
     * ```
     */
    bucket: string;

    /**
     * The full path to this storage object in its bucket.
     *
     * #### Example Value
     *
     * ```
     * invertase/logo.png
     * ```
     */
    fullPath: string;

    /**
     * Storage object generation values enable users to uniquely identify data resources, e.g. object versioning.
     *
     * Read more on generation on the [Google Cloud Storage documentation](https://cloud.google.com/storage/docs/generations-preconditions).
     */
    generation: string;

    /**
     * Storage object metageneration values enable users to uniquely identify data resources, e.g. object versioning.
     *
     * Read more on metageneration on the [Google Cloud Storage documentation](https://cloud.google.com/storage/docs/generations-preconditions).
     */
    metageneration: string;

    /**
     * The short name of storage object in its bucket, e.g. it's file name.
     *
     * #### Example Value
     *
     * ```
     * logo.png
     * ```
     */
    name: string;

    /**
     * The size of this storage object in bytes.
     */
    size: number;

    /**
     * A date string representing when this storage object was created.
     *
     * #### Example Value
     *
     * ```
     * 2019-05-02T00:34:56.264Z
     * ```
     */
    timeCreated: string;

    /**
     * A date string representing when this storage object was last updated.
     *
     * #### Example Value
     *
     * ```
     * 2019-05-02T00:35:56.264Z
     * ```
     */
    updated: string;
  }

  /**
   * Represents a reference to a Google Cloud Storage object in React Native Firebase.
   *
   * A reference can be used to upload and download storage objects, get/set storage object metadata, retrieve storage object download urls and delete storage objects.
   *
   * #### Example 1
   *
   * Get a reference to a specific storage path.
   *
   * ```js
   * const ref = firebase.storage().ref('invertase/logo.png');
   * ```
   *
   * #### Example 2
   *
   * Get a reference to a specific storage path on another bucket in the same firebase project.
   *
   * ```js
   * const ref = firebase.storage().refFromURL('gs://other-bucket/invertase/logo.png');
   * ```
   */
  export interface Reference {
    // TODO(salakar) -----\/

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

    putFile(localFilePath: string, metadata?: SettableMetadata): Task;

    put(data: Blob | Uint8Array | ArrayBuffer, metadata?: SettableMetadata): Task;

    putString(data: string, format?: StringFormat, metadata?: SettableMetadata): Task;

    updateMetadata(metadata: SettableMetadata): Promise<FullMetadata>;
  }

  export interface TaskSnapshotObserver {
    next: (taskSnapshot: TaskSnapshot) => void;

    error: (error: NativeFirebaseError) => void;

    complete: () => void;
  }

  /**
   * Storage Task used for Uploading or Downloading files.
   *
   * #### Example 1
   *
   * Get a Upload Storage task to upload a string:
   *
   * ```js
   * const string = '{ "foo": 1 }';
   * const task = firebase
   *  .storage()
   *  .ref('/foo/bar.json')
   *  .putString(string);
   * ```
   *
   * #### Example 2
   *
   * Get a Download Storage task to download a file:
   *
   * ```js
   * const string = '{ "foo": 1 }';
   * const downloadTo = `${firebase.storage.Path.DocumentDirectory}/bar.json`;
   *
   * const task = firebase
   *  .storage()
   *  .ref('/foo/bar.json')
   *  .getFile(downloadTo);
   * ```
   */
  export interface Task {
    /**
     * Pause the current Download or Upload task.
     *
     * #### Example
     *
     * Pause a running task inside a state changed listener:
     *
     * ```js
     * task.on('state_changed', taskSnapshot => {
     *   if (taskSnapshot.state === firebase.storage.TaskState.RUNNING) {
     *     console.log('Pausing my task!');
     *     task.pause();
     *   }
     * });
     * ```
     *
     */
    pause(): Promise<boolean>;

    /**
     * Resume the current Download or Upload task.
     *
     * #### Example
     *
     * Resume a previously paused task inside a state changed listener:
     *
     * ```js
     * task.on('state_changed', taskSnapshot => {
     *   // ... pause me ...
     *   if (taskSnapshot.state === firebase.storage.TaskState.PAUSED) {
     *     console.log('Resuming my task!');
     *     task.resume();
     *   }
     * });
     * ```
     *
     */
    resume(): Promise<boolean>;

    /**
     * Cancel the current Download or Upload task.
     *
     *
     * #### Example
     *
     * Cancel a task inside a state changed listener:
     *
     * ```js
     * task.on('state_changed', taskSnapshot => {
     *   console.log('Cancelling my task!');
     *   task.cancel();
     * });
     * ```
     *
     */
    cancel(): Promise<boolean>;

    /**
     *
     * @param event
     * @param nextOrObserver
     * @param error
     * @param complete
     */
    on(
      event: 'state_changed',
      nextOrObserver?: TaskSnapshotObserver | null | ((a: TaskSnapshot) => any),
      error?: ((a: NativeFirebaseError) => any) | null,
      complete?: (() => void) | null,
    ): Function;

    // /**
    //  * @ignore May not exist in RN JS Environment yet so we'll hide from docs.
    //  */
    // finally(onFinally?: (() => void) | undefined | null): Promise<TaskSnapshot>;

    then(
      onFulfilled?: ((a: TaskSnapshot) => any) | null,
      onRejected?: ((a: NativeFirebaseError) => any) | null,
    ): Promise<any>;

    catch(onRejected: (a: NativeFirebaseError) => any): Promise<any>;
  }

  /**
   * A TaskSnapshot provides information about a storage tasks state.
   *
   * #### Example 1
   *
   * ```
   * firebase
   *   .storage()
   *   .ref('/foo/bar.json')
   *   .putString(JSON.stringify({ foo: 'bar' }))
   *   .then((taskSnapshot) => {
   *     if (taskSnapshot.state === firebase.storage.TaskState.SUCCESS) {
   *       console.log('Total bytes uploaded: ', taskSnapshot.totalBytes);
   *     }
   *   });
   * ```
   *
   * #### Example 2
   *
   * ```
   * const task = firebase
   *   .storage()
   *   .ref('/foo/bar.json')
   *   .putString(JSON.stringify({ foo: 'bar' }));
   *
   * task.on('state_changed', taskSnapshot => {
   *   if (taskSnapshot.state === firebase.storage.TaskState.PAUSED) {
   *     console.log('Resuming my task!');
   *     task.resume();
   *   }
   * });
   * ```
   */
  export interface TaskSnapshot {
    /**
     * The number of bytes currently transferred.
     */
    bytesTransferred: number;

    /**
     * The metadata of the tasks via a {@link storage.FullMetadata} interface.
     */
    metadata: FullMetadata;

    /**
     * The {@link storage.Reference} of the task.
     */
    ref: Reference;

    /**
     * The current state of the task snapshot.
     */
    state: 'cancelled' | 'error' | 'paused' | 'running' | 'success';

    /**
     * The parent {@link storage.Task} of this snapshot.
     */
    task: Task;

    /**
     * The total amount of bytes for this task.
     */
    totalBytes: number;

    /**
     * If the {@link storage.TaskSnapshot#state} is `error`, returns a JavaScript error of the
     * current task snapshot.
     */
    error?: NativeFirebaseError;
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
    /**
     * TODO.
     *
     * #### Example
     *
     * ```js
     * const uploadRetryTime = firebase.storage().maxUploadRetryTime;
     * ```
     */
    maxUploadRetryTime: number;

    /**
     * TODO.
     *
     * #### Example
     *
     * ```js
     * await firebase.storage().setMaxUploadRetryTime(5000);
     * ```
     *
     * @param time Number of milliseconds.... TODO
     */
    setMaxUploadRetryTime(time: number): Promise<null>;

    /**
     * TODO.
     *
     * #### Example
     *
     * ```js
     * const downloadRetryTime = firebase.storage().maxUploadRetryTime;
     * ```
     */
    maxDownloadRetryTime: number;

    /**
     * TODO.
     *
     * #### Example
     *
     * ```js
     * await firebase.storage().setMaxDownloadRetryTime(5000);
     * ```
     *
     * @param time Number of miliseconds.... TODO
     */
    setMaxDownloadRetryTime(time: number): Promise<null>;

    /**
     * TODO.
     *
     * #### Example
     *
     * ```js
     * const maxOperationRetryTime = firebase.storage().maxOperationRetryTime;
     * ```
     */
    maxOperationRetryTime: number;

    /**
     * TODO.
     *
     * #### Example
     *
     * ```js
     * await firebase.storage().setMaxOperationRetryTime(5000);
     * ```
     *
     * @param time Number of miliseconds.... TODO
     */
    setMaxOperationRetryTime(time: number): Promise<null>;

    /**
     * Returns a new {@link storage.Reference} instance.
     *
     * #### Example
     *
     * ```js
     * const maxOperationRetryTime = firebase.storage().maxOperationRetryTime;
     * ```
     *
     * @param path An optional string pointing to a location on the storage bucket. If no path
     * is provided, the returned reference will be the bucket root path.
     */
    ref(path?: string): Reference;

    /**
     * Returns a new {@link storage.Reference} instance from a storage bucket URL.
     *
     * #### Example
     *
     * ```js
     * const maxOperationRetryTime = firebase.storage().maxOperationRetryTime;
     * ```
     *
     * @param url A storage bucket URL pointing to a single file or location. Must start with `gs://`,
     * e.g. `gs://assets/logo.png` or `gs://assets`.
     */
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

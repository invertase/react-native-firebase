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

import { ReactNativeFirebase } from '@react-native-firebase/app';

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
export namespace FirebaseStorageTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;
  import NativeFirebaseError = ReactNativeFirebase.NativeFirebaseError;

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
     * You may specify the md5hash of the file in metadata on upload only. It may not be updated via updateMetadata
     */
    md5hash?: string | null;

    /**
     * Additional user-defined custom metadata for this storage object.
     *
     * All values must be strings. Set to null to delete all. Any keys ommitted during update will be removed.
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
    /**
     * The name of the bucket containing this reference's object.
     */
    bucket: string;
    /**
     * A reference pointing to the parent location of this reference, or null if this reference is the root.
     */
    parent: Reference | null;
    /**
     * The full path of this object.
     */
    fullPath: string;
    /**
     * The short name of this object, which is the last component of the full path. For example,
     * if fullPath is 'full/path/image.png', name is 'image.png'.
     */
    name: string;
    /**
     * A reference to the root of this reference's bucket.
     */
    root: Reference;
    /**
     * The storage service associated with this reference.
     */
    storage: Module;

    /**
     * Returns a gs:// URL for this object in the form `gs://<bucket>/<path>/<to>/<object>`.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.storage().ref('invertase/logo.png');
     * console.log('Full path: ', ref.toString()); // gs://invertase.io/invertase/logo.png
     * ```
     */
    toString(): string;

    /**
     * Returns a reference to a relative path from this reference.
     *
     * #### Example
     *
     * ```js
     * const parent = firebase.storage().ref('invertase');
     * const ref = parent.child('logo.png');
     * ```
     *
     * @param path The relative path from this reference. Leading, trailing, and consecutive slashes are removed.
     */
    child(path: string): Reference;

    /**
     * Deletes the object at this reference's location.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.storage().ref('invertase/logo.png');
     * await ref.delete();
     * ```
     */
    delete(): Promise<void>;

    /**
     * Fetches a long lived download URL for this object.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.storage().ref('invertase/logo.png');
     * const url = await ref.getDownloadURL();
     * ```
     */
    getDownloadURL(): Promise<string>;

    /**
     * Fetches metadata for the object at this location, if one exists.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.storage().ref('invertase/logo.png');
     * const metadata = await ref.getMetadata();
     * console.log('Cache control: ', metadata.cacheControl);
     * ```
     */
    getMetadata(): Promise<FullMetadata>;

    /**
     * List items (files) and prefixes (folders) under this storage reference.
     *
     * List API is only available for Firebase Rules Version 2.
     *
     * GCS is a key-blob store. Firebase Storage imposes the semantic of '/' delimited folder structure.
     * Refer to GCS's List API if you want to learn more.
     *
     * To adhere to Firebase Rules's Semantics, Firebase Storage does not support objects whose paths
     * end with "/" or contain two consecutive "/"s. Firebase Storage List API will filter these unsupported objects.
     * list() may fail if there are too many unsupported objects in the bucket.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.storage().ref('/');
     * const results = await ref.list({
     *   maxResults: 30,
     * });
     * ```
     *
     * @param options An optional ListOptions interface.
     */
    list(options?: ListOptions): Promise<ListResult>;

    /**
     * List all items (files) and prefixes (folders) under this storage reference.
     *
     * This is a helper method for calling list() repeatedly until there are no more results. The default pagination size is 1000.
     *
     * Note: The results may not be consistent if objects are changed while this operation is running.
     *
     * Warning: `listAll` may potentially consume too many resources if there are too many results.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.storage().ref('/');
     * const results = await ref.listAll();
     * ```
     */
    listAll(): Promise<ListResult>;

    /**
     * Puts a file from local disk onto the storage bucket.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.storage().ref('invertase/new-logo.png');
     * const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/new-logo.png`;
     * const task = ref.putFile(path, {
     *   cacheControl: 'no-store', // disable caching
     * });
     * ```
     *
     * @param localFilePath The local file path to upload to the bucket at the reference location.
     * @param metadata Any additional `SettableMetadata` for this task.
     */
    putFile(localFilePath: string, metadata?: SettableMetadata): Task;

    /**
     * Downloads a file to the specified local file path on the device.
     *
     * #### Example
     *
     * Get a Download Storage task to download a file:
     *
     * ```js
     * const downloadTo = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/foobar.json`;
     *
     * const task = firebase.storage().ref('/foo/bar.json').writeToFile(downloadTo);
     * ```
     * @param localFilePath
     */
    writeToFile(localFilePath: string): Task;

    /**
     * Puts data onto the storage bucket.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.storage().ref('invertase/new-logo.png');
     * const task = ref.put(BLOB, {
     *   cacheControl: 'no-store', // disable caching
     * });
     * ```
     *
     * @param data The data to upload to the storage bucket at the reference location.
     * @param metadata
     */
    put(data: Blob | Uint8Array | ArrayBuffer, metadata?: SettableMetadata): Task;

    /**
     * Puts a string on the storage bucket. Depending on the string type, set a {@link storage.StringFormat} type.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.storage().ref('invertase/new-logo.png');
     * const task = ref.putString('PEZvbyBCYXI+', firebase.storage.StringFormat.BASE64, {
     *   cacheControl: 'no-store', // disable caching
     * });
     * ```
     *
     * @param data The string data, must match the format provided.
     * @param format The format type of the string, e.g. a Base64 format string.
     * @param metadata Any additional `SettableMetadata` for this task.
     */
    putString(
      data: string,
      format?: 'raw' | 'base64' | 'base64url' | 'data_url',
      metadata?: SettableMetadata,
    ): Task;

    /**
     * Updates the metadata for this reference object on the storage bucket.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.storage().ref('invertase/nsfw-logo.png');
     * const updatedMetadata = await ref.updateMetadata({
     *   customMetadata: {
     *     'nsfw': 'true',
     *   }
     * });
     * ```
     *
     * @param metadata A `SettableMetadata` instance to update.
     */
    updateMetadata(metadata: SettableMetadata): Promise<FullMetadata>;
  }

  /**
   * The snapshot observer returned from a {@link storage.Task#on} listener.
   *
   * #### Example
   *
   * ```js
   * const ref = firebase.storage().ref(...);
   * const task = ref.put(...)
   *
   * task.on('state_changed', {
   *   next(taskSnapshot) {
   *     console.log(taskSnapshot.state);
   *   },
   *   error(error) {
   *     console.error(error.message);
   *   },
   *   complete() {
   *     console.log('Task complete');
   *   },
   * })
   * ```
   */
  export interface TaskSnapshotObserver {
    /**
     * Called when the task state changes.
     *
     * @param taskSnapshot A `TaskSnapshot` for the event.
     */
    next: (taskSnapshot: TaskSnapshot) => void;

    /**
     * Called when the task errors.
     *
     * @param error A JavaScript error.
     */
    error: (error: NativeFirebaseError) => void;

    /**
     * Called when the task has completed successfully.
     */
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
   * const downloadTo = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/bar.json`;
   *
   * const task = firebase
   *  .storage()
   *  .ref('/foo/bar.json')
   *  .writeToFile(downloadTo);
   * ```
   */
  export interface Task {
    /**
     * Initial state of Task.snapshot is `null`. Once uploading begins, it updates to a `TaskSnapshot` object.
     */
    snapshot: null | TaskSnapshot;

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
     * Task event handler called when state has changed on the task.
     *
     * #### Example
     *
     * ```js
     * const task = firebase
     *  .storage()
     *  .ref('/foo/bar.json')
     *  .writeToFile(downloadTo);
     *
     * task.on('state_changed', (taskSnapshot) => {
     *   console.log(taskSnapshot.state);
     * });
     *
     * task.then(() => {]
     *   console.log('Task complete');
     * })
     * .catch((error) => {
     *   console.error(error.message);
     * });
     * ```
     *
     * @param event The event name to handle, always `state_changed`.
     * @param nextOrObserver The optional event observer function.
     * @param error An optional JavaScript error handler.
     * @param complete An optional complete handler function.
     */
    on(
      event: 'state_changed',
      nextOrObserver?: TaskSnapshotObserver | null | ((a: TaskSnapshot) => any),
      error?: ((a: NativeFirebaseError) => any) | null,
      complete?: (() => void) | null,
    ): () => void;

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
   * ```js
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
   * ```js
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
   * The options `list()` accepts.
   */
  export interface ListOptions {
    /**
     * If set, limits the total number of `prefixes` and `items` to return. The default and maximum maxResults is 1000.
     */
    maxResults?: number;

    /**
     * The `nextPageToken` from a previous call to `list()`. If provided, listing is resumed from the previous position.
     */
    pageToken?: string;
  }

  /**
   * Result returned by `list()`.
   */
  export interface ListResult {
    /**
     * Objects in this directory. You can call `getMetadata()` and `getDownloadUrl()` on them.
     */
    items: Reference[];

    /**
     * If set, there might be more results for this list. Use this token to resume the list.
     */
    nextPageToken: string | null;

    /**
     * References to prefixes (sub-folders). You can call `list()` on them to get its contents.
     *
     * Folders are implicit based on '/' in the object paths. For example, if a bucket has two objects '/a/b/1' and '/a/b/2', list('/a') will return '/a/b' as a prefix.
     */
    prefixes: Reference[];
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
  export class Module extends FirebaseModule {
    /**
     * Returns the current maximum time in milliseconds to retry an upload if a failure occurs.
     *
     * #### Example
     *
     * ```js
     * const uploadRetryTime = firebase.storage().maxUploadRetryTime;
     * ```
     */
    maxUploadRetryTime: number;

    /**
     * Sets the maximum time in milliseconds to retry an upload if a failure occurs.
     *
     * #### Example
     *
     * ```js
     * await firebase.storage().setMaxUploadRetryTime(25000);
     * ```
     *
     * @param time The new maximum upload retry time in milliseconds.
     */
    setMaxUploadRetryTime(time: number): Promise<void>;

    /**
     * Returns the current maximum time in milliseconds to retry a download if a failure occurs.
     *
     * #### Example
     *
     * ```js
     * const downloadRetryTime = firebase.storage().maxUploadRetryTime;
     * ```
     */
    maxDownloadRetryTime: number;

    /**
     * Sets the maximum time in milliseconds to retry a download if a failure occurs.
     *
     * #### Example
     *
     * ```js
     * await firebase.storage().setMaxDownloadRetryTime(25000);
     * ```
     *
     * @param time The new maximum download retry time in milliseconds.
     */
    setMaxDownloadRetryTime(time: number): Promise<void>;

    /**
     * Returns the current maximum time in milliseconds to retry operations other than upload and download if a failure occurs.
     *
     * #### Example
     *
     * ```js
     * const maxOperationRetryTime = firebase.storage().maxOperationRetryTime;
     * ```
     */
    maxOperationRetryTime: number;

    /**
     * Sets the maximum time in milliseconds to retry operations other than upload and download if a failure occurs.
     *
     * #### Example
     *
     * ```js
     * await firebase.storage().setMaxOperationRetryTime(5000);
     * ```
     *
     * @param time The new maximum operation retry time in milliseconds.
     */
    setMaxOperationRetryTime(time: number): Promise<void>;

    /**
     * Returns a new {@link storage.Reference} instance.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.storage().ref('cats.gif');
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
     * const gsUrl = 'gs://react-native-firebase-testing/cats.gif';
     * const httpUrl = 'https://firebasestorage.googleapis.com/v0/b/react-native-firebase-testing.appspot.com/o/cats.gif';
     *
     * const refFromGsUrl = firebase.storage().refFromURL(gsUrl);
     * // or
     * const refFromHttpUrl = firebase.storage().refFromURL(httpUrl);
     * ```
     *
     * @param url A storage bucket URL pointing to a single file or location. Must be either a `gs://` url or an `http` url,
     * e.g. `gs://assets/logo.png` or `https://firebasestorage.googleapis.com/v0/b/react-native-firebase-testing.appspot.com/o/cats.gif`.
     */
    refFromURL(url: string): Reference;

    /**
     * Modify this Storage instance to communicate with the Firebase Storage emulator.
     * This must be called synchronously immediately following the first call to firebase.storage().
     * Do not use with production credentials as emulator traffic is not encrypted.
     *
     * Note: on android, hosts 'localhost' and '127.0.0.1' are automatically remapped to '10.0.2.2' (the
     * "host" computer IP address for android emulators) to make the standard development experience easy.
     * If you want to use the emulator on a real android device, you will need to specify the actual host
     * computer IP address.
     *
     * @param host: emulator host (eg, 'localhost')
     * @param port: emulator port (eg, 9199)
     */
    useEmulator(host: string, port: number): void;
  }
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseStorageTypes.Module,
  FirebaseStorageTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  storage: typeof defaultExport;
  app(name?: string): ReactNativeFirebase.FirebaseApp & { storage(): FirebaseStorageTypes.Module };
};

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      storage: FirebaseModuleWithStaticsAndApp<
        FirebaseStorageTypes.Module,
        FirebaseStorageTypes.Statics
      >;
    }
    interface FirebaseApp {
      storage(bucket?: string): FirebaseStorageTypes.Module;
    }
  }
}

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
 * Storage
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
    STATE_CHANGED: 'state_changed',
  }

  /**
   * A collection of properties that indicates the
   *
   * Event subscription is created via `StorageTask.on()`.
   *
   * ```js
   * firebase.storage.TaskEvent;
   * ```
   */
  export interface TaskState {
    /**
     * Task has been cancelled.
     */
    CANCELLED: 'cancelled',
    ERROR: 'error',
    PAUSED: 'paused',
    /**
     * Task is running.
     */
    RUNNING: 'running',
    SUCCESS: 'success',
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

  export class Module extends ReactNativeFirebaseModule {

  }
}

declare module '@react-native-firebase/storage' {
  import {ReactNativeFirebaseNamespace} from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/storage';
   * firebase.storage().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const StorageDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Storage.Module,
    Storage.Statics
  >;
  /**
   * @example
   * ```js
   * import storage from '@react-native-firebase/storage';
   * storage().X(...);
   * ```
   */
  export default StorageDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Storage
     */
    storage: ReactNativeFirebaseModuleAndStatics<
      Storage.Module,
      Storage.Statics
    >;
  }

  interface FirebaseApp {
    /**
     * Storage
     */
    storage(): Storage.Module;
  }
}

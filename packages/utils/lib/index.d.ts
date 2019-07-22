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
 * React Native Firebase Utilities package.
 *
 * #### Example 1
 *
 * Access the firebase export from the `utils` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/utils';
 *
 * // firebase.utils().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `utils` package:
 *
 * ```js
 * import utils from '@react-native-firebase/utils';
 *
 * // utils().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/utils';
 *
 * // firebase.utils().X
 * ```
 *
 * @firebase utils
 */
export namespace Utils {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  /**
   * A collection of native device file paths to aid in the usage of file path based methods.
   *
   * Concatenate a file path with your target file name when using with Storage `putFile` or `writeToFile`.
   *
   * ```js
   * firebase.utils.FilePath;
   * ```
   */
  export interface FilePath {
    /**
     * Returns an absolute path to the applications main bundle.
     *
     * ```js
     * firebase.utils.FilePath.MAIN_BUNDLE;
     * ```
     *
     * @ios iOS only
     */
    MAIN_BUNDLE: string;

    /**
     * Returns an absolute path to the application specific cache directory on the filesystem.
     *
     * The system will automatically delete files in this directory when disk space is needed elsewhere on the device, starting with the oldest files first.
     *
     * ```js
     * firebase.utils.FilePath.CACHES_DIRECTORY;
     * ```
     */
    CACHES_DIRECTORY: string;

    /**
     * Returns an absolute path to the users Documents directory.
     *
     * Use this directory to place documents that have been created by the user.
     *
     * ```js
     * firebase.utils.FilePath.DOCUMENT_DIRECTORY;
     * ```
     */
    DOCUMENT_DIRECTORY: string;

    /**
     * Returns an absolute path to a temporary directory.
     *
     * Use this directory to create temporary files. The system will automatically delete files in this directory when disk space is needed elsewhere on the device, starting with the oldest files first.
     *
     * ```js
     * firebase.utils.FilePath.TEMP_DIRECTORY;
     * ```
     */
    TEMP_DIRECTORY: string;

    /**
     * Returns an absolute path to the apps library/resources directory.
     *
     * E.g. this can be used for things like documentation, support files, and configuration files and generic resources.
     *
     * ```js
     * firebase.utils.FilePath.LIBRARY_DIRECTORY;
     * ```
     */
    LIBRARY_DIRECTORY: string;

    /**
     * Returns an absolute path to the directory on the primary shared/external storage device.
     *
     * Here your application can place persistent files it owns. These files are internal to the application, and not typically visible to the user as media.
     *
     * Returns null if no external storage directory found, e.g. removable media has been ejected by the user.
     *
     * ```js
     * firebase.utils.FilePath.EXTERNAL_DIRECTORY;
     * ```
     *
     * @android Android only - iOS returns null
     */
    EXTERNAL_DIRECTORY: string | null;

    /**
     * Returns an absolute path to the primary shared/external storage directory.
     *
     * Traditionally this is an SD card, but it may also be implemented as built-in storage on a device.
     *
     * Returns null if no external storage directory found, e.g. removable media has been ejected by the user.
     *
     * ```js
     * firebase.utils.FilePath.EXTERNAL_STORAGE_DIRECTORY;
     * ```
     *
     * @android Android only - iOS returns null
     */
    EXTERNAL_STORAGE_DIRECTORY: string | null;

    /**
     * Returns an absolute path to a directory in which to place pictures that are available to the user.
     *
     * ```js
     * firebase.utils.FilePath.PICTURES_DIRECTORY;
     * ```
     */
    PICTURES_DIRECTORY: string;

    /**
     * Returns an absolute path to a directory in which to place movies that are available to the user.
     *
     * ```js
     * firebase.utils.FilePath.MOVIES_DIRECTORY;
     * ```
     */
    MOVIES_DIRECTORY: string;
  }

  export interface Statics {
    FilePath: FilePath;
  }

  /**
   * The React Native Firebase Utils service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Utils service for the default app:
   *
   * ```js
   * const defaultAppUtils = firebase.utils();
   * ```
   */
  export class Module extends FirebaseModule {
    /**
     * Returns true if this app is running inside a Firebase Test Lab environment. Always returns false on iOS.
     *
     * @android
     */
    isRunningInTestLab: boolean;
  }
}

declare module '@react-native-firebase/utils' {
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const module: FirebaseModuleWithStatics<Utils.Module, Utils.Statics>;
  export default module;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;

    interface Module {
      /**
       * Utils provides a collection of utilities to aid in using Firebase
       * and related services inside React Native, e.g. Test Lab helpers
       * and Google Play Services version helpers.
       */
      utils: FirebaseModuleWithStatics<Utils.Module, Utils.Statics>;
    }

    interface FirebaseApp {
      utils(): Utils.Module;
    }
  }
}

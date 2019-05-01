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
  ReactNativeFirebaseNamespace,
  ReactNativeFirebaseModuleAndStaticsWithApp,
} from '@react-native-firebase/app-types';

/**
 * Firebase Instance ID package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `iid` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/iid';
 *
 * // firebase.iid().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `iid` package:
 *
 * ```js
 * import iid from '@react-native-firebase/iid';
 *
 * // iid().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/iid';
 *
 * // firebase.iid().X
 * ```
 *
 * @firebase iid
 */
export namespace Iid {
  export interface Statics {}

  /**
   * The Firebase Instance ID service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Instance ID service for the default app:
   *
   * ```js
   * const defaultAppIid = firebase.iid();
   * ```
   */
  export class Module extends ReactNativeFirebaseModule {
    /**
     * Returns a identifier that uniquely identifies the app instance.
     *
     * Once an Instance ID is generated, Firebase periodically sends information about the application
     * and the device it's running on to the Firebase backend. To stop this, see `delete()`.
     *
     * #### Example
     *
     * ```js
     * const id = firebase.iid().get();
     * ```
     */
    get(): Promise<string>;

    /**
     * Delete the Instance ID and all data associated with it. This stops the periodic sending of data to the Firebase
     * backend that was started when the Instance ID was generated.
     *
     * A new Instance ID is asynchronously generated unless auto initialisation is turned off.
     *
     * #### Example
     *
     * ```js
     * await firebase.iid().delete();
     * ```
     */
    delete(): Promise<void>;

    /**
     * Returns a token that authorizes an Entity to perform an action on behalf of the application.
     *
     * #### Example
     *
     * ```js
     * const token = await firebase.iid().getToken(firebase.app().options.storageBucket, '*');
     * ```
     *
     * @param authorizedEntity Entity authorized by the token. Defaults to the apps `messagingSenderId` option.
     * @param scope Action authorized for authorizedEntity. Defaults to '*'.
     */
    getToken(authorizedEntity?: string, scope?: string): Promise<string>;

    /**
     * Revokes access to a scope for an entity previously authorized by `getToken()`.
     *
     * #### Example
     *
     * ```js
     * await firebase.iid().deleteToken(firebase.app().options.storageBucket, '*');
     * ```
     *
     * @param authorizedEntity Entity authorized by the token. Defaults to the apps' `messagingSenderId` option.
     * @param scope Action authorized for authorizedEntity. Defaults to '*'.
     */
    deleteToken(authorizedEntity?: string, scope?: string): Promise<void>;
  }
}

declare module '@react-native-firebase/iid' {
  import {
    ReactNativeFirebaseModuleAndStaticsWithApp,
  ReactNativeFirebaseNamespace
} from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/iid';
   * firebase.iid().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const IidDefaultExport: ReactNativeFirebaseModuleAndStaticsWithApp<Iid.Module, Iid.Statics>;
  /**
   * @example
   * ```js
   * import iid from '@react-native-firebase/iid';
   * iid().X(...);
   * ```
   */
  export default IidDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Firebase Instance ID provides a unique identifier for each instance of your app and a mechanism to authenticate
     * and authorize actions for it (for example: sending FCM messages).
     *
     * An Instance ID is long lived except when you call delete, the app is restored on a new device, the user
     * uninstalls/reinstall the app or the user clears the app data (clearing data applies to Android only).
     */
    iid: ReactNativeFirebaseModuleAndStaticsWithApp<Iid.Module, Iid.Statics>;
  }

  interface FirebaseApp {
    /**
     * Firebase Instance ID provides a unique identifier for each instance of your app and a mechanism to authenticate
     * and authorize actions for it (for example: sending FCM messages).
     *
     * An Instance ID is long lived except when you call delete, the app is restored on a new device, the user
     * uninstalls/reinstall the app or the user clears the app data (clearing data applies to Android only).
     *
     */
    iid(): Iid.Module;
  }
}

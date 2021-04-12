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

/**
 * Core React Native Firebase package.
 *
 * #### Example 1
 *
 * Access the default firebase app from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 *
 * console.log(firebase.app().name);
 * ```
 *
 * @firebase app
 */
export namespace ReactNativeFirebase {
  export interface NativeFirebaseError extends Error {
    /**
     * Firebase error code, e.g. `auth/invalid-email`
     */
    readonly code: string;

    /**
     * Firebase error message
     */
    readonly message: string;

    /**
     * The firebase module namespace that this error originated from, e.g. 'analytics'
     */
    readonly namespace: string;

    /**
     * The native sdks returned error code, different per platform
     */
    readonly nativeErrorCode: string | number;

    /**
     * The native sdks returned error message, different per platform
     */
    readonly nativeErrorMessage: string;
  }

  export interface FirebaseAppOptions {
    /**
     * The Google App ID that is used to uniquely identify an instance of an app.
     */
    appId: string;

    /**
     * An API key used for authenticating requests from your app, e.g.
     * "AIzaSyDdVgKwhZl0sTTTLZ7iTmt1r3N2cJLnaDk", used to identify your app to Google servers.
     */
    apiKey?: string;

    /**
     * The database root URL, e.g. "http://abc-xyz-123.firebaseio.com".
     */
    databaseURL?: string;

    /**
     * The Project ID from the Firebase console, for example "abc-xyz-123".
     */
    projectId: string;

    /**
     * The tracking ID for Google Analytics, e.g. "UA-12345678-1", used to configure Google Analytics.
     */
    gaTrackingId?: string;

    /**
     * The Google Cloud Storage bucket name, e.g. "abc-xyz-123.storage.firebase.com".
     */
    storageBucket?: string;

    /**
     * The Project Number from the Google Developer's console, for example "012345678901", used to
     * configure Google Cloud Messaging.
     */
    messagingSenderId?: string;

    /**
     * iOS only - The OAuth2 client ID for iOS application used to authenticate Google users, for example
     * "12345.apps.googleusercontent.com", used for signing in with Google.
     */
    clientId?: string;

    /**
     * iOS only - The Android client ID used in Google AppInvite when an iOS app has its Android version, for
     * example "12345.apps.googleusercontent.com".
     */
    androidClientId?: string;

    /**
     * iOS only - The URL scheme used to set up Durable Deep Link service.
     */
    deepLinkURLScheme?: string;
    [name: string]: any;
  }

  export interface FirebaseAppConfig {
    /**
     * The Firebase App name, defaults to [DEFAULT] if none provided.
     */
    name?: string;

    /**
     *
     */
    automaticDataCollectionEnabled?: boolean;

    /**
     * If set to true it indicates that Firebase should close database connections
     * automatically when the app is in the background. Disabled by default.
     */
    automaticResourceManagement?: boolean;
  }

  export interface FirebaseApp {
    /**
     * The name (identifier) for this App. '[DEFAULT]' is the default App.
     */
    readonly name: string;

    /**
     * The (read-only) configuration options from the app initialization.
     */
    readonly options: FirebaseAppOptions;

    /**
     * Make this app unusable and free up resources.
     */
    delete(): Promise<void>;

    utils(): Utils.Module;
  }

  export interface Module {
    /**
     * Create (and initialize) a FirebaseApp.
     *
     * @param options Options to configure the services used in the App.
     * @param config The optional config for your firebase app
     */
    initializeApp(options: FirebaseAppOptions, config?: FirebaseAppConfig): Promise<FirebaseApp>;

    /**
     * Create (and initialize) a FirebaseApp.
     *
     * @param options Options to configure the services used in the App.
     * @param name The optional name of the app to initialize ('[DEFAULT]' if
     * omitted)
     */
    initializeApp(options: FirebaseAppOptions, name?: string): Promise<FirebaseApp>;

    /**
     * Retrieve an instance of a FirebaseApp.
     *
     * @example
     * ```js
     * const app = firebase.app('foo');
     * ```
     *
     * @param name The optional name of the app to return ('[DEFAULT]' if omitted)
     */
    app(name?: string): FirebaseApp;

    /**
     * A (read-only) array of all the initialized Apps.
     */
    apps: FirebaseApp[];

    /**
     * The current React Native Firebase version.
     */
    readonly SDK_VERSION: string;

    /**
     * Utils provides a collection of utilities to aid in using Firebase
     * and related services inside React Native, e.g. Test Lab helpers
     * and Google Play Services version helpers.
     */
    utils: typeof utils;
  }

  /**
   * A class that all React Native Firebase modules extend from to provide default behaviour.
   */
  export class FirebaseModule {
    /**
     * The current `FirebaseApp` instance for this Firebase service.
     */
    app: FirebaseApp;

    /**
     * The native module instance for this Firebase service.
     */
    private native: any;

    /**
     * Returns the shared event emitter instance used for all JS event routing.
     */
    private emitter: any;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  export type FirebaseModuleWithStatics<M, S = {}> = {
    (): M;

    /**
     * This React Native Firebase module version.
     */
    readonly SDK_VERSION: string;
  } & S;

  // eslint-disable-next-line @typescript-eslint/ban-types
  export type FirebaseModuleWithStaticsAndApp<M, S = {}> = {
    (app?: FirebaseApp): M;

    /**
     * This React Native Firebase module version.
     */
    readonly SDK_VERSION: string;
  } & S;
}

/*
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
     * Normally this is the external files directory on Android but if no external storage directory found,
     * e.g. removable media has been ejected by the user, it will fall back to internal storage. This may
     * under rare circumstances where device storage environment changes cause the directory to be different
     * between runs of the application
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
   * For further information on the status codes available & what they represent, please head over
   * to ConnectionResult documentation:
   * https://developers.google.com/android/reference/com/google/android/gms/common/ConnectionResult
   */
  export enum PlayServicesAvailabilityStatusCodes {
    API_UNAVAILABLE = 16,
    CANCELED = 13,
    DEVELOPER_ERROR = 10,
    DRIVE_EXTERNAL_STORAGE_REQUIRED = 1500,
    INTERNAL_ERROR = 8,
    INTERRUPTED = 15,
    INVALID_ACCOUNT = 5,
    LICENSE_CHECK_FAILED = 11,
    NETWORK_ERROR = 7,
    RESOLUTION_REQUIRED = 6,
    RESTRICTED_PROFILE = 20,
    SERVICE_DISABLED = 3,
    SERVICE_INVALID = 9,
    SERVICE_MISSING = 1,
    SERVICE_MISSING_PERMISSION = 19,
    SERVICE_UPDATING = 18,
    SERVICE_VERSION_UPDATE_REQUIRED = 2,
    SIGN_IN_FAILED = 17,
    SIGN_IN_REQUIRED = 4,
    SUCCESS = 0,
    TIMEOUT = 14,
  }

  export interface PlayServicesAvailability {
    /**
     * Returns a numeric status code. Please refer to Android documentation
     * for further information:
     * https://developers.google.com/android/reference/com/google/android/gms/common/ConnectionResult
     *
     * ```js
     * firebase.utils().playServicesAvailability.status;
     * ```
     *
     * @android Android only - iOS returns 0
     */
    status: PlayServicesAvailabilityStatusCodes;

    /**
     * Returns a boolean indicating whether Play Store is available on the device
     *
     * ```js
     * firebase.utils().playServicesAvailability.isAvailable;
     * ```
     *
     * @android Android only - iOS returns true
     */
    isAvailable: boolean;

    /**
     * If Play Services is not available on the device, hasResolution indicates
     * whether it is possible to do something about it (e.g. install Play Services).
     *
     * ```js
     * firebase.utils().playServicesAvailability.hasResolution;
     * ```
     * @android Android only - iOS returns undefined
     */
    hasResolution: boolean | undefined;

    /**
     * If an error was received, this indicates whether the error is resolvable
     *
     * ```js
     * firebase.utils().playServicesAvailability.isUserResolvableError;
     * ```
     * @android Android only - iOS returns undefined
     */
    isUserResolvableError: boolean | undefined;

    /**
     * A human readable error string
     *
     * ```js
     * firebase.utils().playServicesAvailability.error;
     * ```
     * @android Android only - iOS returns undefined
     */
    error: string | undefined;
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
     * Returns true if this app is running inside a Firebase Test Lab environment.
     *
     * #### Example
     *
     * ```js
     * const isRunningInTestLab = await firebase.utils().isRunningInTestLab;
     * ```
     * @android Android only - iOS returns false
     */
    isRunningInTestLab: boolean;
    /**
     * Returns PlayServicesAvailability properties
     *
     * #### Example
     *
     * ```js
     * const PlayServicesAvailability = await firebase.utils().playServicesAvailability;
     * ```
     *
     * @android Android only - iOS always returns { isAvailable: true, status: 0 }
     */
    playServicesAvailability: PlayServicesAvailability;

    /**
     * Returns PlayServicesAvailability properties
     *
     * #### Example
     *
     * ```js
     * const PlayServicesAvailability = await firebase.utils().getPlayServicesStatus();
     * ```
     *
     * @android Android only - iOS always returns { isAvailable: true, status: 0 }
     */
    getPlayServicesStatus(): Promise<PlayServicesAvailability>;

    /**
     * A prompt appears on the device to ask the user to update play services
     *
     * #### Example
     *
     * ```js
     * await firebase.utils().promptForPlayServices();
     * ```
     *
     * @android Android only - iOS returns undefined
     */
    promptForPlayServices(): Promise<void>;
    /**
     * Attempts to make Google Play services available on this device
     *
     * #### Example
     *
     * ```js
     * await firebase.utils().makePlayServicesAvailable();
     * ```
     *
     * @android Android only - iOS returns undefined
     */
    makePlayServicesAvailable(): Promise<void>;
    /**
     * Resolves an error by starting any intents requiring user interaction.
     *
     * #### Example
     *
     * ```js
     * await firebase.utils().resolutionForPlayServices();
     * ```
     *
     * @android Android only - iOS returns undefined
     */
    resolutionForPlayServices(): Promise<void>;
  }
}

/**
 * Add Utils module as a named export for `app`.
 */
export const utils: ReactNativeFirebase.FirebaseModuleWithStatics<Utils.Module, Utils.Statics>;

declare const module: ReactNativeFirebase.Module;
export default module;

/**
 * Information regarding the current Google Play Services availability.
 */
export type PlayServicesAvailability =
  | {
      /**
       * Whether Play Services are available.
       *
       * On iOS and Web, this is always `true`.
       */
      isAvailable: true;
      /**
       * The returned status result from Google Play.
       */
      status: PlayServicesConnectionStatus.SUCCESS;
    }
  | {
      /**
       * Whether Play Services are available.
       *
       * On iOS and Web, this is always `true`.
       */
      isAvailable: false;
      /**
       * The returned status result from Google Play.
       */
      status: PlayServicesConnectionStatus;
      /**
       * If an error was received, this indicates whether the error is resolvable.
       */
      isUserResolvableError: boolean;
      /**
       * If Play Services is not available on the device, this indicates whether it is possible to do something about it (e.g. install Play Services).
       */
      hasResolution: boolean;
      /**
       * A human readable error string.
       */
      error: string;
    };

export enum PlayServicesConnectionStatus {
  /**
   * The API being requested is disabled on this device for this application. Trying again at a later time may succeed.
   */
  API_DISABLED = 23,

  /**
   * The API being requested is disabled for this connection attempt, but may work for other connections.
   */
  API_DISABLED_FOR_CONNECTION = 24,

  /**
   * One of the API components you attempted to connect to is not available. The API will not work on this device or for your app or for this particular account, and updating Google Play services will not likely solve the problem.
   */
  API_UNAVAILABLE = 16,

  /**
   * The connection was canceled.
   *
   * See https://developers.google.com/android/reference/com/google/android/gms/common/ConnectionResult#public-static-final-int-canceled.
   */
  CANCELED = 13,

  /**
   * The application is misconfigured. This error is not recoverable and will be treated as fatal. The developer should look at the logs after this to determine more actionable information.
   */
  DEVELOPER_ERROR = 10,

  /**
   * An internal error occurred. Retrying should resolve the problem.
   */
  INTERNAL_ERROR = 8,

  /**
   * An interrupt occurred while waiting for the connection complete.
   */
  INTERRUPTED = 15,

  /**
   * The client attempted to connect to the service with an invalid account name specified.
   */
  INVALID_ACCOUNT = 5,

  /**
   * The application is not licensed to the user. This error is not recoverable and will be treated as fatal.
   */
  LICENSE_CHECK_FAILED = 11,

  /**
   * A network error occurred. Retrying should resolve the problem.
   */
  NETWORK_ERROR = 7,

  /**
   * There was a user-resolvable issue connecting to Google Play services, but when attempting to start the resolution, the activity was not found.
   *
   * This can occur when attempting to resolve issues connecting to Google Play services on emulators with Google APIs but not Google Play Store.
   */
  RESOLUTION_ACTIVITY_NOT_FOUND = 22,

  /**
   * Completing the connection requires some form of resolution.
   */
  RESOLUTION_REQUIRED = 6,

  /**
   * The current user profile is restricted and cannot use authenticated features. (Jelly Bean MR2+ Restricted Profiles for Android tablets).
   */
  RESTRICTED_PROFILE = 20,

  /**
   * The installed version of Google Play services has been disabled on this device.
   */
  SERVICE_DISABLED = 3,

  /**
   * The version of the Google Play services installed on this device is not authentic.
   */
  SERVICE_INVALID = 9,

  /**
   * Google Play services is missing on this device.
   */
  SERVICE_MISSING = 1,

  /**
   * Google Play service doesn't have one or more required permissions.
   */
  SERVICE_MISSING_PERMISSION = 19,

  /**
   * Google Play service is currently being updated on this device.
   */
  SERVICE_UPDATING = 18,

  /**
   * The installed version of Google Play services is out of date.
   */
  SERVICE_VERSION_UPDATE_REQUIRED = 2,

  /**
   * The client attempted to connect to the service but the user is not signed in.
   *
   * See https://developers.google.com/android/reference/com/google/android/gms/common/ConnectionResult#public-static-final-int-sign_in_failed.
   */
  SIGN_IN_FAILED = 17,

  /**
   * The client attempted to connect to the service but the user is not signed in.
   */
  SIGN_IN_REQUIRED = 4,

  /**
   * The connection was successful.
   */
  SUCCESS = 0,

  /**
   * The timeout was exceeded while waiting for the connection to complete.
   */
  TIMEOUT = 14,
}

/**
 * A collection of native device file paths to aid in the usage of file path based methods.
 *
 * Concatenate a file path with your target file name when using with Storage `putFile` or `writeToFile`.
 */
export interface FilePaths {
  /**
   * Returns an absolute path to the applications main bundle.
   *
   * iOS Only.
   */
  readonly MAIN_BUNDLE?: string;
  /**
   * Returns an absolute path to the application specific cache directory on the filesystem.
   *
   * The system will automatically delete files in this directory when disk space is needed elsewhere on the device, starting with the oldest files first.
   */
  readonly CACHES_DIRECTORY?: string;
  /**
   * Returns an absolute path to the users Documents directory.
   *
   * Use this directory to place documents that have been created by the user.
   *
   * Normally this is the external files directory on Android but if no external storage directory found,
   * e.g. removable media has been ejected by the user, it will fall back to internal storage. This may
   * under rare circumstances where device storage environment changes cause the directory to be different
   * between runs of the application.
   */
  readonly DOCUMENT_DIRECTORY?: string;
  /**
   * Returns an absolute path to a temporary directory.
   *
   * Use this directory to create temporary files. The system will automatically delete files in this directory when disk space is needed elsewhere on the device, starting with the oldest files first.
   */
  readonly TEMP_DIRECTORY?: string;
  /**
   * Returns an absolute path to the apps library/resources directory.
   *
   * E.g. this can be used for things like documentation, support files, and configuration files and generic resources.
   */
  readonly LIBRARY_DIRECTORY?: string;
  /**
   * Returns an absolute path to the directory on the primary shared/external storage device.
   *
   * Here your application can place persistent files it owns. These files are internal to the application, and not typically visible to the user as media.
   *
   * Returns null if no external storage directory found, e.g. removable media has been ejected by the user.
   *
   * Android only.
   */
  readonly EXTERNAL_DIRECTORY?: string;
  /**
   * Returns an absolute path to the primary shared/external storage directory.
   *
   * Traditionally this is an SD card, but it may also be implemented as built-in storage on a device.
   *
   * Returns null if no external storage directory found, e.g. removable media has been ejected by the user.
   *
   * Android only.
   */
  readonly EXTERNAL_STORAGE_DIRECTORY?: string;
  /**
   * Returns an absolute path to a directory in which to place pictures that are available to the user.
   */
  readonly PICTURES_DIRECTORY?: string;
  /**
   * Returns an absolute path to a directory in which to place movies that are available to the user.
   */
  readonly MOVIES_DIRECTORY?: string;
  readonly FILE_TYPE_REGULAR?: string;
  readonly FILE_TYPE_DIRECTORY?: string;
}

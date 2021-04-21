export type PlayServicesStatus =
  | {
      /**
       * Whether Play Services are available.
       *
       * On iOS and Web, this is always `true`.
       */
      isAvailable: true;
      status: PlayServicesConnectionStatus.SUCCESS;
    }
  | {
      /**
       * Whether Play Services are available.
       *
       * On iOS and Web, this is always `true`.
       */
      isAvailable: false;
      status: PlayServicesConnectionStatus;
      isUserResolvableError: boolean;
      hasResolution: boolean;
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

export interface FilePaths {
  readonly MAIN_BUNDLE?: string;
  readonly CACHES_DIRECTORY?: string;
  readonly DOCUMENT_DIRECTORY?: string;
  readonly EXTERNAL_DIRECTORY?: string;
  readonly EXTERNAL_STORAGE_DIRECTORY?: string;
  readonly TEMP_DIRECTORY?: string;
  readonly LIBRARY_DIRECTORY?: string;
  readonly PICTURES_DIRECTORY?: string;
  readonly MOVIES_DIRECTORY?: string;
  readonly FILE_TYPE_REGULAR?: string;
  readonly FILE_TYPE_DIRECTORY?: string;
}

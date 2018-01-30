// Type definitions for React Native Firebase  v1.0.0-alpha7
// Project: https://github.com/invertase/react-native-firebase
// Definitions by: Tal <https://github.com/taljacobson>
// TypeScript Version: 2.1

declare module "react-native-firebase" {

  /** 3rd party provider Credentials */
  type AuthCredential = {
    providerId: string,
    token: string,
    secret: string
  }

  type FirebaseModuleAndStatics<M, S = {}> = {
    (): M;
    nativeModuleExists: boolean;
  } & S

  // Modules commented-out do not currently have type definitions
  export class Firebase {
    private constructor();
    // admob: FirebaseModuleAndStatics<RNFirebase.admob.AdMob>;
    analytics: FirebaseModuleAndStatics<RNFirebase.Analytics>;
    auth: FirebaseModuleAndStatics<RNFirebase.auth.Auth, RNFirebase.auth.AuthStatics>;
    // config: FirebaseModule<RNFirebase.config.Config>;
    crash: FirebaseModuleAndStatics<RNFirebase.crash.Crash>;
    database: FirebaseModuleAndStatics<RNFirebase.database.Database, RNFirebase.database.DatabaseStatics>;
    fabric: {
      crashlytics: FirebaseModuleAndStatics<RNFirebase.crashlytics.Crashlytics>;
    };
    firestore: FirebaseModuleAndStatics<RNFirebase.firestore.Firestore, RNFirebase.firestore.FirestoreStatics>;
    links: FirebaseModuleAndStatics<RNFirebase.links.Links>;
    messaging: FirebaseModuleAndStatics<RNFirebase.messaging.Messaging>;
    // perf: FirebaseModuleAndStatics<RNFirebase.perf.Perf>;
    storage: FirebaseModuleAndStatics<RNFirebase.storage.Storage>;
    // utils: FirebaseModuleAndStatics<RNFirebase.utils.Utils>;
    initializeApp(options: Firebase.Options, name: string): App;
    app(name?: string): App;
    apps(): App[];
    SDK_VERSION(): string;
  }
  namespace Firebase {
    interface Options {
      apiKey: string;
      appId: string;
      databaseURL: string;
      messagingSenderId: string;
      projectId: string;
      storageBucket: string;
    }
  }
  const firebase: Firebase;
  export default firebase;

  // Modules commented-out do not currently have type definitions
  export class App {
    private constructor();
    // admob(): RNFirebase.admob.AdMob;
    analytics(): RNFirebase.Analytics;
    auth(): RNFirebase.auth.Auth;
    // config(): RNFirebase.config.Config;
    crash(): RNFirebase.crash.Crash;
    database(): RNFirebase.database.Database;
    fabric: {
      crashlytics(): RNFirebase.crashlytics.Crashlytics,
    };
    firestore(): RNFirebase.firestore.Firestore;
    links(): RNFirebase.links.Links;
    messaging(): RNFirebase.messaging.Messaging;
    // perf(): RNFirebase.perf.Performance;
    storage(): RNFirebase.storage.Storage;
    // utils(): RNFirebase.utils.Utils;
  }

  export namespace RNFirebase {
    interface RnError extends Error {
      code?: string;
    }

    type GoogleApiAvailabilityType = {
      status: number,
      isAvailable: boolean,
      isUserResolvableError?: boolean,
      error?: string
    };

    /**
     * pass custom options by passing an object with configuration options.
     * The configuration object will be generated first by the native configuration object, if set and then will be overridden if passed in JS.
     * That is, all of the following key/value pairs are optional if the native configuration is set.
     */
    interface configurationOptions {
      /**
       *  default false
       *  When set to true, RNFirebase will log messages to the console and fire debug events we can listen to in js
       * @usage
       * firebase.on('debug', msg => console.log('Received debug message', msg))
       */
      debug?: boolean;
      /**
       * default false
       * When set to true, database persistence will be enabled.
       */
      persistence?: boolean;
      /**
       * Default from app [NSBundle mainBundle]  The bundle ID for the app to be bundled with
       */
      bundleID?: string;
      /**
       * defualt ""
       * The Google App ID that is used to uniquely identify an instance of an app.
       */
      googleAppID?: string;
      /**
       * deufalt ""
       * The database root (i.e. https://my-app.firebaseio.com)
       */
      databaseURL?: string;
      /**
       * defualt ""
       * URL scheme to set up durable deep link service
       */
      deepLinkURLScheme?: string;
      /**
       * defualt ""
       * The Google Cloud storage bucket name
       */
      storageBucket?: string;
      /**
       * default ""
       * The Android client ID used in Google AppInvite when an iOS app has it's android version
       */
      androidClientID?: string;
      /**
       * default  ""
       * The Project number from the Google Developer's console used to configure Google Cloud Messaging
       */
      GCMSenderID?: string;
      /**
       * default ""
       * The tracking ID for Google Analytics
       */
      trackingID?: string;
      /**
       * default ""
       * The OAuth2 client ID for iOS application used to authenticate Google Users for signing in with Google
       */
      clientID?: string;
      /**
       * defualt ""
       * The secret iOS API key used for authenticating requests from our app
       */
      APIKey?: string
    }

    namespace storage {

      interface StorageTask<T> extends Promise<T> {
        on(event: TaskEvent,
           nextOrObserver: (snapshot: any) => any,
           error: (error: RnError) => any,
           complete: (complete: any) => any): any

        /**
         * is not currently supported by react-native-firebase
         */
        pause(): void

        /**
         * is not currently supported by react-native-firebase
         */
        resume(): void

        /**
         * is not currently supported by react-native-firebase
         */
        cancel(): void

      }

      interface RNStorage extends Reference {
        /**
         *  Downloads a reference to the device
         *  @param {String} filePath Where to store the file
         *  @return {Promise}
         * */
        downloadFile(filePath: string): StorageTask<any>;

        /**
         * Upload a file path
         * @returns {Promise}
         */
        putFile(filePath: string, metadata?: any): StorageTask<any>;

        setMaxDownloadRetryTime(time: number): void

        [key: string]: any;
      }

      interface Storage {
        maxOperationRetryTime: number;
        maxUploadRetryTime: number;

        ref(path?: string): storage.RNStorage;

        refFromURL(url: string): storage.RNStorage;

        setMaxOperationRetryTime(time: number): any;

        setMaxUploadRetryTime(time: number): any;
      }

      interface Reference {
        bucket: string;

        child(path: string): storage.Reference;

        delete(): Promise<any>;

        fullPath: string;

        getDownloadURL(): Promise<any>;

        getMetadata(): Promise<any>;

        name: string;
        parent: storage.Reference | null;

        put(data: any | Uint8Array | ArrayBuffer,
            metadata?: storage.UploadMetadata): storage.UploadTask;

        putString(data: string, format?: storage.StringFormat,
                  metadata?: storage.UploadMetadata): storage.UploadTask;

        root: storage.Reference;
        storage: storage.Storage;

        toString(): string;

        updateMetadata(metadata: storage.SettableMetadata): Promise<any>;
      }

      interface UploadMetadata extends storage.SettableMetadata {
        md5Hash?: string | null;
      }

      interface SettableMetadata {
        cacheControl?: string | null;
        contentDisposition?: string | null;
        contentEncoding?: string | null;
        contentLanguage?: string | null;
        contentType?: string | null;
        customMetadata?: { [/* warning: coerced from ? */ key: string]: string } | null;
      }

      type StringFormat = string;
      var StringFormat: {
        BASE64: StringFormat,
        BASE64URL: StringFormat,
        DATA_URL: StringFormat,
        RAW: StringFormat,
      }

      interface UploadTask {
        cancel(): boolean;

        catch(onRejected: (a: RnError) => any): Promise<any>;

        on(event: storage.TaskEvent, nextOrObserver?: null | Object,
           error?: ((a: RnError) => any) | null, complete?: (() => any) | null): Function;

        pause(): boolean;

        resume(): boolean;

        snapshot: storage.UploadTaskSnapshot;

        then(onFulfilled?: ((a: storage.UploadTaskSnapshot) => any) | null,
             onRejected?: ((a: RnError) => any) | null): Promise<any>;
      }

      interface UploadTaskSnapshot {
        bytesTransferred: number;
        downloadURL: string | null;
        metadata: storage.FullMetadata;
        ref: storage.Reference;
        state: storage.TaskState;
        task: storage.UploadTask;
        totalBytes: number;
      }

      interface FullMetadata extends storage.UploadMetadata {
        bucket: string;
        downloadURLs: string[];
        fullPath: string;
        generation: string;
        metageneration: string;
        name: string;
        size: number;
        timeCreated: string;
        updated: string;
      }

      type TaskEvent = string;
      var TaskEvent: {
        STATE_CHANGED: TaskEvent,
      };

      type TaskState = string;
      var TaskState: {
        CANCELED: TaskState,
        ERROR: TaskState,
        PAUSED: TaskState,
        RUNNING: TaskState,
        SUCCESS: TaskState,
      };
    }


    namespace database {


      interface Database {
        /**
         * Returns a new firebase reference instance
         * */
        ref(path?: string): RnReference

        /**
         * register listener
         */
        on(path: string, modifiersString: string, modifiers: Array<string>, eventName: string, cb: () => void, errorCb: () => void): any

        /**
         * unregister listener
         */
        off(path: string, modifiersString: string, eventName?: string, origCB?: () => void): any

        /**
         * Removes all event handlers and their native subscriptions
         */
        cleanup(): Promise<any>

        /**
         * connect to firebase backend
         */
        goOnline(): void

        /**
         * disconnect to firebase backend
         */
        goOffline(): void

        [key: string]: any;
      }

      interface RnReference extends Reference {
        keepSynced(bool: boolean): any

        filter(name: string, value: any, key?: string): any;

        [key: string]: any;
      }

      type QueryEventType = "value" | "child_added" | "child_removed" | "child_changed" | "child_moved";
      type QuerySuccessCallback = (snapshot: DataSnapshot, previousChildId?: string | null) => void;
      type QueryErrorCallback = (e: Error) => void;

      interface Query {
        endAt(value: number | string | boolean | null, key?: string): database.Query;

        equalTo(value: number | string | boolean | null, key?: string): database.Query;

        isEqual(other: database.Query | null): boolean;

        limitToFirst(limit: number): database.Query;

        limitToLast(limit: number): database.Query;

        off(eventType?: QueryEventType,
            callback?: QuerySuccessCallback,
            context?: Object): void;

        on(eventType: QueryEventType,
           callback: QuerySuccessCallback,
           cancelCallbackOrContext?: QueryErrorCallback,
           context?: Object): (a: database.DataSnapshot | null, b?: string) => QuerySuccessCallback;

        once(eventType: QueryEventType,
             successCallback?: QuerySuccessCallback,
             failureCallbackOrContext?: QueryErrorCallback,
             context?: Object): Promise<DataSnapshot>;

        orderByChild(path: string): database.Query;

        orderByKey(): database.Query;

        orderByPriority(): database.Query;

        orderByValue(): database.Query;

        ref: database.Reference;

        startAt(value: number | string | boolean | null, key?: string): database.Query;

        toJSON(): Object;

        toString(): string;
      }

      interface DataSnapshot {
        child(path: string): database.DataSnapshot;

        exists(): boolean;

        exportVal(): any;

        forEach(action: (a: database.DataSnapshot) => boolean): boolean;

        getPriority(): string | number | null;

        hasChild(path: string): boolean;

        hasChildren(): boolean;

        key: string | null;

        numChildren(): number;

        ref: database.Reference;

        toJSON(): Object | null;

        val(): any;
      }

      interface ThenableReference<T> extends Promise<T> {
      }

      interface ThenableReference<T> extends Reference {
      }

      interface Reference extends database.Query {
        child(path: string): database.Reference;

        key: string | null;

        onDisconnect(): any;

        parent: database.Reference | null;

        push(value?: any, onComplete?: (a: RnError | null) => any): ThenableReference<any>

        remove(onComplete?: (a: RnError | null) => any): Promise<any>;

        root: database.Reference;

        set(value: any, onComplete?: (a: RnError | null) => any): Promise<any>;

        setPriority(priority: string | number | null,
                    onComplete: (a: RnError | null) => any): Promise<any>;

        setWithPriority(newVal: any, newPriority: string | number | null,
                        onComplete?: (a: RnError | null) => any): Promise<any>;

        transaction(transactionUpdate: (a: any) => any,
                    onComplete?: (a: RnError | null, b: boolean,
                                  c: database.DataSnapshot | null) => any,
                    applyLocally?: boolean): Promise<any>;

        update(values: Object, onComplete?: (a: RnError | null) => any): Promise<any>;
      }

      interface DatabaseStatics {
        /** @see https://www.firebase.com/docs/java-api/javadoc/com/firebase/client/ServerValue.html#TIMESTAMP */
        ServerValue: {
          TIMESTAMP: {
            [key: string]: string
          }
        }
    }
    }

    /**
     * firebase Analytics
     */
    interface Analytics {
      /**Log a custom event with optional params. */
      logEvent(event: string, params?: Object): void

      /** Sets whether analytics collection is enabled for this app on this device. */
      setAnalyticsCollectionEnabled(enabled: boolean): void

      /**
       * Sets the current screen name, which specifies the current visual context in your app.
       * Whilst screenClassOverride is optional,
       * it is recommended it is always sent as your current class name,
       * for example on Android it will always show as 'MainActivity' if not specified.
       */
      setCurrentScreen(screenName: string | null, screenClassOverride?: string): void

      /**
       * Sets the minimum engagement time required before starting a session.
       * The default value is 10000 (10 seconds)
       */
      setMinimumSessionDuration(miliseconds: number): void

      /**
       * Sets the duration of inactivity that terminates the current session.
       * The default value is 1800000 (30 minutes).
       */
      setSessionTimeoutDuration(miliseconds: number): void

      /**
       * Gives a user a uniqiue identificaition.
       * @example
       * const id = firebase.auth().currentUser.uid;
       *
       * firebase.analytics().setUserId(id);
       */
      setUserId(id: string | null): void

      /**
       * Sets a key/value pair of data on the current user.
       */
      setUserProperty(name: string, value: string | null): void;

      [key: string]: any;
    }

    type UserInfo = {
           displayName?: string,
           email?: string,
           phoneNumber?: string,
           photoURL?: string,
           providerId: string,
           uid: string,
    }

    type UpdateProfile = {
      displayName?: string,
      photoURL?: string,
    }

    interface User {
      /**
       * The user's display name (if available).
       */
      displayName: string | null
      /**
       * - The user's email address (if available).
       */
      email: string | null
      /**
       * - True if the user's email address has been verified.
       */
      emailVerified: boolean
      /**
       *
       */
      isAnonymous: boolean

      phoneNumber: string | null
      /**
       * - The URL of the user's profile picture (if available).
       */
      photoURL: string | null
      /**
       * - Additional provider-specific information about the user.
       */
      providerData: Array<UserInfo>
      /**
       *  - The authentication provider ID for the current user.
       *  For example, 'facebook.com', or 'google.com'.
       */
      providerId: string
      /**
       *  - The user's unique ID.
       */
      uid: string

      /**
       * Delete the current user.
       */
      delete(): Promise<void>

      /**
       * Returns the users authentication token.
       *
       * @param forceRefresh: boolean - default to false
       */
      getIdToken(forceRefresh?: boolean): Promise<string>

      /**
       * Link the user with a 3rd party credential provider.
       */
      linkWithCredential(credential: AuthCredential): Promise<User>

      /**
       * Re-authenticate a user with a third-party authentication provider
       */
      reauthenticateWithCredential(credential: AuthCredential): Promise<void>

      /**
       * Refreshes the current user.
       */
      reload(): Promise<void>

      /**
       * Sends a verification email to a user.
       * This will Promise reject is the user is anonymous.
       */
      sendEmailVerification(actionCodeSettings?: ActionCodeSettings): Promise<void>

      toJSON(): object

      unlink(providerId: string): Promise<User>

      /**
       * Updates the user's email address.
       * See Firebase docs for more information on security & email validation.
       * This will Promise reject is the user is anonymous.
       */
      updateEmail(email: string): Promise<void>

      /**
       * Important: this is a security sensitive operation that requires the user to have recently signed in.
       * If this requirement isn't met, ask the user to authenticate again and then call firebase.User#reauthenticate.
       * This will Promise reject is the user is anonymous.
       */
      updatePassword(password: string): Promise<void>

      /**
       * Updates a user's profile data.
       * Profile data should be an object of fields to update:
       */
      updateProfile(updates: UpdateProfile): Promise<void>
    }

    type ActionCodeSettings = {
      android: {
         installApp?: boolean,
         minimumVersion?: string,
         packageName: string,
       },
       handleCodeInApp?: boolean,
       iOS: {
         bundleId?: string,
       },
       url: string,
    }

    interface ActionCodeInfo {
      email: string,
      error: string,
      fromEmail: string,
      verifyEmail: string,
      recoverEmail: string,
      passwordReset: string
    }

    interface ConfirmationResult {

      confirm(verificationCode: string): Promise<User | null>;

      verificationId: string | null;
    }

    type PhoneAuthSnapshot = {
      state: 'sent' | 'timeout' | 'verified' | 'error',
      verificationId: string,
      code: string | null,
      error: Error | null,
    };

    type PhoneAuthError = {
      code: string | null,
      verificationId: string,
      message: string | null,
      stack: string | null,
    };

    interface PhoneAuthListener {

      on(event: string,
         observer: () => PhoneAuthSnapshot,
         errorCb?: () => PhoneAuthError,
         successCb?: () => PhoneAuthSnapshot): PhoneAuthListener;

      then(fn: () => PhoneAuthSnapshot): Promise<any>

      catch(fn: () => Error): Promise<any>
    }

    namespace auth {

      type AuthResult = {
        authenticated: boolean,
        user: object | null
      } | null;

      type AuthProvider = {
        PROVIDER_ID: string,
        credential: (token: string, secret?: string) => AuthCredential,
      };

      interface Auth {
        /**
         * Returns the current Firebase authentication state.
         */
        authResult: AuthResult | null;
        /**
         * Returns the currently signed-in user (or null). See the User class documentation for further usage.
         */
        user: User | null

        /**
         * Gets/Sets the language for the app instance
         */
        languageCode: string | null;

        /**
         * Listen for changes in the users auth state (logging in and out).
         * This method returns a unsubscribe function to stop listening to events.
         * Always ensure you unsubscribe from the listener when no longer needed to prevent updates to components no longer in use.
         */
        onAuthStateChanged(listener: Function): () => void;

        /**
         * Listen for changes in id token.
         * This method returns a unsubscribe function to stop listening to events.
         * Always ensure you unsubscribe from the listener when no longer needed to prevent updates to components no longer in use.
         */
        onIdTokenChanged(listener: Function): () => void;

        /**
         * Listen for changes in the user.
         * This method returns a unsubscribe function to stop listening to events.
         * Always ensure you unsubscribe from the listener when no longer needed to prevent updates to components no longer in use.
         */
        onUserChanged(listener: Function): () => void;

        signOut(): Promise<void>

        /**
         * Sign an anonymous user.
         * If the user has already signed in, that user will be returned
         */
        signInAnonymously(): Promise<User>


        /**
         * We can create a user by calling the createUserWithEmailAndPassword() function.
         * The method accepts two parameters, an email and a password.
         */
        createUserWithEmailAndPassword(email: string, password: string): Promise<User>

        /**
         * To sign a user in with their email and password, use the signInWithEmailAndPassword() function.
         * It accepts two parameters, the user's email and password:
         */
        signInWithEmailAndPassword(email: string, password: string): Promise<User>

        /**
         * Sign a user in with a self-signed JWT token.
         * To sign a user using a self-signed custom token,
         * use the signInWithCustomToken() function.
         * It accepts one parameter, the custom token:
         */
        signInWithCustomToken(token: string): Promise<User>

        /**
         * Sign in the user with a 3rd party credential provider.
         * credential requires the following properties:
         */
        signInWithCredential(credential: AuthCredential): Promise<User>

        /**
         * Asynchronously signs in using a phone number.
         */
        signInWithPhoneNumber(phoneNumber: string): Promise<ConfirmationResult>

        /**
         * Returns a PhoneAuthListener to listen to phone verification events,
         * on the final completion event a PhoneAuthCredential can be generated for
         * authentication purposes.
         */
        verifyPhoneNumber(phoneNumber: string, autoVerifyTimeout?: number): PhoneAuthListener

        /**
         * Sends a password reset email to the given email address.
         * Unlike the web SDK,
         * the email will contain a password reset link rather than a code.
         */
        sendPasswordResetEmail(email: string, actionCodeSettings?: ActionCodeSettings): Promise<void>

        /**
         * Completes the password reset process, given a confirmation code and new password.
         */
        confirmPasswordReset(code: string, newPassword: string): Promise<void>

        /**
         * Applies a verification code sent to the user by email or other out-of-band mechanism.
         */
        applyActionCode(code: string): Promise<void>

        /**
         * Checks a verification code sent to the user by email or other out-of-band mechanism.
         */
        checkActionCode(code: string): Promise<ActionCodeInfo>

        /**
         * Get the currently signed in user
         */
        getCurrentUser(): Promise<User | null>

        /**
         * Returns a list of authentication providers that can be used to sign in a given user (identified by its main email address).
         */
        fetchProvidersForEmail(email: string): Promise<Array<string>>

        [key: string]: any;
      }

      interface AuthStatics {
        EmailAuthProvider: AuthProvider;
        PhoneAuthProvider: AuthProvider;
        GoogleAuthProvider: AuthProvider;
        GithubAuthProvider: AuthProvider;
        TwitterAuthProvider: AuthProvider;
        FacebookAuthProvider: AuthProvider;
        PhoneAuthState: {
          CODE_SENT: string;
          AUTO_VERIFY_TIMEOUT: string;
          AUTO_VERIFIED: string;
          ERROR: string;
        };
      }
    }

    namespace messaging {

      interface Messaging {
        /**
         * Subscribes the device to a topic.
         */
        subscribeToTopic(topic: string): void

        /**
         * Unsubscribes the device from a topic.
         */
        unsubscribeFromTopic(topic: string): void

        /**
         * When the application has been opened from a notification
         * getInitialNotification is called and the notification payload is returned.
         * Use onMessage for notifications when the app is running.
         */
        getInitialNotification(): Promise<any>

        /**
         * Returns the devices FCM token.
         * This token can be used in the Firebase console to send messages to directly.
         */
        getToken(forceRefresh?: Boolean): Promise<string>

        /**
         * Reset Instance ID and revokes all tokens.
         */
        deleteInstanceId(): Promise<any>

        /**
         * On the event a devices FCM token is refreshed by Google,
         *  the new token is returned in a callback listener.
         */
        onTokenRefresh(listener: (token: string) => any): () => any

        /**
         * On a new message,
         * the payload object is passed to the listener callback.
         * This method is only triggered when the app is running.
         * Use getInitialNotification for notifications which cause the app to open.
         */
        onMessage(listener: (message: any) => any): () => any

        /**
         * Create a local notification from the device itself.
         */
        createLocalNotification(notification: any): any

        /**
         * Schedule a local notification to be shown on the device.
         */
        scheduleLocalNotification(notification: any): any

        /**
         * Returns an array of all currently scheduled notifications.
         * ```
         * firebase.messaging().getScheduledLocalNotifications()
         *   .then((notifications) => {
         *       console.log('Current scheduled notifications: ', notifications);
         *   });
         * ```
         */
        getScheduledLocalNotifications(): Promise<any[]>

        /**
         * Cancels a location notification by ID,
         * or all notifications by *.
         */
        cancelLocalNotification(id: string): void

        /**
         * Removes all delivered notifications from device by ID,
         * or all notifications by *.
         */
        removeDeliveredNotification(id: string): void

        /**
         * IOS
         * Requests app notification permissions in an Alert dialog.
         */
        requestPermissions(): void

        /**
         * Sets the badge number on the iOS app icon.
         */
        setBadgeNumber(value: number): void

        /**
         * Returns the current badge number on the app icon.
         */
        getBadgeNumber(): Promise<number>

        /**
         * Send an upstream message
         * @param senderId
         * @param payload
         */
        send(senderId: string, payload: RemoteMessage): any

        NOTIFICATION_TYPE: Object
        REMOTE_NOTIFICATION_RESULT: Object
        WILL_PRESENT_RESULT: Object
        EVENT_TYPE: Object
      }

      interface RemoteMessage {
        id: string,
        type: string,
        ttl?: number,
        sender: string,
        collapseKey?: string,
        data: Object,
      }
    }
    namespace crash {

      interface Crash {
        /** Logs a message that will appear in a subsequent crash report. */
        log(message: string): void

        /**
         * Android: Logs a message that will appear in a subsequent crash report as well as in logcat.
         * iOS: Logs the message in the subsequest crash report only (same as log).
         */
        logcat(level: number, tag: string, message: string): void

        /**
         * Files a crash report, along with any previous logs to Firebase.
         * An Error object must be passed into the report method.
         */
        report(error: RnError, maxStackSize: Number): void

        [key: string]: any;
      }
    }

    namespace crashlytics {

      interface Crashlytics {
        /**
         * Forces a crash. Useful for testing your application is set up correctly.
         */
        crash(): void;

        /**
         * Logs a message that will appear in any subsequent crash reports.
         */
        log(message: string): void;

        /**
         * Logs a non fatal exception.
         */
        recordError(code: number, message: string): void;

        /**
         * Set a boolean value to show alongside any subsequent crash reports.
         */
        setBoolValue(key: string, value: boolean): void;

        /**
         * Set a float value to show alongside any subsequent crash reports.
         */
        setFloatValue(key: string, value: number): void;

        /**
         * Set an integer value to show alongside any subsequent crash reports.
         */
        setIntValue(key: string, value: number): void;

        /**
         * Set a string value to show alongside any subsequent crash reports.
         */
        setStringValue(key: string, value: string): void;

        /**
         * Set the user ID to show alongside any subsequent crash reports.
         */
        setUserIdentifier(userId: string): void;
      }
    }

    namespace links {
      interface Links {
        /** Creates a standard dynamic link. */
        createDynamicLink(parameters: LinkConfiguration): Promise<string>;
        /** Creates a short dynamic link. */
        createShortDynamicLink(parameters: LinkConfiguration): Promise<string>;
        /**
         * Returns the URL that the app has been launched from. If the app was
         * not launched from a URL the return value will be null.
         */
        getInitialLink(): Promise<string | null>;
        /**
         * Subscribe to URL open events while the app is still running.
         * The listener is called from URL open events whilst the app is still
         * running, use getInitialLink for URLs which cause the app to open
         * from a previously closed / not running state.
         * Returns an unsubscribe function, call the returned function to
         * unsubscribe from all future events.
         */
        onLink(listener: (url: string) => void): () => void;
      }

      /**
       * Configuration when creating a Dynamic Link (standard or short). For
       * more information about each parameter, see the official Firebase docs:
       * https://firebase.google.com/docs/reference/dynamic-links/link-shortener
       */
      interface LinkConfiguration {
        link: string,
        dynamicLinkDomain: string,
        androidInfo?: {
          androidLink?: string,
          androidPackageName: string,
          androidFallbackLink?: string,
          androidMinPackageVersionCode?: string,
        },
        iosInfo?: {
          iosBundleId: string,
          iosAppStoreId?: string,
          iosFallbackLink?: string,
          iosCustomScheme?: string,
          iosIpadBundleId?: string,
          iosIpadFallbackLink?: string,
        },
        socialMetaTagInfo?: {
          socialTitle: string,
          socialImageLink: string,
          socialDescription: string,
        },
        suffix?: {
          option: 'SHORT' | 'UNGUESSABLE',
        },
      }
    }

    namespace firestore {
      interface Firestore {
        batch(): WriteBatch;
        collection(collectionPath: string): CollectionReference;
        doc(documentPath: string): DocumentReference;

        /** NOT SUPPORTED YET */
        // enablePersistence(): Promise<void>;
        /** NOT SUPPORTED YET */
        // runTransaction(): Promise<any>;
        /** NOT SUPPORTED YET */
        // settings(): void;
      }

      interface FirestoreStatics {
        FieldPath: typeof FieldPath;
        FieldValue: typeof FieldValue;
        GeoPoint: typeof GeoPoint;
        enableLogging(enabled: boolean): void;
      }

      interface CollectionReference {
        readonly firestore: Firestore;
        readonly id: string;
        readonly parent: DocumentReference;
        add(data: object): Promise<DocumentReference>;
        doc(documentPath?: string): DocumentReference;
        endAt(snapshot: DocumentSnapshot): Query;
        endAt(...varargs: any[]): Query;
        endBefore(snapshot: DocumentSnapshot): Query;
        endBefore(...varargs: any[]): Query;
        get(): Promise<QuerySnapshot>;
        limit(limit: number): Query;
        onSnapshot(onNext: Query.ObserverOnNext, onError?: Query.ObserverOnError): () => void;
        onSnapshot(observer: Query.Observer): () => void;
        onSnapshot(queryListenOptions: Query.QueryListenOptions, onNext: Query.ObserverOnNext, onError?: Query.ObserverOnError): () => void;
        onSnapshot(queryListenOptions: Query.QueryListenOptions, observer: Query.Observer): () => void;
        orderBy(fieldPath: string | FieldPath, directionStr?: Types.QueryDirection): Query;
        startAfter(snapshot: DocumentSnapshot): Query;
        startAfter(...varargs: any[]): Query;
        startAt(snapshot: DocumentSnapshot): Query;
        startAt(...varargs: any[]): Query;
        where(fieldPath: string, op: Types.QueryOperator, value: any): Query;
      }

      interface DocumentChange {
        readonly doc: DocumentSnapshot;
        readonly newIndex: number;
        readonly oldIndex: number;
        readonly type: string;
      }

      interface DocumentReference {
        readonly firestore: Firestore;
        readonly id: string | null;
        readonly parent: CollectionReference;
        readonly path: string;
        collection(collectionPath: string): CollectionReference;
        delete(): Promise<void>;
        get(): Promise<DocumentSnapshot>;
        onSnapshot(onNext: DocumentReference.ObserverOnNext, onError?: DocumentReference.ObserverOnError): () => void;
        onSnapshot(observer: DocumentReference.Observer): () => void;
        onSnapshot(documentListenOptions: DocumentReference.DocumentListenOptions, onNext: DocumentReference.ObserverOnNext, onError?: DocumentReference.ObserverOnError): () => void;
        onSnapshot(documentListenOptions: DocumentReference.DocumentListenOptions, observer: DocumentReference.Observer): () => void;
        set(data: object, writeOptions?: Types.WriteOptions): Promise<void>;
        update(obj: object): Promise<void>;
        update(key1: Types.UpdateKey, val1: any): Promise<void>;
        update(key1: Types.UpdateKey, val1: any, key2: Types.UpdateKey, val2: any): Promise<void>;
        update(key1: Types.UpdateKey, val1: any, key2: Types.UpdateKey, val2: any, key3: Types.UpdateKey, val3: any): Promise<void>;
        update(key1: Types.UpdateKey, val1: any, key2: Types.UpdateKey, val2: any, key3: Types.UpdateKey, val3: any, key4: Types.UpdateKey, val4: any): Promise<void>;
        update(key1: Types.UpdateKey, val1: any, key2: Types.UpdateKey, val2: any, key3: Types.UpdateKey, val3: any, key4: Types.UpdateKey, val4: any, key5: Types.UpdateKey, val5: any): Promise<void>;
      }
      namespace DocumentReference {
        interface DocumentListenOptions {
          includeMetadataChanges: boolean;
        }

        type ObserverOnNext = (documentSnapshot: DocumentSnapshot) => void;
        type ObserverOnError = (err: object) => void;
        interface Observer {
          next: ObserverOnNext;
          error?: ObserverOnError;
        }
      }

      interface DocumentSnapshot {
        readonly exists: boolean;
        readonly id: string | null;
        readonly metadata: Types.SnapshotMetadata;
        readonly ref: DocumentReference;
        data(): object | void;
        get(fieldPath: string | FieldPath): any | undefined;
      }

      class FieldPath {
        static documentId(): FieldPath;
        constructor(...segments: string[]);
      }

      class FieldValue {
        static delete(): FieldValue;
        static serverTimestamp(): FieldValue;
      }

      class GeoPoint {
        constructor(latitude: number, longitude: number);
        readonly latitude: number;
        readonly longitude: number;
      }

      class Path {
        static fromName(name: string): Path;
        constructor(pathComponents: string[]);
        readonly id: string | null;
        readonly isDocument: boolean;
        readonly isCollection: boolean;
        readonly relativeName: string;
        child(relativePath: string): Path;
        parent(): Path | null;
      }

      interface Query {
        readonly firestore: Firestore;
        endAt(snapshot: DocumentSnapshot): Query;
        endAt(...varargs: any[]): Query;
        endBefore(snapshot: DocumentSnapshot): Query;
        endBefore(...varargs: any[]): Query;
        get(): Promise<QuerySnapshot>;
        limit(limit: number): Query;
        onSnapshot(onNext: Query.ObserverOnNext, onError?: Query.ObserverOnError): () => void;
        onSnapshot(observer: Query.Observer): () => void;
        onSnapshot(queryListenOptions: Query.QueryListenOptions, onNext: Query.ObserverOnNext, onError?: Query.ObserverOnError): () => void;
        onSnapshot(queryListenOptions: Query.QueryListenOptions, observer: Query.Observer): () => void;
        orderBy(fieldPath: string | FieldPath, directionStr?: Types.QueryDirection): Query;
        startAfter(snapshot: DocumentSnapshot): Query;
        startAfter(...varargs: any[]): Query;
        startAt(snapshot: DocumentSnapshot): Query;
        startAt(...varargs: any[]): Query;
        where(fieldPath: string, op: Types.QueryOperator, value: any): Query;
      }
      namespace Query {
        interface NativeFieldPath {
          elements?: string[];
          string?: string;
          type: 'fieldpath' | 'string';
        }

        interface FieldFilter {
          fieldPath: NativeFieldPath;
          operator: string;
          value: any;
        }

        interface FieldOrder {
          direction: string;
          fieldPath: NativeFieldPath;
        }

        interface QueryOptions {
          endAt?: any[];
          endBefore?: any[];
          limit?: number;
          offset?: number;
          selectFields?: string[];
          startAfter?: any[];
          startAt?: any[];
        }

        // The JS code expects at least one of 'includeDocumentMetadataChanges'
        // or 'includeQueryMetadataChanges' to be defined.
        interface _IncludeDocumentMetadataChanges {
          includeDocumentMetadataChanges: boolean;
        }
        interface _IncludeQueryMetadataChanges {
          includeQueryMetadataChanges: boolean;
        }
        type QueryListenOptions = _IncludeDocumentMetadataChanges | _IncludeQueryMetadataChanges | (_IncludeDocumentMetadataChanges & _IncludeQueryMetadataChanges);

        type ObserverOnNext = (querySnapshot: QuerySnapshot) => void;
        type ObserverOnError = (err: object) => void;
        interface Observer {
          next: ObserverOnNext;
          error?: ObserverOnError;
        }
      }

      interface QuerySnapshot {
        readonly docChanges: DocumentChange[];
        readonly docs: DocumentSnapshot[];
        readonly empty: boolean;
        readonly metadata: Types.SnapshotMetadata;
        readonly query: Query;
        readonly size: number;
        forEach(callback: (snapshot: DocumentSnapshot) => any): void;
      }
      namespace QuerySnapshot {
        interface NativeData {
          changes: Types.NativeDocumentChange[];
          documents: Types.NativeDocumentSnapshot[];
          metadata: Types.SnapshotMetadata;
        }
      }

      interface WriteBatch {
        commit(): Promise<void>;
        delete(docRef: DocumentReference): WriteBatch;
        set(docRef: DocumentReference, data: object, options?: Types.WriteOptions): WriteBatch;
        // multiple overrides for update() to allow strong-typed var_args
        update(docRef: DocumentReference, obj: object): WriteBatch;
        update(docRef: DocumentReference, key1: Types.UpdateKey, val1: any): WriteBatch;
        update(docRef: DocumentReference, key1: Types.UpdateKey, val1: any, key2: Types.UpdateKey, val2: any): WriteBatch;
        update(docRef: DocumentReference, key1: Types.UpdateKey, val1: any, key2: Types.UpdateKey, val2: any, key3: Types.UpdateKey, val3: any): WriteBatch;
        update(docRef: DocumentReference, key1: Types.UpdateKey, val1: any, key2: Types.UpdateKey, val2: any, key3: Types.UpdateKey, val3: any, key4: Types.UpdateKey, val4: any): WriteBatch;
        update(docRef: DocumentReference, key1: Types.UpdateKey, val1: any, key2: Types.UpdateKey, val2: any, key3: Types.UpdateKey, val3: any, key4: Types.UpdateKey, val4: any, key5: Types.UpdateKey, val5: any): WriteBatch;
      }

      namespace Types {
        interface NativeDocumentChange {
          document: NativeDocumentSnapshot;
          newIndex: number;
          oldIndex: number;
          type: string;
        }

        interface NativeDocumentSnapshot {
          data: {
            [key: string]: TypeMap;
          };
          metadata: SnapshotMetadata;
          path: string;
        }

        interface SnapshotMetadata {
          fromCache: boolean;
          hasPendingWrites: boolean;
        }

        type QueryDirection = 'asc' | 'ASC' | 'desc' | 'DESC';
        type QueryOperator = '=' | '==' | '>' | '>=' | '<' | '<=';

        interface TypeMap {
          type: 'array' | 'boolean' | 'date' | 'documentid' | 'fieldvalue' | 'geopoint' | 'null' | 'number' | 'object' | 'reference' | 'string';
          value: any;
        }

        /** The key in update() function for DocumentReference and WriteBatch. */
        type UpdateKey = string | FieldPath

        interface WriteOptions {
          merge?: boolean;
        }
      }
    }
  }
}

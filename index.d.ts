
// Type definitions for React Native Firebase  v1.0.0-alpha7
// Project: https://github.com/invertase/react-native-firebase
// TypeScript Version: 2.1 

// TODO definitions for storage, database methods, undocumented features

  class FireBase {
      constructor(config?: configurationOptions)
      analytics(): Analytics
      auth(): Auth
      on(type: string, handler: (msg:any) => void): any
      /** mimics firebase Web SDK */
      database(): any
      /**RNFirebase mimics the Web Firebase SDK Storage, 
       * whilst providing some iOS and Android specific functionality. 
       */
      storage(): any
      /**
       * Firebase Cloud Messaging (FCM) allows you to send push messages at no cost to both Android & iOS platforms.
       * Assuming the installation instructions have been followed, FCM is ready to go.
       * As the Firebase Web SDK has limited messaging functionality, 
       * the following methods within react-native-firebase have been created to handle FCM in the React Native environment.
       */
      messaging(): Messaging
      /**
       * RNFirebase provides crash reporting for your app out of the box.
       * Please note crashes do not appear in real-time on the console,
       * they tend to take a number of hours to appear
       * If you want to manually report a crash,
       * such as a pre-caught exception this is possible by using the report method.
       */
      crash(): Crash
  }

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
       * Default from app [NSBundle mainBundle]	The bundle ID for the app to be bundled with
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
       * default	""	
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
      setCurrentScreen(screenName: string, screenClassOverride?: string): void
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
      setUserId(id: string): void
      /**
       * Sets a key/value pair of data on the current user.
       */
      setUserProperty(name: string, value: string): void
  }

  interface User {
      /**
       * The user's display name (if available).
       */
      isplayName: string | null
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
      /**
       * - The URL of the user's profile picture (if available).
       */
      photoURL: string | null
      /**
       * - Additional provider-specific information about the user.
       */
      providerData: Object | null
      /**
       *  - The authentication provider ID for the current user.
       *  For example, 'facebook.com', or 'google.com'.
       */
      providerId: string | null
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
       */
      getToken(): Promise<string>
      /**
       * Reauthenticate the current user with credentials:
       */
      reauthenticate(credential: Credential): Promise<void>
      /**
       * Refreshes the current user.
       */
      reload(): Promise<void>
      /**
       * Sends a verification email to a user. 
       * This will Promise reject is the user is anonymous.
       */
      sendEmailVerification(): Promise<void>
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
      updateProfile(profile: Object): Promise<void>
  }

  /** 3rd party provider Credentials */
  interface Credential {
      provider: string,
      token: string,
      secret: string
  }

  interface Auth {
      /**
       * Returns the current Firebase authentication state.
       */
      authenticated: boolean;
      /**
       * Returns the currently signed-in user (or null). See the User class documentation for further usage.
       */
      currentUser: User | null
      /**
       * Listen for changes in the users auth state (logging in and out). 
       * This method returns a unsubscribe function to stop listening to events. 
       * Always ensure you unsubscribe from the listener when no longer needed to prevent updates to components no longer in use.
       */
      onAuthStateChanged(event: Function): Function
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
       * Sign an anonymous user. 
       * If the user has already signed in, that user will be returned
       */
      signInAnonymously(): Promise<User>
      /**
       * Sign in the user with a 3rd party credential provider. 
       * credential requires the following properties:
       */
      signInWithCredential(credential: Credential): Promise<User>
      /**
       * Sign a user in with a self-signed JWT token. 
       * To sign a user using a self-signed custom token, 
       * use the signInWithCustomToken() function. 
       * It accepts one parameter, the custom token:
       */
      signInWithCustomToken(token: string): Promise<User>
      /**
       * Sends a password reset email to the given email address. 
       * Unlike the web SDK, 
       * the email will contain a password reset link rather than a code.
       */
      sendPasswordResetEmail(email: string): Promise<void>
      /**
       * Completes the password reset process, 
       * given a confirmation code and new password.
       */
      signOut(): Promise<void>

  }

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
      getInitialNotification(): Promise<Object>
      /**
       * Returns the devices FCM token. 
       * This token can be used in the Firebase console to send messages to directly.
       */
      getToken(): Promise<string>
      /**
       * On the event a devices FCM token is refreshed by Google,
       *  the new token is returned in a callback listener.
       */
      onTokenRefresh(listener: (token: string) => any): void
      /**
       * On a new message, 
       * the payload object is passed to the listener callback. 
       * This method is only triggered when the app is running.
       * Use getInitialNotification for notifications which cause the app to open.
       */
      onMessage(listener: (message: Object) => any): void
      /**
       * Create a local notification from the device itself.
       */
      createLocalNotification(notification: Object): any
      /**
       * Schedule a local notification to be shown on the device.
       */
      scheduleLocalNotification(notification: Object): any
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
       * IOS
       * Sets the badge number on the iOS app icon.
       */
      setBadgeNumber(value: number): void
      /**
       * IOS
       * Returns the current badge number on the app icon.
       */
      getBadgeNumber(): number
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
      report(error: Error, maxStackSize: Number): void
  }


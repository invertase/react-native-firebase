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
 * Firebase Authentication package for React Native.
 *
 * #### Example: Access the firebase export from the `auth` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/auth';
 *
 * // firebase.auth().X
 * ```
 *
 * #### Example: Using the default export from the `auth` package:
 *
 * ```js
 * import auth from '@react-native-firebase/auth';
 *
 * // auth().X
 * ```
 *
 * #### Example: Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/auth';
 *
 * // firebase.auth().X
 * ```
 * TODO @salakar @ehesp missing auth providers (PhoneAuthProvider, Facebook etc)
 *
 * @firebase auth
 */
export namespace FirebaseAuthTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;
  import NativeFirebaseError = ReactNativeFirebase.NativeFirebaseError;

  export interface NativeFirebaseAuthError extends NativeFirebaseError {
    userInfo: {
      /**
       *  When trying to sign in or link with an AuthCredential which was already associated with an account,
       *  you might receive an updated credential (depending of provider) which you can use to recover from the error.
       */
      authCredential: AuthCredential | null;
    };
  }

  /**
   * Interface that represents the credentials returned by an auth provider. Implementations specify the details
   * about each auth provider's credential requirements.
   *
   * TODO Missing; signInMethod, toJSON, fromJSON
   *
   * #### Example
   *
   * ```js
   * const provider = firebase.auth.EmailAuthProvider;
   * const authCredential = provider.credential('foo@bar.com', '123456');
   *
   * await firebase.auth().signInWithCredential(authCredential);
   * ```
   */
  export interface AuthCredential {
    /**
     * The authentication provider ID for the credential. For example, 'facebook.com', or 'google.com'.
     */
    providerId: string;
    token: string;
    secret: string;
  }

  /**
   * Interface that represents an auth provider. Implemented by other providers.
   */
  export interface AuthProvider {
    /**
     * The provider ID of the provider.
     */
    PROVIDER_ID: string;
    /**
     * Creates a new `AuthCredential`.
     *
     * @returns {@link auth.AuthCredential}.
     * @param token A provider token.
     * @param secret A provider secret.
     */
    credential: (token: string | null, secret?: string) => AuthCredential;
  }

  /**
   * Email and password auth provider implementation.
   */
  export interface EmailAuthProvider {
    /**
     * The provider ID. Always returns `password`.
     */
    PROVIDER_ID: string;
    /**
     * This corresponds to the sign-in method identifier as returned in {@link auth#fetchSignInMethodsForEmail}.
     *
     * #### Example
     *
     * ```js
     * const signInMethods = await firebase.auth().fetchSignInMethodsForEmail('...');
     * if (signInMethods.indexOf(firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD) != -1) {
     *   // User can sign in with email/link
     * }
     * ```
     */
    EMAIL_LINK_SIGN_IN_METHOD: string;
    /**
     * This corresponds to the sign-in method identifier as returned in {@link auth#fetchSignInMethodsForEmail}.
     *
     * #### Example
     *
     * ```js
     * const signInMethods = await firebase.auth().fetchSignInMethodsForEmail('...');
     * if (signInMethods.indexOf(firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD) != -1) {
     *   // User can sign in with email/password
     * }
     * ```
     */
    EMAIL_PASSWORD_SIGN_IN_METHOD: string;
    /**
     * Returns the auth provider credential.
     *
     * #### Example
     *
     * ```js
     * const authCredential = firebase.auth.EmailAuthProvider.credential('joe.bloggs@example.com', '123456');
     * ```
     *
     * @returns {@link auth.AuthCredential}
     * @param email Users email address.
     * @param password User account password.
     */
    credential: (email: string, password: string) => AuthCredential;
    /**
     * Initialize an `EmailAuthProvider` credential using an email and an email link after a sign in with email link operation.
     *
     * #### Example
     *
     * ```js
     * const authCredential = firebase.auth.EmailAuthProvider.credentialWithLink('joe.bloggs@example.com', 'https://myexample.com/invite');
     * ```
     *
     * @param email Users email address.
     * @param emailLink Sign-in email link.
     */
    credentialWithLink: (email: string, emailLink: string) => AuthCredential;
  }

  /**
   *
   */
  export interface PhoneAuthState {
    /**
     * The timeout specified in {@link auth#verifyPhoneNumber} has expired.
     */
    CODE_SENT: 'sent';
    /**
     * SMS message with verification code sent to phone number.
     */
    AUTO_VERIFY_TIMEOUT: 'timeout';
    /**
     * Phone number auto-verification succeeded.
     */
    AUTO_VERIFIED: 'verified';
    /**
     * Phone number verification failed with an error.
     */
    ERROR: 'error';
  }

  /**
   * firebase.auth.X
   */
  export interface Statics {
    /**
     * Email and password auth provider implementation.
     *
     * #### Example
     *
     * ```js
     * firebase.auth.EmailAuthProvider;
     * ```
     */
    EmailAuthProvider: EmailAuthProvider;
    /**
     * Phone auth provider implementation.
     *
     * #### Example
     *
     * ```js
     * firebase.auth.PhoneAuthProvider;
     * ```
     */
    PhoneAuthProvider: AuthProvider;
    /**
     * Google auth provider implementation.
     *
     * #### Example
     *
     * ```js
     * firebase.auth.GoogleAuthProvider;
     * ```
     */
    GoogleAuthProvider: AuthProvider;
    /**
     * Apple auth provider implementation. Currently this is iOS only.
     *
     * For Apple Authentication please see our [`@invertase/react-native-apple-authentication`](https://github.com/invertase/react-native-apple-authentication) library which integrates well with Firebase and provides Firebase + Apple Auth examples.
     *
     * #### Example
     *
     * ```js
     * firebase.auth.AppleAuthProvider;
     * ```
     */
    AppleAuthProvider: AuthProvider;
    /**
     * Github auth provider implementation.
     *
     * #### Example
     *
     * ```js
     * firebase.auth.GithubAuthProvider;
     * ```
     */
    GithubAuthProvider: AuthProvider;
    /**
     * Twitter auth provider implementation.
     *
     * #### Example
     *
     * ```js
     * firebase.auth.TwitterAuthProvider;
     * ```
     */
    TwitterAuthProvider: AuthProvider;
    /**
     * Facebook auth provider implementation.
     *
     * #### Example
     *
     * ```js
     * firebase.auth.FacebookAuthProvider;
     * ```
     */
    FacebookAuthProvider: AuthProvider;
    /**
     * Custom OAuth auth provider implementation.
     *
     * #### Example
     *
     * ```js
     * firebase.auth.OAuthProvider;
     * ```
     */
    OAuthProvider: AuthProvider;
    /**
     * A PhoneAuthState interface.
     *
     * #### Example
     *
     * ```js
     * firebase.auth.PhoneAuthState;
     * ```
     */
    PhoneAuthState: PhoneAuthState;
  }

  /**
   * A structure containing additional user information from a federated identity provider via {@link auth.UserCredential}.
   *
   * #### Example
   *
   * ```js
   * const userCredential = await firebase.auth().signInAnonymously();
   * console.log('Additional user info: ', userCredential.additionalUserInfo);
   * ```
   *
   * @error auth/operation-not-allowed Thrown if anonymous accounts are not enabled. Enable anonymous accounts in the Firebase Console, under the Auth tab.
   */
  export interface AdditionalUserInfo {
    /**
     * Returns whether the user is new or existing.
     */
    isNewUser: boolean;
    /**
     * Returns an Object containing IDP-specific user data if the provider is one of Facebook,
     * GitHub, Google, Twitter, Microsoft, or Yahoo.
     */
    profile?: Record<string, any>;
    /**
     * Returns the provider ID for specifying which provider the information in `profile` is for.
     */
    providerId: string;
    /**
     * Returns the username if the provider is GitHub or Twitter.
     */
    username?: string;
  }

  /**
   * A structure containing a User, an AuthCredential, the operationType, and any additional user
   * information that was returned from the identity provider. operationType could be 'signIn' for
   * a sign-in operation, 'link' for a linking operation and 'reauthenticate' for a re-authentication operation.
   *
   * TODO @salakar; missing credential, operationType
   */
  export interface UserCredential {
    /**
     * Any additional user information assigned to the user.
     */
    additionalUserInfo?: AdditionalUserInfo;
    /**
     * Returns the {@link auth.User} interface of this credential.
     */
    user: User;
  }

  /**
   * Holds the user metadata for the current {@link auth.User}.
   *
   * #### Example
   *
   * ```js
   * const user = firebase.auth().currentUser;
   * console.log('User metadata: ', user.metadata);
   * ```
   */
  export interface UserMetadata {
    /**
     * Returns the timestamp at which this account was created as dictated by the server clock
     * as an ISO Date string.
     */
    creationTime?: string;
    /**
     * Returns the last signin timestamp as dictated by the server clock as an ISO Date string.
     * This is only accurate up to a granularity of 2 minutes for consecutive sign-in attempts.
     */
    lastSignInTime?: string;
  }

  /**
   * Represents a collection of standard profile information for a user. Can be used to expose
   * profile information returned by an identity provider, such as Google Sign-In or Facebook Login.
   *
   * TODO @salakar: isEmailVerified
   *
   * #### Example
   *
   * ```js
   * const user = firebase.auth().currentUser;
   *
   * user.providerData.forEach((userInfo) => {
   *   console.log('User info for provider: ', userInfo);
   * });
   * ```
   */
  export interface UserInfo {
    /**
     * Returns the user's display name, if available.
     */
    displayName?: string;
    /**
     * Returns the email address corresponding to the user's account in the specified provider, if available.
     */
    email?: string;
    /**
     * The phone number normalized based on the E.164 standard (e.g. +16505550101) for the current user. This is null if the user has no phone credential linked to the account.
     */
    phoneNumber?: string;
    /**
     * Returns a url to the user's profile picture, if available.
     */
    photoURL?: string;
    /**
     * Returns the unique identifier of the provider type that this instance corresponds to.
     */
    providerId: string;
    /**
     * Returns a string representing the multi-tenant tenant id. This is null if the user is not associated with a tenant.
     */
    tenantId?: string;
    /**
     * Returns a user identifier as specified by the authentication provider.
     */
    uid: string;
  }

  /**
   * Interface representing ID token result obtained from {@link auth.User#getIdTokenResult}.
   * It contains the ID token JWT string and other helper properties for getting different data
   * associated with the token as well as all the decoded payload claims.
   *
   * TODO @salakar validate timestamp types
   *
   * #### Example
   *
   * ```js
   * const idTokenResult = await firebase.auth().currentUser.getIdTokenResult();
   * console.log('User JWT: ', idTokenResult.token);
   * ```
   */
  export interface IdTokenResult {
    /**
     * The Firebase Auth ID token JWT string.
     */
    token: string;
    /**
     * The authentication time formatted as a UTC string. This is the time the user authenticated
     * (signed in) and not the time the token was refreshed.
     */
    authTime: string;
    /**
     * The ID token issued at time formatted as a UTC string.
     */
    issuedAtTime: string;
    /**
     * The ID token expiration time formatted as a UTC string.
     */
    expirationTime: string;
    /**
     * The sign-in provider through which the ID token was obtained (anonymous, custom,
     * phone, password, etc). Note, this does not map to provider IDs.
     */
    signInProvider: null | string;
    /**
     * The entire payload claims of the ID token including the standard reserved claims as well as
     * the custom claims.
     */
    claims: {
      [key: string]: any;
    };
  }

  /**
   * Request used to update user profile information.
   *
   * #### Example
   *
   * ```js
   * const update = {
   *   displayName: 'Alias',
   *   photoURL: 'https://my-cdn.com/assets/user/123.png',
   * };
   *
   * await firebase.auth().currentUser.updateProfile(update);
   * ```
   */
  export interface UpdateProfile {
    /**
     * An optional display name for the user. Explicitly pass null to clear the displayName.
     */
    displayName?: string | null;
    /**
     * An optional photo URL for the user. Explicitly pass null to clear the photoURL.
     */
    photoURL?: string | null;
  }

  /**
   * A result from a {@link auth#signInWithPhoneNumber} call.
   *
   * #### Example
   *
   * ```js
   * // Force a new message to be sent
   * const result = await firebase.auth().signInWithPhoneNumber('#4423456789');
   * const user = await result.confirm('12345');
   * ```
   */
  export interface ConfirmationResult {
    /**
     * The phone number authentication operation's verification ID. This can be used along with
     * the verification code to initialize a phone auth credential.
     */
    verificationId: string | null;
    /**
     * Finishes the sign in flow. Validates a code that was sent to the users device.
     *
     * @param verificationCode The code sent to the users device from Firebase.
     */
    confirm(verificationCode: string): Promise<UserCredential | null>;
  }

  /**
   * Android specific options which can be attached to the {@link auth.ActionCodeSettings} object
   * to be sent with requests such as {@link auth.User#sendEmailVerification}.
   *
   * #### Example
   *
   * ```js
   * await firebase.auth().currentUser.sendEmailVerification({
   *  android: {
   *    installApp: true,
   *    packageName: 'com.awesome.app',
   *  },
   * });
   * ```
   */
  export interface ActionCodeSettingsAndroid {
    /**
     * Sets the Android package name. This will try to open the link in an android app if it is installed.
     */
    packageName: string;
    /**
     * If installApp is passed, it specifies whether to install the Android app if the device supports it and the app is not already installed. If this field is provided without a packageName, an error is thrown explaining that the packageName must be provided in conjunction with this field.
     */
    installApp?: boolean;
    /**
     * If minimumVersion is specified, and an older version of the app is installed, the user is taken to the Play Store to upgrade the app. The Android app needs to be registered in the Console.
     */
    minimumVersion?: string;
  }

  /**
   * Additional data returned from a {@link auth#checkActionCode} call.
   * For the PASSWORD_RESET, VERIFY_EMAIL, and RECOVER_EMAIL actions, this object contains an email field with the address the email was sent to.
   * For the RECOVER_EMAIL action, which allows a user to undo an email address change, this object also contains a fromEmail field with the user account's new email address. After the action completes, the user's email address will revert to the value in the email field from the value in fromEmail field.
   *
   * #### Example
   *
   * ```js
   * const actionCodeInfo = await firebase.auth().checkActionCode('ABCD');
   *Data
   * console.log('Action code email: ', actionCodeInfo.data.email);
   * console.log('Action code from email: ', actionCodeInfo.data.fromEmail);
   * ```
   */
  export interface ActionCodeInfoData {
    /**
     * This signifies the email before the call was made.
     */
    email?: string;
    /**
     * This signifies the current email associated with the account, which may have changed as a result of the {@link auth#checkActionCode} call performed.
     */
    fromEmail?: string;
  }

  /**
   * The interface returned from a {@link auth#checkActionCode} call.
   *
   * #### Example
   *
   * ```js
   * const actionCodeInfo = await firebase.auth().checkActionCode('ABCD');
   * console.log('Action code operation: ', actionCodeInfo.operation);
   * ```
   */
  export interface ActionCodeInfo {
    /**
     * The data associated with the action code.
     */
    data: ActionCodeInfoData;
    /**
     * The operation from where the action originated.
     */
    operation: 'PASSWORD_RESET' | 'VERIFY_EMAIL' | 'RECOVER_EMAIL' | 'EMAIL_SIGNIN' | 'ERROR';
  }

  /**
   * iOS specific options which can be attached to the {@link auth.ActionCodeSettings} object
   * to be sent with requests such as {@link auth.User#sendEmailVerification}.
   *
   * #### Example
   *
   * ```js
   * await firebase.auth().currentUser.sendEmailVerification({
   *  iOS: {
   *    bundleId: '123456',
   *  },
   * });
   * ```
   */
  export interface ActionCodeSettingsIos {
    /**
     * Sets the iOS bundle ID. This will try to open the link in an iOS app if it is installed. The iOS app needs to be registered in the Console.
     */
    bundleId?: string;
  }

  /**
   * Options to be sent with requests such as {@link auth.User#sendEmailVerification}.
   *
   * #### Example
   *
   * ```js
   * await firebase.auth().currentUser.sendEmailVerification({
   *  handleCodeInApp: true,
   *  url: 'app/email-verification',
   * });
   * ```
   */
  export interface ActionCodeSettings {
    /**
     * Android specific settings.
     */
    android?: ActionCodeSettingsAndroid;

    /**
     * Whether the email action link will be opened in a mobile app or a web link first. The default is false. When set to true, the action code link will be be sent as a Universal Link or Android App Link and will be opened by the app if installed. In the false case, the code will be sent to the web widget first and then on continue will redirect to the app if installed.
     */
    handleCodeInApp?: boolean;

    /**
     * iOS specific settings.
     */
    iOS?: ActionCodeSettingsIos;

    /**
     * Sets the dynamic link domain (or subdomain) to use for the current link if it is to be opened using Firebase Dynamic Links. As multiple dynamic link domains can be configured per project, this field provides the ability to explicitly choose one. If none is provided, the first domain is used by default.
     */
    dynamicLinkDomain?: string;

    /**
     * This URL represents the state/Continue URL in the form of a universal link. This URL can should be constructed as a universal link that would either directly open the app where the action code would be handled or continue to the app after the action code is handled by Firebase.
     */
    url: string;
  }

  /**
   * An auth listener callback function for {@link auth#onAuthStateChanged}.
   *
   * #### Example
   *
   * ```js
   * function listener(user) {
   *   if (user) {
   *     // Signed in
   *   } else {
   *     // Signed out
   *   }
   * }
   *
   * firebase.auth().onAuthStateChanged(listener);
   * ```
   */
  export type AuthListenerCallback = (user: User | null) => void;

  /**
   * A snapshot interface of the current phone auth state.
   *
   * #### Example
   *
   * ```js
   * firebase.auth().verifyPhoneNumber('+4423456789')
   *  .on('state_changed', (phoneAuthSnapshot) => {
   *    console.log('Snapshot state: ', phoneAuthSnapshot.state);
   *  });
   * ```
   */
  export interface PhoneAuthSnapshot {
    /**
     * The current phone auth verification state.
     *
     * - `sent`: On iOS, this is the final event received. Once sent, show a visible input box asking the user to enter the verification code.
     * - `timeout`: Auto verification has timed out. Show a visible input box asking the user to enter the verification code.
     * - `verified`: The verification code has automatically been verified by the Android device. The snapshot contains the verification ID & code to create a credential.
     * - `error`: An error occurred. Handle or allow the promise to reject.
     */
    state: 'sent' | 'timeout' | 'verified' | 'error';
    /**
     * The verification ID to build a `PhoneAuthProvider` credential.
     */
    verificationId: string;
    /**
     * The verification code. Will only be available if auto verification has taken place.
     */
    code: string | null;
    /**
     * A native JavaScript error if an error occurs.
     */
    error: NativeFirebaseError | null;
  }

  /**
   * A custom error in the event verifying a phone number failed.
   *
   * #### Example
   *
   * ```js
   * firebase.auth().verifyPhoneNumber('+4423456789')
   *  .on('state_changed', (phoneAuthSnapshot) => {
   *    console.log('Snapshot state: ', phoneAuthSnapshot.state);
   *  }, (phoneAuthError) => {
   *    console.error('Error: ', phoneAuthError.message);
   *  });
   * ```
   */
  export interface PhoneAuthError {
    /**
     * The code the verification failed with.
     */
    code: string | null;
    /**
     * The verification ID which failed.
     */
    verificationId: string;
    /**
     * JavaScript error message.
     */
    message: string | null;
    /**
     * JavaScript error stack trace.
     */
    stack: string | null;
  }

  /**
   * The listener function returned from a {@link auth#verifyPhoneNumber} call.
   */
  export interface PhoneAuthListener {
    /**
     * The phone auth state listener. See {@link auth.PhoneAuthState} for different event state types.
     *
     * #### Example
     *
     * ```js
     * firebase.auth().verifyPhoneNumber('+4423456789')
     *  .on('state_changed', (phoneAuthSnapshot) => {
     *    console.log('State: ', phoneAuthSnapshot.state);
     *  }, (error) => {
     *    console.error(error);
     *  }, (phoneAuthSnapshot) => {
     *    console.log('Success');
     *  });
     * ```
     *
     * @param event The event to subscribe to. Currently only `state_changed` is available.
     * @param observer The required observer function. Returns a new phone auth snapshot on each event.
     * @param errorCb An optional error handler function. This is not required if the `error` snapshot state is being handled in the `observer`.
     * @param successCb An optional success handler function. This is not required if the `sent` or `verified` snapshot state is being handled in the `observer`.
     */
    on(
      event: string,
      observer: (snapshot: PhoneAuthSnapshot) => void,
      errorCb?: (error: PhoneAuthError) => void,
      successCb?: (snapshot: PhoneAuthSnapshot) => void,
    ): PhoneAuthListener;

    /**
     * A promise handler called once the `on` listener flow has succeeded or rejected.
     *
     * #### Example
     *
     * ```js
     * firebase.auth().verifyPhoneNumber('+4423456789')
     *  .on('state_changed', (phoneAuthSnapshot) => {
     *    if (phoneAuthSnapshot.state === firebase.auth.PhoneAuthState.CODE_SENT) {
     *      return Promise.resolve();
     *    } else {
     *      return Promise.reject(
     *        new Error('Code not sent!')
     *      );
     *    }
     *  })
     *  .then((phoneAuthSnapshot) => {
     *    console.log(phoneAuthSnapshot.state);
     *  }, (error) => {
     *    console.error(error.message);
     *  });
     * ```
     *
     * @param onFulfilled Resolved promise handler.
     * @param onRejected Rejected promise handler.
     */
    then(
      onFulfilled?: ((a: PhoneAuthSnapshot) => any) | null,
      onRejected?: ((a: NativeFirebaseError) => any) | null,
    ): Promise<any>;

    /**
     * A promise handler called once the `on` listener flow has rejected.
     *
     * #### Example
     *
     * ```js
     * firebase.auth().verifyPhoneNumber('+4423456789')
     *  .on('state_changed', (phoneAuthSnapshot) => {
     *    return Promise.reject(
     *      new Error('Code not sent!')
     *    );
     *  })
     *  .catch((error) => {
     *    console.error(error.message);
     *  });
     * ```
     *
     * > Used when no `onRejected` handler is passed to {@link auth.PhoneAuthListener#then}.
     *
     * @param onRejected Rejected promise handler.
     */
    catch(onRejected: (a: NativeFirebaseError) => any): Promise<any>;
  }

  /**
   * Interface for module auth settings.
   *
   * #### Example
   *
   * ```js
   * const settings = firebase.auth().settings;
   * console.log(settings.appVerificationDisabledForTesting);
   * ```
   */
  export interface AuthSettings {
    /**
     * iOS only flag to disable app verification for the purpose of testing phone authentication. For this property to take effect, it needs to be set before rendering a reCAPTCHA app verifier. When this is disabled, a mock reCAPTCHA is rendered instead. This is useful for manual testing during development or for automated integration tests.
     *
     * > In order to use this feature, you will need to [whitelist your phone number](https://firebase.google.com/docs/auth/web/phone-auth#test-with-whitelisted-phone-numbers) via the Firebase Console.
     *
     * @ios
     * @param disabled Boolean value representing whether app verification should be disabled for testing.
     */
    appVerificationDisabledForTesting: boolean;

    /**
     * Calling this method a second time will overwrite the previously passed parameters.
     * Only one number can be configured at a given time.
     *
     * > The phone number and SMS code here must have been configured in the Firebase Console (Authentication > Sign In Method > Phone).
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().settings.setAutoRetrievedSmsCodeForPhoneNumber('+4423456789', 'ABCDE');
     * ```
     *
     * @android
     * @param phoneNumber The users phone number.
     * @param smsCode The pre-set SMS code.
     */
    setAutoRetrievedSmsCodeForPhoneNumber(phoneNumber: string, smsCode: string): Promise<null>;
  }

  /**
   * Represents a user's profile information in your Firebase project's user database. It also
   * contains helper methods to change or retrieve profile information, as well as to manage that user's authentication state.
   *
   * #### Example 1
   *
   * Subscribing to the users authentication state.
   *
   * ```js
   * firebase.auth().onAuthStateChanged((user) => {
   *   if (user) {
   *     console.log('User email: ', user.email);
   *   }
   * });
   * ```
   *
   * #### Example 2
   *
   * ```js
   * const user = firebase.auth().currentUser;
   *
   * if (user) {
   *  console.log('User email: ', user.email);
   * }
   * ```
   */
  export interface User {
    /**
     * The user's display name (if available).
     */
    displayName: string | null;
    /**
     * - The user's email address (if available).
     */
    email: string | null;
    /**
     * - True if the user's email address has been verified.
     */
    emailVerified: boolean;
    /**
     * Returns true if the user is anonymous; that is, the user account was created with
     * {@link auth#signInAnonymously} and has not been linked to another account
     * with {@link auth#linkWithCredential}.
     */
    isAnonymous: boolean;

    /**
     * Returns the {@link auth.UserMetadata} associated with this user.
     */
    metadata: UserMetadata;

    /**
     * Returns the phone number of the user, as stored in the Firebase project's user database,
     * or null if none exists. This can be updated at any time by calling {@link auth.User#updatePhoneNumber}.
     */
    phoneNumber: string | null;

    /**
     * The URL of the user's profile picture (if available).
     */
    photoURL: string | null;

    /**
     * Additional provider-specific information about the user.
     */
    providerData: UserInfo[];

    /**
     *  The authentication provider ID for the current user.
     *  For example, 'facebook.com', or 'google.com'.
     */
    providerId: string;

    /**
     *  - The user's unique ID.
     */
    uid: string;

    /**
     * Delete the current user.
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().currentUser.delete();
     * ```
     *
     * @error auth/requires-recent-login Thrown if the user's last sign-in time does not meet the security threshold. Use `auth.User#reauthenticateWithCredential` to resolve. This does not apply if the user is anonymous.
     */
    delete(): Promise<void>;

    /**
     * Returns the users authentication token.
     *
     * #### Example
     *
     * ```js
     * // Force a token refresh
     * const idToken = await firebase.auth().currentUser.getIdToken(true);
     * ```
     *
     * @param forceRefresh A boolean value which forces Firebase to refresh the token.
     */
    getIdToken(forceRefresh?: boolean): Promise<string>;

    /**
     * Returns a firebase.auth.IdTokenResult object which contains the ID token JWT string and
     * other helper properties for getting different data associated with the token as well as
     * all the decoded payload claims.
     *
     * #### Example
     *
     * ```js
     * // Force a token refresh
     * const idTokenResult = await firebase.auth().currentUser.getIdTokenResult(true);
     * ```
     *
     * @param forceRefresh boolean Force refresh regardless of token expiration.
     */
    getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;

    /**
     * Link the user with a 3rd party credential provider.
     *
     * #### Example
     *
     * ```js
     * const facebookCredential = firebase.auth.FacebookAuthProvider.credential('access token from Facebook');
     * const userCredential = await firebase.auth().currentUser.linkWithCredential(facebookCredential);
     * ```
     *
     * @error auth/provider-already-linked Thrown if the provider has already been linked to the user. This error is thrown even if this is not the same provider's account that is currently linked to the user.
     * @error auth/invalid-credential Thrown if the provider's credential is not valid. This can happen if it has already expired when calling link, or if it used invalid token(s). See the Firebase documentation for your provider, and make sure you pass in the correct parameters to the credential method.
     * @error auth/credential-already-in-use Thrown if the account corresponding to the credential already exists among your users, or is already linked to a Firebase User.
     * @error auth/email-already-in-use Thrown if the email corresponding to the credential already exists among your users.
     * @error auth/operation-not-allowed Thrown if you have not enabled the provider in the Firebase Console. Go to the Firebase Console for your project, in the Auth section and the Sign in Method tab and configure the provider.
     * @error auth/invalid-email Thrown if the email used in a auth.EmailAuthProvider.credential is invalid.
     * @error auth/wrong-password Thrown if the password used in a auth.EmailAuthProvider.credential is not correct or when the user associated with the email does not have a password.
     * @error auth/invalid-verification-code Thrown if the credential is a auth.PhoneAuthProvider.credential and the verification code of the credential is not valid.
     * @error auth/invalid-verification-id Thrown if the credential is a auth.PhoneAuthProvider.credential and the verification ID of the credential is not valid.
     * @throws on iOS {@link auth.NativeFirebaseAuthError}, on Android {@link auth.NativeFirebaseError}
     * @param credential A created {@link auth.AuthCredential}.
     */
    linkWithCredential(credential: AuthCredential): Promise<UserCredential>;

    /**
     * Re-authenticate a user with a third-party authentication provider.
     *
     * #### Example
     *
     * ```js
     * const facebookCredential = firebase.auth.FacebookAuthProvider.credential('access token from Facebook');
     * const userCredential = await firebase.auth().currentUser.reauthenticateWithCredential(facebookCredential);
     * ```
     *
     * @error auth/user-mismatch Thrown if the credential given does not correspond to the user.
     * @error auth/user-not-found Thrown if the credential given does not correspond to any existing user.
     * @error auth/invalid-credential Thrown if the provider's credential is not valid. This can happen if it has already expired when calling link, or if it used invalid token(s). See the Firebase documentation for your provider, and make sure you pass in the correct parameters to the credential method.
     * @error auth/invalid-email Thrown if the email used in a auth.EmailAuthProvider.credential is invalid.
     * @error auth/wrong-password Thrown if the password used in a auth.EmailAuthProvider.credential is not correct or when the user associated with the email does not have a password.
     * @error auth/invalid-verification-code Thrown if the credential is a auth.PhoneAuthProvider.credential and the verification code of the credential is not valid.
     * @error auth/invalid-verification-id Thrown if the credential is a auth.PhoneAuthProvider.credential and the verification ID of the credential is not valid.
     * @param credential A created {@link auth.AuthCredential}.
     */
    reauthenticateWithCredential(credential: AuthCredential): Promise<UserCredential>;

    /**
     * Refreshes the current user.
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().currentUser.reload();
     * ```
     */
    reload(): Promise<void>;

    /**
     * Sends a verification email to a user.
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().currentUser.sendEmailVerification({
     *   handleCodeInApp: true,
     * });
     * ```
     *
     * > This will Promise reject if the user is anonymous.
     *
     * @error auth/missing-android-pkg-name An Android package name must be provided if the Android app is required to be installed.
     * @error auth/missing-continue-uri A continue URL must be provided in the request.
     * @error auth/missing-ios-bundle-id An iOS bundle ID must be provided if an App Store ID is provided.
     * @error auth/invalid-continue-uri The continue URL provided in the request is invalid.
     * @error auth/unauthorized-continue-uri The domain of the continue URL is not whitelisted. Whitelist the domain in the Firebase console.
     * @param actionCodeSettings Any optional additional settings to be set before sending the verification email.
     */
    sendEmailVerification(actionCodeSettings?: ActionCodeSettings): Promise<void>;
    /**
     * Sends a link to the user's email address, when clicked, the user's Authentication email address will be updated to whatever
     * was passed as the first argument.
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().currentUser.verifyBeforeUpdateEmail(
     * 'foo@emailaddress.com',
     * {
     *   handleCodeInApp: true,
     * });
     * ```
     *
     * > This will Promise reject if the user is anonymous.
     *
     * @error auth/missing-android-pkg-name An Android package name must be provided if the Android app is required to be installed.
     * @error auth/missing-continue-uri A continue URL must be provided in the request.
     * @error auth/missing-ios-bundle-id An iOS bundle ID must be provided if an App Store ID is provided.
     * @error auth/invalid-continue-uri The continue URL provided in the request is invalid.
     * @error auth/unauthorized-continue-uri The domain of the continue URL is not whitelisted. Whitelist the domain in the Firebase console.
     * @param actionCodeSettings Any optional additional settings to be set before sending the verification email.
     */
    verifyBeforeUpdateEmail(email: string, actionCodeSettings?: ActionCodeSettings): Promise<void>;

    /**
     * Returns a JSON-serializable representation of this object.
     *
     * #### Example
     *
     * ```js
     * const user = firebase.auth().currentUser.toJSON();
     * ```
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    toJSON(): object;

    /**
     * Unlinks a provider from a user account.
     *
     * #### Example
     *
     * ```js
     * const user = await firebase.auth().currentUser.unlink('facebook.com');
     * ```
     *
     * @error auth/no-such-provider Thrown if the user does not have this provider linked or when the provider ID given does not exist.
     * @param providerId
     */
    unlink(providerId: string): Promise<User>;

    /**
     * Updates the user's email address.
     *
     * See Firebase docs for more information on security & email validation.
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().currentUser.updateEmail('joe.bloggs@new-email.com');
     * ```
     *
     * > This will Promise reject if the user is anonymous.
     *
     * @error auth/invalid-email Thrown if the email used is invalid.
     * @error auth/email-already-in-use Thrown if the email is already used by another user.
     * @error auth/requires-recent-login Thrown if the user's last sign-in time does not meet the security threshold.
     * @param email The users new email address.
     */
    updateEmail(email: string): Promise<void>;

    /**
     * Updates the users password.
     *
     * Important: this is a security sensitive operation that requires the user to have recently signed in.
     * If this requirement isn't met, ask the user to authenticate again and then call firebase.User#reauthenticate.
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().currentUser.updatePassword('654321');
     * ```
     *
     * > This will Promise reject is the user is anonymous.
     *
     * @error auth/weak-password Thrown if the password is not strong enough.
     * @error auth/requires-recent-login Thrown if the user's last sign-in time does not meet the security threshold.
     * @param password The users new password.
     */
    updatePassword(password: string): Promise<void>;

    /**
     * Updates the user's phone number.
     *
     * See Firebase docs for more information on security & email validation.
     *
     * #### Example
     *
     * ```js
     * const snapshot = await firebase.auth().verifyPhoneNumber('+4423456789')
     *  .on(...); // See PhoneAuthListener - wait for successful verification
     *
     * const credential = firebase.auth.PhoneAuthProvider.credential(snapshot.verificationId, snapshot.code);
     *
     * // Update user with new verified phone number
     * await firebase.auth().currentUser.updatePhoneNumber(credential);
     * ```
     *
     * > This will Promise reject is the user is anonymous.
     *
     * @error auth/invalid-verification-code Thrown if the verification code of the credential is not valid.
     * @error auth/invalid-verification-id Thrown if the verification ID of the credential is not valid.
     * @param credential A created `PhoneAuthCredential`.
     */
    updatePhoneNumber(credential: AuthCredential): Promise<void>;

    /**
     * Updates a user's profile data.
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().currentUser.updateProfile({
     *   displayName: 'Alias',
     * });
     * ```
     */
    updateProfile(updates: UpdateProfile): Promise<void>;
  }

  /**
   * The Firebase Authentication service is available for the default app or a given app.
   *
   * #### Example 1
   *
   * Get the auth instance for the **default app**:
   *
   * ```js
   * const authForDefaultApp = firebase.auth();
   * ```
   *
   * #### Example 2
   *
   * Get the auth instance for a **secondary app**:
   *
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const authForOtherApp = firebase.auth(otherApp);
   * ```
   *
   * TODO @salakar missing updateCurrentUser
   */
  export class Module extends FirebaseModule {
    /**
     * Returns the current tenant Id or null if it has never been set
     *
     * #### Example
     *
     * ```js
     * const tenantId = firebase.auth().tenantId;
     * ```
     */
    tenantId: string | null;
    /**
     * Returns the current language code.
     *
     * #### Example
     *
     * ```js
     * const language = firebase.auth().languageCode;
     * ```
     */
    languageCode: string;
    /**
     * Returns the current `AuthSettings`.
     */
    settings: AuthSettings;

    /**
     * Returns the currently signed-in user (or null if no user signed in). See the User interface documentation for detailed usage.
     *
     * #### Example
     *
     * ```js
     * const user = firebase.auth().currentUser;
     * ```
     *
     * > It is recommended to use {@link auth#onAuthStateChanged} to track whether the user is currently signed in.
     */
    currentUser: User | null;
    /**
     * Sets the tenant id.
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().setTenantId('tenant-123');
     * ```
     *
     * @error auth/invalid-tenant-id if the tenant id is invalid for some reason
     * @param tenantId the tenantID current app bind to.
     */
    setTenantId(tenantId: string): Promise<void>;
    /**
     * Sets the language code.
     *
     * #### Example
     *
     * ```js
     * // Set language to French
     * await firebase.auth().setLanguageCode('fr');
     * ```
     *
     * @param code An ISO language code.
     * 'null' value will set the language code to the app's current language.
     */
    setLanguageCode(languageCode: string | null): Promise<void>;
    /**
     * Listen for changes in the users auth state (logging in and out).
     * This method returns a unsubscribe function to stop listening to events.
     * Always ensure you unsubscribe from the listener when no longer needed to prevent updates to components no longer in use.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
     *   if (user) {
     *     // Signed in
     *   } else {
     *     // Signed out
     *   }
     * });
     *
     * // Unsubscribe from further state changes
     * unsubscribe();
     * ```
     *
     * @param listener A listener function which triggers when auth state changed (for example signing out).
     */
    onAuthStateChanged(listener: CallbackOrObserver<AuthListenerCallback>): () => void;

    /**
     * Listen for changes in ID token.
     * This method returns a unsubscribe function to stop listening to events.
     * Always ensure you unsubscribe from the listener when no longer needed to prevent updates to components no longer in use.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.auth().onIdTokenChanged((user) => {
     *   if (user) {
     *     // User is signed in or token was refreshed.
     *   }
     * });
     *
     * // Unsubscribe from further state changes
     * unsubscribe();
     * ```
     *
     * @param listener A listener function which triggers when the users ID token changes.
     */
    onIdTokenChanged(listener: CallbackOrObserver<AuthListenerCallback>): () => void;

    /**
     * Adds a listener to observe changes to the User object. This is a superset of everything from
     * {@link auth#onAuthStateChanged}, {@link auth#onIdTokenChanged} and user changes. The goal of this
     * method is to provide easier listening to all user changes, such as when credentials are
     * linked and unlinked, without manually having to call {@link auth.User#reload}.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.auth().onUserChanged((user) => {
     *   if (user) {
     *     // User is signed in or token was refreshed.
     *   }
     * });
     *
     * // Unsubscribe from further state changes
     * unsubscribe();
     * ```
     *
     * > This is an experimental feature and is only part of React Native Firebase.
     *
     * @react-native-firebase
     * @param listener A listener function which triggers when the users data changes.
     */
    onUserChanged(listener: CallbackOrObserver<AuthListenerCallback>): () => void;

    /**
     * Signs the user out.
     *
     * Triggers the {@link auth#onAuthStateChanged} listener.
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().signOut();
     * ```
     *
     */
    signOut(): Promise<void>;

    /**
     * Sign in a user anonymously. If the user has already signed in, that user will be returned.
     *
     * #### Example
     *
     * ```js
     * const userCredential = await firebase.auth().signInAnonymously();
     * ```
     *
     * @error auth/operation-not-allowed Thrown if anonymous accounts are not enabled. Enable anonymous accounts in the Firebase Console, under the Auth tab.
     */
    signInAnonymously(): Promise<UserCredential>;

    /**
     * Signs in the user using their phone number.
     *
     * #### Example
     *
     * ```js
     * // Force a new message to be sent
     * const result = await firebase.auth().signInWithPhoneNumber('#4423456789', true);
     * ```
     *
     * @error auth/invalid-phone-number Thrown if the phone number has an invalid format.
     * @error auth/missing-phone-number Thrown if the phone number is missing.
     * @error auth/quota-exceeded Thrown if the SMS quota for the Firebase project has been exceeded.
     * @error auth/user-disabled Thrown if the user corresponding to the given phone number has been disabled.
     * @error auth/operation-not-allowed Thrown if you have not enabled the provider in the Firebase Console. Go to the Firebase Console for your project, in the Auth section and the Sign in Method tab and configure the provider.
     * @param phoneNumber The devices phone number.
     * @param forceResend Forces a new message to be sent if it was already recently sent.
     */
    signInWithPhoneNumber(phoneNumber: string, forceResend?: boolean): Promise<ConfirmationResult>;

    /**
     * Returns a PhoneAuthListener to listen to phone verification events,
     * on the final completion event a PhoneAuthCredential can be generated for
     * authentication purposes.
     *
     * #### Example
     *
     * ```js
     * firebase.auth().verifyPhoneNumber('+4423456789', )
     *  .on('state_changed', (phoneAuthSnapshot) => {
     *    console.log('Snapshot state: ', phoneAuthSnapshot.state);
     *  });
     * ```
     *
     * @param phoneNumber The phone number identifier supplied by the user. Its format is normalized on the server, so it can be in any format here. (e.g. +16505550101).
     * @param autoVerifyTimeoutOrForceResend If a number, sets in seconds how to to wait until auto verification times out. If boolean, sets the `forceResend` parameter.
     * @param forceResend If true, resend the verification message even if it was recently sent.
     */
    verifyPhoneNumber(
      phoneNumber: string,
      autoVerifyTimeoutOrForceResend?: number | boolean,
      forceResend?: boolean,
    ): PhoneAuthListener;

    /**
     * Creates a new user with an email and password.
     *
     * This method also signs the user in once the account has been created.
     *
     * #### Example
     *
     * ```js
     * const userCredential = await firebase.auth().createUserWithEmailAndPassword('joe.bloggs@example.com', '123456');
     * ```
     *
     * @error auth/email-already-in-use Thrown if there already exists an account with the given email address.
     * @error auth/invalid-email Thrown if the email address is not valid.
     * @error auth/operation-not-allowed Thrown if email/password accounts are not enabled. Enable email/password accounts in the Firebase Console, under the Auth tab.
     * @error auth/weak-password Thrown if the password is not strong enough.
     * @param email The users email address.
     * @param password The users password.
     */
    createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;

    /**
     * Signs a user in with an email and password.
     *
     * #### Example
     *
     * ```js
     * const userCredential = await firebase.auth().signInWithEmailAndPassword('joe.bloggs@example.com', '123456');
     * ````
     * @error auth/invalid-email Thrown if the email address is not valid.
     * @error auth/user-disabled Thrown if the user corresponding to the given email has been disabled.
     * @error auth/user-not-found Thrown if there is no user corresponding to the given email.
     * @error auth/wrong-password Thrown if the password is invalid for the given email, or the account corresponding to the email does not have a password set.
     * @param email The users email address.
     * @param password The users password.
     */
    signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;

    /**
     * Signs a user in with a custom token.
     *
     * #### Example
     *
     * ```js
     * // Create a custom token via the Firebase Admin SDK.
     * const token = await firebase.auth().createCustomToken(uid, customClaims);
     * ...
     * // Use the token on the device to sign in.
     * const userCredential = await firebase.auth().signInWithCustomToken(token);
     * ```
     *
     * @error auth/custom-token-mismatch Thrown if the custom token is for a different Firebase App.
     * @error auth/invalid-custom-token Thrown if the custom token format is incorrect.
     * @param customToken A custom token generated from the Firebase Admin SDK.
     */
    signInWithCustomToken(customToken: string): Promise<UserCredential>;

    /**
     * Signs the user in with a generated credential.
     *
     * #### Example
     *
     * ```js
     * // Generate a Firebase credential
     * const credential = firebase.auth.FacebookAuthProvider.credential('access token from Facebook');
     * // Sign the user in with the credential
     * const userCredential = await firebase.auth().signInWithCredential(credential);
     * ```
     *
     * @error auth/account-exists-with-different-credential Thrown if there already exists an account with the email address asserted by the credential.
     * @error auth/invalid-credential Thrown if the credential is malformed or has expired.
     * @error auth/operation-not-allowed Thrown if the type of account corresponding to the credential is not enabled. Enable the account type in the Firebase Console, under the Auth tab.
     * @error auth/user-disabled Thrown if the user corresponding to the given credential has been disabled.
     * @error auth/user-not-found Thrown if signing in with a credential from firebase.auth.EmailAuthProvider.credential and there is no user corresponding to the given email.
     * @error auth/wrong-password Thrown if signing in with a credential from firebase.auth.EmailAuthProvider.credential and the password is invalid for the given email, or if the account corresponding to the email does not have a password set.
     * @error auth/invalid-verification-code Thrown if the credential is a firebase.auth.PhoneAuthProvider.credential and the verification code of the credential is not valid.
     * @error auth/invalid-verification-id Thrown if the credential is a firebase.auth.PhoneAuthProvider.credential and the verification ID of the credential is not valid.
     * @param credential A generated `AuthCredential`, for example from social auth.
     */
    signInWithCredential(credential: AuthCredential): Promise<UserCredential>;

    /**
     * Sends a password reset email to the given email address.
     * Unlike the web SDK, the email will contain a password reset link rather than a code.
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().sendPasswordResetEmail('joe.bloggs@example.com');
     * ```
     *
     * @error auth/invalid-email Thrown if the email address is not valid.
     * @error auth/missing-android-pkg-name An Android package name must be provided if the Android app is required to be installed.
     * @error auth/missing-continue-uri A continue URL must be provided in the request.
     * @error auth/missing-ios-bundle-id An iOS Bundle ID must be provided if an App Store ID is provided.
     * @error auth/invalid-continue-uri The continue URL provided in the request is invalid.
     * @error auth/unauthorized-continue-uri The domain of the continue URL is not whitelisted. Whitelist the domain in the Firebase console.
     * @error auth/user-not-found Thrown if there is no user corresponding to the email address.
     * @param email The users email address.
     * @param actionCodeSettings Additional settings to be set before sending the reset email.
     */
    sendPasswordResetEmail(email: string, actionCodeSettings?: ActionCodeSettings): Promise<void>;

    /**
     * Sends a sign in link to the user.
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().sendSignInLinkToEmail('joe.bloggs@example.com');
     * ```
     *
     * @error auth/argument-error Thrown if handleCodeInApp is false.
     * @error auth/invalid-email Thrown if the email address is not valid.
     * @error auth/missing-android-pkg-name An Android package name must be provided if the Android app is required to be installed.
     * @error auth/missing-continue-uri A continue URL must be provided in the request.
     * @error auth/missing-ios-bundle-id An iOS Bundle ID must be provided if an App Store ID is provided.
     * @error auth/invalid-continue-uri The continue URL provided in the request is invalid.
     * @error auth/unauthorized-continue-uri The domain of the continue URL is not whitelisted. Whitelist the domain in the Firebase console.
     * @param email The users email address.
     * @param actionCodeSettings The action code settings. The action code settings which provides Firebase with instructions on how to construct the email link. This includes the sign in completion URL or the deep link for mobile redirects, the mobile apps to use when the sign-in link is opened on an Android or iOS device. Mobile app redirects will only be applicable if the developer configures and accepts the Firebase Dynamic Links terms of condition. The Android package name and iOS bundle ID will be respected only if they are configured in the same Firebase Auth project used.
     */
    sendSignInLinkToEmail(email: string, actionCodeSettings?: ActionCodeSettings): Promise<void>;

    /**
     * Returns whether the user signed in with a given email link.
     *
     * #### Example
     *
     * ```js
     * const signedInWithLink = firebase.auth().isSignInWithEmailLink(link);
     * ```
     *
     * @param emailLink The email link to check whether the user signed in with it.
     */
    isSignInWithEmailLink(emailLink: string): boolean;

    /**
     * Signs the user in with an email link.
     *
     * #### Example
     *
     * ```js
     * const userCredential = await firebase.auth().signInWithEmailLink('joe.bloggs@example.com', link);
     * ```
     *
     * @error auth/expired-action-code Thrown if OTP in email link expires.
     * @error auth/invalid-email Thrown if the email address is not valid.
     * @error auth/user-disabled Thrown if the user corresponding to the given email has been disabled.
     * @param email The users email to sign in with.
     * @param emailLink An email link.
     */
    signInWithEmailLink(email: string, emailLink: string): Promise<UserCredential>;

    /**
     * Completes the password reset process with the confirmation code and new password, via
     * {@link auth#sendPasswordResetEmail}.
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().confirmPasswordReset('ABCD', '1234567');
     * ```
     *
     * @error auth/expired-action-code Thrown if the password reset code has expired.
     * @error auth/invalid-action-code Thrown if the password reset code is invalid. This can happen if the code is malformed or has already been used.
     * @error auth/user-disabled Thrown if the user corresponding to the given password reset code has been disabled.
     * @error auth/user-not-found Thrown if there is no user corresponding to the password reset code. This may have happened if the user was deleted between when the code was issued and when this method was called.
     * @error auth/weak-password Thrown if the new password is not strong enough.
     * @param code The code from the password reset email.
     * @param newPassword The new password.
     */
    confirmPasswordReset(code: string, newPassword: string): Promise<void>;

    /**
     * Applies a verification code sent to the user by email or other out-of-band mechanism.
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().applyActionCode('ABCD');
     * ```
     *
     * @error auth/expired-action-code Thrown if the action code has expired.
     * @error auth/invalid-action-code Thrown if the action code is invalid. This can happen if the code is malformed or has already been used.
     * @error auth/user-disabled Thrown if the user corresponding to the given action code has been disabled.
     * @error auth/user-not-found Thrown if there is no user corresponding to the action code. This may have happened if the user was deleted between when the action code was issued and when this method was called.
     * @param code A verification code sent to the user.
     */
    applyActionCode(code: string): Promise<void>;

    /**
     * Checks a verification code sent to the user by email or other out-of-band mechanism.
     *
     * #### Example
     *
     * ```js
     * const actionCodeInfo = await firebase.auth().checkActionCode('ABCD');
     * console.log('Action code operation: ', actionCodeInfo.operation);
     * ```
     *
     * @error auth/expired-action-code Thrown if the action code has expired.
     * @error auth/invalid-action-code Thrown if the action code is invalid. This can happen if the code is malformed or has already been used.
     * @error auth/user-disabled Thrown if the user corresponding to the given action code has been disabled.
     * @error auth/user-not-found Thrown if there is no user corresponding to the action code. This may have happened if the user was deleted between when the action code was issued and when this method was called.
     * @param code A verification code sent to the user.
     */
    checkActionCode(code: string): Promise<ActionCodeInfo>;

    /**
     * Returns a list of authentication methods that can be used to sign in a given user (identified by its main email address).
     *
     * #### Example
     *
     * ```js
     * const methods = await firebase.auth().fetchSignInMethodsForEmail('joe.bloggs@example.com');
     *
     * methods.forEach((method) => {
     *   console.log(method);
     * });
     * ```
     *
     * @error auth/invalid-email Thrown if the email address is not valid.
     * @param email The users email address.
     */
    fetchSignInMethodsForEmail(email: string): Promise<string[]>;

    /**
     * Checks a password reset code sent to the user by email or other out-of-band mechanism.
     * TODO salakar: confirm return behavior (Returns the user's email address if valid.)
     *
     * #### Example
     *
     * ```js
     * await firebase.auth().verifyPasswordResetCode('ABCD');
     * ```
     *
     * @error auth/expired-action-code Thrown if the password reset code has expired.
     * @error auth/invalid-action-code Thrown if the password reset code is invalid. This can happen if the code is malformed or has already been used.
     * @error auth/user-disabled Thrown if the user corresponding to the given password reset code has been disabled.
     * @error auth/user-not-found Thrown if there is no user corresponding to the password reset code. This may have happened if the user was deleted between when the code was issued and when this method was called.
     * @param code A password reset code.
     */
    verifyPasswordResetCode(code: string): Promise<void>;
    /**
     * Switch userAccessGroup and current user to the given accessGroup and the user stored in it.
     * Sign in a user with any sign in method, and the same current user is available in all
     * apps in the access group.
     *
     * Set the `useAccessGroup` argument to `null` to stop sharing the auth state (default behaviour), the user state will no longer be
     * available to any other apps.
     *
     * @platform ios
     *
     * @error auth/keychain-error Thrown if you attempt to access an inaccessible keychain
     * @param userAccessGroup A string of the keychain id i.e. "TEAMID.com.example.group1"
     */
    useUserAccessGroup(userAccessGroup: string): Promise<null>;
    /**
     * Modify this Auth instance to communicate with the Firebase Auth emulator.
     * This must be called synchronously immediately following the first call to firebase.auth().
     * Do not use with production credentials as emulator traffic is not encrypted.
     *
     * Note: on android, hosts 'localhost' and '127.0.0.1' are automatically remapped to '10.0.2.2' (the
     * "host" computer IP address for android emulators) to make the standard development experience easy.
     * If you want to use the emulator on a real android device, you will need to specify the actual host
     * computer IP address.
     *
     * @param url: emulator URL, must have host and port (eg, 'http://localhost:9099')
     */
    useEmulator(url: string): void;
  }
}

type CallbackOrObserver<T extends (...args: any[]) => any> = T | { next: T };

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseAuthTypes.Module,
  FirebaseAuthTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  auth: typeof defaultExport;
  app(name?: string): ReactNativeFirebase.FirebaseApp & { auth(): FirebaseAuthTypes.Module };
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
      auth: FirebaseModuleWithStaticsAndApp<FirebaseAuthTypes.Module, FirebaseAuthTypes.Statics>;
    }
    interface FirebaseApp {
      auth(): FirebaseAuthTypes.Module;
    }
  }
}

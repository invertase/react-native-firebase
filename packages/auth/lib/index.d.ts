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
  ReactNativeFirebaseModuleAndStatics,
  NativeFirebaseError,
} from '@react-native-firebase/app-types';

/**
 * Firebase Authentication package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `auth` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/auth';
 *
 * // firebase.auth().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `auth` package:
 *
 * ```js
 * import auth from '@react-native-firebase/auth';
 *
 * // auth().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/auth';
 *
 * // firebase.auth().X
 * ```
 *
 * @firebase auth
 */
export namespace Auth {
  export interface AuthProviderCredential {
    providerId: string;
    token: string;
    secret: string;
  }

  export interface AuthProvider {
    PROVIDER_ID: string;
    credential: (token: string | null, secret?: string) => AuthProviderCredential;
  }

  export interface EmailAuthProvider {
    PROVIDER_ID: string;
    EMAIL_LINK_SIGN_IN_METHOD: string;
    EMAIL_PASSWORD_SIGN_IN_METHOD: string;
    credential: (email: string, password: string) => AuthProviderCredential;
    credentialWithLink: (email: string, emailLink: string) => AuthProviderCredential;
  }

  export interface PhoneAuthState {
    CODE_SENT: 'sent';
    AUTO_VERIFY_TIMEOUT: 'timeout';
    AUTO_VERIFIED: 'verified';
    ERROR: 'error';
  }

  export interface Statics {
    EmailAuthProvider: EmailAuthProvider;
    PhoneAuthProvider: AuthProvider;
    GoogleAuthProvider: AuthProvider;
    GithubAuthProvider: AuthProvider;
    TwitterAuthProvider: AuthProvider;
    FacebookAuthProvider: AuthProvider;
    OAuthProvider: AuthProvider;
    PhoneAuthState: PhoneAuthState;
  }

  export interface AdditionalUserInfo {
    isNewUser: boolean;
    profile?: Object;
    providerId: string;
    username?: string;
  }

  export interface UserCredential {
    additionalUserInfo?: AdditionalUserInfo;
    user: User;
  }

  export interface UserMetadata {
    creationTime?: string;
    lastSignInTime?: string;
  }

  export interface UserInfo {
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
    providerId: string;
    uid: string;
  }

  export interface IdTokenResult {
    token: string;
    authTime: string;
    issuedAtTime: string;
    expirationTime: string;
    signInProvider: null | string;
    claims: {
      [key: string]: any;
    };
  }

  export interface UpdateProfile {
    displayName?: string;
    photoURL?: string;
  }

  export interface ConfirmationResult {
    confirm(verificationCode: string): Promise<User | null>;
    verificationId: string | null;
  }

  export interface ActionCodeSettingsAndroid {
    installApp?: boolean;
    minimumVersion?: string;
    packageName: string;
  }

  export interface ActionCodeInfoData {
    email?: string;
    fromEmail?: string;
  }

  export interface ActionCodeInfo {
    data: ActionCodeInfoData;
    operation: 'PASSWORD_RESET' | 'VERIFY_EMAIL' | 'RECOVER_EMAIL' | 'EMAIL_SIGNIN' | 'ERROR';
  }

  export interface ActionCodeSettingsIos {
    bundleId?: string;
  }

  export interface ActionCodeSettings {
    android: ActionCodeSettingsAndroid;
    handleCodeInApp?: boolean;
    iOS: ActionCodeSettingsIos;
    url: string;
  }

  export type AuthListenerCallback = (user: User | null) => void;

  export interface PhoneAuthSnapshot {
    state: 'sent' | 'timeout' | 'verified' | 'error';
    verificationId: string;
    code: string | null;
    error: NativeFirebaseError | null;
  }

  export interface PhoneAuthError {
    code: string | null;
    verificationId: string;
    message: string | null;
    stack: string | null;
  }

  export interface PhoneAuthListener {
    on(
      event: string,
      observer: (snapshot: PhoneAuthSnapshot) => void,
      errorCb?: (error: PhoneAuthError) => void,
      successCb?: (snapshot: PhoneAuthSnapshot) => void,
    ): PhoneAuthListener;

    then(
      onFulfilled?: ((a: PhoneAuthSnapshot) => any) | null,
      onRejected?: ((a: NativeFirebaseError) => any) | null,
    ): Promise<any>;

    catch(onRejected: (a: NativeFirebaseError) => any): Promise<any>;
  }

  export interface AuthSettings {
    /**
     * Flag to determine whether app verification should be disabled for testing or not.
     *
     * @platform iOS
     * @param disabled
     */
    appVerificationDisabledForTesting: boolean;

    /**
     * The phone number and SMS code here must have been configured in the
     * Firebase Console (Authentication > Sign In Method > Phone).
     *
     * Calling this method a second time will overwrite the previously passed parameters.
     * Only one number can be configured at a given time.
     *
     * @platform Android
     * @param phoneNumber
     * @param smsCode
     * @return {*}
     */
    setAutoRetrievedSmsCodeForPhoneNumber(phoneNumber: string, smsCode: string): Promise<null>;
  }

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
     *
     */
    isAnonymous: boolean;

    metadata: UserMetadata;

    phoneNumber: string | null;

    /**
     * - The URL of the user's profile picture (if available).
     */
    photoURL: string | null;

    /**
     * - Additional provider-specific information about the user.
     */
    providerData: Array<UserInfo>;

    /**
     *  - The authentication provider ID for the current user.
     *  For example, 'facebook.com', or 'google.com'.
     */
    providerId: string;

    /**
     *  - The user's unique ID.
     */
    uid: string;

    /**
     * Delete the current user.
     */
    delete(): Promise<void>;

    /**
     * Returns the users authentication token.
     *
     * @param forceRefresh: boolean - default to false
     */
    getIdToken(forceRefresh?: boolean): Promise<string>;

    /**
     * Returns a firebase.auth.IdTokenResult object which contains the ID token JWT string and
     * other helper properties for getting different data associated with the token as well as
     * all the decoded payload claims.
     *
     * @param forceRefresh boolean Force refresh regardless of token expiration.
     */
    getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;

    /**
     * Link the user with a 3rd party credential provider.
     */
    linkWithCredential(credential: AuthProviderCredential): Promise<UserCredential>;

    /**
     * Re-authenticate a user with a third-party authentication provider
     */
    reauthenticateWithCredential(credential: AuthProviderCredential): Promise<UserCredential>;

    /**
     * Refreshes the current user.
     */
    reload(): Promise<void>;

    /**
     * Sends a verification email to a user.
     * This will Promise reject is the user is anonymous.
     */
    sendEmailVerification(actionCodeSettings?: ActionCodeSettings): Promise<void>;

    toJSON(): object;

    unlink(providerId: string): Promise<User>;

    /**
     * Updates the user's email address.
     * See Firebase docs for more information on security & email validation.
     * This will Promise reject is the user is anonymous.
     */
    updateEmail(email: string): Promise<void>;

    /**
     * Important: this is a security sensitive operation that requires the user to have recently signed in.
     * If this requirement isn't met, ask the user to authenticate again and then call firebase.User#reauthenticate.
     * This will Promise reject is the user is anonymous.
     */
    updatePassword(password: string): Promise<void>;

    /**
     * Updates the user's phone number.
     * See Firebase docs for more information on security & email validation.
     * This will Promise reject is the user is anonymous.
     */
    updatePhoneNumber(credential: AuthProviderCredential): Promise<void>;

    /**
     * Updates a user's profile data.
     * Profile data should be an object of fields to update:
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
   */
  export class Module extends ReactNativeFirebaseModule {
    languageCode(): string;

    set languageCode(code: string): void;

    get settings(): AuthSettings;

    /**
     * Returns the currently signed-in user (or null if no user signed in). See the User interface documentation for detailed usage.
     */
    get currentUser(): User | null;

    /**
     * Listen for changes in the users auth state (logging in and out).
     * This method returns a unsubscribe function to stop listening to events.
     * Always ensure you unsubscribe from the listener when no longer needed to prevent updates to components no longer in use.
     */
    onAuthStateChanged(listener: AuthListenerCallback): () => void;

    /**
     * Listen for changes in id token.
     * This method returns a unsubscribe function to stop listening to events.
     * Always ensure you unsubscribe from the listener when no longer needed to prevent updates to components no longer in use.
     */
    onIdTokenChanged(listener: AuthListenerCallback): () => void;

    /**
     * Listen for changes in the user.
     * This method returns a unsubscribe function to stop listening to events.
     * Always ensure you unsubscribe from the listener when no longer needed to prevent updates to components no longer in use.
     */
    onUserChanged(listener: AuthListenerCallback): () => void;

    signOut(): Promise<void>;

    /**
     * Sign in a user anonymously. If the user has already signed in, that user will be returned.
     */
    signInAnonymously(): Promise<UserCredential>;

    /**
     * Signs in the user using their phone number.
     * @param phoneNumber
     * @param forceResend
     */
    signInWithPhoneNumber(phoneNumber: string, forceResend?: boolean): Promise<ConfirmationResult>;

    /**
     * Returns a PhoneAuthListener to listen to phone verification events,
     * on the final completion event a PhoneAuthCredential can be generated for
     * authentication purposes.
     *
     * @param phoneNumber
     * @param autoVerifyTimeoutOrForceResend
     * @param forceResend
     */
    verifyPhoneNumber(
      phoneNumber: string,
      autoVerifyTimeoutOrForceResend?: number | boolean,
      forceResend?: boolean,
    ): PhoneAuthListener;

    /**
     *
     * @param email
     * @param password
     */
    createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;

    /**
     *
     * @param email
     * @param password
     */
    signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;

    /**
     *
     * @param customToken
     */
    signInWithCustomToken(customToken: string): Promise<UserCredential>;

    /**
     *
     * @param credential
     */
    signInWithCredential(credential: string): Promise<UserCredential>;

    /**
     * Sends a password reset email to the given email address.
     * Unlike the web SDK, the email will contain a password reset link rather than a code.
     *
     * @param email
     * @param actionCodeSettings
     */
    sendPasswordResetEmail(email: string, actionCodeSettings?: ActionCodeSettings): Promise<void>;

    /**
     *
     * @param email
     * @param actionCodeSettings
     */
    sendSignInLinkToEmail(email: string, actionCodeSettings?: ActionCodeSettings): Promise<void>;

    /**
     *
     * @param emailLink
     */
    isSignInWithEmailLink(emailLink: string): boolean;

    /**
     *
     * @param email
     * @param emailLink
     */
    signInWithEmailLink(email: string, emailLink: string): Promise<UserCredential>;

    /**
     * Completes the password reset process with the confirmation code and new password.
     *
     * @param code
     * @param newPassword
     */
    confirmPasswordReset(code: string, newPassword: string): Promise<void>;

    /**
     * Applies a verification code sent to the user by email or other out-of-band mechanism.
     *
     * @param code
     */
    applyActionCode(code: string): Promise<void>;

    /**
     * Checks a verification code sent to the user by email or other out-of-band mechanism.
     *
     * @param code
     */
    checkActionCode(code: string): Promise<ActionCodeInfo>;

    /**
     * Returns a list of authentication methods that can be used to sign in a given user (identified by its main email address).
     *
     * @param email
     */
    fetchSignInMethodsForEmail(email: string): Promise<Array<string>>;

    /**
     *
     * @param code
     */
    verifyPasswordResetCode(code: string): Promise<void>;
  }
}

declare module '@react-native-firebase/auth' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/auth';
   * firebase.auth().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const AuthDefaultExport: ReactNativeFirebaseModuleAndStatics<Auth.Module, Auth.Statics>;
  /**
   * @example
   * ```js
   * import auth from '@react-native-firebase/auth';
   * auth().X(...);
   * ```
   */
  export default AuthDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Auth
     */
    auth: ReactNativeFirebaseModuleAndStatics<Auth.Module, Auth.Statics>;
  }

  interface FirebaseApp {
    /**
     * Auth
     */
    auth(): Auth.Module;
  }
}

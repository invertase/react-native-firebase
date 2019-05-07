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
  
  export interface UserCredential {}

  export interface ActionCodeSettings {}

  export interface Statics {}

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
    /**
     *
     */
    get languageCode(): string;

    /**
     *
     */
    set languageCode(code: string): void;

    /**
     *
     */
    get settings(): Setting;

    /**
     *
     */
    get currentUser(): User | null;

    /**
     *
     * @param listener
     */
    onAuthStateChanged(listener: Function): Function;

    /**
     *
     * @param listener
     */
    onIdTokenChanged(listener: Function): Function;

    /**
     *
     * @param listener
     */
    onUserChanged(listener: Function): Function;

    /**
     *
     */
    signOut(): Promise<void>;

    /**
     *
     */
    signInAnonymously(): Promise<UserCredential>;

    /**
     *
     * @param phoneNumber
     * @param forceResend
     */
    signInWithPhoneNumber(phoneNumber: string, forceResend?: boolean): Promise<ConfirmationResult>;

    /**
     *
     * @param phoneNumber
     * @param autoVerifyTimeoutOrForceResend
     * @param forceResend
     */
    verifyPhoneNumber(phoneNumber: string, autoVerifyTimeoutOrForceResend?: number | boolean, forceResend?: boolean): PhoneAuthListener;

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
     *
     * @param code
     * @param newPassword
     */
    confirmPasswordReset(code: string, newPassword: string): Promise<void>;

    /**
     *
     * @param code
     */
    applyActionCode(code: string): Promise<void>;

    /**
     *
     * @param code
     */
    checkActionCode(code: string): Promise<void>;

    /**
     *
     * @param email
     */
    fetchSignInMethodsForEmail(email: string): Promise<[]>;

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

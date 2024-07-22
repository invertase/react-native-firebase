/* eslint-disable @typescript-eslint/no-unused-vars */
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
 */

import { FirebaseApp } from '@firebase/app-types';
import { FirebaseAuthTypes, CallbackOrObserver, AuthListenerCallback } from '../index';
import { firebase } from '..';

import Auth = FirebaseAuthTypes.Module;

/**
 * Returns the Auth instance associated with the provided FirebaseApp.
 */
export function getAuth(app?: FirebaseApp): Auth;

/**
 * This function allows more control over the Auth instance than getAuth().
 *
 * getAuth uses platform-specific defaults to supply the Dependencies.
 * In general, getAuth is the easiest way to initialize Auth and works for most use cases.
 * Use initializeAuth if you need control over which persistence layer is used, or to minimize bundle size
 * if you're not using either signInWithPopup or signInWithRedirect.
 */
export function initializeAuth(app: FirebaseApp, deps?: any): Auth;

/**
 * Applies a verification code sent to the user by email or other out-of-band mechanism.
 *
 * Returns a promise that resolves when the code is applied successfully.
 */
export function applyActionCode(auth: Auth, oobCode: string): Promise<void>;

/**
 * Adds a blocking callback that runs before an auth state change sets a new user.
 */
export function beforeAuthStateChanged(
  auth: Auth,
  callback: (user: FirebaseAuthTypes.User | null) => void,
  onAbort?: () => void,
): void;

/**
 * Checks a verification code sent to the user by email or other out-of-band mechanism.
 */
export function checkActionCode(
  auth: Auth,
  oobCode: string,
): Promise<FirebaseAuthTypes.ActionCodeInfo>;

/**
 * Completes the password reset process, given a confirmation code and new password.
 */
export function confirmPasswordReset(
  auth: Auth,
  oobCode: string,
  newPassword: string,
): Promise<void>;

/**
 * Changes the Auth instance to communicate with the Firebase Auth Emulator, instead of production Firebase Auth services.
 *
 * This must be called synchronously immediately following the first call to initializeAuth(). Do not use with production credentials as emulator traffic is not encrypted.
 */
export function connectAuthEmulator(
  auth: Auth,
  url: string,
  options?: { disableWarnings: boolean },
): void;

/**
 * Creates a new user account associated with the specified email address and password.
 */
export function createUserWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Gets the list of possible sign in methods for the given email address.
 */
export function fetchSignInMethodsForEmail(auth: Auth, email: string): Promise<string[]>;

/**
 * Provides a MultiFactorResolver suitable for completion of a multi-factor flow.
 */
export function getMultiFactorResolver(
  auth: Auth,
  error: FirebaseAuthTypes.MultiFactorError,
): FirebaseAuthTypes.MultiFactorResolver;

/**
 * Returns a UserCredential from the redirect-based sign-in flow.
 */

export interface PopupRedirectResolver {}

export function getRedirectResult(
  auth: Auth,
  resolver?: PopupRedirectResolver,
): Promise<FirebaseAuthTypes.UserCredential | null>;

/**
 * Checks if an incoming link is a sign-in with email link suitable for signInWithEmailLink().
 */
export function isSignInWithEmailLink(auth: Auth, emailLink: string): boolean;

/**
 * Adds an observer for changes to the user's sign-in state.
 */
export function onAuthStateChanged(
  auth: Auth,
  nextOrObserver: CallbackOrObserver<AuthListenerCallback>,
): () => void;

/**
 * Adds an observer for changes to the signed-in user's ID token.
 */
export function onIdTokenChanged(
  auth: Auth,
  nextOrObserver: CallbackOrObserver<AuthListenerCallback>,
): () => void;

/**
 * Sends a password reset email to the given email address.
 */
export function sendPasswordResetEmail(
  auth: Auth,
  email: string,
  actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
): Promise<void>;

/**
 * Sends a sign-in email link to the user with the specified email.
 */
export function sendSignInLinkToEmail(
  auth: Auth,
  email: string,
  actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
): Promise<void>;

export interface Persistence {
  /**
   * Type of Persistence.
   * - 'SESSION' is used for temporary persistence such as `sessionStorage`.
   * - 'LOCAL' is used for long term persistence such as `localStorage` or `IndexedDB`.
   * - 'NONE' is used for in-memory, or no persistence.
   */
  readonly type: 'SESSION' | 'LOCAL' | 'NONE';
}

/**
 * Changes the type of persistence on the Auth instance for the currently saved Auth session and applies this type of persistence for future sign-in requests, including sign-in with redirect requests.
 */
export function setPersistence(auth: Auth, persistence: Persistence): Promise<void>;

/**
 * Asynchronously signs in as an anonymous user.
 */
export function signInAnonymously(auth: Auth): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Asynchronously signs in with the given credentials.
 */
export function signInWithCredential(
  auth: Auth,
  credential: FirebaseAuthTypes.AuthCredential,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Asynchronously signs in using a custom token.
 */
export function signInWithCustomToken(
  auth: Auth,
  customToken: string,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Asynchronously signs in using an email and password.
 */
export function signInWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Asynchronously signs in using an email and sign-in email link.
 */
export function signInWithEmailLink(
  auth: Auth,
  email: string,
  emailLink: string,
): Promise<FirebaseAuthTypes.UserCredential>;

export interface ApplicationVerifier {
  type: string;
  verify(): Promise<string>;
}
/**
 * Asynchronously signs in using a phone number.
 */
export function signInWithPhoneNumber(
  auth: Auth,
  phoneNumber: string,
  appVerifier: ApplicationVerifier,
): Promise<FirebaseAuthTypes.ConfirmationResult>;

/**
 * Asynchronously signs in using a phone number.
 */
export function verifyPhoneNumber(
  auth: Auth,
  phoneNumber: string,
  autoVerifyTimeoutOrForceResend: number | boolean,
  forceResend?: boolean,
): FirebaseAuthTypes.PhoneAuthListener;

/**
 * Authenticates a Firebase client using a popup-based OAuth authentication flow.
 */
export function signInWithPopup(
  auth: Auth,
  provider: FirebaseAuthTypes.AuthProvider,
  resolver?: PopupRedirectResolver,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Authenticates a Firebase client using a full-page redirect flow.
 */
export function signInWithRedirect(
  auth: Auth,
  provider: FirebaseAuthTypes.AuthProvider,
  resolver?: PopupRedirectResolver,
): Promise<void>;

/**
 * Signs out the current user.
 */
export function signOut(auth: Auth): Promise<void>;

/**
 * Asynchronously sets the provided user as Auth.currentUser on the Auth instance.
 */
export function updateCurrentUser(auth: Auth, user: FirebaseAuthTypes.User): Promise<void>;

/**
 * Sets the current language to the default device/browser preference.
 */
export function useDeviceLanguage(auth: Auth): void;

/**
 * Sets the current language to the default device/browser preference.
 */
export function useUserAccessGroup(auth: Auth, userAccessGroup: string): Promise<void>;

/**
 * Verifies the password reset code sent to the user by email or other out-of-band mechanism.
 */
export function verifyPasswordResetCode(auth: Auth, code: string): Promise<string>;

/**
 * Parses the email action link string and returns an ActionCodeURL if the link is valid, otherwise returns null.
 */
export function parseActionCodeURL(link: string): FirebaseAuthTypes.ActionCodeURL | null;

/**
 * Deletes and signs out the user.
 */
export function deleteUser(user: FirebaseAuthTypes.User): Promise<void>;

/**
 * Returns a JSON Web Token (JWT) used to identify the user to a Firebase service.
 */
export function getIdToken(user: FirebaseAuthTypes.User, forceRefresh?: boolean): Promise<string>;

/**
 * Returns a deserialized JSON Web Token (JWT) used to identify the user to a Firebase service.
 */
export function getIdTokenResult(
  user: FirebaseAuthTypes.User,
  forceRefresh?: boolean,
): Promise<FirebaseAuthTypes.IdTokenResult>;

/**
 * Links the user account with the given credentials.
 */
export function linkWithCredential(
  user: FirebaseAuthTypes.User,
  credential: FirebaseAuthTypes.AuthCredential,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Links the user account with the given phone number.
 */
export function linkWithPhoneNumber(
  user: FirebaseAuthTypes.User,
  phoneNumber: string,
  appVerifier: ApplicationVerifier,
): Promise<FirebaseAuthTypes.ConfirmationResult>;

/**
 * Links the authenticated provider to the user account using a pop-up based OAuth flow.
 */
export function linkWithPopup(
  user: FirebaseAuthTypes.User,
  provider: FirebaseAuthTypes.AuthProvider,
  resolver?: PopupRedirectResolver,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Links the OAuthProvider to the user account using a full-page redirect flow.
 */
export function linkWithRedirect(
  user: FirebaseAuthTypes.User,
  provider: FirebaseAuthTypes.AuthProvider,
  resolver?: PopupRedirectResolver,
): Promise<void>;

/**
 * The MultiFactorUser corresponding to the user.
 */
export function multiFactor(user: FirebaseAuthTypes.User): FirebaseAuthTypes.MultiFactorUser;

/**
 * Re-authenticates a user using a fresh credential.
 */
export function reauthenticateWithCredential(
  user: FirebaseAuthTypes.User,
  credential: FirebaseAuthTypes.AuthCredential,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Re-authenticates a user using a fresh phone credential.
 */
export function reauthenticateWithPhoneNumber(
  user: FirebaseAuthTypes.User,
  phoneNumber: string,
  appVerifier: ApplicationVerifier,
): Promise<FirebaseAuthTypes.ConfirmationResult>;

/**
 * Reauthenticates the current user with the specified OAuthProvider using a pop-up based OAuth flow.
 */
export function reauthenticateWithPopup(
  user: FirebaseAuthTypes.User,
  provider: FirebaseAuthTypes.AuthProvider,
  resolver?: PopupRedirectResolver,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Reauthenticates the current user with the specified OAuthProvider using a full-page redirect flow.
 */
export function reauthenticateWithRedirect(
  user: FirebaseAuthTypes.User,
  provider: FirebaseAuthTypes.AuthProvider,
  resolver?: PopupRedirectResolver,
): Promise<void>;

/**
 * Reloads user account data, if signed in.
 */
export function reload(user: FirebaseAuthTypes.User): Promise<void>;

/**
 * Sends a verification email to a user.
 */
export function sendEmailVerification(
  user: FirebaseAuthTypes.User,
  actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
): Promise<void>;

/**
 * Unlinks a provider from a user account.
 */
export function unlink(
  user: FirebaseAuthTypes.User,
  providerId: string,
): Promise<FirebaseAuthTypes.User>;

/**
 * Updates the user's email address.
 */
export function updateEmail(user: FirebaseAuthTypes.User, newEmail: string): Promise<void>;

/**
 * Updates the user's password.
 */
export function updatePassword(user: FirebaseAuthTypes.User, newPassword: string): Promise<void>;

/**
 * Updates the user's phone number.
 */
export function updatePhoneNumber(
  user: FirebaseAuthTypes.User,
  credential: FirebaseAuthTypes.AuthCredential,
): Promise<void>;

/**
 * Updates a user's profile data.
 */
export function updateProfile(
  user: FirebaseAuthTypes.User,
  { displayName, photoURL: photoUrl }: { displayName?: string | null; photoURL?: string | null },
): Promise<void>;

/**
 * Sends a verification email to a new email address.
 */
export function verifyBeforeUpdateEmail(
  user: FirebaseAuthTypes.User,
  newEmail: string,
  actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
): Promise<void>;

/**
 * Extracts provider specific AdditionalUserInfo for the given credential.
 */
export function getAdditionalUserInfo(
  userCredential: FirebaseAuthTypes.UserCredential,
): FirebaseAuthTypes.AdditionalUserInfo | null;
/**
 * Returns the custom auth domain for the auth instance.
 */
export function getCustomAuthDomain(auth: Auth): Promise<string>;

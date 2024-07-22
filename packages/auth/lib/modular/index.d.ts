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
 * @param app - The Firebase app instance.
 * @returns The Auth instance.
 */
export function getAuth(app?: FirebaseApp): Auth;

/**
 * This function allows more control over the Auth instance than getAuth().
 *
 * @param app - The Firebase app instance.
 * @param deps - Optional. Dependencies for the Auth instance.
 * @returns The Auth instance.
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
 * @param auth - The Auth instance.
 * @param oobCode - The out-of-band code sent to the user.
 * @returns A promise that resolves when the code is applied successfully.
 */
export function applyActionCode(auth: Auth, oobCode: string): Promise<void>;

/**
 * Adds a blocking callback that runs before an auth state change sets a new user.
 *
 * @param auth - The Auth instance.
 * @param callback - A callback function to run before the auth state changes.
 * @param onAbort - Optional. A callback function to run if the operation is aborted.
 */
export function beforeAuthStateChanged(
  auth: Auth,
  callback: (user: FirebaseAuthTypes.User | null) => void,
  onAbort?: () => void,
): void;

/**
 * Checks a verification code sent to the user by email or other out-of-band mechanism.
 *
 * @param auth - The Auth instance.
 * @param oobCode - The out-of-band code sent to the user.
 * @returns A promise that resolves with the action code information.
 */
export function checkActionCode(
  auth: Auth,
  oobCode: string,
): Promise<FirebaseAuthTypes.ActionCodeInfo>;

/**
 * Completes the password reset process, given a confirmation code and new password.
 *
 * @param auth - The Auth instance.
 * @param oobCode - The out-of-band code sent to the user.
 * @param newPassword - The new password.
 * @returns A promise that resolves when the password is reset.
 */
export function confirmPasswordReset(
  auth: Auth,
  oobCode: string,
  newPassword: string,
): Promise<void>;

/**
 * Changes the Auth instance to communicate with the Firebase Auth Emulator, instead of production Firebase Auth services.
 *
 * @param auth - The Auth instance.
 * @param url - The URL of the Firebase Auth Emulator.
 * @param options - Optional. Options for the emulator connection.
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
 *
 * @param auth - The Auth instance.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A promise that resolves with the user credentials.
 */
export function createUserWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Gets the list of possible sign in methods for the given email address.
 *
 * @param auth - The Auth instance.
 * @param email - The user's email address.
 * @returns A promise that resolves with the list of sign-in methods.
 */
export function fetchSignInMethodsForEmail(auth: Auth, email: string): Promise<string[]>;

/**
 * Provides a MultiFactorResolver suitable for completion of a multi-factor flow.
 *
 * @param auth - The Auth instance.
 * @param error - The multi-factor error.
 * @returns The MultiFactorResolver instance.
 */
export function getMultiFactorResolver(
  auth: Auth,
  error: FirebaseAuthTypes.MultiFactorError,
): FirebaseAuthTypes.MultiFactorResolver;

/**
 * Returns a UserCredential from the redirect-based sign-in flow.
 *
 * @param auth - The Auth instance.
 * @param resolver - Optional. The popup redirect resolver.
 * @returns A promise that resolves with the user credentials or null.
 */
export interface PopupRedirectResolver {}

export function getRedirectResult(
  auth: Auth,
  resolver?: PopupRedirectResolver,
): Promise<FirebaseAuthTypes.UserCredential | null>;

/**
 * Checks if an incoming link is a sign-in with email link suitable for signInWithEmailLink().
 *
 * @param auth - The Auth instance.
 * @param emailLink - The email link to check.
 * @returns True if the link is a sign-in with email link.
 */
export function isSignInWithEmailLink(auth: Auth, emailLink: string): boolean;

/**
 * Adds an observer for changes to the user's sign-in state.
 *
 * @param auth - The Auth instance.
 * @param nextOrObserver - A callback function or observer for auth state changes.
 * @returns A function to unsubscribe from the auth state changes.
 */
export function onAuthStateChanged(
  auth: Auth,
  nextOrObserver: CallbackOrObserver<AuthListenerCallback>,
): () => void;

/**
 * Adds an observer for changes to the signed-in user's ID token.
 *
 * @param auth - The Auth instance.
 * @param nextOrObserver - A callback function or observer for ID token changes.
 * @returns A function to unsubscribe from the ID token changes.
 */
export function onIdTokenChanged(
  auth: Auth,
  nextOrObserver: CallbackOrObserver<AuthListenerCallback>,
): () => void;

/**
 * Sends a password reset email to the given email address.
 *
 * @param auth - The Auth instance.
 * @param email - The user's email address.
 * @param actionCodeSettings - Optional. Action code settings.
 * @returns A promise that resolves when the email is sent.
 */
export function sendPasswordResetEmail(
  auth: Auth,
  email: string,
  actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
): Promise<void>;

/**
 * Sends a sign-in email link to the user with the specified email.
 *
 * @param auth - The Auth instance.
 * @param email - The user's email address.
 * @param actionCodeSettings - Optional. Action code settings.
 * @returns A promise that resolves when the email is sent.
 */
export function sendSignInLinkToEmail(
  auth: Auth,
  email: string,
  actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
): Promise<void>;

/**
 * Type of Persistence.
 * - 'SESSION' is used for temporary persistence such as `sessionStorage`.
 * - 'LOCAL' is used for long term persistence such as `localStorage` or `IndexedDB`.
 * - 'NONE' is used for in-memory, or no persistence.
 */
export type Persistence = {
  readonly type: 'SESSION' | 'LOCAL' | 'NONE';
};

/**
 * Changes the type of persistence on the Auth instance for the currently saved Auth session and applies this type of persistence for future sign-in requests, including sign-in with redirect requests.
 *
 * @param auth - The Auth instance.
 * @param persistence - The persistence type.
 * @returns A promise that resolves when the persistence is set.
 */
export function setPersistence(auth: Auth, persistence: Persistence): Promise<void>;

/**
 * Asynchronously signs in as an anonymous user.
 *
 * @param auth - The Auth instance.
 * @returns A promise that resolves with the user credentials.
 */
export function signInAnonymously(auth: Auth): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Asynchronously signs in with the given credentials.
 *
 * @param auth - The Auth instance.
 * @param credential - The auth credentials.
 * @returns A promise that resolves with the user credentials.
 */
export function signInWithCredential(
  auth: Auth,
  credential: FirebaseAuthTypes.AuthCredential,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Asynchronously signs in using a custom token.
 *
 * @param auth - The Auth instance.
 * @param customToken - The custom token.
 * @returns A promise that resolves with the user credentials.
 */
export function signInWithCustomToken(
  auth: Auth,
  customToken: string,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Asynchronously signs in using an email and password.
 *
 * @param auth - The Auth instance.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A promise that resolves with the user credentials.
 */
export function signInWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Asynchronously signs in using an email and sign-in email link.
 *
 * @param auth - The Auth instance.
 * @param email - The user's email address.
 * @param emailLink - The email link.
 * @returns A promise that resolves with the user credentials.
 */
export function signInWithEmailLink(
  auth: Auth,
  email: string,
  emailLink: string,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Interface representing an application verifier.
 */
export interface ApplicationVerifier {
  type: string;
  verify(): Promise<string>;
}

/**
 * Asynchronously signs in using a phone number.
 *
 * @param auth - The Auth instance.
 * @param phoneNumber - The user's phone number.
 * @param appVerifier - The application verifier.
 * @returns A promise that resolves with the confirmation result.
 */
export function signInWithPhoneNumber(
  auth: Auth,
  phoneNumber: string,
  appVerifier: ApplicationVerifier,
): Promise<FirebaseAuthTypes.ConfirmationResult>;

/**
 * Asynchronously signs in using a phone number.
 *
 * @param auth - The Auth instance.
 * @param phoneNumber - The user's phone number.
 * @param autoVerifyTimeoutOrForceResend - The auto verify timeout or force resend flag.
 * @param forceResend - Optional. Whether to force resend.
 * @returns A promise that resolves with the phone auth listener.
 */
export function verifyPhoneNumber(
  auth: Auth,
  phoneNumber: string,
  autoVerifyTimeoutOrForceResend: number | boolean,
  forceResend?: boolean,
): FirebaseAuthTypes.PhoneAuthListener;

/**
 * Authenticates a Firebase client using a popup-based OAuth authentication flow.
 *
 * @param auth - The Auth instance.
 * @param provider - The auth provider.
 * @param resolver - Optional. The popup redirect resolver.
 * @returns A promise that resolves with the user credentials.
 */
export function signInWithPopup(
  auth: Auth,
  provider: FirebaseAuthTypes.AuthProvider,
  resolver?: PopupRedirectResolver,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Authenticates a Firebase client using a full-page redirect flow.
 *
 * @param auth - The Auth instance.
 * @param provider - The auth provider.
 * @param resolver - Optional. The popup redirect resolver.
 * @returns A promise that resolves when the redirect is complete.
 */
export function signInWithRedirect(
  auth: Auth,
  provider: FirebaseAuthTypes.AuthProvider,
  resolver?: PopupRedirectResolver,
): Promise<void>;

/**
 * Signs out the current user.
 *
 * @param auth - The Auth instance.
 * @returns A promise that resolves when the user is signed out.
 */
export function signOut(auth: Auth): Promise<void>;

/**
 * Asynchronously sets the provided user as Auth.currentUser on the Auth instance.
 *
 * @param auth - The Auth instance.
 * @param user - The user to set as the current user.
 * @returns A promise that resolves when the user is set.
 */
export function updateCurrentUser(auth: Auth, user: FirebaseAuthTypes.User): Promise<void>;

/**
 * Sets the current language to the default device/browser preference.
 *
 * @param auth - The Auth instance.
 */
export function useDeviceLanguage(auth: Auth): void;

/**
 * Sets the current language to the default device/browser preference.
 *
 * @param auth - The Auth instance.
 * @param userAccessGroup - The user access group.
 * @returns A promise that resolves when the user access group is set.
 */
export function useUserAccessGroup(auth: Auth, userAccessGroup: string): Promise<void>;

/**
 * Verifies the password reset code sent to the user by email or other out-of-band mechanism.
 *
 * @param auth - The Auth instance.
 * @param code - The password reset code.
 * @returns A promise that resolves with the user's email address.
 */
export function verifyPasswordResetCode(auth: Auth, code: string): Promise<string>;

/**
 * Parses the email action link string and returns an ActionCodeURL if the link is valid, otherwise returns null.
 *
 * @param link - The email action link string.
 * @returns The ActionCodeURL if the link is valid, otherwise null.
 */
export function parseActionCodeURL(link: string): FirebaseAuthTypes.ActionCodeURL | null;

/**
 * Deletes and signs out the user.
 *
 * @param user - The user to delete.
 * @returns A promise that resolves when the user is deleted.
 */
export function deleteUser(user: FirebaseAuthTypes.User): Promise<void>;

/**
 * Returns a JSON Web Token (JWT) used to identify the user to a Firebase service.
 *
 * @param user - The user to get the token for.
 * @param forceRefresh - Optional. Whether to force refresh the token.
 * @returns A promise that resolves with the token.
 */
export function getIdToken(user: FirebaseAuthTypes.User, forceRefresh?: boolean): Promise<string>;

/**
 * Returns a deserialized JSON Web Token (JWT) used to identify the user to a Firebase service.
 *
 * @param user - The user to get the token result for.
 * @param forceRefresh - Optional. Whether to force refresh the token.
 * @returns A promise that resolves with the token result.
 */
export function getIdTokenResult(
  user: FirebaseAuthTypes.User,
  forceRefresh?: boolean,
): Promise<FirebaseAuthTypes.IdTokenResult>;

/**
 * Links the user account with the given credentials.
 *
 * @param user - The user to link the credentials with.
 * @param credential - The auth credentials.
 * @returns A promise that resolves with the user credentials.
 */
export function linkWithCredential(
  user: FirebaseAuthTypes.User,
  credential: FirebaseAuthTypes.AuthCredential,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Links the user account with the given phone number.
 *
 * @param user - The user to link the phone number with.
 * @param phoneNumber - The phone number.
 * @param appVerifier - The application verifier.
 * @returns A promise that resolves with the confirmation result.
 */
export function linkWithPhoneNumber(
  user: FirebaseAuthTypes.User,
  phoneNumber: string,
  appVerifier: ApplicationVerifier,
): Promise<FirebaseAuthTypes.ConfirmationResult>;

/**
 * Links the authenticated provider to the user account using a pop-up based OAuth flow.
 *
 * @param user - The user to link the provider with.
 * @param provider - The auth provider.
 * @param resolver - Optional. The popup redirect resolver.
 * @returns A promise that resolves with the user credentials.
 */
export function linkWithPopup(
  user: FirebaseAuthTypes.User,
  provider: FirebaseAuthTypes.AuthProvider,
  resolver?: PopupRedirectResolver,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Links the OAuthProvider to the user account using a full-page redirect flow.
 *
 * @param user - The user to link the provider with.
 * @param provider - The auth provider.
 * @param resolver - Optional. The popup redirect resolver.
 * @returns A promise that resolves when the redirect is complete.
 */
export function linkWithRedirect(
  user: FirebaseAuthTypes.User,
  provider: FirebaseAuthTypes.AuthProvider,
  resolver?: PopupRedirectResolver,
): Promise<void>;

/**
 * The MultiFactorUser corresponding to the user.
 *
 * @param user - The user to get the multi-factor user for.
 * @returns The MultiFactorUser instance.
 */
export function multiFactor(user: FirebaseAuthTypes.User): FirebaseAuthTypes.MultiFactorUser;

/**
 * Re-authenticates a user using a fresh credential.
 *
 * @param user - The user to re-authenticate.
 * @param credential - The auth credentials.
 * @returns A promise that resolves with the user credentials.
 */
export function reauthenticateWithCredential(
  user: FirebaseAuthTypes.User,
  credential: FirebaseAuthTypes.AuthCredential,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Re-authenticates a user using a fresh phone credential.
 *
 * @param user - The user to re-authenticate.
 * @param phoneNumber - The phone number.
 * @param appVerifier - The application verifier.
 * @returns A promise that resolves with the confirmation result.
 */
export function reauthenticateWithPhoneNumber(
  user: FirebaseAuthTypes.User,
  phoneNumber: string,
  appVerifier: ApplicationVerifier,
): Promise<FirebaseAuthTypes.ConfirmationResult>;

/**
 * Reauthenticates the current user with the specified OAuthProvider using a pop-up based OAuth flow.
 *
 * @param user - The user to re-authenticate.
 * @param provider - The auth provider.
 * @param resolver - Optional. The popup redirect resolver.
 * @returns A promise that resolves with the user credentials.
 */
export function reauthenticateWithPopup(
  user: FirebaseAuthTypes.User,
  provider: FirebaseAuthTypes.AuthProvider,
  resolver?: PopupRedirectResolver,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Reauthenticates the current user with the specified OAuthProvider using a full-page redirect flow.
 *
 * @param user - The user to re-authenticate.
 * @param provider - The auth provider.
 * @param resolver - Optional. The popup redirect resolver.
 * @returns A promise that resolves when the redirect is complete.
 */
export function reauthenticateWithRedirect(
  user: FirebaseAuthTypes.User,
  provider: FirebaseAuthTypes.AuthProvider,
  resolver?: PopupRedirectResolver,
): Promise<void>;

/**
 * Reloads user account data, if signed in.
 *
 * @param user - The user to reload data for.
 * @returns A promise that resolves when the data is reloaded.
 */
export function reload(user: FirebaseAuthTypes.User): Promise<void>;

/**
 * Sends a verification email to a user.
 *
 * @param user - The user to send the email to.
 * @param actionCodeSettings - Optional. Action code settings.
 * @returns A promise that resolves when the email is sent.
 */
export function sendEmailVerification(
  user: FirebaseAuthTypes.User,
  actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
): Promise<void>;

/**
 * Unlinks a provider from a user account.
 *
 * @param user - The user to unlink the provider from.
 * @param providerId - The provider ID.
 * @returns A promise that resolves with the user.
 */
export function unlink(
  user: FirebaseAuthTypes.User,
  providerId: string,
): Promise<FirebaseAuthTypes.User>;

/**
 * Updates the user's email address.
 *
 * @param user - The user to update the email for.
 * @param newEmail - The new email address.
 * @returns A promise that resolves when the email is updated.
 */
export function updateEmail(user: FirebaseAuthTypes.User, newEmail: string): Promise<void>;

/**
 * Updates the user's password.
 *
 * @param user - The user to update the password for.
 * @param newPassword - The new password.
 * @returns A promise that resolves when the password is updated.
 */
export function updatePassword(user: FirebaseAuthTypes.User, newPassword: string): Promise<void>;

/**
 * Updates the user's phone number.
 *
 * @param user - The user to update the phone number for.
 * @param credential - The auth credentials.
 * @returns A promise that resolves when the phone number is updated.
 */
export function updatePhoneNumber(
  user: FirebaseAuthTypes.User,
  credential: FirebaseAuthTypes.AuthCredential,
): Promise<void>;

/**
 * Updates a user's profile data.
 *
 * @param user - The user to update the profile for.
 * @param profile - An object containing the profile data to update.
 * @returns A promise that resolves when the profile is updated.
 */
export function updateProfile(
  user: FirebaseAuthTypes.User,
  { displayName, photoURL: photoUrl }: { displayName?: string | null; photoURL?: string | null },
): Promise<void>;

/**
 * Sends a verification email to a new email address.
 *
 * @param user - The user to send the email to.
 * @param newEmail - The new email address.
 * @param actionCodeSettings - Optional. Action code settings.
 * @returns A promise that resolves when the email is sent.
 */
export function verifyBeforeUpdateEmail(
  user: FirebaseAuthTypes.User,
  newEmail: string,
  actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
): Promise<void>;

/**
 * Extracts provider specific AdditionalUserInfo for the given credential.
 *
 * @param userCredential - The user credential.
 * @returns The additional user information, or null if none is available.
 */
export function getAdditionalUserInfo(
  userCredential: FirebaseAuthTypes.UserCredential,
): FirebaseAuthTypes.AdditionalUserInfo | null;

/**
 * Returns the custom auth domain for the auth instance.
 *
 * @param auth - The Auth instance.
 * @returns A promise that resolves with the custom auth domain.
 */
export function getCustomAuthDomain(auth: Auth): Promise<string>;

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

import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseAuthTypes, CallbackOrObserver } from '../index';
import { firebase } from '..';

import Auth = FirebaseAuthTypes.Module;
import FirebaseApp = ReactNativeFirebase.FirebaseApp;

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
 *
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
export function getRedirectResult(
  auth: Auth,
  resolver?: PopupRedirectResolver,
): Promise<FirebaseAuthTypes.UserCredential | null>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PopupRedirectResolver {}

/**
 * Loads the reCAPTCHA configuration into the Auth instance.
 * Does not work in a Node.js environment
 * @param auth - The Auth instance.
 */
export function initializeRecaptchaConfig(auth: Auth): Promise<void>;

/**
 * Checks if an incoming link is a sign-in with email link suitable for signInWithEmailLink.
 * Note that android and other platforms require `apiKey` link parameter for signInWithEmailLink
 *
 * @param auth - The Auth instance.
 * @param emailLink - The email link to check.
 * @returns A promise that resolves if the link is a sign-in with email link.
 */
export function isSignInWithEmailLink(auth: Auth, emailLink: string): Promise<boolean>;

/**
 * Adds an observer for changes to the user's sign-in state.
 *
 * @param auth - The Auth instance.
 * @param nextOrObserver - A callback function or observer for auth state changes.
 * @returns A function to unsubscribe from the auth state changes.
 */
export function onAuthStateChanged(
  auth: Auth,
  nextOrObserver: CallbackOrObserver<FirebaseAuthTypes.AuthListenerCallback>,
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
  nextOrObserver: CallbackOrObserver<FirebaseAuthTypes.AuthListenerCallback>,
): () => void;

/**
 * Revoke the given access token, Currently only supports Apple OAuth access tokens.
 * @param auth
 * @param token
 */
export declare function revokeAccessToken(auth: Auth, token: string): Promise<void>;

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
 * @param actionCodeSettings - Optional, Action code settings.
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
  readonly type: string;
  verify(): Promise<string>;
}

/**
 * Asynchronously signs in using a phone number.
 *
 * @param auth - The Auth instance.
 * @param phoneNumber - The user's phone number.
 * @param appVerifier - Optional. The application verifier.
 * @param forceResend - Optional. (Native only) Forces a new message to be sent if it was already recently sent.
 * @returns A promise that resolves with the confirmation result.
 */
export function signInWithPhoneNumber(
  auth: Auth,
  phoneNumber: string,
  appVerifier?: ApplicationVerifier,
  forceResend?: boolean,
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
): Promise<never>;

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
export function updateCurrentUser(auth: Auth, user: FirebaseAuthTypes.User | null): Promise<void>;

/**
 * Sets the current language to the default device/browser preference.
 *
 * @param auth - The Auth instance.
 */
export function useDeviceLanguage(auth: Auth): void;

/**
 * Sets the language code.
 *
 * #### Example
 *
 * ```js
 * // Set language to French
 * await firebase.auth().setLanguageCode('fr');
 * ```
 * @param auth - The Auth instance.
 * @param languageCode An ISO language code.
 * 'null' value will set the language code to the app's current language.
 */
export function setLanguageCode(auth: Auth, languageCode: string | null): Promise<void>;

/**
 * Validates the password against the password policy configured for the project or tenant.
 *
 * @param auth - The Auth instance.
 * @param password - The password to validate.
 *
 */
export function validatePassword(auth: Auth, password: string): Promise<PasswordValidationStatus>;

/**
 * Configures a shared user access group to sync auth state across multiple apps via the Keychain.
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
  appVerifier?: ApplicationVerifier,
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
  appVerifier?: ApplicationVerifier,
): Promise<FirebaseAuthTypes.ConfirmationResult>;

/**
 * Re-authenticate a user with a federated authentication provider (Microsoft, Yahoo). For native platforms, this will open a browser window.
 *
 * @param user - The user to re-authenticate.
 * @param provider - The auth provider.
 * @param resolver - Optional. The popup redirect resolver. Web only.
 * @returns A promise that resolves with the user credentials.
 */
export function reauthenticateWithPopup(
  user: FirebaseAuthTypes.User,
  provider: FirebaseAuthTypes.AuthProvider,
  resolver?: PopupRedirectResolver,
): Promise<FirebaseAuthTypes.UserCredential>;

/**
 * Re-authenticate a user with a federated authentication provider (Microsoft, Yahoo). For native platforms, this will open a browser window.
 *
 * @param user - The user to re-authenticate.
 * @param provider - The auth provider.
 * @param resolver - Optional. The popup redirect resolver. Web only.
 * @returns A promise that resolves with no value.
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
  actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings | null,
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
 * @returns {Promise<string>} A promise that resolves with the custom auth domain.
 */
export function getCustomAuthDomain(auth: Auth): Promise<string>;

/**
 * Validates the password against the password policy configured for the project or tenant.
 *
 * @remarks
 * If no tenant ID is set on the `Auth` instance, then this method will use the password
 * policy configured for the project. Otherwise, this method will use the policy configured
 * for the tenant. If a password policy has not been configured, then the default policy
 * configured for all projects will be used.
 *
 * If an auth flow fails because a submitted password does not meet the password policy
 * requirements and this method has previously been called, then this method will use the
 * most recent policy available when called again.
 *
 * When using this method, ensure you have the Identity Toolkit enabled on the
 * Google Cloud Platform with the API Key for your application permitted to use it.
 *
 * @example
 * ``` js
 * import { getAuth, validatePassword } from "firebase/auth";
 *
 * const status = await validatePassword(getAuth(), passwordFromUser);
 * if (!status.isValid) {
 * // Password could not be validated. Use the status to show what
 * // requirements are met and which are missing.
 *
 * // If a criterion is undefined, it is not required by policy. If the
 * // criterion is defined but false, it is required but not fulfilled by
 * // the given password. For example:
 *   const needsLowerCase = status.containsLowercaseLetter !== true;
 * }
 * ```
 *
 * @param auth The {@link Auth} instance.
 * @param password The password to validate.
 *
 * @public
 */
export function validatePassword(auth: Auth, password: string): Promise<PasswordValidationStatus>;

/**
 * A structure indicating which password policy requirements were met or violated and what the
 * requirements are.
 *
 * @public
 */
export interface PasswordValidationStatus {
  /**
   * Whether the password meets all requirements.
   */
  readonly isValid: boolean;
  /**
   * Whether the password meets the minimum password length, or undefined if not required.
   */
  readonly meetsMinPasswordLength?: boolean;
  /**
   * Whether the password meets the maximum password length, or undefined if not required.
   */
  readonly meetsMaxPasswordLength?: boolean;
  /**
   * Whether the password contains a lowercase letter, or undefined if not required.
   */
  readonly containsLowercaseLetter?: boolean;
  /**
   * Whether the password contains an uppercase letter, or undefined if not required.
   */
  readonly containsUppercaseLetter?: boolean;
  /**
   * Whether the password contains a numeric character, or undefined if not required.
   */
  readonly containsNumericCharacter?: boolean;
  /**
   * Whether the password contains a non-alphanumeric character, or undefined if not required.
   */
  readonly containsNonAlphanumericCharacter?: boolean;
  /**
   * The policy used to validate the password.
   */
  readonly passwordPolicy: PasswordPolicy;
}

export {
  AppleAuthProvider,
  EmailAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  OIDCAuthProvider,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  TotpSecret,
  TwitterAuthProvider,
  PhoneAuthState,
} from '../index';

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

import { getApp } from '@react-native-firebase/app';
import type { FirebaseApp } from '@react-native-firebase/app';
import { MultiFactorUser } from './multiFactor';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type {
  FirebaseAuth,
  User,
  UserCredential,
  AuthCredential,
  AuthProvider,
  ActionCodeInfo,
  ActionCodeSettings,
  ConfirmationResult,
  MultiFactorResolver,
  MultiFactorError,
  AdditionalUserInfo,
  IdTokenResult,
} from './types/auth';
import type { AuthInternal } from './types/internal';

/**
 * Returns the Auth instance associated with the provided FirebaseApp.
 * @param app - The Firebase app instance.
 * @returns The Auth instance.
 */
export function getAuth(app?: FirebaseApp): FirebaseAuth {
  if (app) {
    return getApp(app.name).auth() as FirebaseAuth;
  }
  return getApp().auth() as FirebaseAuth;
}

/**
 * This function allows more control over the Auth instance than getAuth().
 * @param app - The Firebase app instance.
 * @param deps - Optional. Dependencies for the Auth instance.
 * @returns The Auth instance.
 */
export function initializeAuth(app: FirebaseApp, _deps?: unknown): FirebaseAuth {
  if (app) {
    return getApp(app.name).auth() as FirebaseAuth;
  }
  return getApp().auth() as FirebaseAuth;
}

/**
 * Applies a verification code sent to the user by email or other out-of-band mechanism.
 * @param {Auth} auth - The Auth instance.
 * @param {string} oobCode - The out-of-band code sent to the user.
 * @returns {Promise<void>}
 */
export async function applyActionCode(auth: FirebaseAuth, oobCode: string): Promise<void> {
  return (auth as AuthInternal).applyActionCode.call(auth, oobCode, MODULAR_DEPRECATION_ARG);
}

/**
 * Adds a blocking callback that runs before an auth state change sets a new user.
 * @param {Auth} auth - The Auth instance.
 * @param {(user: User | null) => void} callback - A callback function to run before the auth state changes.
 * @param {() => void} [onAbort] - Optional. A callback function to run if the operation is aborted.
 */
export function beforeAuthStateChanged(
  _auth: FirebaseAuth,
  _callback: (user: User | null) => void,
  _onAbort?: () => void,
): void {
  throw new Error('beforeAuthStateChanged is unsupported by the native Firebase SDKs');
}

/**
 * Checks a verification code sent to the user by email or other out-of-band mechanism.
 * @param {Auth} auth - The Auth instance.
 * @param {string} oobCode - The out-of-band code sent to the user.
 * @returns {Promise<ActionCodeInfo>}
 */
export async function checkActionCode(auth: FirebaseAuth, oobCode: string): Promise<ActionCodeInfo> {
  return (auth as AuthInternal).checkActionCode.call(auth, oobCode, MODULAR_DEPRECATION_ARG);
}

/**
 * Completes the password reset process, given a confirmation code and new password.
 * @param {Auth} auth - The Auth instance.
 * @param {string} oobCode - The out-of-band code sent to the user.
 * @param {string} newPassword - The new password.
 * @returns {Promise<void>}
 */
export async function confirmPasswordReset(
  auth: FirebaseAuth,
  oobCode: string,
  newPassword: string,
): Promise<void> {
  return (auth as AuthInternal).confirmPasswordReset.call(
    auth,
    oobCode,
    newPassword,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Changes the Auth instance to communicate with the Firebase Auth Emulator, instead of production Firebase Auth services.
 * @param {Auth} auth - The Auth instance.
 * @param {string} url - The URL of the Firebase Auth Emulator.
 * @param {{ disableWarnings: boolean }} [options] - Optional. Options for the emulator connection.
 */
export function connectAuthEmulator(
  auth: FirebaseAuth,
  url: string,
  options?: { disableWarnings?: boolean },
): void {
  ((auth as AuthInternal).useEmulator as (url: string, options?: unknown, ...args: unknown[]) => void).call(
    auth,
    url,
    options,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Creates a new user account associated with the specified email address and password.
 * @param {Auth} auth - The Auth instance.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<UserCredential>}
 */
export async function createUserWithEmailAndPassword(
  auth: FirebaseAuth,
  email: string,
  password: string,
): Promise<UserCredential> {
  return (auth as AuthInternal).createUserWithEmailAndPassword.call(
    auth,
    email,
    password,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Gets the list of possible sign in methods for the given email address.
 * @param {Auth} auth - The Auth instance.
 * @param {string} email - The user's email address.
 * @returns {Promise<string[]>}
 */
export async function fetchSignInMethodsForEmail(
  auth: FirebaseAuth,
  email: string,
): Promise<string[]> {
  return (auth as AuthInternal).fetchSignInMethodsForEmail.call(auth, email, MODULAR_DEPRECATION_ARG);
}

/**
 * Provides a MultiFactorResolver suitable for completion of a multi-factor flow.
 * @param {Auth} auth - The Auth instance.
 * @param {MultiFactorError} error - The multi-factor error.
 * @returns {MultiFactorResolver}
 */
export function getMultiFactorResolver(
  auth: FirebaseAuth,
  error: MultiFactorError,
): MultiFactorResolver | null {
  return (auth as AuthInternal).getMultiFactorResolver.call(auth, error, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a UserCredential from the redirect-based sign-in flow.
 * @param {Auth} auth - The Auth instance.
 * @param {PopupRedirectResolver} [resolver] - Optional. The popup redirect resolver.
 * @returns {Promise<UserCredential | null>}
 */
export async function getRedirectResult(
  _auth: FirebaseAuth,
  _resolver?: unknown,
): Promise<UserCredential | null> {
  throw new Error('getRedirectResult is unsupported by the native Firebase SDKs');
}

export function isSignInWithEmailLink(auth: FirebaseAuth, emailLink: string): Promise<boolean> {
  return (auth as AuthInternal).isSignInWithEmailLink.call(auth, emailLink, MODULAR_DEPRECATION_ARG);
}

export function onAuthStateChanged(
  auth: FirebaseAuth,
  nextOrObserver: (user: User | null) => void | { next: (user: User | null) => void },
): () => void {
  return (auth as AuthInternal).onAuthStateChanged.call(auth, nextOrObserver, MODULAR_DEPRECATION_ARG);
}

export function onIdTokenChanged(
  auth: FirebaseAuth,
  nextOrObserver: (user: User | null) => void | { next: (user: User | null) => void },
): () => void {
  return (auth as AuthInternal).onIdTokenChanged.call(auth, nextOrObserver, MODULAR_DEPRECATION_ARG);
}

export async function revokeAccessToken(_auth: FirebaseAuth, _token: string): Promise<void> {
  throw new Error('revokeAccessToken() is only supported on Web');
}

export async function sendPasswordResetEmail(
  auth: FirebaseAuth,
  email: string,
  actionCodeSettings?: ActionCodeSettings | null,
): Promise<void> {
  return (auth as AuthInternal).sendPasswordResetEmail.call(
    auth,
    email,
    actionCodeSettings,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function sendSignInLinkToEmail(
  auth: FirebaseAuth,
  email: string,
  actionCodeSettings?: ActionCodeSettings,
): Promise<void> {
  return (auth as AuthInternal).sendSignInLinkToEmail.call(
    auth,
    email,
    actionCodeSettings,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function setPersistence(_auth: FirebaseAuth, _persistence: unknown): Promise<void> {
  throw new Error('setPersistence is unsupported by the native Firebase SDKs');
}

export async function signInAnonymously(auth: FirebaseAuth): Promise<UserCredential> {
  return (auth as AuthInternal).signInAnonymously.call(auth, MODULAR_DEPRECATION_ARG);
}

export async function signInWithCredential(
  auth: FirebaseAuth,
  credential: AuthCredential,
): Promise<UserCredential> {
  return (auth as AuthInternal).signInWithCredential.call(auth, credential, MODULAR_DEPRECATION_ARG);
}

export async function signInWithCustomToken(
  auth: FirebaseAuth,
  customToken: string,
): Promise<UserCredential> {
  return (auth as AuthInternal).signInWithCustomToken.call(
    auth,
    customToken,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function signInWithEmailAndPassword(
  auth: FirebaseAuth,
  email: string,
  password: string,
): Promise<UserCredential> {
  return (auth as AuthInternal).signInWithEmailAndPassword.call(
    auth,
    email,
    password,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function signInWithEmailLink(
  auth: FirebaseAuth,
  email: string,
  emailLink: string,
): Promise<UserCredential> {
  return (auth as AuthInternal).signInWithEmailLink.call(
    auth,
    email,
    emailLink,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function signInWithPhoneNumber(
  auth: FirebaseAuth,
  phoneNumber: string,
  appVerifier?: boolean,
): Promise<ConfirmationResult> {
  return (auth as AuthInternal).signInWithPhoneNumber.call(
    auth,
    phoneNumber,
    appVerifier,
    MODULAR_DEPRECATION_ARG,
  );
}

export function verifyPhoneNumber(
  auth: FirebaseAuth,
  phoneNumber: string,
  autoVerifyTimeoutOrForceResend?: number | boolean,
  forceResend?: boolean,
): unknown {
  return (auth as AuthInternal).verifyPhoneNumber.call(
    auth,
    phoneNumber,
    autoVerifyTimeoutOrForceResend,
    forceResend,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function signInWithPopup(
  auth: FirebaseAuth,
  provider: AuthProvider,
  resolver?: unknown,
): Promise<UserCredential> {
  return (auth as AuthInternal).signInWithPopup.call(
    auth,
    provider,
    resolver,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function signInWithRedirect(
  auth: FirebaseAuth,
  provider: AuthProvider,
  resolver?: unknown,
): Promise<UserCredential> {
  return (auth as AuthInternal).signInWithRedirect.call(
    auth,
    provider,
    resolver,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function signOut(auth: FirebaseAuth): Promise<void> {
  return (auth as AuthInternal).signOut.call(auth, MODULAR_DEPRECATION_ARG);
}

export async function updateCurrentUser(_auth: FirebaseAuth, _user: User | null): Promise<void> {
  throw new Error('updateCurrentUser is unsupported by the native Firebase SDKs');
}

export function useDeviceLanguage(_auth: FirebaseAuth): void {
  throw new Error('useDeviceLanguage is unsupported by the native Firebase SDKs');
}

export function setLanguageCode(auth: FirebaseAuth, languageCode: string): Promise<void> {
  return (auth as AuthInternal).setLanguageCode.call(
    auth,
    languageCode,
    MODULAR_DEPRECATION_ARG,
  );
}

export function useUserAccessGroup(
  auth: FirebaseAuth,
  userAccessGroup: string,
): Promise<null> {
  return (auth as AuthInternal).useUserAccessGroup.call(
    auth,
    userAccessGroup,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function verifyPasswordResetCode(
  auth: FirebaseAuth,
  code: string,
): Promise<string> {
  return (auth as AuthInternal).verifyPasswordResetCode.call(auth, code, MODULAR_DEPRECATION_ARG);
}

export function parseActionCodeURL(_link: string): unknown {
  throw new Error('parseActionCodeURL is unsupported by the native Firebase SDKs');
}

export async function deleteUser(user: User): Promise<void> {
  return (user as { delete: (...args: unknown[]) => Promise<void> }).delete.call(
    user,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function getIdToken(user: User, forceRefresh?: boolean): Promise<string> {
  return (user as { getIdToken: (...args: unknown[]) => Promise<string> }).getIdToken.call(
    user,
    forceRefresh,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function getIdTokenResult(
  user: User,
  forceRefresh?: boolean,
): Promise<IdTokenResult> {
  return (user as unknown as { getIdTokenResult: (...args: unknown[]) => Promise<IdTokenResult> }).getIdTokenResult.call(
    user,
    forceRefresh,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Links the user account with the given credentials.
 * @param {User} user - The user to link the credentials with.
 * @param {AuthCredential} credential - The auth credentials.
 * @returns {Promise<UserCredential>}
 */
export async function linkWithCredential(
  user: User,
  credential: AuthCredential,
): Promise<UserCredential> {
  return (user as unknown as { linkWithCredential: (...args: unknown[]) => Promise<UserCredential> }).linkWithCredential.call(
    user,
    credential,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function linkWithPhoneNumber(
  _user: User,
  _phoneNumber: string,
  _appVerifier: unknown,
): Promise<ConfirmationResult> {
  throw new Error('linkWithPhoneNumber is unsupported by the native Firebase SDKs');
}

export async function linkWithPopup(
  user: User,
  provider: AuthProvider,
  resolver?: unknown,
): Promise<UserCredential> {
  return (user as unknown as { linkWithPopup: (...args: unknown[]) => Promise<UserCredential> }).linkWithPopup.call(
    user,
    provider,
    resolver,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function linkWithRedirect(
  user: User,
  provider: AuthProvider,
  resolver?: unknown,
): Promise<UserCredential> {
  return (user as unknown as { linkWithRedirect: (...args: unknown[]) => Promise<UserCredential> }).linkWithRedirect.call(
    user,
    provider,
    resolver,
    MODULAR_DEPRECATION_ARG,
  );
}

export function multiFactor(user: User): MultiFactorUser {
  return new MultiFactorUser(getAuth() as AuthInternal, user);
}

export async function reauthenticateWithCredential(
  user: User,
  credential: AuthCredential,
): Promise<UserCredential> {
  return (user as unknown as { reauthenticateWithCredential: (...args: unknown[]) => Promise<UserCredential> }).reauthenticateWithCredential.call(
    user,
    credential,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function reauthenticateWithPhoneNumber(
  _user: User,
  _phoneNumber: string,
  _appVerifier: unknown,
): Promise<ConfirmationResult> {
  throw new Error('reauthenticateWithPhoneNumber is unsupported by the native Firebase SDKs');
}

export async function reauthenticateWithPopup(
  user: User,
  provider: AuthProvider,
  resolver?: unknown,
): Promise<UserCredential> {
  return (user as unknown as { reauthenticateWithPopup: (...args: unknown[]) => Promise<UserCredential> }).reauthenticateWithPopup.call(
    user,
    provider,
    resolver,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function reauthenticateWithRedirect(
  user: User,
  provider: AuthProvider,
  resolver?: unknown,
): Promise<UserCredential> {
  return (user as unknown as { reauthenticateWithRedirect: (...args: unknown[]) => Promise<UserCredential> }).reauthenticateWithRedirect.call(
    user,
    provider,
    resolver,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function reload(user: User): Promise<void> {
  return (user as { reload: (...args: unknown[]) => Promise<void> }).reload.call(
    user,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function sendEmailVerification(
  user: User,
  actionCodeSettings?: ActionCodeSettings,
): Promise<void> {
  return (user as unknown as { sendEmailVerification: (...args: unknown[]) => Promise<void> }).sendEmailVerification.call(
    user,
    actionCodeSettings,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function unlink(user: User, providerId: string): Promise<User> {
  return (user as unknown as { unlink: (...args: unknown[]) => Promise<User> }).unlink.call(
    user,
    providerId,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function updateEmail(user: User, newEmail: string): Promise<void> {
  return (user as unknown as { updateEmail: (...args: unknown[]) => Promise<void> }).updateEmail.call(
    user,
    newEmail,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function updatePassword(user: User, newPassword: string): Promise<void> {
  return (user as unknown as { updatePassword: (...args: unknown[]) => Promise<void> }).updatePassword.call(
    user,
    newPassword,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function updatePhoneNumber(
  user: User,
  credential: AuthCredential,
): Promise<void> {
  return (user as unknown as { updatePhoneNumber: (...args: unknown[]) => Promise<void> }).updatePhoneNumber.call(
    user,
    credential,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function updateProfile(
  user: User,
  profile: { displayName?: string | null; photoURL?: string | null },
): Promise<void> {
  return (user as unknown as { updateProfile: (...args: unknown[]) => Promise<void> }).updateProfile.call(
    user,
    profile,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function verifyBeforeUpdateEmail(
  user: User,
  newEmail: string,
  actionCodeSettings?: ActionCodeSettings,
): Promise<void> {
  return (user as unknown as { verifyBeforeUpdateEmail: (...args: unknown[]) => Promise<void> }).verifyBeforeUpdateEmail.call(
    user,
    newEmail,
    actionCodeSettings,
    MODULAR_DEPRECATION_ARG,
  );
}

export function getAdditionalUserInfo(
  userCredential: UserCredential,
): AdditionalUserInfo | undefined {
  return userCredential.additionalUserInfo;
}

export function getCustomAuthDomain(auth: FirebaseAuth): Promise<string> {
  return (auth as AuthInternal).getCustomAuthDomain.call(auth, MODULAR_DEPRECATION_ARG);
}

export async function validatePassword(auth: FirebaseAuth, password: string): Promise<unknown> {
  if (!auth || !auth.app) {
    throw new Error(
      "firebase.auth().validatePassword(*) 'auth' must be a valid Auth instance with an 'app' property. Received: undefined",
    );
  }

  if (password === null || password === undefined) {
    throw new Error(
      "firebase.auth().validatePassword(*) expected 'password' to be a non-null or a defined value.",
    );
  }

  return (auth as AuthInternal).validatePassword.call(auth, password, MODULAR_DEPRECATION_ARG);
}

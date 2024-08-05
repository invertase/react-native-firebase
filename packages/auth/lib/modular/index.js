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

import { firebase } from '..';

/**
 * @typedef {import('@firebase/app-types').FirebaseApp} FirebaseApp
 * @typedef {import('..').FirebaseAuthTypes} FirebaseAuthTypes
 * @typedef {import('..').FirebaseAuthTypes.Module} Auth
 * @typedef {import('..').FirebaseAuthTypes.CallbackOrObserver} CallbackOrObserver
 * @typedef {import('..').FirebaseAuthTypes.AuthListenerCallback} AuthListenerCallback
 * @typedef {import('..').FirebaseAuthTypes.ActionCodeInfo} ActionCodeInfo
 * @typedef {import('..').FirebaseAuthTypes.UserCredential} UserCredential
 * @typedef {import('..').FirebaseAuthTypes.MultiFactorError} MultiFactorError
 * @typedef {import('..').FirebaseAuthTypes.MultiFactorUser} MultiFactorUser
 * @typedef {import('..').FirebaseAuthTypes.MultiFactorResolver} MultiFactorResolver
 * @typedef {import('..').FirebaseAuthTypes.ConfirmationResult} ConfirmationResult
 * @typedef {import('..').FirebaseAuthTypes.AuthCredential} AuthCredential
 * @typedef {import('..').FirebaseAuthTypes.AuthProvider} AuthProvider
 * @typedef {import('..').FirebaseAuthTypes.PhoneAuthListener} PhoneAuthListener
 * @typedef {import('..').FirebaseAuthTypes.ActionCodeSettings} ActionCodeSettings
 * @typedef {import('..').FirebaseAuthTypes.User} User
 * @typedef {import('..').FirebaseAuthTypes.IdTokenResult} IdTokenResult
 * @typedef {import('..').FirebaseAuthTypes.AdditionalUserInfo} AdditionalUserInfo
 * @typedef {import('..').FirebaseAuthTypes.ActionCodeURL} ActionCodeURL
 * @typedef {import('..').FirebaseAuthTypes.ApplicationVerifier} ApplicationVerifier
 */

/**
 * Returns the Auth instance associated with the provided FirebaseApp.
 * @param {FirebaseApp} [app] - The Firebase app instance.
 * @returns {Auth}
 */
export function getAuth(app) {
  if (app) {
    return firebase.app(app.name).auth();
  }
  return firebase.app().auth();
}

/**
 * This function allows more control over the Auth instance than getAuth().
 * @param {FirebaseApp} app - The Firebase app instance.
 * @param {any} [deps] - Optional. Dependencies for the Auth instance.
 * @returns {Auth}
 */
export function initializeAuth(app, deps) {
  if (app) {
    return firebase.app(app.name).auth();
  }
  return firebase.app().auth();
}

/**
 * Applies a verification code sent to the user by email or other out-of-band mechanism.
 * @param {Auth} auth - The Auth instance.
 * @param {string} oobCode - The out-of-band code sent to the user.
 * @returns {Promise<void>}
 */
export async function applyActionCode(auth, oobCode) {
  return auth.applyActionCode(oobCode);
}

/**
 * Adds a blocking callback that runs before an auth state change sets a new user.
 * @param {Auth} auth - The Auth instance.
 * @param {(user: User | null) => void} callback - A callback function to run before the auth state changes.
 * @param {() => void} [onAbort] - Optional. A callback function to run if the operation is aborted.
 */
export function beforeAuthStateChanged(auth, callback, onAbort) {
  throw new Error('beforeAuthStateChanged is unsupported by the native Firebase SDKs');
}

/**
 * Checks a verification code sent to the user by email or other out-of-band mechanism.
 * @param {Auth} auth - The Auth instance.
 * @param {string} oobCode - The out-of-band code sent to the user.
 * @returns {Promise<ActionCodeInfo>}
 */
export async function checkActionCode(auth, oobCode) {
  return auth.checkActionCode(oobCode);
}

/**
 * Completes the password reset process, given a confirmation code and new password.
 * @param {Auth} auth - The Auth instance.
 * @param {string} oobCode - The out-of-band code sent to the user.
 * @param {string} newPassword - The new password.
 * @returns {Promise<void>}
 */
export async function confirmPasswordReset(auth, oobCode, newPassword) {
  return auth.confirmPasswordReset(oobCode, newPassword);
}

/**
 * Changes the Auth instance to communicate with the Firebase Auth Emulator, instead of production Firebase Auth services.
 * @param {Auth} auth - The Auth instance.
 * @param {string} url - The URL of the Firebase Auth Emulator.
 * @param {{ disableWarnings: boolean }} [options] - Optional. Options for the emulator connection.
 */
export function connectAuthEmulator(auth, url, options) {
  auth.useEmulator(url, options);
}

/**
 * Creates a new user account associated with the specified email address and password.
 * @param {Auth} auth - The Auth instance.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<UserCredential>}
 */
export async function createUserWithEmailAndPassword(auth, email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

/**
 * Gets the list of possible sign in methods for the given email address.
 * @param {Auth} auth - The Auth instance.
 * @param {string} email - The user's email address.
 * @returns {Promise<string[]>}
 */
export async function fetchSignInMethodsForEmail(auth, email) {
  return auth.fetchSignInMethodsForEmail(email);
}

/**
 * Provides a MultiFactorResolver suitable for completion of a multi-factor flow.
 * @param {Auth} auth - The Auth instance.
 * @param {MultiFactorError} error - The multi-factor error.
 * @returns {MultiFactorResolver}
 */
export function getMultiFactorResolver(auth, error) {
  return auth.getMultiFactorResolver(error);
}

/**
 * Returns a UserCredential from the redirect-based sign-in flow.
 * @param {Auth} auth - The Auth instance.
 * @param {PopupRedirectResolver} [resolver] - Optional. The popup redirect resolver.
 * @returns {Promise<UserCredential | null>}
 */
export async function getRedirectResult(auth, resolver) {
  throw new Error('getRedirectResult is unsupported by the native Firebase SDKs');
}

/**
 * Checks if an incoming link is a sign-in with email link suitable for signInWithEmailLink().
 * @param {Auth} auth - The Auth instance.
 * @param {string} emailLink - The email link to check.
 * @returns {boolean}
 */
export function isSignInWithEmailLink(auth, emailLink) {
  return auth.isSignInWithEmailLink(emailLink);
}

/**
 * Adds an observer for changes to the user's sign-in state.
 * @param {Auth} auth - The Auth instance.
 * @param {CallbackOrObserver<AuthListenerCallback>} nextOrObserver - A callback function or observer for auth state changes.
 * @returns {() => void}
 */
export function onAuthStateChanged(auth, nextOrObserver) {
  return auth.onAuthStateChanged(nextOrObserver);
}

/**
 * Adds an observer for changes to the signed-in user's ID token.
 * @param {Auth} auth - The Auth instance.
 * @param {CallbackOrObserver<AuthListenerCallback>} nextOrObserver - A callback function or observer for ID token changes.
 * @returns {() => void}
 */
export function onIdTokenChanged(auth, nextOrObserver) {
  return auth.onIdTokenChanged(nextOrObserver);
}

/**
 * Sends a password reset email to the given email address.
 * @param {Auth} auth - The Auth instance.
 * @param {string} email - The user's email address.
 * @param {ActionCodeSettings} [actionCodeSettings] - Optional. Action code settings.
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(auth, email, actionCodeSettings) {
  return auth.sendPasswordResetEmail(email, actionCodeSettings);
}

/**
 * Sends a sign-in email link to the user with the specified email.
 * @param {Auth} auth - The Auth instance.
 * @param {string} email - The user's email address.
 * @param {ActionCodeSettings} [actionCodeSettings] - Optional. Action code settings.
 * @returns {Promise<void>}
 */
export async function sendSignInLinkToEmail(auth, email, actionCodeSettings) {
  return auth.sendSignInLinkToEmail(email, actionCodeSettings);
}

/**
 * Changes the type of persistence on the Auth instance for the currently saved Auth session and applies this type of persistence for future sign-in requests, including sign-in with redirect requests.
 * @param {Auth} auth - The Auth instance.
 * @param {Persistence} persistence - The persistence type.
 * @returns {Promise<void>}
 */
export async function setPersistence(auth, persistence) {
  throw new Error('setPersistence is unsupported by the native Firebase SDKs');
}

/**
 * Asynchronously signs in as an anonymous user.
 * @param {Auth} auth - The Auth instance.
 * @returns {Promise<UserCredential>}
 */
export async function signInAnonymously(auth) {
  return auth.signInAnonymously();
}

/**
 * Asynchronously signs in with the given credentials.
 * @param {Auth} auth - The Auth instance.
 * @param {AuthCredential} credential - The auth credentials.
 * @returns {Promise<UserCredential>}
 */
export async function signInWithCredential(auth, credential) {
  return auth.signInWithCredential(credential);
}

/**
 * Asynchronously signs in using a custom token.
 * @param {Auth} auth - The Auth instance.
 * @param {string} customToken - The custom token.
 * @returns {Promise<UserCredential>}
 */
export async function signInWithCustomToken(auth, customToken) {
  return auth.signInWithCustomToken(customToken);
}

/**
 * Asynchronously signs in using an email and password.
 * @param {Auth} auth - The Auth instance.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<UserCredential>}
 */
export async function signInWithEmailAndPassword(auth, email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

/**
 * Asynchronously signs in using an email and sign-in email link.
 * @param {Auth} auth - The Auth instance.
 * @param {string} email - The user's email address.
 * @param {string} emailLink - The email link.
 * @returns {Promise<UserCredential>}
 */
export async function signInWithEmailLink(auth, email, emailLink) {
  return auth.signInWithEmailLink(email, emailLink);
}

/**
 * Asynchronously signs in using a phone number.
 * @param {Auth} auth - The Auth instance.
 * @param {string} phoneNumber - The user's phone number.
 * @param {ApplicationVerifier} appVerifier - The application verifier.
 * @returns {Promise<ConfirmationResult>}
 */
export async function signInWithPhoneNumber(auth, phoneNumber, appVerifier) {
  return auth.signInWithPhoneNumber(phoneNumber, appVerifier);
}

/**
 * Asynchronously verifies a phone number.
 * @param {Auth} auth - The Auth instance.
 * @param {string} phoneNumber - The user's phone number.
 * @param {number | boolean} autoVerifyTimeoutOrForceResend - The auto verify timeout or force resend flag.
 * @param {boolean} [forceResend] - Optional. Whether to force resend.
 * @returns {PhoneAuthListener}
 */
export function verifyPhoneNumber(auth, phoneNumber, autoVerifyTimeoutOrForceResend, forceResend) {
  return auth.verifyPhoneNumber(phoneNumber, autoVerifyTimeoutOrForceResend, forceResend);
}

/**
 * Authenticates a Firebase client using a popup-based OAuth authentication flow.
 * @param {Auth} auth - The Auth instance.
 * @param {AuthProvider} provider - The auth provider.
 * @param {PopupRedirectResolver} [resolver] - Optional. The popup redirect resolver.
 * @returns {Promise<UserCredential>}
 */
export async function signInWithPopup(auth, provider, resolver) {
  return auth.signInWithPopup(provider, resolver);
}

/**
 * Authenticates a Firebase client using a full-page redirect flow.
 * @param {Auth} auth - The Auth instance.
 * @param {AuthProvider} provider - The auth provider.
 * @param {PopupRedirectResolver} [resolver] - Optional. The popup redirect resolver.
 * @returns {Promise<void>}
 */
export async function signInWithRedirect(auth, provider, resolver) {
  return auth.signInWithRedirect(provider, resolver);
}

/**
 * Signs out the current user.
 * @param {Auth} auth - The Auth instance.
 * @returns {Promise<void>}
 */
export async function signOut(auth) {
  return auth.signOut();
}

/**
 * Asynchronously sets the provided user as Auth.currentUser on the Auth instance.
 * @param {Auth} auth - The Auth instance.
 * @param {User} user - The user to set as the current user.
 * @returns {Promise<void>}
 */
export async function updateCurrentUser(auth, user) {
  throw new Error('updateCurrentUser is unsupported by the native Firebase SDKs');
}

/**
 * Sets the current language to the default device/browser preference.
 * @param {Auth} auth - The Auth instance.
 */
export function useDeviceLanguage(auth) {
  throw new Error('useDeviceLanguage is unsupported by the native Firebase SDKs');
}

/**
 * Sets the current language to the default device/browser preference.
 * @param {Auth} auth - The Auth instance.
 * @param {string} userAccessGroup - The user access group.
 * @returns {Promise<void>}
 */
export function useUserAccessGroup(auth, userAccessGroup) {
  return auth.useUserAccessGroup(userAccessGroup);
}

/**
 * Verifies the password reset code sent to the user by email or other out-of-band mechanism.
 * @param {Auth} auth - The Auth instance.
 * @param {string} code - The password reset code.
 * @returns {Promise<string>}
 */
export async function verifyPasswordResetCode(auth, code) {
  return auth.verifyPasswordResetCode(code);
}

/**
 * Parses the email action link string and returns an ActionCodeURL if the link is valid, otherwise returns null.
 * @param {string} link - The email action link string.
 * @returns {ActionCodeURL | null}
 */
export function parseActionCodeURL(link) {
  throw new Error('parseActionCodeURL is unsupported by the native Firebase SDKs');
}

/**
 * Deletes and signs out the user.
 * @param {User} user - The user to delete.
 * @returns {Promise<void>}
 */
export async function deleteUser(user) {
  return user.delete();
}

/**
 * Returns a JSON Web Token (JWT) used to identify the user to a Firebase service.
 * @param {User} user - The user to get the token for.
 * @param {boolean} [forceRefresh] - Optional. Whether to force refresh the token.
 * @returns {Promise<string>}
 */
export async function getIdToken(user, forceRefresh) {
  return user.getIdToken(forceRefresh);
}

/**
 * Returns a deserialized JSON Web Token (JWT) used to identify the user to a Firebase service.
 * @param {User} user - The user to get the token result for.
 * @param {boolean} [forceRefresh] - Optional. Whether to force refresh the token.
 * @returns {Promise<IdTokenResult>}
 */
export async function getIdTokenResult(user, forceRefresh) {
  return user.getIdTokenResult(forceRefresh);
}

/**
 * Links the user account with the given credentials.
 * @param {User} user - The user to link the credentials with.
 * @param {AuthCredential} credential - The auth credentials.
 * @returns {Promise<UserCredential>}
 */
export async function linkWithCredential(user, credential) {
  return user.linkWithCredential(credential);
}

/**
 * Links the user account with the given phone number.
 * @param {User} user - The user to link the phone number with.
 * @param {string} phoneNumber - The phone number.
 * @param {ApplicationVerifier} appVerifier - The application verifier.
 * @returns {Promise<ConfirmationResult>}
 */
export async function linkWithPhoneNumber(user, phoneNumber, appVerifier) {
  throw new Error('linkWithPhoneNumber is unsupported by the native Firebase SDKs');
}

/**
 * Links the authenticated provider to the user account using a pop-up based OAuth flow.
 * @param {User} user - The user to link the provider with.
 * @param {AuthProvider} provider - The auth provider.
 * @param {PopupRedirectResolver} [resolver] - Optional. The popup redirect resolver.
 * @returns {Promise<UserCredential>}
 */
export async function linkWithPopup(user, provider, resolver) {
  return user.linkWithPopup(provider, resolver);
}

/**
 * Links the OAuthProvider to the user account using a full-page redirect flow.
 * @param {User} user - The user to link the provider with.
 * @param {AuthProvider} provider - The auth provider.
 * @param {PopupRedirectResolver} [resolver] - Optional. The popup redirect resolver.
 * @returns {Promise<void>}
 */
export async function linkWithRedirect(user, provider, resolver) {
  return user.linkWithRedirect(provider, resolver);
}

/**
 * The MultiFactorUser corresponding to the user.
 * @param {User} user - The user to get the multi-factor user for.
 * @returns {MultiFactorUser}
 */
export function multiFactor(user) {
  return user._auth.multiFactor(user);
}

/**
 * Re-authenticates a user using a fresh credential.
 * @param {User} user - The user to re-authenticate.
 * @param {AuthCredential} credential - The auth credentials.
 * @returns {Promise<UserCredential>}
 */
export async function reauthenticateWithCredential(user, credential) {
  return user.reauthenticateWithCredential(credential);
}

/**
 * Re-authenticates a user using a fresh phone credential.
 * @param {User} user - The user to re-authenticate.
 * @param {string} phoneNumber - The phone number.
 * @param {ApplicationVerifier} appVerifier - The application verifier.
 * @returns {Promise<ConfirmationResult>}
 */
export async function reauthenticateWithPhoneNumber(user, phoneNumber, appVerifier) {
  throw new Error('reauthenticateWithPhoneNumber is unsupported by the native Firebase SDKs');
}

/**
 * Reauthenticates the current user with the specified OAuthProvider using a pop-up based OAuth flow.
 * @param {User} user - The user to re-authenticate.
 * @param {AuthProvider} provider - The auth provider.
 * @param {PopupRedirectResolver} [resolver] - Optional. The popup redirect resolver.
 * @returns {Promise<UserCredential>}
 */
export async function reauthenticateWithPopup(user, provider, resolver) {
  return user.reauthenticateWithPopup(provider, resolver);
}

/**
 * Reauthenticates the current user with the specified OAuthProvider using a full-page redirect flow.
 * @param {User} user - The user to re-authenticate.
 * @param {AuthProvider} provider - The auth provider.
 * @param {PopupRedirectResolver} [resolver] - Optional. The popup redirect resolver.
 * @returns {Promise<void>}
 */
export async function reauthenticateWithRedirect(user, provider, resolver) {
  return user.reauthenticateWithRedirect(provider, resolver);
}

/**
 * Reloads user account data, if signed in.
 * @param {User} user - The user to reload data for.
 * @returns {Promise<void>}
 */
export async function reload(user) {
  return user.reload();
}

/**
 * Sends a verification email to a user.
 * @param {User} user - The user to send the email to.
 * @param {ActionCodeSettings} [actionCodeSettings] - Optional. Action code settings.
 * @returns {Promise<void>}
 */
export async function sendEmailVerification(user, actionCodeSettings) {
  return user.sendEmailVerification(actionCodeSettings);
}

/**
 * Unlinks a provider from a user account.
 * @param {User} user - The user to unlink the provider from.
 * @param {string} providerId - The provider ID.
 * @returns {Promise<User>}
 */
export async function unlink(user, providerId) {
  return user.unlink(providerId);
}

/**
 * Updates the user's email address.
 * @param {User} user - The user to update the email for.
 * @param {string} newEmail - The new email address.
 * @returns {Promise<void>}
 */
export async function updateEmail(user, newEmail) {
  return user.updateEmail(newEmail);
}

/**
 * Updates the user's password.
 * @param {User} user - The user to update the password for.
 * @param {string} newPassword - The new password.
 * @returns {Promise<void>}
 */
export async function updatePassword(user, newPassword) {
  return user.updatePassword(newPassword);
}

/**
 * Updates the user's phone number.
 * @param {User} user - The user to update the phone number for.
 * @param {AuthCredential} credential - The auth credentials.
 * @returns {Promise<void>}
 */
export async function updatePhoneNumber(user, credential) {
  return user.updatePhoneNumber(credential);
}

/**
 * Updates a user's profile data.
 * @param {User} user - The user to update the profile for.
 * @param {{ displayName?: string | null, photoURL?: string | null }} profile - An object containing the profile data to update.
 * @returns {Promise<void>}
 */
export async function updateProfile(user, { displayName, photoURL: photoUrl }) {
  return user.updateProfile({ displayName, photoURL: photoUrl });
}

/**
 * Sends a verification email to a new email address.
 * @param {User} user - The user to send the email to.
 * @param {string} newEmail - The new email address.
 * @param {ActionCodeSettings} [actionCodeSettings] - Optional. Action code settings.
 * @returns {Promise<void>}
 */
export async function verifyBeforeUpdateEmail(user, newEmail, actionCodeSettings) {
  return user.verifyBeforeUpdateEmail(newEmail, actionCodeSettings);
}

/**
 * Extracts provider specific AdditionalUserInfo for the given credential.
 * @param {UserCredential} userCredential - The user credential.
 * @returns {AdditionalUserInfo | null}
 */
export function getAdditionalUserInfo(userCredential) {
  return userCredential.additionalUserInfo;
}

/**
 * Returns the custom auth domain for the auth instance.
 * @param {Auth} auth - The Auth instance.
 * @returns {Promise<string>}
 */
export function getCustomAuthDomain(auth) {
  return auth.getCustomAuthDomain();
}

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
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import { MultiFactorUser } from './multiFactor';
import type { FirebaseApp } from '@react-native-firebase/app';
import type {
  ActionCodeInfo,
  ActionCodeSettings,
  ActionCodeURL,
  AdditionalUserInfo,
  ApplicationVerifier,
  Auth,
  AuthCredential,
  AuthProvider,
  CompleteFn,
  ConfirmationResult,
  Dependencies,
  ErrorFn,
  IdTokenResult,
  MultiFactorError,
  MultiFactorResolver,
  MultiFactorUser as MultiFactorUserType,
  NextFn,
  Observer,
  PasswordValidationStatus,
  Persistence,
  PhoneAuthListener,
  PopupRedirectResolver,
  UpdateProfile,
  User,
  UserCredential,
} from './types/auth';
import type { UserInternal } from './types/internal';

type AnyFn = (...args: any[]) => any;

type WithModularDeprecationArg<F extends AnyFn> = (
  ...args: [...Parameters<F>, typeof MODULAR_DEPRECATION_ARG]
) => ReturnType<F>;

type AuthWithPasswordValidationInternal = Auth & {
  validatePassword(password: string): Promise<PasswordValidationStatus>;
};

type NextOrObserverInternal = NextFn<User | null> | Observer<User | null>;

function callAuthMethod<F extends AnyFn>(
  auth: Auth,
  method: F,
  ...args: Parameters<F>
): ReturnType<F> {
  return (method as unknown as WithModularDeprecationArg<F>).call(
    auth,
    ...args,
    MODULAR_DEPRECATION_ARG,
  );
}

function callUserMethod<F extends AnyFn>(
  user: User,
  method: F,
  ...args: Parameters<F>
): ReturnType<F> {
  return (method as unknown as WithModularDeprecationArg<F>).call(
    user,
    ...args,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Returns the Auth instance associated with the provided FirebaseApp.
 */
export function getAuth(app?: FirebaseApp): Auth {
  if (app) {
    return getApp(app.name).auth();
  }

  return getApp().auth();
}

/**
 * This function allows more control over the Auth instance than getAuth().
 */
export function initializeAuth(app: FirebaseApp, _deps?: Dependencies): Auth {
  return getApp(app.name).auth();
}

export function applyActionCode(auth: Auth, oobCode: string): Promise<void> {
  return callAuthMethod(auth, auth.applyActionCode, oobCode);
}

export function beforeAuthStateChanged(
  _auth: Auth,
  _callback: (user: User | null) => void | Promise<void>,
  _onAbort?: () => void,
): () => void {
  throw new Error('beforeAuthStateChanged is unsupported by the native Firebase SDKs');
}

export function checkActionCode(auth: Auth, oobCode: string): Promise<ActionCodeInfo> {
  return callAuthMethod(auth, auth.checkActionCode, oobCode);
}

export function confirmPasswordReset(
  auth: Auth,
  oobCode: string,
  newPassword: string,
): Promise<void> {
  return callAuthMethod(auth, auth.confirmPasswordReset, oobCode, newPassword);
}

export function connectAuthEmulator(
  auth: Auth,
  url: string,
  _options?: { disableWarnings?: boolean },
): void {
  callAuthMethod(auth, auth.useEmulator, url);
}

export function createUserWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
): Promise<UserCredential> {
  return callAuthMethod(auth, auth.createUserWithEmailAndPassword, email, password);
}

export function fetchSignInMethodsForEmail(auth: Auth, email: string): Promise<string[]> {
  return callAuthMethod(auth, auth.fetchSignInMethodsForEmail, email);
}

export function getMultiFactorResolver(auth: Auth, error: MultiFactorError): MultiFactorResolver {
  return callAuthMethod(auth, auth.getMultiFactorResolver, error);
}

export function getRedirectResult(
  _auth: Auth,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential | null> {
  throw new Error('getRedirectResult is unsupported by the native Firebase SDKs');
}

export function isSignInWithEmailLink(auth: Auth, emailLink: string): Promise<boolean> {
  return callAuthMethod(auth, auth.isSignInWithEmailLink, emailLink);
}

export function onAuthStateChanged(
  auth: Auth,
  nextOrObserver: NextOrObserverInternal,
  _error?: ErrorFn,
  _completed?: CompleteFn,
): () => void {
  // The legacy callback overload exists for JS SDK compatibility, but native auth listeners
  // never invoke separate error/completed callbacks.
  return callAuthMethod(auth, auth.onAuthStateChanged, nextOrObserver);
}

export function onIdTokenChanged(
  auth: Auth,
  nextOrObserver: NextOrObserverInternal,
  _error?: ErrorFn,
  _completed?: CompleteFn,
): () => void {
  // The legacy callback overload exists for JS SDK compatibility, but native auth listeners
  // never invoke separate error/completed callbacks.
  return callAuthMethod(auth, auth.onIdTokenChanged, nextOrObserver);
}

export function revokeAccessToken(_auth: Auth, _token: string): Promise<void> {
  throw new Error('revokeAccessToken() is only supported on Web');
}

export function sendPasswordResetEmail(
  auth: Auth,
  email: string,
  actionCodeSettings?: ActionCodeSettings,
): Promise<void> {
  return callAuthMethod(auth, auth.sendPasswordResetEmail, email, actionCodeSettings);
}

export function sendSignInLinkToEmail(
  auth: Auth,
  email: string,
  actionCodeSettings: ActionCodeSettings,
): Promise<void> {
  return callAuthMethod(auth, auth.sendSignInLinkToEmail, email, actionCodeSettings);
}

export function setPersistence(_auth: Auth, _persistence: Persistence): Promise<void> {
  throw new Error('setPersistence is unsupported by the native Firebase SDKs');
}

export function signInAnonymously(auth: Auth): Promise<UserCredential> {
  return callAuthMethod(auth, auth.signInAnonymously);
}

export function signInWithCredential(
  auth: Auth,
  credential: AuthCredential,
): Promise<UserCredential> {
  return callAuthMethod(auth, auth.signInWithCredential, credential);
}

export function signInWithCustomToken(auth: Auth, customToken: string): Promise<UserCredential> {
  return callAuthMethod(auth, auth.signInWithCustomToken, customToken);
}

export function signInWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
): Promise<UserCredential> {
  return callAuthMethod(auth, auth.signInWithEmailAndPassword, email, password);
}

export function signInWithEmailLink(
  auth: Auth,
  email: string,
  emailLink: string,
): Promise<UserCredential> {
  return callAuthMethod(auth, auth.signInWithEmailLink, email, emailLink);
}

export function signInWithPhoneNumber(
  auth: Auth,
  phoneNumber: string,
  _appVerifier?: ApplicationVerifier,
): Promise<ConfirmationResult> {
  // Native SDKs own the verification flow, so the modular wrapper intentionally ignores the
  // JS SDK's optional ApplicationVerifier and forwards only the phone number.
  const signInWithPhoneNumberInternal = auth.signInWithPhoneNumber as unknown as (
    phoneNumber: string,
  ) => Promise<ConfirmationResult>;

  return callAuthMethod(auth, signInWithPhoneNumberInternal, phoneNumber);
}

export function verifyPhoneNumber(
  auth: Auth,
  phoneNumber: string,
  autoVerifyTimeoutOrForceResend?: number | boolean,
  forceResend?: boolean,
): PhoneAuthListener {
  return (
    auth.verifyPhoneNumber as unknown as WithModularDeprecationArg<
      (
        phoneNumber: string,
        autoVerifyTimeoutOrForceResend?: number | boolean,
        forceResend?: boolean,
      ) => PhoneAuthListener
    >
  ).call(auth, phoneNumber, autoVerifyTimeoutOrForceResend, forceResend, MODULAR_DEPRECATION_ARG);
}

export function signInWithPopup(
  auth: Auth,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  return callAuthMethod(auth, auth.signInWithPopup, provider);
}

export function signInWithRedirect(
  auth: Auth,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  // Native provider flows complete immediately and return a credential instead of following the
  // browser redirect contract from the Firebase JS SDK.
  return callAuthMethod(auth, auth.signInWithRedirect, provider);
}

export function signOut(auth: Auth): Promise<void> {
  return callAuthMethod(auth, auth.signOut);
}

export function updateCurrentUser(_auth: Auth, _user: User | null): Promise<void> {
  throw new Error('updateCurrentUser is unsupported by the native Firebase SDKs');
}

export function useDeviceLanguage(_auth: Auth): void {
  throw new Error('useDeviceLanguage is unsupported by the native Firebase SDKs');
}

export function setLanguageCode(auth: Auth, languageCode: string | null): Promise<void> {
  return callAuthMethod(auth, auth.setLanguageCode, languageCode);
}

export function useUserAccessGroup(auth: Auth, userAccessGroup: string): Promise<void> {
  return callAuthMethod(auth, auth.useUserAccessGroup, userAccessGroup).then(() => undefined);
}

export function verifyPasswordResetCode(auth: Auth, code: string): Promise<string> {
  return callAuthMethod(auth, auth.verifyPasswordResetCode, code);
}

export function parseActionCodeURL(_link: string): ActionCodeURL | null {
  throw new Error('parseActionCodeURL is unsupported by the native Firebase SDKs');
}

export function deleteUser(user: User): Promise<void> {
  return callUserMethod(user, user.delete);
}

export function getIdToken(user: User, forceRefresh?: boolean): Promise<string> {
  return callUserMethod(user, user.getIdToken, forceRefresh);
}

export function getIdTokenResult(user: User, forceRefresh?: boolean): Promise<IdTokenResult> {
  return callUserMethod(user, user.getIdTokenResult, forceRefresh);
}

export function linkWithCredential(
  user: User,
  credential: AuthCredential,
): Promise<UserCredential> {
  return callUserMethod(user, user.linkWithCredential, credential);
}

export function linkWithPhoneNumber(
  _user: User,
  _phoneNumber: string,
  _appVerifier?: ApplicationVerifier,
): Promise<ConfirmationResult> {
  throw new Error('linkWithPhoneNumber is unsupported by the native Firebase SDKs');
}

export function linkWithPopup(
  user: User,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  return callUserMethod(user, user.linkWithPopup, provider);
}

export function linkWithRedirect(
  user: User,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  // Native provider flows complete immediately and return a credential instead of following the
  // browser redirect contract from the Firebase JS SDK.
  return callUserMethod(user, user.linkWithRedirect, provider);
}

export function multiFactor(user: User): MultiFactorUserType {
  return new MultiFactorUser(
    (user as UserInternal)._auth || getAuth(),
    user,
  ) as MultiFactorUserType;
}

export function reauthenticateWithCredential(
  user: User,
  credential: AuthCredential,
): Promise<UserCredential> {
  return callUserMethod(user, user.reauthenticateWithCredential, credential);
}

export function reauthenticateWithPhoneNumber(
  _user: User,
  _phoneNumber: string,
  _appVerifier?: ApplicationVerifier,
): Promise<ConfirmationResult> {
  throw new Error('reauthenticateWithPhoneNumber is unsupported by the native Firebase SDKs');
}

export function reauthenticateWithPopup(
  user: User,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  return callUserMethod(user, user.reauthenticateWithPopup, provider);
}

export function reauthenticateWithRedirect(
  user: User,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<void> {
  return callUserMethod(user, user.reauthenticateWithRedirect, provider);
}

export function reload(user: User): Promise<void> {
  return callUserMethod(user, user.reload);
}

export function sendEmailVerification(
  user: User,
  actionCodeSettings?: ActionCodeSettings,
): Promise<void> {
  return callUserMethod(user, user.sendEmailVerification, actionCodeSettings);
}

export function unlink(user: User, providerId: string): Promise<User> {
  return callUserMethod(user, user.unlink, providerId);
}

export function updateEmail(user: User, newEmail: string): Promise<void> {
  return callUserMethod(user, user.updateEmail, newEmail);
}

export function updatePassword(user: User, newPassword: string): Promise<void> {
  return callUserMethod(user, user.updatePassword, newPassword);
}

export function updatePhoneNumber(user: User, credential: AuthCredential): Promise<void> {
  return callUserMethod(user, user.updatePhoneNumber, credential);
}

export function updateProfile(user: User, profile: UpdateProfile): Promise<void> {
  return callUserMethod(user, user.updateProfile, {
    displayName: profile.displayName,
    photoURL: profile.photoURL,
  });
}

export function verifyBeforeUpdateEmail(
  user: User,
  newEmail: string,
  actionCodeSettings?: ActionCodeSettings,
): Promise<void> {
  return callUserMethod(user, user.verifyBeforeUpdateEmail, newEmail, actionCodeSettings);
}

export function getAdditionalUserInfo(userCredential: UserCredential): AdditionalUserInfo | null {
  return userCredential.additionalUserInfo ?? null;
}

export function getCustomAuthDomain(auth: Auth): Promise<string> {
  return callAuthMethod(auth, auth.getCustomAuthDomain);
}

export function validatePassword(auth: Auth, password: string): Promise<PasswordValidationStatus> {
  if (!auth || !('app' in auth)) {
    throw new Error(
      "firebase.auth().validatePassword(*) 'auth' must be a valid Auth instance with an 'app' property. Received: undefined",
    );
  }

  if (password === null || password === undefined) {
    throw new Error(
      "firebase.auth().validatePassword(*) expected 'password' to be a non-null or a defined value.",
    );
  }

  const authWithPasswordValidation = auth as AuthWithPasswordValidationInternal;
  return callAuthMethod(
    authWithPasswordValidation,
    authWithPasswordValidation.validatePassword,
    password,
  );
}

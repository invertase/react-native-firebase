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
import PhoneMultiFactorGenerator from './PhoneMultiFactorGenerator';
import { PhoneAuthState } from './PhoneAuthState';
import TotpMultiFactorGenerator from './TotpMultiFactorGenerator';
import { TotpSecret } from './TotpSecret';
import { MultiFactorUser as MultiFactorUserModule } from './multiFactor';
import AppleAuthProvider from './providers/AppleAuthProvider';
import EmailAuthProvider from './providers/EmailAuthProvider';
import FacebookAuthProvider from './providers/FacebookAuthProvider';
import GithubAuthProvider from './providers/GithubAuthProvider';
import GoogleAuthProvider from './providers/GoogleAuthProvider';
import OAuthProvider from './providers/OAuthProvider';
import OIDCAuthProvider from './providers/OIDCAuthProvider';
import PhoneAuthProvider from './providers/PhoneAuthProvider';
import TwitterAuthProvider from './providers/TwitterAuthProvider';
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
  MultiFactorUser,
  NextOrObserver,
  PasswordValidationStatus,
  Persistence,
  PhoneAuthListener,
  PopupRedirectResolver,
  Unsubscribe,
  User,
  UserCredential,
} from './types/auth';
import type { FirebaseAuthTypes } from './types/namespaced';
import type { UserInternal } from './types/internal';

type AnyFn = (...args: any[]) => any;

type WithModularDeprecationArg<F extends AnyFn> = (
  ...args: [...Parameters<F>, typeof MODULAR_DEPRECATION_ARG]
) => ReturnType<F>;

type AuthModuleInternal = FirebaseAuthTypes.Module & {
  validatePassword(password: string): Promise<PasswordValidationStatus>;
  getCustomAuthDomain(): Promise<string>;
};

type UserModuleInternal = UserInternal;

type AuthProviderWithObjectInternal = FirebaseAuthTypes.AuthProvider & {
  toObject(): Record<string, unknown>;
};

function getAuthInternal(auth: Auth): AuthModuleInternal {
  return auth as unknown as AuthModuleInternal;
}

function getUserInternal(user: User): UserModuleInternal {
  return user as unknown as UserModuleInternal;
}

function asAuth(auth: FirebaseAuthTypes.Module): Auth {
  return auth as unknown as Auth;
}

function asActionCodeInfo(
  promise: Promise<FirebaseAuthTypes.ActionCodeInfo>,
): Promise<ActionCodeInfo> {
  return promise as unknown as Promise<ActionCodeInfo>;
}

function asUserCredential(
  promise: Promise<FirebaseAuthTypes.UserCredential>,
): Promise<UserCredential> {
  return promise as unknown as Promise<UserCredential>;
}

function asIdTokenResult(
  promise: Promise<FirebaseAuthTypes.IdTokenResult>,
): Promise<IdTokenResult> {
  return promise as unknown as Promise<IdTokenResult>;
}

function asUser(promise: Promise<FirebaseAuthTypes.User>): Promise<User> {
  return promise as unknown as Promise<User>;
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
  PhoneAuthState,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  TotpSecret,
  TwitterAuthProvider,
};

function normalizeAuthListener(
  nextOrObserver: NextOrObserver<User>,
): FirebaseAuthTypes.AuthListenerCallback | { next: FirebaseAuthTypes.AuthListenerCallback } {
  if (typeof nextOrObserver === 'function') {
    return nextOrObserver as unknown as FirebaseAuthTypes.AuthListenerCallback;
  }

  return {
    next:
      typeof nextOrObserver.next === 'function'
        ? (nextOrObserver.next as unknown as FirebaseAuthTypes.AuthListenerCallback)
        : () => {},
  };
}

function callAuthMethod<F extends AnyFn>(
  auth: AuthModuleInternal,
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
  user: UserModuleInternal,
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
    return asAuth(getApp(app.name).auth());
  }

  return asAuth(getApp().auth());
}

/**
 * This function allows more control over the Auth instance than getAuth().
 */
export function initializeAuth(app: FirebaseApp, _deps?: Dependencies): Auth {
  return asAuth(getApp(app.name).auth());
}

export function applyActionCode(auth: Auth, oobCode: string): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.applyActionCode, oobCode);
}

export function beforeAuthStateChanged(
  _auth: Auth,
  _callback: (user: User | null) => void | Promise<void>,
  _onAbort?: () => void,
): Unsubscribe {
  throw new Error('beforeAuthStateChanged is unsupported by the native Firebase SDKs');
}

export function checkActionCode(auth: Auth, oobCode: string): Promise<ActionCodeInfo> {
  const authInternal = getAuthInternal(auth);
  return asActionCodeInfo(callAuthMethod(authInternal, authInternal.checkActionCode, oobCode));
}

export function confirmPasswordReset(
  auth: Auth,
  oobCode: string,
  newPassword: string,
): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.confirmPasswordReset, oobCode, newPassword);
}

export function connectAuthEmulator(
  auth: Auth,
  url: string,
  _options?: { disableWarnings?: boolean },
): void {
  const authInternal = getAuthInternal(auth);
  callAuthMethod(authInternal, authInternal.useEmulator, url);
}

export function createUserWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return asUserCredential(
    callAuthMethod(authInternal, authInternal.createUserWithEmailAndPassword, email, password),
  );
}

export function fetchSignInMethodsForEmail(auth: Auth, email: string): Promise<string[]> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.fetchSignInMethodsForEmail, email);
}

export function getMultiFactorResolver(auth: Auth, error: MultiFactorError): MultiFactorResolver {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.getMultiFactorResolver as unknown as (
      error: MultiFactorError,
    ) => FirebaseAuthTypes.MultiFactorResolver,
    error,
  ) as unknown as MultiFactorResolver;
}

export function getRedirectResult(
  _auth: Auth,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential | null> {
  throw new Error('getRedirectResult is unsupported by the native Firebase SDKs');
}

export function isSignInWithEmailLink(auth: Auth, emailLink: string): Promise<boolean> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.isSignInWithEmailLink, emailLink);
}

export function onAuthStateChanged(
  auth: Auth,
  nextOrObserver: NextOrObserver<User>,
  _error?: ErrorFn,
  _completed?: CompleteFn,
): Unsubscribe {
  // The legacy callback overload exists for JS SDK compatibility, but native auth listeners
  // never invoke separate error/completed callbacks.
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.onAuthStateChanged as unknown as (
      nextOrObserver:
        | FirebaseAuthTypes.AuthListenerCallback
        | { next: FirebaseAuthTypes.AuthListenerCallback },
    ) => Unsubscribe,
    normalizeAuthListener(nextOrObserver),
  );
}

export function onIdTokenChanged(
  auth: Auth,
  nextOrObserver: NextOrObserver<User>,
  _error?: ErrorFn,
  _completed?: CompleteFn,
): Unsubscribe {
  // The legacy callback overload exists for JS SDK compatibility, but native auth listeners
  // never invoke separate error/completed callbacks.
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.onIdTokenChanged as unknown as (
      nextOrObserver:
        | FirebaseAuthTypes.AuthListenerCallback
        | { next: FirebaseAuthTypes.AuthListenerCallback },
    ) => Unsubscribe,
    normalizeAuthListener(nextOrObserver),
  );
}

export function revokeAccessToken(_auth: Auth, _token: string): Promise<void> {
  throw new Error('revokeAccessToken() is only supported on Web');
}

export function sendPasswordResetEmail(
  auth: Auth,
  email: string,
  actionCodeSettings?: ActionCodeSettings,
): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.sendPasswordResetEmail,
    email,
    actionCodeSettings,
  );
}

export function sendSignInLinkToEmail(
  auth: Auth,
  email: string,
  actionCodeSettings: ActionCodeSettings,
): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.sendSignInLinkToEmail,
    email,
    actionCodeSettings,
  );
}

export function setPersistence(_auth: Auth, _persistence: Persistence): Promise<void> {
  throw new Error('setPersistence is unsupported by the native Firebase SDKs');
}

export function signInAnonymously(auth: Auth): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return asUserCredential(callAuthMethod(authInternal, authInternal.signInAnonymously));
}

export function signInWithCredential(
  auth: Auth,
  credential: AuthCredential,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return asUserCredential(
    callAuthMethod(authInternal, authInternal.signInWithCredential, credential),
  );
}

export function signInWithCustomToken(auth: Auth, customToken: string): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return asUserCredential(
    callAuthMethod(authInternal, authInternal.signInWithCustomToken, customToken),
  );
}

export function signInWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return asUserCredential(
    callAuthMethod(authInternal, authInternal.signInWithEmailAndPassword, email, password),
  );
}

export function signInWithEmailLink(
  auth: Auth,
  email: string,
  emailLink: string,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return asUserCredential(
    callAuthMethod(authInternal, authInternal.signInWithEmailLink, email, emailLink),
  );
}

export function signInWithPhoneNumber(
  auth: Auth,
  phoneNumber: string,
  _appVerifier?: ApplicationVerifier,
): Promise<ConfirmationResult> {
  // Native SDKs own the verification flow, so the modular wrapper intentionally ignores the
  // JS SDK's optional ApplicationVerifier and forwards only the phone number.
  const authInternal = getAuthInternal(auth);
  const signInWithPhoneNumberInternal = authInternal.signInWithPhoneNumber as unknown as (
    phoneNumber: string,
  ) => Promise<ConfirmationResult>;

  return callAuthMethod(authInternal, signInWithPhoneNumberInternal, phoneNumber);
}

export function verifyPhoneNumber(
  auth: Auth,
  phoneNumber: string,
  autoVerifyTimeoutOrForceResend?: number | boolean,
  forceResend?: boolean,
): PhoneAuthListener {
  const authInternal = getAuthInternal(auth);
  return (
    authInternal.verifyPhoneNumber as unknown as WithModularDeprecationArg<
      (
        phoneNumber: string,
        autoVerifyTimeoutOrForceResend?: number | boolean,
        forceResend?: boolean,
      ) => PhoneAuthListener
    >
  ).call(
    authInternal,
    phoneNumber,
    autoVerifyTimeoutOrForceResend,
    forceResend,
    MODULAR_DEPRECATION_ARG,
  );
}

export function signInWithPopup(
  auth: Auth,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return asUserCredential(
    callAuthMethod(
      authInternal,
      authInternal.signInWithPopup,
      provider as unknown as AuthProviderWithObjectInternal,
    ),
  );
}

export function signInWithRedirect(
  auth: Auth,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  // Native provider flows complete immediately and return a credential instead of following the
  // browser redirect contract from the Firebase JS SDK.
  const authInternal = getAuthInternal(auth);
  return asUserCredential(
    callAuthMethod(
      authInternal,
      authInternal.signInWithRedirect,
      provider as unknown as AuthProviderWithObjectInternal,
    ),
  );
}

export function signOut(auth: Auth): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signOut);
}

export function updateCurrentUser(_auth: Auth, _user: User | null): Promise<void> {
  throw new Error('updateCurrentUser is unsupported by the native Firebase SDKs');
}

export function useDeviceLanguage(_auth: Auth): void {
  throw new Error('useDeviceLanguage is unsupported by the native Firebase SDKs');
}

export function setLanguageCode(auth: Auth, languageCode: string | null): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.setLanguageCode, languageCode);
}

export function useUserAccessGroup(auth: Auth, userAccessGroup: string): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.useUserAccessGroup, userAccessGroup).then(
    () => undefined,
  );
}

export function verifyPasswordResetCode(auth: Auth, code: string): Promise<string> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.verifyPasswordResetCode, code);
}

export function parseActionCodeURL(_link: string): ActionCodeURL | null {
  throw new Error('parseActionCodeURL is unsupported by the native Firebase SDKs');
}

export function deleteUser(user: User): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.delete);
}

export function getIdToken(user: User, forceRefresh?: boolean): Promise<string> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.getIdToken, forceRefresh);
}

export function getIdTokenResult(user: User, forceRefresh?: boolean): Promise<IdTokenResult> {
  const userInternal = getUserInternal(user);
  return asIdTokenResult(callUserMethod(userInternal, userInternal.getIdTokenResult, forceRefresh));
}

export function linkWithCredential(
  user: User,
  credential: AuthCredential,
): Promise<UserCredential> {
  const userInternal = getUserInternal(user);
  return asUserCredential(
    callUserMethod(userInternal, userInternal.linkWithCredential, credential),
  );
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
  const userInternal = getUserInternal(user);
  return asUserCredential(
    callUserMethod(
      userInternal,
      userInternal.linkWithPopup,
      provider as unknown as AuthProviderWithObjectInternal,
    ),
  );
}

export function linkWithRedirect(
  user: User,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  // Native provider flows complete immediately and return a credential instead of following the
  // browser redirect contract from the Firebase JS SDK.
  const userInternal = getUserInternal(user);
  return asUserCredential(
    callUserMethod(
      userInternal,
      userInternal.linkWithRedirect,
      provider as unknown as AuthProviderWithObjectInternal,
    ),
  );
}

export function multiFactor(user: User): MultiFactorUser {
  return new MultiFactorUserModule(
    ((user as unknown as UserInternal)._auth ||
      (getAuth() as unknown as UserInternal['_auth'])) as NonNullable<UserInternal['_auth']>,
    user as unknown as FirebaseAuthTypes.User,
  ) as MultiFactorUser;
}

export function reauthenticateWithCredential(
  user: User,
  credential: AuthCredential,
): Promise<UserCredential> {
  const userInternal = getUserInternal(user);
  return asUserCredential(
    callUserMethod(userInternal, userInternal.reauthenticateWithCredential, credential),
  );
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
  const userInternal = getUserInternal(user);
  return asUserCredential(
    callUserMethod(
      userInternal,
      userInternal.reauthenticateWithPopup,
      provider as unknown as AuthProviderWithObjectInternal,
    ),
  );
}

export function reauthenticateWithRedirect(
  user: User,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(
    userInternal,
    userInternal.reauthenticateWithRedirect,
    provider as unknown as AuthProviderWithObjectInternal,
  );
}

export function reload(user: User): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.reload);
}

export function sendEmailVerification(
  user: User,
  actionCodeSettings?: ActionCodeSettings | null,
): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(
    userInternal,
    userInternal.sendEmailVerification,
    actionCodeSettings ?? undefined,
  );
}

export function unlink(user: User, providerId: string): Promise<User> {
  const userInternal = getUserInternal(user);
  return asUser(callUserMethod(userInternal, userInternal.unlink, providerId));
}

export function updateEmail(user: User, newEmail: string): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.updateEmail, newEmail);
}

export function updatePassword(user: User, newPassword: string): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.updatePassword, newPassword);
}

export function updatePhoneNumber(user: User, credential: AuthCredential): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.updatePhoneNumber, credential);
}

export function updateProfile(
  user: User,
  profile: { displayName?: string | null; photoURL?: string | null },
): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.updateProfile, {
    displayName: profile.displayName,
    photoURL: profile.photoURL,
  });
}

export function verifyBeforeUpdateEmail(
  user: User,
  newEmail: string,
  actionCodeSettings?: ActionCodeSettings | null,
): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(
    userInternal,
    userInternal.verifyBeforeUpdateEmail,
    newEmail,
    actionCodeSettings ?? undefined,
  );
}

export function getAdditionalUserInfo(userCredential: UserCredential): AdditionalUserInfo | null {
  const info = (userCredential as unknown as FirebaseAuthTypes.UserCredential).additionalUserInfo;
  if (!info) {
    return null;
  }

  return {
    isNewUser: info.isNewUser,
    profile: info.profile ?? null,
    providerId: info.providerId ?? null,
    username: info.username ?? null,
  };
}

export function getCustomAuthDomain(auth: Auth): Promise<string> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.getCustomAuthDomain);
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

  const authWithPasswordValidation = getAuthInternal(auth);
  return callAuthMethod(
    authWithPasswordValidation,
    authWithPasswordValidation.validatePassword,
    password,
  );
}

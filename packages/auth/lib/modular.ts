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
import {
  ActionCodeOperation,
  FactorId,
  OperationType,
  ProviderId,
  SignInMethod,
} from './constants';
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
import { ActionCodeURL } from './ActionCodeURL';
import type {
  ActionCodeInfo,
  ActionCodeSettings,
  AdditionalUserInfo,
  AdditionalUserInfoNative,
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
  MultiFactorInfo,
  MultiFactorResolver,
  MultiFactorUser,
  NextOrObserver,
  PasswordValidationStatus,
  Persistence,
  PhoneAuthCredential,
  PhoneAuthListener,
  PhoneMultiFactorInfo,
  PopupRedirectResolver,
  TotpMultiFactorInfo,
  Unsubscribe,
  User,
  UserCredential,
} from './types/auth';
import type {
  ActionCodeInfoResultInternal,
  AppWithAuthInternal,
  AuthInternal,
  AuthListenerCallbackInternal,
  AuthProviderWithObjectInternal,
  ConfirmationResultResultInternal,
  MultiFactorResolverResultInternal,
  MultiFactorUserResultInternal,
  MultiFactorUserSourceInternal,
  UserCredentialResultInternal,
  UserInternal,
  WithAuthDeprecationArg,
} from './types/internal';

/**
 * Modular Auth API for React Native Firebase.
 *
 * Most exports mirror the [firebase-js-sdk modular Auth API](https://firebase.google.com/docs/reference/js/auth).
 * Remarks on individual symbols call out React Native-specific behavior, unsupported
 * web-only APIs, and return-type differences.
 *
 * @packageDocumentation
 */

type AnyFn = (...args: any[]) => any;

type UserModuleInternal = UserInternal;
type MultiFactorInfoInternal =
  | MultiFactorInfo
  | MultiFactorResolverResultInternal['hints'][number];

export {
  ActionCodeOperation,
  FactorId,
  OperationType,
  ProviderId,
  SignInMethod,
};

function appWithAuth(app?: FirebaseApp): AppWithAuthInternal {
  return (app ? getApp(app.name) : getApp()) as unknown as AppWithAuthInternal;
}

function getAuthInternal(auth: Auth): AuthInternal {
  return auth as unknown as AuthInternal;
}

function getUserInternal(user: User): UserModuleInternal {
  return user as unknown as UserModuleInternal;
}

type AdditionalUserInfoSource = {
  isNewUser?: boolean;
  profile?: Record<string, unknown> | null;
  providerId?: string | null;
  username?: string | null;
} & Record<string, unknown>;

function normalizeAdditionalUserInfo(
  info: AdditionalUserInfoSource,
): AdditionalUserInfoNative {
  return {
    ...info,
    isNewUser: Boolean(info.isNewUser),
    profile: info.profile ?? null,
    providerId: info.providerId ?? null,
    username: info.username ?? null,
  };
}

function normalizeUserCredential(
  userCredential: UserCredentialResultInternal,
  overrides: Partial<Pick<UserCredential, 'operationType' | 'providerId'>> = {},
): UserCredential {
  const normalizedUserCredential: UserCredential = {
    user: userCredential.user as unknown as User,
    providerId:
      overrides.providerId ??
      userCredential.providerId ??
      userCredential.additionalUserInfo?.providerId ??
      null,
    operationType: overrides.operationType ?? userCredential.operationType ?? OperationType.SIGN_IN,
  };

  if (userCredential.additionalUserInfo) {
    normalizedUserCredential.additionalUserInfo = normalizeAdditionalUserInfo(
      userCredential.additionalUserInfo as AdditionalUserInfoSource,
    );
  }

  return normalizedUserCredential;
}

function normalizeMultiFactorInfo(info: MultiFactorInfoInternal): MultiFactorInfo {
  const normalizedInfo = {
    uid: info.uid,
    displayName: info.displayName ?? null,
    enrollmentTime: info.enrollmentTime,
    factorId: info.factorId,
  };

  if ('phoneNumber' in info) {
    return {
      ...normalizedInfo,
      phoneNumber: info.phoneNumber,
    } as PhoneMultiFactorInfo;
  }

  return normalizedInfo as TotpMultiFactorInfo;
}

function normalizeActionCodeInfo(actionCodeInfo: ActionCodeInfoResultInternal): ActionCodeInfo {
  const data = actionCodeInfo.data ?? {};

  return {
    data: {
      email: data.email ?? null,
      multiFactorInfo:
        'multiFactorInfo' in data && data.multiFactorInfo
          ? normalizeMultiFactorInfo(data.multiFactorInfo)
          : null,
      previousEmail:
        ('previousEmail' in data ? data.previousEmail : undefined) ??
        ('fromEmail' in data ? data.fromEmail : undefined) ??
        null,
    },
    operation: actionCodeInfo.operation as ActionCodeInfo['operation'],
  };
}

function normalizeConfirmationResult(
  confirmationResult: ConfirmationResultResultInternal,
): ConfirmationResult {
  if (!confirmationResult.verificationId) {
    throw new Error('signInWithPhoneNumber() did not return a verificationId.');
  }

  return {
    verificationId: confirmationResult.verificationId,
    async confirm(verificationCode: string) {
      const userCredential = await confirmationResult.confirm(verificationCode);

      if (!userCredential) {
        throw new Error('signInWithPhoneNumber().confirm() returned no user credential.');
      }

      return normalizeUserCredential(userCredential, {
        providerId: ProviderId.PHONE,
        operationType: OperationType.SIGN_IN,
      });
    },
  };
}

function normalizeMultiFactorResolver(
  resolver: MultiFactorResolverResultInternal,
): MultiFactorResolver {
  return {
    hints: resolver.hints.map(normalizeMultiFactorInfo),
    session: resolver.session,
    async resolveSignIn(assertion) {
      return normalizeUserCredential(await resolver.resolveSignIn(assertion), {
        providerId: assertion.factorId === FactorId.PHONE ? ProviderId.PHONE : null,
        operationType: OperationType.SIGN_IN,
      });
    },
  };
}

function normalizeMultiFactorUser(multiFactorUser: MultiFactorUserResultInternal): MultiFactorUser {
  return {
    enrolledFactors: multiFactorUser.enrolledFactors.map(normalizeMultiFactorInfo),
    getSession: () => multiFactorUser.getSession(),
    enroll: (assertion, displayName) => multiFactorUser.enroll(assertion, displayName),
    unenroll: option =>
      multiFactorUser.unenroll(
        option as Parameters<MultiFactorUserResultInternal['unenroll']>[0],
      ),
  };
}

export { ActionCodeURL } from './ActionCodeURL';
export {
  AuthCredential,
  EmailAuthCredential,
  OAuthCredential,
  PhoneAuthCredential,
} from './credentials';

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
): AuthListenerCallbackInternal | { next: AuthListenerCallbackInternal } {
  if (typeof nextOrObserver === 'function') {
    return nextOrObserver as AuthListenerCallbackInternal;
  }

  if (typeof nextOrObserver.next !== 'function') {
    return { next: () => {} };
  }

  return nextOrObserver as { next: AuthListenerCallbackInternal };
}

function callAuthMethod<F extends AnyFn>(
  auth: AuthInternal,
  method: F,
  ...args: Parameters<F>
): ReturnType<F> {
  return (method as unknown as WithAuthDeprecationArg<F>).call(
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
  return (method as unknown as WithAuthDeprecationArg<F>).call(
    user,
    ...args,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Returns the Auth instance associated with the provided FirebaseApp.
 *
 * @param app - The Firebase app instance. Defaults to the default app.
 */
export function getAuth(app?: FirebaseApp): Auth {
  // Keep getAuth() on the shared namespaced instance; method wrappers add the modular sentinel.
  return appWithAuth(app).auth();
}

/**
 * This function allows more control over the Auth instance than getAuth().
 *
 * @param app - The Firebase app to initialize Auth for.
 * @param _deps - Optional firebase-js-sdk dependency bag.
 *
 * @remarks
 * The optional `deps` argument exists for firebase-js-sdk API parity. React Native Firebase
 * ignores persistence, popup redirect resolver, and error-map dependencies because native
 * iOS/Android SDKs manage auth state and do not support the web-only persistence stack.
 * `initializeAuth()` returns the same shared Auth instance as {@link getAuth}.
 */
export function initializeAuth(app: FirebaseApp, _deps?: Dependencies): Auth {
  // Keep initializeAuth() aligned with getAuth(); passing the sentinel here creates a second module.
  return appWithAuth(app).auth();
}

/**
 * Applies an out-of-band email action code (for example from a password reset or email verification link).
 */
export function applyActionCode(auth: Auth, oobCode: string): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.applyActionCode, oobCode);
}

/**
 * Registers a callback to run before an auth state change is committed.
 *
 * @returns An unsubscribe function.
 */
export function beforeAuthStateChanged(
  auth: Auth,
  callback: (user: User | null) => void | Promise<void>,
  onAbort?: () => void,
): Unsubscribe {
  const authInternal = getAuthInternal(auth);
  return authInternal.beforeAuthStateChanged(callback, onAbort);
}

/**
 * Checks the validity of an out-of-band email action code and returns metadata about the pending operation.
 *
 * @remarks React Native Firebase normalizes native results toward firebase-js-sdk shapes, including mapping
 * `fromEmail` to `previousEmail` and coercing multi-factor info objects.
 */
export function checkActionCode(auth: Auth, oobCode: string): Promise<ActionCodeInfo> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.checkActionCode, oobCode).then(
    normalizeActionCodeInfo,
  );
}

/**
 * Confirms a password reset using the out-of-band code from the reset email.
 */
export function confirmPasswordReset(
  auth: Auth,
  oobCode: string,
  newPassword: string,
): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.confirmPasswordReset, oobCode, newPassword);
}

/**
 * Connects the Auth instance to the Auth emulator.
 *
 * @remarks Delegates to the native `useEmulator` bridge. Accepts the firebase-js-sdk
 * `options.disableWarnings` flag for {@link Auth.emulatorConfig} parity. On web, that flag
 * suppresses the emulator DOM warning banner; native iOS/Android SDKs do not surface that banner,
 * so the value is recorded on `auth.emulatorConfig.options` only. When `options` is provided,
 * `disableWarnings` is required (matching firebase-js-sdk).
 */
export function connectAuthEmulator(
  auth: Auth,
  url: string,
  options?: { disableWarnings: boolean },
): void {
  const authInternal = getAuthInternal(auth);
  callAuthMethod(authInternal, authInternal.useEmulator, url, options);
}

/**
 * Creates a new user with an email address and password.
 *
 * @remarks Returned {@link UserCredential} objects include top-level `providerId` and `operationType`
 * fields. `additionalUserInfo`, when present, is attached as a non-enumerable property.
 */
export function createUserWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.createUserWithEmailAndPassword, email, password).then(
    userCredential =>
      normalizeUserCredential(userCredential, {
        operationType: OperationType.SIGN_IN,
      }),
  );
}

/**
 * Fetches the sign-in methods available for the given email address.
 */
export function fetchSignInMethodsForEmail(auth: Auth, email: string): Promise<string[]> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.fetchSignInMethodsForEmail, email);
}

/**
 * Extracts a {@link MultiFactorResolver} from a {@link MultiFactorError}.
 *
 * @throws If the error does not contain resolver hints.
 */
export function getMultiFactorResolver(auth: Auth, error: MultiFactorError): MultiFactorResolver {
  const authInternal = getAuthInternal(auth);
  const resolver = callAuthMethod(
    authInternal,
    authInternal.getMultiFactorResolver,
    error,
  ) as MultiFactorResolverResultInternal | null;

  if (!resolver) {
    throw new Error('The provided auth error did not contain a multi-factor resolver.');
  }

  return normalizeMultiFactorResolver(resolver);
}

/**
 * Returns the redirect sign-in result after a browser redirect flow completes.
 *
 * @remarks
 * **Not supported on React Native Firebase.** Always throws synchronously because native provider
 * flows do not use the browser redirect contract from the firebase-js-sdk.
 */
export function getRedirectResult(
  _auth: Auth,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential | null> {
  throw new Error('getRedirectResult is unsupported by the native Firebase SDKs.');
}

/**
 * Checks whether an email link is a valid sign-in with email link URL.
 *
 * @remarks React Native Firebase performs this check through the native bridge and returns
 * `Promise<boolean>`. The firebase-js-sdk returns a synchronous `boolean`.
 */
export function isSignInWithEmailLink(auth: Auth, emailLink: string): Promise<boolean> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.isSignInWithEmailLink, emailLink);
}

/**
 * Subscribes to auth state changes for the given Auth instance.
 *
 * @returns An unsubscribe function.
 *
 * @remarks The legacy `error` and `completed` callback overload exists for firebase-js-sdk API parity.
 * Native auth listeners never invoke separate error or completed callbacks.
 */
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
    authInternal.onAuthStateChanged,
    normalizeAuthListener(nextOrObserver),
  );
}

/**
 * Subscribes to ID token changes for the given Auth instance.
 *
 * @returns An unsubscribe function.
 *
 * @remarks The legacy `error` and `completed` callback overload exists for firebase-js-sdk API parity.
 * Native auth listeners never invoke separate error or completed callbacks.
 */
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
    authInternal.onIdTokenChanged,
    normalizeAuthListener(nextOrObserver),
  );
}

/**
 * Revokes the given OAuth access token for the current user.
 *
 * @remarks
 * **Web only.** Always throws synchronously on React Native Firebase.
 */
export function revokeAccessToken(_auth: Auth, _token: string): Promise<void> {
  throw new Error('revokeAccessToken() is only supported on Web');
}

/**
 * Sends a password reset email to the given address.
 */
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

/**
 * Sends a sign-in with email link to the given address.
 *
 * @remarks `actionCodeSettings` is required in the modular API (matching firebase-js-sdk).
 * The namespaced `firebase.auth().sendSignInLinkToEmail(email, settings?)` API still supplies
 * defaults when settings are omitted.
 */
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

/**
 * Sets the persistence type for the Auth instance.
 *
 * @remarks
 * **Not supported on React Native Firebase.** Always throws synchronously because auth state is
 * managed by the native iOS/Android SDKs rather than the web persistence stack.
 */
export function setPersistence(_auth: Auth, _persistence: Persistence): Promise<void> {
  throw new Error('setPersistence is unsupported by the native Firebase SDKs.');
}

/**
 * Signs in anonymously.
 */
export function signInAnonymously(auth: Auth): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signInAnonymously).then(userCredential =>
    normalizeUserCredential(userCredential, {
      operationType: OperationType.SIGN_IN,
    }),
  );
}

/**
 * Signs in with the given auth credential.
 */
export function signInWithCredential(
  auth: Auth,
  credential: AuthCredential,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signInWithCredential, credential).then(
    userCredential =>
      normalizeUserCredential(userCredential, {
        providerId: credential.providerId,
        operationType: OperationType.SIGN_IN,
      }),
  );
}

/**
 * Signs in with a custom authentication token.
 */
export function signInWithCustomToken(auth: Auth, customToken: string): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signInWithCustomToken, customToken).then(
    userCredential =>
      normalizeUserCredential(userCredential, {
        operationType: OperationType.SIGN_IN,
      }),
  );
}

/**
 * Signs in with an email address and password.
 */
export function signInWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signInWithEmailAndPassword, email, password).then(
    userCredential =>
      normalizeUserCredential(userCredential, {
        operationType: OperationType.SIGN_IN,
      }),
  );
}

/**
 * Signs in using an email and sign-in with email link.
 *
 * @remarks The `emailLink` argument is optional, matching firebase-js-sdk.
 */
export function signInWithEmailLink(
  auth: Auth,
  email: string,
  emailLink?: string,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signInWithEmailLink, email, emailLink).then(
    userCredential =>
      normalizeUserCredential(userCredential, {
        providerId: ProviderId.PASSWORD,
        operationType: OperationType.SIGN_IN,
      }),
  );
}

/**
 * Signs in with a phone number and returns a confirmation result for SMS verification.
 *
 * @remarks
 * Native SDKs own the phone verification flow. The optional `appVerifier` argument from the
 * firebase-js-sdk is ignored. This modular API also does not accept RNFB's legacy `forceResend`
 * argument — use {@link verifyPhoneNumber} for the native listener / force-resend flow instead.
 */
export function signInWithPhoneNumber(
  auth: Auth,
  phoneNumber: string,
  _appVerifier?: ApplicationVerifier,
): Promise<ConfirmationResult> {
  // Native SDKs own the verification flow, so the modular wrapper intentionally ignores the
  // JS SDK's optional ApplicationVerifier and forwards only the phone number.
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signInWithPhoneNumber, phoneNumber).then(
    normalizeConfirmationResult,
  );
}

/**
 * Starts native phone number verification and returns a listener for verification events.
 *
 * @remarks React Native Firebase-specific API with no firebase-js-sdk equivalent. Use this for
 * auto-verification, resend, and multi-step phone auth flows that require native callbacks.
 */
export function verifyPhoneNumber(
  auth: Auth,
  phoneNumber: string,
  autoVerifyTimeoutOrForceResend?: number | boolean,
  forceResend?: boolean,
): PhoneAuthListener {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.verifyPhoneNumber,
    phoneNumber,
    autoVerifyTimeoutOrForceResend,
    forceResend,
  );
}

/**
 * Signs in with the given provider using a native popup-style flow where supported.
 */
export function signInWithPopup(
  auth: Auth,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.signInWithPopup,
    provider as unknown as AuthProviderWithObjectInternal,
  ).then(userCredential =>
    normalizeUserCredential(userCredential, {
      providerId: provider.providerId,
      operationType: OperationType.SIGN_IN,
    }),
  );
}

/**
 * Signs in with the given provider using a redirect-style flow.
 *
 * @remarks On React Native Firebase, native provider flows complete immediately and resolve with a
 * {@link UserCredential} instead of following the browser redirect contract used by the
 * firebase-js-sdk (which resolves later via {@link getRedirectResult}).
 */
export function signInWithRedirect(
  auth: Auth,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  // Native provider flows complete immediately and return a credential instead of following the
  // browser redirect contract from the Firebase JS SDK.
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.signInWithRedirect,
    provider as unknown as AuthProviderWithObjectInternal,
  ).then(userCredential =>
    normalizeUserCredential(userCredential, {
      providerId: provider.providerId,
      operationType: OperationType.SIGN_IN,
    }),
  );
}

/**
 * Signs out the current user for the given Auth instance.
 */
export function signOut(auth: Auth): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signOut);
}

/**
 * Updates the currently signed-in user on the Auth instance.
 */
export function updateCurrentUser(auth: Auth, user: User | null): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.updateCurrentUser, user);
}

/**
 * Sets the Auth `languageCode` from the device locale.
 *
 * @remarks
 * **Not supported on React Native Firebase.** Always throws synchronously. Set `auth.languageCode`
 * directly or use {@link setLanguageCode}.
 */
export function useDeviceLanguage(_auth: Auth): void {
  throw new Error('useDeviceLanguage is unsupported by the native Firebase SDKs');
}

/**
 * Sets the Auth language code.
 *
 * @remarks React Native Firebase exposes this as a modular helper. The firebase-js-sdk only exposes
 * the writable `auth.languageCode` property.
 */
export function setLanguageCode(auth: Auth, languageCode: string | null): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.setLanguageCode, languageCode);
}

/**
 * Configures iOS keychain access group sharing for the Auth instance.
 *
 * @remarks React Native Firebase-specific iOS helper with no firebase-js-sdk equivalent.
 */
export function useUserAccessGroup(auth: Auth, userAccessGroup: string): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.useUserAccessGroup, userAccessGroup).then(
    () => undefined,
  );
}

/**
 * Verifies a password reset code and returns the associated email address.
 */
export function verifyPasswordResetCode(auth: Auth, code: string): Promise<string> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.verifyPasswordResetCode, code);
}

/**
 * Parses an email action link string.
 *
 * @param link - The email action link to parse.
 * @returns The {@link ActionCodeURL} object, or `null` if the link is invalid.
 *
 * @remarks Pure URL parsing (ported from firebase-js-sdk). Works on all platforms without a native
 * bridge. See also {@link ActionCodeURL.parseLink}.
 */
export function parseActionCodeURL(link: string): ActionCodeURL | null {
  return ActionCodeURL.parseLink(link);
}

/**
 * Deletes the given user account.
 */
export function deleteUser(user: User): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.delete);
}

/**
 * Returns the current ID token for the user.
 */
export function getIdToken(user: User, forceRefresh?: boolean): Promise<string> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.getIdToken, forceRefresh);
}

/**
 * Returns the decoded ID token result for the user.
 */
export function getIdTokenResult(user: User, forceRefresh?: boolean): Promise<IdTokenResult> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.getIdTokenResult, forceRefresh);
}

/**
 * Links the user account with the given credential.
 */
export function linkWithCredential(
  user: User,
  credential: AuthCredential,
): Promise<UserCredential> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.linkWithCredential, credential).then(
    userCredential =>
      normalizeUserCredential(userCredential, {
        providerId: credential.providerId,
        operationType: OperationType.LINK,
      }),
  );
}

/**
 * Links the user account with a phone number using SMS verification.
 *
 * @remarks
 * **Not supported on React Native Firebase.** Always throws synchronously.
 */
export function linkWithPhoneNumber(
  _user: User,
  _phoneNumber: string,
  _appVerifier?: ApplicationVerifier,
): Promise<ConfirmationResult> {
  throw new Error('linkWithPhoneNumber is unsupported by the native Firebase SDKs');
}

/**
 * Links the user account with the given provider using a native popup-style flow where supported.
 */
export function linkWithPopup(
  user: User,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  const userInternal = getUserInternal(user);
  return callUserMethod(
    userInternal,
    userInternal.linkWithPopup,
    provider as unknown as AuthProviderWithObjectInternal,
  ).then(userCredential =>
    normalizeUserCredential(userCredential, {
      providerId: provider.providerId,
      operationType: OperationType.LINK,
    }),
  );
}

/**
 * Links the user account with the given provider using a redirect-style flow.
 *
 * @remarks On React Native Firebase, native provider flows complete immediately and resolve with a
 * {@link UserCredential} instead of following the browser redirect contract used by the
 * firebase-js-sdk.
 */
export function linkWithRedirect(
  user: User,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  // Native provider flows complete immediately and return a credential instead of following the
  // browser redirect contract from the Firebase JS SDK.
  const userInternal = getUserInternal(user);
  return callUserMethod(
    userInternal,
    userInternal.linkWithRedirect,
    provider as unknown as AuthProviderWithObjectInternal,
  ).then(userCredential =>
    normalizeUserCredential(userCredential, {
      providerId: provider.providerId,
      operationType: OperationType.LINK,
    }),
  );
}

/**
 * Returns the multi-factor interface for the given user.
 *
 * @remarks Uses the user's own Auth instance instead of always calling {@link getAuth}, which fixes
 * secondary Firebase app usage compared with earlier RNFB behavior.
 */
export function multiFactor(user: User): MultiFactorUser {
  return normalizeMultiFactorUser(
    new MultiFactorUserModule(
      ((user as unknown as UserInternal)._auth ||
        (getAuth() as unknown as UserInternal['_auth'])) as NonNullable<UserInternal['_auth']>,
      user as unknown as MultiFactorUserSourceInternal,
    ),
  );
}

/**
 * Reauthenticates the user with the given credential.
 */
export function reauthenticateWithCredential(
  user: User,
  credential: AuthCredential,
): Promise<UserCredential> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.reauthenticateWithCredential, credential).then(
    userCredential =>
      normalizeUserCredential(userCredential, {
        providerId: credential.providerId,
        operationType: OperationType.REAUTHENTICATE,
      }),
  );
}

/**
 * Reauthenticates the user with a phone number using SMS verification.
 *
 * @remarks
 * **Not supported on React Native Firebase.** Always throws synchronously.
 */
export function reauthenticateWithPhoneNumber(
  _user: User,
  _phoneNumber: string,
  _appVerifier?: ApplicationVerifier,
): Promise<ConfirmationResult> {
  throw new Error('reauthenticateWithPhoneNumber is unsupported by the native Firebase SDKs');
}

/**
 * Reauthenticates the user with the given provider using a native popup-style flow where supported.
 */
export function reauthenticateWithPopup(
  user: User,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  const userInternal = getUserInternal(user);
  return callUserMethod(
    userInternal,
    userInternal.reauthenticateWithPopup,
    provider as unknown as AuthProviderWithObjectInternal,
  ).then(userCredential =>
    normalizeUserCredential(userCredential, {
      providerId: provider.providerId,
      operationType: OperationType.REAUTHENTICATE,
    }),
  );
}

/**
 * Reauthenticates the user with the given provider using a redirect-style flow.
 *
 * @remarks On React Native Firebase, native provider flows do not follow the browser redirect
 * contract. This resolves with `void` after the native flow completes instead of the
 * firebase-js-sdk `Promise<never>` signature used for unresolved browser redirects.
 */
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

/**
 * Reloads the user's profile data from the server.
 */
export function reload(user: User): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.reload);
}

/**
 * Sends an email verification message to the user.
 */
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

/**
 * Unlinks a provider from the user account.
 */
export function unlink(user: User, providerId: string): Promise<User> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.unlink, providerId);
}

/**
 * Updates the user's email address.
 */
export function updateEmail(user: User, newEmail: string): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.updateEmail, newEmail);
}

/**
 * Updates the user's password.
 */
export function updatePassword(user: User, newPassword: string): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.updatePassword, newPassword);
}

/**
 * Updates the user's phone number using a phone auth credential.
 */
export function updatePhoneNumber(user: User, credential: PhoneAuthCredential): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.updatePhoneNumber, credential);
}

/**
 * Updates the user's display name and/or photo URL.
 */
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

/**
 * Sends a verification email to the new address before updating the user's email.
 */
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

/**
 * Returns additional OAuth / federated sign-in information from a {@link UserCredential}.
 *
 * @remarks Returns firebase-js-sdk core fields plus any extra native keys copied from the bridge.
 */
export function getAdditionalUserInfo(
  userCredential: UserCredential,
): AdditionalUserInfo | null {
  if (userCredential.additionalUserInfo) {
    return userCredential.additionalUserInfo;
  }

  const info = (userCredential as unknown as UserCredentialResultInternal).additionalUserInfo;
  if (!info) {
    return null;
  }

  return normalizeAdditionalUserInfo(info as AdditionalUserInfoSource);
}

/**
 * Returns the configured custom auth domain for the Auth instance.
 *
 * @remarks React Native Firebase-specific helper with no firebase-js-sdk equivalent.
 */
export function getCustomAuthDomain(auth: Auth): Promise<string> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.getCustomAuthDomain);
}

/**
 * Validates a password against the project's password policy.
 */
export function validatePassword(auth: Auth, password: string): Promise<PasswordValidationStatus> {
  if (!auth || !('app' in auth)) {
    throw new Error(
      `firebase.auth().validatePassword(*) 'auth' must be a valid Auth instance with an 'app' property`,
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

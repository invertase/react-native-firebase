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

import type { ModuleConfig } from '@react-native-firebase/app/dist/module/types/internal';
import type {
  FirebaseAuth,
  User,
  UserCredential,
  AuthCredential,
  AuthProvider,
  ActionCodeSettings,
  ActionCodeInfo,
  ConfirmationResult,
  MultiFactorResolver,
  MultiFactorError,
} from './auth';
import type EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';

/**
 * Phone auth listener (internal shape for modular).
 */
export interface PhoneAuthListenerInternal {
  on(
    event: string,
    observer: (snapshot: unknown) => void,
    errorCb?: (error: unknown) => void,
    successCb?: (snapshot: unknown) => void,
  ): PhoneAuthListenerInternal;
  then(onFulfilled?: ((a: unknown) => unknown) | null, onRejected?: ((a: unknown) => unknown) | null): Promise<unknown>;
  catch(onRejected: (a: unknown) => unknown): Promise<unknown>;
}

/**
 * Internal Auth type with access to methods called by modular API.
 */
export type AuthInternal = FirebaseAuth & {
  native: RNFBAuthModule;
  emitter: EventEmitter;
  eventNameForApp: (...args: Array<string | number>) => string;
  _config: ModuleConfig;
  _setUser(user?: unknown): void;
  _setUserCredential(userCredential: unknown): unknown;
  applyActionCode(code: string, ...args: unknown[]): Promise<void>;
  checkActionCode(code: string, ...args: unknown[]): Promise<ActionCodeInfo>;
  confirmPasswordReset(code: string, newPassword: string, ...args: unknown[]): Promise<void>;
  connectAuthEmulator(url: string, options?: unknown): void;
  createUserWithEmailAndPassword(email: string, password: string, ...args: unknown[]): Promise<UserCredential>;
  fetchSignInMethodsForEmail(email: string, ...args: unknown[]): Promise<string[]>;
  getMultiFactorResolver(error: MultiFactorError, ...args: unknown[]): MultiFactorResolver | null;
  isSignInWithEmailLink(emailLink: string, ...args: unknown[]): Promise<boolean>;
  onAuthStateChanged(nextOrObserver: unknown, ...args: unknown[]): () => void;
  onIdTokenChanged(nextOrObserver: unknown, ...args: unknown[]): () => void;
  sendPasswordResetEmail(email: string, actionCodeSettings?: ActionCodeSettings | null, ...args: unknown[]): Promise<void>;
  sendSignInLinkToEmail(email: string, actionCodeSettings?: ActionCodeSettings, ...args: unknown[]): Promise<void>;
  setLanguageCode(languageCode: string | null, ...args: unknown[]): Promise<void>;
  signInAnonymously(...args: unknown[]): Promise<UserCredential>;
  signInWithCredential(credential: AuthCredential, ...args: unknown[]): Promise<UserCredential>;
  signInWithCustomToken(customToken: string, ...args: unknown[]): Promise<UserCredential>;
  signInWithEmailAndPassword(email: string, password: string, ...args: unknown[]): Promise<UserCredential>;
  signInWithEmailLink(email: string, emailLink: string, ...args: unknown[]): Promise<UserCredential>;
  signInWithPhoneNumber(phoneNumber: string, forceResend?: boolean, ...args: unknown[]): Promise<ConfirmationResult>;
  signInWithPopup(provider: AuthProvider, resolver?: unknown, ...args: unknown[]): Promise<UserCredential>;
  signInWithRedirect(provider: AuthProvider, resolver?: unknown, ...args: unknown[]): Promise<UserCredential>;
  signOut(...args: unknown[]): Promise<void>;
  useEmulator(url: string, options?: unknown, ...args: unknown[]): void;
  useUserAccessGroup(userAccessGroup: string, ...args: unknown[]): Promise<null>;
  getCustomAuthDomain(...args: unknown[]): Promise<string>;
  verifyPasswordResetCode(code: string, ...args: unknown[]): Promise<string>;
  resolveMultiFactorSignIn(session: string, verificationId: string, verificationCode: string): Promise<UserCredential>;
  resolveTotpSignIn(session: string, uid: string, totpSecret: string): Promise<UserCredential>;
  verifyPhoneNumber(
    phoneNumber: string,
    autoVerifyTimeoutOrForceResend?: number | boolean,
    forceResend?: boolean,
    ...args: unknown[]
  ): PhoneAuthListenerInternal;
  verifyPhoneNumberForMultiFactor(phoneInfoOptions: { phoneNumber: string; session: string }): Promise<string>;
  verifyPhoneNumberWithMultiFactorInfo(multiFactorHint: { uid: string }, session: string): Promise<string>;
  validatePassword(password: string, ...args: unknown[]): Promise<unknown>;
};

/** Auth module with app reference (e.g. for PhoneAuthProvider). */
export type AuthModuleWithApp = { app: { auth(): AuthInternal } };

/**
 * Internal User type (implementation detail).
 */
export type UserInternal = User;

/**
 * Wrapped native module interface for Auth.
 */
/** Native user object shape returned from native module. */
export interface NativeUserShape {
  displayName?: string | null;
  email?: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  metadata?: { lastSignInTime: number; creationTime: number };
  multiFactor?: unknown;
  phoneNumber?: string | null;
  tenantId?: string | null;
  photoURL?: string | null;
  providerData?: unknown[];
  providerId?: string;
  uid?: string;
}

export interface RNFBAuthModule {
  APP_LANGUAGE: Record<string, string>;
  APP_USER: Record<string, unknown>;
  addAuthStateListener(): void;
  addIdTokenListener(): void;
  applyActionCode(code: string): Promise<void>;
  checkActionCode(code: string): Promise<ActionCodeInfo>;
  configureAuthDomain(): void;
  confirmationResultConfirm(verificationCode: string): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  confirmPasswordReset(code: string, newPassword: string): Promise<void>;
  createUserWithEmailAndPassword(email: string, password: string): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  delete(): Promise<void>;
  fetchSignInMethodsForEmail(email: string): Promise<string[]>;
  finalizeMultiFactorEnrollment(token: string, secret: string, displayName?: string): Promise<void>;
  finalizeTotpEnrollment(totpSecret: string, verificationCode: string, displayName?: string): Promise<void>;
  forceRecaptchaFlowForTesting(forceRecaptchaFlow: boolean): void;
  getCustomAuthDomain(): Promise<string>;
  getIdToken(forceRefresh?: boolean): Promise<string>;
  getIdTokenResult(forceRefresh?: boolean): Promise<unknown>;
  getMultiFactorResolver?(error: unknown): unknown;
  getSession(): Promise<unknown>;
  isSignInWithEmailLink(emailLink: string): Promise<boolean>;
  linkWithCredential(providerId: string, token: string, secret: string): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  linkWithProvider(provider: unknown): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  reload(): Promise<unknown>;
  reauthenticateWithCredential(providerId: string, token: string, secret: string): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  reauthenticateWithProvider(provider: unknown): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  resolveMultiFactorSignIn(session: string, verificationId: string, verificationCode: string): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  resolveTotpSignIn(session: string, uid: string, totpSecret: string): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  revokeToken(authorizationCode: string): Promise<void>;
  sendPasswordResetEmail(email: string, actionCodeSettings: ActionCodeSettings | null): Promise<void>;
  sendSignInLinkToEmail(email: string, actionCodeSettings: Record<string, unknown>): Promise<void>;
  sendEmailVerification(actionCodeSettings?: unknown): Promise<unknown>;
  setAppVerificationDisabledForTesting(disabled: boolean): void;
  setAutoRetrievedSmsCodeForPhoneNumber(phoneNumber: string, smsCode: string): Promise<null>;
  setLanguageCode(code: string | null): Promise<void>;
  setTenantId(tenantId: string): Promise<void>;
  signInAnonymously(): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  signInWithCredential(providerId: string, token: string, secret: string): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  signInWithCustomToken(customToken: string): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  signInWithEmailAndPassword(email: string, password: string): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  signInWithEmailLink(email: string, emailLink: string): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  signInWithPhoneNumber(phoneNumber: string, forceResend?: boolean): Promise<{ verificationId: string }>;
  signInWithProvider(provider: unknown): Promise<{ user: unknown; additionalUserInfo?: unknown }>;
  signOut(): Promise<void>;
  unlink(providerId: string): Promise<unknown>;
  updateEmail(email: string): Promise<unknown>;
  updatePassword(password: string): Promise<unknown>;
  updatePhoneNumber(providerId: string, token: string, secret: string): Promise<unknown>;
  updateProfile(updates: unknown): Promise<unknown>;
  useEmulator(host: string, port: number): void;
  useUserAccessGroup(userAccessGroup: string): Promise<null>;
  verifyBeforeUpdateEmail(newEmail: string, actionCodeSettings?: unknown): Promise<unknown>;
  verifyPasswordResetCode(code: string): Promise<string>;
  verifyPhoneNumber(phoneNumber: string, requestIdOrTimeout?: string | number, timeoutOrForceResend?: number | boolean, forceResend?: boolean): Promise<unknown>;
  verifyPhoneNumberForMultiFactor(phoneNumber: string, session: string): Promise<string>;
  verifyPhoneNumberWithMultiFactorInfo(uid: string, session: string): Promise<string>;
  unenrollMultiFactor(enrollmentId: string): Promise<void>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBAuthModule: RNFBAuthModule;
  }
}

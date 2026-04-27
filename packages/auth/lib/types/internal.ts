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

import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type {} from '@react-native-firebase/app/dist/module/internal/NativeModules';
import type {
  ModuleConfig,
  NativeErrorUserInfo,
} from '@react-native-firebase/app/dist/module/types/internal';
import type EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';
import type { Auth } from './auth';
import type { CallbackOrObserver, FirebaseAuthTypes } from './namespaced';

export interface NativeUserMetadataInternal {
  creationTime: string;
  lastSignInTime: string;
}

export interface NativeUserInternal {
  uid: string;
  providerId: string;
  providerData: FirebaseAuthTypes.UserInfo[];
  displayName?: string | null;
  email?: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  metadata: NativeUserMetadataInternal;
  multiFactor?: FirebaseAuthTypes.MultiFactor | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  tenantId?: string | null;
}

export interface NativeUserCredentialInternal {
  additionalUserInfo?: FirebaseAuthTypes.AdditionalUserInfo;
  user: NativeUserInternal;
}

export interface NativePhoneAuthCredentialInternal {
  verificationId: string;
  code?: string | null;
}

export interface NativePhoneAuthErrorInternal {
  verificationId: string;
  error: NativeErrorUserInfo;
}

export interface AuthStateChangedEventInternal {
  user: NativeUserInternal | null;
}

export interface AuthIdTokenChangedEventInternal {
  user: NativeUserInternal | null;
}

export interface PhoneAuthStateChangedEventInternal {
  requestKey: string;
  type:
    | 'onCodeSent'
    | 'onVerificationFailed'
    | 'onVerificationComplete'
    | 'onCodeAutoRetrievalTimeout';
  state: NativePhoneAuthCredentialInternal | NativePhoneAuthErrorInternal;
}

export type AuthNativeEventInternal =
  | AuthStateChangedEventInternal
  | AuthIdTokenChangedEventInternal
  | PhoneAuthStateChangedEventInternal;

export interface PasswordPolicyCustomStrengthOptionsInternal {
  minPasswordLength?: number;
  maxPasswordLength?: number;
  containsLowercaseLetter?: boolean;
  containsUppercaseLetter?: boolean;
  containsNumericCharacter?: boolean;
  containsNonAlphanumericCharacter?: boolean;
}

export interface PasswordPolicyInternal {
  readonly customStrengthOptions: PasswordPolicyCustomStrengthOptionsInternal;
  readonly allowedNonAlphanumericCharacters: string;
  readonly enforcementState: string;
  readonly forceUpgradeOnSignin: boolean;
  readonly schemaVersion: number;
  validatePassword(password: string): PasswordValidationStatusInternal;
}

export interface PasswordPolicyResponseCustomStrengthOptionsInternal {
  minPasswordLength?: number;
  maxPasswordLength?: number;
  containsLowercaseCharacter?: boolean;
  containsUppercaseCharacter?: boolean;
  containsNumericCharacter?: boolean;
  containsNonAlphanumericCharacter?: boolean;
}

export interface PasswordPolicyResponseInternal {
  customStrengthOptions?: PasswordPolicyResponseCustomStrengthOptionsInternal;
  allowedNonAlphanumericCharacters?: string[];
  enforcementState?: string;
  forceUpgradeOnSignin?: boolean;
  schemaVersion: number;
}

export type PasswordValidationStatusInternal = {
  isValid: boolean;
  meetsMinPasswordLength?: boolean;
  meetsMaxPasswordLength?: boolean;
  containsLowercaseLetter?: boolean;
  containsUppercaseLetter?: boolean;
  containsNumericCharacter?: boolean;
  containsNonAlphanumericCharacter?: boolean;
  passwordPolicy: PasswordPolicyInternal;
};

export interface PasswordPolicyHostInternal {
  app: ReactNativeFirebase.FirebaseApp;
  _tenantId: string | null;
  _projectPasswordPolicy: PasswordPolicyInternal | null;
  _tenantPasswordPolicies: Record<string, PasswordPolicyInternal | null>;
}

export interface PasswordPolicyMixinInternal {
  _getPasswordPolicyInternal(): PasswordPolicyInternal | null;
  _updatePasswordPolicy(): Promise<void>;
  _recachePasswordPolicy(): Promise<void>;
  validatePassword(password: string): Promise<PasswordValidationStatusInternal>;
}

export interface RNFBAuthModule {
  APP_LANGUAGE: Record<string, string | undefined>;
  APP_USER: Record<string, NativeUserInternal | undefined>;
  addAuthStateListener(): void | Promise<void>;
  addIdTokenListener(): void | Promise<void>;
  configureAuthDomain(): void | Promise<void>;
  setLanguageCode(code: string | null): Promise<void>;
  setTenantId(tenantId: string): Promise<void>;
  signOut(): Promise<void>;
  signInAnonymously(): Promise<NativeUserCredentialInternal>;
  signInWithPhoneNumber(
    phoneNumber: string,
    forceResend?: boolean,
  ): Promise<NativePhoneAuthCredentialInternal>;
  verifyPhoneNumber(
    phoneNumber: string,
    requestKey: string,
    timeout?: number,
    forceResend?: boolean,
  ): void | Promise<void>;
  verifyPhoneNumberWithMultiFactorInfo(
    uid: string,
    session: FirebaseAuthTypes.MultiFactorSession,
  ): Promise<string>;
  verifyPhoneNumberForMultiFactor(
    phoneNumber: string,
    session: FirebaseAuthTypes.MultiFactorSession,
  ): Promise<string>;
  resolveMultiFactorSignIn(
    session: FirebaseAuthTypes.MultiFactorSession,
    verificationId: string,
    verificationCode: string,
  ): Promise<NativeUserCredentialInternal>;
  resolveTotpSignIn(
    session: FirebaseAuthTypes.MultiFactorSession,
    uid: string,
    totpSecret: string,
  ): Promise<NativeUserCredentialInternal>;
  createUserWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<NativeUserCredentialInternal>;
  signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<NativeUserCredentialInternal>;
  signInWithCustomToken(customToken: string): Promise<NativeUserCredentialInternal>;
  signInWithCredential(
    providerId: string,
    token: string,
    secret?: string | null,
  ): Promise<NativeUserCredentialInternal>;
  revokeToken(authorizationCode: string): Promise<void>;
  sendPasswordResetEmail(
    email: string,
    actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings | null,
  ): Promise<void>;
  sendSignInLinkToEmail(
    email: string,
    actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
  ): Promise<void>;
  isSignInWithEmailLink(emailLink: string): Promise<boolean>;
  signInWithEmailLink(email: string, emailLink: string): Promise<NativeUserCredentialInternal>;
  confirmPasswordReset(code: string, newPassword: string): Promise<void>;
  applyActionCode(code: string): Promise<NativeUserInternal | null | undefined>;
  checkActionCode(code: string): Promise<FirebaseAuthTypes.ActionCodeInfo>;
  fetchSignInMethodsForEmail(email: string): Promise<string[]>;
  verifyPasswordResetCode(code: string): Promise<string>;
  useUserAccessGroup(userAccessGroup: string): Promise<null | void>;
  signInWithProvider(provider: Record<string, unknown>): Promise<NativeUserCredentialInternal>;
  useEmulator(host: string, port: number): void;
  getCustomAuthDomain(): Promise<string>;
  confirmationResultConfirm(verificationCode: string): Promise<NativeUserCredentialInternal>;
  delete(): Promise<void>;
  getIdToken(forceRefresh: boolean): Promise<string>;
  getIdTokenResult(forceRefresh: boolean): Promise<FirebaseAuthTypes.IdTokenResult>;
  linkWithCredential(
    providerId: string,
    token: string,
    secret?: string | null,
  ): Promise<NativeUserCredentialInternal>;
  linkWithProvider(provider: Record<string, unknown>): Promise<NativeUserCredentialInternal>;
  reauthenticateWithCredential(
    providerId: string,
    token: string,
    secret?: string | null,
  ): Promise<NativeUserCredentialInternal>;
  reauthenticateWithProvider(
    provider: Record<string, unknown>,
  ): Promise<NativeUserCredentialInternal>;
  reload(): Promise<NativeUserInternal>;
  sendEmailVerification(
    actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
  ): Promise<NativeUserInternal>;
  unlink(providerId: string): Promise<NativeUserInternal>;
  updateEmail(email: string): Promise<NativeUserInternal>;
  updatePassword(password: string): Promise<NativeUserInternal>;
  updatePhoneNumber(
    providerId: string,
    token: string,
    secret?: string | null,
  ): Promise<NativeUserInternal>;
  updateProfile(updates: FirebaseAuthTypes.UpdateProfile): Promise<NativeUserInternal>;
  verifyBeforeUpdateEmail(
    newEmail: string,
    actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
  ): Promise<NativeUserInternal>;
  forceRecaptchaFlowForTesting(forceRecaptchaFlow: boolean): void | Promise<void>;
  setAppVerificationDisabledForTesting(disabled: boolean): void | Promise<void>;
  setAutoRetrievedSmsCodeForPhoneNumber(phoneNumber: string, smsCode: string): Promise<null>;
  getSession(): Promise<FirebaseAuthTypes.MultiFactorSession>;
  finalizeMultiFactorEnrollment(token: string, secret: string, displayName?: string): Promise<void>;
  finalizeTotpEnrollment(
    totpSecret: string,
    verificationCode: string,
    displayName?: string,
  ): Promise<void>;
  unenrollMultiFactor(enrollmentId: string | FirebaseAuthTypes.MultiFactorInfo): Promise<void>;
  getMultiFactorResolver(error: unknown): FirebaseAuthTypes.MultiFactorResolver | null;
  generateTotpSecret(session: FirebaseAuthTypes.MultiFactorSession): Promise<{ secretKey: string }>;
  generateQrCodeUrl(secretKey: string, accountName: string, issuer: string): Promise<string>;
  openInOtpApp(secretKey: string, qrCodeUrl: string): string | void;
  assertionForSignIn(
    uid: string,
    verificationCode: string,
  ): { uid: string; verificationCode: string };
}

export type AuthInternal = Auth & {
  app: ReactNativeFirebase.FirebaseApp;
  currentUser: FirebaseAuthTypes.User | null;
  applyActionCode(code: string): Promise<void>;
  checkActionCode(code: string): Promise<FirebaseAuthTypes.ActionCodeInfo>;
  confirmPasswordReset(code: string, newPassword: string): Promise<void>;
  createUserWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.UserCredential>;
  fetchSignInMethodsForEmail(email: string): Promise<string[]>;
  getCustomAuthDomain(): Promise<string>;
  getMultiFactorResolver(error: unknown): FirebaseAuthTypes.MultiFactorResolver | null;
  isSignInWithEmailLink(emailLink: string): Promise<boolean>;
  onAuthStateChanged(
    listenerOrObserver: CallbackOrObserver<FirebaseAuthTypes.AuthListenerCallback>,
  ): () => void;
  onIdTokenChanged(
    listenerOrObserver: CallbackOrObserver<FirebaseAuthTypes.AuthListenerCallback>,
  ): () => void;
  sendPasswordResetEmail(
    email: string,
    actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings | null,
  ): Promise<void>;
  sendSignInLinkToEmail(
    email: string,
    actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
  ): Promise<void>;
  setLanguageCode(code: string | null): Promise<void>;
  signInAnonymously(): Promise<FirebaseAuthTypes.UserCredential>;
  signInWithCredential(
    credential: FirebaseAuthTypes.AuthCredential,
  ): Promise<FirebaseAuthTypes.UserCredential>;
  signInWithCustomToken(customToken: string): Promise<FirebaseAuthTypes.UserCredential>;
  signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.UserCredential>;
  signInWithEmailLink(email: string, emailLink: string): Promise<FirebaseAuthTypes.UserCredential>;
  signInWithPhoneNumber(
    phoneNumber: string,
    forceResend?: boolean,
  ): Promise<FirebaseAuthTypes.ConfirmationResult>;
  signInWithPopup(
    provider: FirebaseAuthTypes.AuthProvider,
  ): Promise<FirebaseAuthTypes.UserCredential>;
  signInWithRedirect(
    provider: FirebaseAuthTypes.AuthProvider,
  ): Promise<FirebaseAuthTypes.UserCredential>;
  signOut(): Promise<void>;
  useEmulator(url: string): void;
  useUserAccessGroup(userAccessGroup: string): Promise<void>;
  verifyPhoneNumber(
    phoneNumber: string,
    autoVerifyTimeoutOrForceResend?: number | boolean,
    forceResend?: boolean,
  ): FirebaseAuthTypes.PhoneAuthListener;
  verifyPasswordResetCode(code: string): Promise<string>;
  native: RNFBAuthModule;
  emitter: EventEmitter;
  eventNameForApp(...args: Array<string | number>): string;
  _config: ModuleConfig;
  _tenantId: string | null;
  _projectPasswordPolicy: PasswordPolicyInternal | null;
  _tenantPasswordPolicies: Record<string, PasswordPolicyInternal | null>;
  _setUser(user?: NativeUserInternal | null): FirebaseAuthTypes.User | null;
  _setUserCredential(
    userCredential: NativeUserCredentialInternal,
  ): FirebaseAuthTypes.UserCredential;
  resolveMultiFactorSignIn(
    session: FirebaseAuthTypes.MultiFactorSession,
    verificationId: string,
    verificationCode: string,
  ): Promise<FirebaseAuthTypes.UserCredential>;
  resolveTotpSignIn(
    session: FirebaseAuthTypes.MultiFactorSession,
    uid: string,
    totpSecret: string,
  ): Promise<FirebaseAuthTypes.UserCredential>;
} & PasswordPolicyMixinInternal;

export type UserInternal = FirebaseAuthTypes.User & {
  _auth?: AuthInternal;
};

export type ConfirmationResultInternal = FirebaseAuthTypes.ConfirmationResult;
export type MultiFactorResolverInternal = FirebaseAuthTypes.MultiFactorResolver;

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBAuthModule: RNFBAuthModule;
  }
}

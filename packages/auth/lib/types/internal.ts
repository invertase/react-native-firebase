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
import type {
  ActionCodeInfo,
  ActionCodeSettings,
  Auth,
  AuthCredential,
  AuthProvider,
  IdTokenResult,
  MultiFactorAssertion,
  PhoneAuthListener,
  User,
  UserCredential,
} from './auth';
import type { CallbackOrObserver, FirebaseAuthTypes } from './namespaced';

export type AuthModularDeprecationArg = string;

export type WithAuthDeprecationArg<F> = F extends (...args: infer P) => infer R
  ? (...args: [...P, AuthModularDeprecationArg]) => R
  : never;

export interface AppWithAuthInternal {
  auth(deprecationArg?: AuthModularDeprecationArg): Auth;
}

export type AuthListenerCallbackInternal = (user: User | null) => void;

export type AuthProviderWithObjectInternal = AuthProvider & {
  toObject(): Record<string, unknown>;
};

export type UserCredentialWithAdditionalUserInfoInternal = UserCredential & {
  user: FirebaseAuthTypes.User;
  additionalUserInfo?: FirebaseAuthTypes.AdditionalUserInfo;
};

export type UserCredentialResultInternal = FirebaseAuthTypes.UserCredential &
  Partial<Pick<UserCredential, 'operationType' | 'providerId'>>;

export type ActionCodeInfoResultInternal = FirebaseAuthTypes.ActionCodeInfo | ActionCodeInfo;

export type ConfirmationResultResultInternal = {
  verificationId: string | null;
  confirm(verificationCode: string): Promise<UserCredentialResultInternal | null>;
};

export type MultiFactorResolverResultInternal = {
  hints: FirebaseAuthTypes.MultiFactorInfo[];
  session: FirebaseAuthTypes.MultiFactorSession;
  resolveSignIn(
    assertion: FirebaseAuthTypes.MultiFactorAssertion | MultiFactorAssertion,
  ): Promise<UserCredentialResultInternal>;
};

export type MultiFactorUserSourceInternal = FirebaseAuthTypes.User;

export type MultiFactorUserResultInternal = {
  enrolledFactors: FirebaseAuthTypes.MultiFactorInfo[];
  getSession(): Promise<FirebaseAuthTypes.MultiFactorSession>;
  enroll(
    assertion: FirebaseAuthTypes.MultiFactorAssertion | MultiFactorAssertion,
    displayName?: string | null,
  ): Promise<void>;
  unenroll(option: FirebaseAuthTypes.MultiFactorInfo | string): Promise<void>;
};

export type MultiFactorEnrollmentAssertionInternal =
  | {
      factorId: 'phone';
      token: string;
      secret: string;
    }
  | {
      factorId: 'totp';
      totpSecret: string;
      verificationCode: string;
    };

export interface NativeUserMetadataInternal {
  creationTime: string;
  lastSignInTime: string;
}

export interface NativeUserInfoInternal {
  uid: string;
  providerId: string;
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  tenantId?: string | null;
}

export interface NativeUserInternal {
  uid: string;
  providerId: string;
  providerData: NativeUserInfoInternal[];
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
  useEmulator(host: string, port?: number): void;
  getCustomAuthDomain(): Promise<string>;
  confirmationResultConfirm(verificationCode: string): Promise<NativeUserCredentialInternal>;
  delete(): Promise<void>;
  getIdToken(forceRefresh: boolean): Promise<string>;
  getIdTokenResult(forceRefresh: boolean): Promise<IdTokenResult>;
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
  updateProfile(
    updates: { displayName?: string | null; photoURL?: string | null },
  ): Promise<NativeUserInternal>;
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
  getMultiFactorResolver(error: unknown): MultiFactorResolverResultInternal | null;
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
  checkActionCode(code: string): Promise<ActionCodeInfoResultInternal>;
  confirmPasswordReset(code: string, newPassword: string): Promise<void>;
  createUserWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  fetchSignInMethodsForEmail(email: string): Promise<string[]>;
  getCustomAuthDomain(): Promise<string>;
  getMultiFactorResolver(error: unknown): MultiFactorResolverResultInternal | null;
  isSignInWithEmailLink(emailLink: string): Promise<boolean>;
  onAuthStateChanged(
    listenerOrObserver: CallbackOrObserver<AuthListenerCallbackInternal>,
  ): () => void;
  onIdTokenChanged(
    listenerOrObserver: CallbackOrObserver<AuthListenerCallbackInternal>,
  ): () => void;
  sendPasswordResetEmail(
    email: string,
    actionCodeSettings?: ActionCodeSettings | null,
  ): Promise<void>;
  sendSignInLinkToEmail(
    email: string,
    actionCodeSettings?: ActionCodeSettings,
  ): Promise<void>;
  setLanguageCode(code: string | null): Promise<void>;
  signInAnonymously(): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  signInWithCredential(credential: AuthCredential): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  signInWithCustomToken(customToken: string): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  signInWithEmailLink(
    email: string,
    emailLink: string,
  ): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  signInWithPhoneNumber(
    phoneNumber: string,
    forceResend?: boolean,
  ): Promise<ConfirmationResultResultInternal>;
  signInWithPopup(
    provider: AuthProviderWithObjectInternal,
  ): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  signInWithRedirect(
    provider: AuthProviderWithObjectInternal,
  ): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  signOut(): Promise<void>;
  useEmulator(url: string): void;
  useUserAccessGroup(userAccessGroup: string): Promise<void>;
  verifyPhoneNumber(
    phoneNumber: string,
    autoVerifyTimeoutOrForceResend?: number | boolean,
    forceResend?: boolean,
  ): PhoneAuthListener;
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
  ): UserCredentialWithAdditionalUserInfoInternal;
  resolveMultiFactorSignIn(
    session: FirebaseAuthTypes.MultiFactorSession,
    verificationId: string,
    verificationCode: string,
  ): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  resolveTotpSignIn(
    session: FirebaseAuthTypes.MultiFactorSession,
    uid: string,
    totpSecret: string,
  ): Promise<UserCredentialWithAdditionalUserInfoInternal>;
} & PasswordPolicyMixinInternal;

export type UserInternal = FirebaseAuthTypes.User & {
  _auth?: AuthInternal;
  getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;
  linkWithCredential(credential: AuthCredential): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  linkWithPopup(provider: AuthProviderWithObjectInternal): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  linkWithRedirect(
    provider: AuthProviderWithObjectInternal,
  ): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  reauthenticateWithCredential(
    credential: AuthCredential,
  ): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  reauthenticateWithPopup(
    provider: AuthProviderWithObjectInternal,
  ): Promise<UserCredentialWithAdditionalUserInfoInternal>;
  reauthenticateWithRedirect(provider: AuthProviderWithObjectInternal): Promise<void>;
  sendEmailVerification(actionCodeSettings?: ActionCodeSettings): Promise<void>;
  unlink(providerId: string): Promise<User>;
  updateEmail(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  updatePhoneNumber(credential: AuthCredential): Promise<void>;
  updateProfile(updates: { displayName?: string | null; photoURL?: string | null }): Promise<void>;
  verifyBeforeUpdateEmail(newEmail: string, actionCodeSettings?: ActionCodeSettings): Promise<void>;
};

export type ConfirmationResultInternal = FirebaseAuthTypes.ConfirmationResult;
export type MultiFactorResolverInternal = FirebaseAuthTypes.MultiFactorResolver;

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBAuthModule: RNFBAuthModule;
  }
}

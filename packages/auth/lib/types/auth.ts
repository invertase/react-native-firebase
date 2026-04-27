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

import type { FirebaseApp, ReactNativeFirebase } from '@react-native-firebase/app';
import type { FirebaseAuthTypes } from './namespaced';

export type CompleteFn = () => void;
export type ErrorFn = (error: Error) => void;
export type NextFn<T> = (value: T) => void;
export type Unsubscribe = () => void;

interface Observer<T> {
  next?: NextFn<T> | null;
  error?: ErrorFn | null;
  complete?: CompleteFn | null;
}

export const ActionCodeOperation = {
  EMAIL_SIGNIN: 'EMAIL_SIGNIN',
  PASSWORD_RESET: 'PASSWORD_RESET',
  RECOVER_EMAIL: 'RECOVER_EMAIL',
  REVERT_SECOND_FACTOR_ADDITION: 'REVERT_SECOND_FACTOR_ADDITION',
  VERIFY_AND_CHANGE_EMAIL: 'VERIFY_AND_CHANGE_EMAIL',
  VERIFY_EMAIL: 'VERIFY_EMAIL',
} as const;

export const FactorId = {
  PHONE: 'phone',
  TOTP: 'totp',
} as const;

export const OperationType = {
  LINK: 'link',
  REAUTHENTICATE: 'reauthenticate',
  SIGN_IN: 'signIn',
} as const;

export const ProviderId = {
  FACEBOOK: 'facebook.com',
  GITHUB: 'github.com',
  GOOGLE: 'google.com',
  PASSWORD: 'password',
  PHONE: 'phone',
  TWITTER: 'twitter.com',
} as const;

export const SignInMethod = {
  EMAIL_LINK: 'emailLink',
  EMAIL_PASSWORD: 'password',
  FACEBOOK: 'facebook.com',
  GITHUB: 'github.com',
  GOOGLE: 'google.com',
  PHONE: 'phone',
  TWITTER: 'twitter.com',
} as const;

export interface Auth {
  readonly app: FirebaseApp;
  readonly name: string;
  readonly config: Config;
  setPersistence(persistence: Persistence): Promise<void>;
  languageCode: string | null;
  tenantId: string | null;
  readonly settings: AuthSettings;
  onAuthStateChanged(
    nextOrObserver: NextOrObserver<User | null>,
    error?: ErrorFn,
    completed?: CompleteFn,
  ): Unsubscribe;
  beforeAuthStateChanged(
    callback: (user: User | null) => void | Promise<void>,
    onAbort?: () => void,
  ): Unsubscribe;
  onIdTokenChanged(
    nextOrObserver: NextOrObserver<User | null>,
    error?: ErrorFn,
    completed?: CompleteFn,
  ): Unsubscribe;
  authStateReady(): Promise<void>;
  readonly currentUser: User | null;
  readonly emulatorConfig: EmulatorConfig | null;
  updateCurrentUser(user: User | null): Promise<void>;
  useDeviceLanguage(): void;
  signOut(): Promise<void>;
}

export interface AuthError extends ReactNativeFirebase.NativeFirebaseError {
  readonly customData: {
    readonly appName: string;
    readonly email?: string;
    readonly phoneNumber?: string;
    readonly tenantId?: string;
  };
}

export type NativeFirebaseAuthError = FirebaseAuthTypes.NativeFirebaseAuthError;
export type AuthCredential = FirebaseAuthTypes.AuthCredential;
export type OIDCProvider = FirebaseAuthTypes.OIDCProvider;
export interface MultiFactorError extends AuthError {
  readonly customData: AuthError['customData'] & {
    readonly operationType: (typeof OperationType)[keyof typeof OperationType];
  };
}
export type PhoneAuthListener = FirebaseAuthTypes.PhoneAuthListener;
export type PhoneAuthError = FirebaseAuthTypes.PhoneAuthError;
export type PhoneAuthSnapshot = FirebaseAuthTypes.PhoneAuthSnapshot;
export type ActionCodeURL = FirebaseAuthTypes.ActionCodeURL;

export interface Config {
  apiKey: string;
  apiHost: string;
  apiScheme: string;
  tokenApiHost: string;
  sdkClientVersion: string;
  authDomain?: string;
}

export interface AuthErrorMap {}

export interface PopupRedirectResolver {}

export interface Dependencies {
  persistence?: Persistence | Persistence[];
  popupRedirectResolver?: PopupRedirectResolver;
  errorMap?: AuthErrorMap;
}

export interface ApplicationVerifier {
  readonly type: string;
  verify(): Promise<string>;
}

export type CustomParameters = Record<string, string>;

export interface AuthProvider {
  readonly providerId: string;
}

export interface AuthSettings {
  appVerificationDisabledForTesting: boolean;
}

export interface EmulatorConfig {
  readonly protocol: string;
  readonly host: string;
  readonly port: number | null;
  readonly options: {
    readonly disableWarnings: boolean;
  };
}

export interface PasswordPolicy {
  readonly customStrengthOptions: {
    readonly minPasswordLength?: number;
    readonly maxPasswordLength?: number;
    readonly containsLowercaseLetter?: boolean;
    readonly containsUppercaseLetter?: boolean;
    readonly containsNumericCharacter?: boolean;
    readonly containsNonAlphanumericCharacter?: boolean;
  };
  readonly allowedNonAlphanumericCharacters: string;
  readonly enforcementState: string;
  readonly forceUpgradeOnSignin: boolean;
}

export interface PasswordValidationStatus {
  readonly isValid: boolean;
  readonly meetsMinPasswordLength?: boolean;
  readonly meetsMaxPasswordLength?: boolean;
  readonly containsLowercaseLetter?: boolean;
  readonly containsUppercaseLetter?: boolean;
  readonly containsNumericCharacter?: boolean;
  readonly containsNonAlphanumericCharacter?: boolean;
  readonly passwordPolicy: PasswordPolicy;
}

export interface Persistence {
  readonly type: 'SESSION' | 'LOCAL' | 'NONE' | 'COOKIE';
}

export type NextOrObserver<T> = NextFn<T | null> | Observer<T | null>;

export interface ParsedToken {
  exp?: string;
  sub?: string;
  auth_time?: string;
  iat?: string;
  firebase?: {
    sign_in_provider?: string;
    sign_in_second_factor?: string;
    identities?: Record<string, string>;
  };
  [key: string]: unknown;
}

export type UserProfile = Record<string, unknown>;

export interface AdditionalUserInfo {
  readonly isNewUser: boolean;
  readonly profile: Record<string, unknown> | null;
  readonly providerId: string | null;
  readonly username?: string | null;
}

export interface UserInfo {
  readonly displayName: string | null;
  readonly email: string | null;
  readonly phoneNumber: string | null;
  readonly photoURL: string | null;
  readonly providerId: string;
  readonly uid: string;
}

export interface UserMetadata {
  readonly creationTime?: string;
  readonly lastSignInTime?: string;
}

export interface IdTokenResult {
  authTime: string;
  expirationTime: string;
  issuedAtTime: string;
  signInProvider: string | null;
  signInSecondFactor: string | null;
  token: string;
  claims: ParsedToken;
}

export interface User extends UserInfo {
  readonly emailVerified: boolean;
  readonly isAnonymous: boolean;
  readonly metadata: UserMetadata;
  readonly providerData: UserInfo[];
  readonly refreshToken: string;
  readonly tenantId: string | null;
  delete(): Promise<void>;
  getIdToken(forceRefresh?: boolean): Promise<string>;
  getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;
  reload(): Promise<void>;
  toJSON(): object;
}

export interface UserCredential {
  user: User;
  providerId: string | null;
  operationType: (typeof OperationType)[keyof typeof OperationType];
}

export interface ConfirmationResult {
  readonly verificationId: string;
  confirm(verificationCode: string): Promise<UserCredential>;
}

export interface ActionCodeSettings {
  android?: {
    installApp?: boolean;
    minimumVersion?: string;
    packageName: string;
  };
  handleCodeInApp?: boolean;
  iOS?: {
    bundleId: string;
  };
  url: string;
  dynamicLinkDomain?: string;
  linkDomain?: string;
}

export interface ActionCodeInfo {
  data: {
    email?: string | null;
    multiFactorInfo?: MultiFactorInfo | null;
    previousEmail?: string | null;
  };
  operation: (typeof ActionCodeOperation)[keyof typeof ActionCodeOperation];
}

export interface MultiFactorAssertion {
  readonly factorId: (typeof FactorId)[keyof typeof FactorId];
}

export interface MultiFactorInfo {
  readonly uid: string;
  readonly displayName?: string | null;
  readonly enrollmentTime: string;
  readonly factorId: (typeof FactorId)[keyof typeof FactorId];
}

export interface MultiFactorSession {}

export interface MultiFactorResolver {
  readonly hints: MultiFactorInfo[];
  readonly session: MultiFactorSession;
  resolveSignIn(assertion: MultiFactorAssertion): Promise<UserCredential>;
}

export interface MultiFactorUser {
  readonly enrolledFactors: MultiFactorInfo[];
  getSession(): Promise<MultiFactorSession>;
  enroll(assertion: MultiFactorAssertion, displayName?: string | null): Promise<void>;
  unenroll(option: MultiFactorInfo | string): Promise<void>;
}

export interface PhoneMultiFactorAssertion extends MultiFactorAssertion {}

export interface PhoneMultiFactorEnrollInfoOptions {
  phoneNumber: string;
  session: MultiFactorSession;
}

export interface PhoneMultiFactorInfo extends MultiFactorInfo {
  readonly phoneNumber: string;
}

export interface PhoneMultiFactorSignInInfoOptions {
  multiFactorHint?: MultiFactorInfo;
  multiFactorUid?: string;
  session: MultiFactorSession;
}

export interface PhoneSingleFactorInfoOptions {
  phoneNumber: string;
}

export type PhoneInfoOptions =
  | PhoneSingleFactorInfoOptions
  | PhoneMultiFactorEnrollInfoOptions
  | PhoneMultiFactorSignInInfoOptions;

export interface TotpMultiFactorAssertion extends MultiFactorAssertion {}

export interface TotpMultiFactorInfo extends MultiFactorInfo {}

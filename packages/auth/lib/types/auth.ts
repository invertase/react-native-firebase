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

import type { FirebaseAuthTypes } from './namespaced';

/**
 * Auth instance from {@link getAuth} / `firebase.auth()`.
 * Uses the namespaced module shape so compatibility methods are typed (e.g. deprecation tests).
 */
export type FirebaseAuth = FirebaseAuthTypes.Module;

/**
 * Auth settings (modular API).
 */
export interface AuthSettings {
  forceRecaptchaFlowForTesting: boolean;
  appVerificationDisabledForTesting: boolean;
  setAutoRetrievedSmsCodeForPhoneNumber(phoneNumber: string, smsCode: string): Promise<null>;
}

/**
 * User profile and auth state (modular API).
 */
export interface User {
  readonly uid: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly photoURL: string | null;
  readonly emailVerified: boolean;
  readonly isAnonymous: boolean;
  readonly phoneNumber: string | null;
  readonly providerId: string;
  readonly tenantId: string | null;
  readonly providerData: UserInfo[];
  readonly metadata: UserMetadata;
  readonly multiFactor: MultiFactor | null;
  delete(): Promise<void>;
  getIdToken(forceRefresh?: boolean): Promise<string>;
  getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;
  reload(): Promise<void>;
  toJSON(): object;
}

/**
 * User info from a provider.
 */
export interface UserInfo {
  uid: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  providerId: string;
}

/**
 * User metadata.
 */
export interface UserMetadata {
  creationTime?: string;
  lastSignInTime?: string;
}

/**
 * Multi-factor on user.
 */
export interface MultiFactor {
  enrolledFactors: MultiFactorInfo[];
}

/**
 * Multi-factor info (minimal for modular).
 */
export interface MultiFactorInfo {
  uid: string;
  displayName?: string;
  factorId: string;
  enrollmentTime: string;
}

/**
 * ID token result.
 */
export interface IdTokenResult {
  token: string;
  authTime: string;
  issuedAtTime: string;
  expirationTime: string;
  signInProvider: string | null;
  claims: Record<string, unknown>;
}

/**
 * Auth credential (modular API).
 */
export interface AuthCredential {
  providerId: string;
  token: string;
  secret: string;
}

/**
 * Auth provider (modular API).
 */
export interface AuthProvider {
  readonly PROVIDER_ID: string;
  credential(token: string | null, secret?: string): AuthCredential;
  /** Serializes provider for native (e.g. OAuthProvider). */
  toObject(): unknown;
}

/**
 * User credential (modular API).
 */
export interface UserCredential {
  user: User;
  additionalUserInfo?: AdditionalUserInfo;
}

/**
 * Additional user info.
 */
export interface AdditionalUserInfo {
  isNewUser: boolean;
  profile?: Record<string, unknown>;
  providerId: string;
  username?: string;
}

/**
 * Action code settings.
 */
export interface ActionCodeSettings {
  android?: { packageName: string; installApp?: boolean; minimumVersion?: string };
  ios?: { bundleId?: string };
  handleCodeInApp?: boolean;
  url: string;
  dynamicLinkDomain?: string;
  linkDomain?: string;
}

/**
 * Action code info.
 */
export interface ActionCodeInfo {
  data: { email?: string; fromEmail?: string };
  operation: 'PASSWORD_RESET' | 'VERIFY_EMAIL' | 'RECOVER_EMAIL' | 'EMAIL_SIGNIN' | 'ERROR';
}

/**
 * Confirmation result for phone auth.
 */
export interface ConfirmationResult {
  verificationId: string | null;
  confirm(verificationCode: string): Promise<UserCredential | null>;
}

/**
 * Multi-factor resolver.
 */
export interface MultiFactorResolver {
  hints: MultiFactorInfo[];
  session: MultiFactorSession;
  resolveSignIn(assertion: MultiFactorAssertion): Promise<UserCredential>;
}

/**
 * Multi-factor session (opaque).
 */
export interface MultiFactorSession {}

/**
 * Multi-factor assertion.
 */
export interface MultiFactorAssertion {
  token: string;
  secret: string;
}

/**
 * Multi-factor error (for getMultiFactorResolver).
 */
export interface MultiFactorError {
  readonly customData: Record<string, unknown> & {
    readonly operationType: string;
  };
}

/**
 * Callback or observer type.
 */
export type Unsubscribe = () => void;

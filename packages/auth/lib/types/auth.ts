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
import type {
  CompleteFn,
  ErrorFn,
  NextFn,
  Observer,
  Unsubscribe,
} from '@react-native-firebase/app/dist/module/types/common';
import type { FirebaseAuthTypes } from './namespaced';

export type { CompleteFn, ErrorFn, NextFn, Observer, Unsubscribe };

export type FirebaseApp = ReactNativeFirebase.FirebaseApp;
export type Auth = FirebaseAuthTypes.Module;
export type NativeFirebaseAuthError = FirebaseAuthTypes.NativeFirebaseAuthError;
export type AuthCredential = FirebaseAuthTypes.AuthCredential;
export type AuthProvider = FirebaseAuthTypes.AuthProvider;
export type OAuthProvider = FirebaseAuthTypes.OAuthProvider;
export type OIDCProvider = FirebaseAuthTypes.OIDCProvider;
export type EmailAuthProvider = FirebaseAuthTypes.EmailAuthProvider;
export type PhoneAuthState = FirebaseAuthTypes.PhoneAuthState;
export type MultiFactorSession = FirebaseAuthTypes.MultiFactorSession;
export type PhoneMultiFactorGenerator = FirebaseAuthTypes.PhoneMultiFactorGenerator;
export type TotpSecret = FirebaseAuthTypes.TotpSecret;
export type TotpMultiFactorGenerator = FirebaseAuthTypes.TotpMultiFactorGenerator;
export type MultiFactorError = FirebaseAuthTypes.MultiFactorError;
export type AdditionalUserInfo = FirebaseAuthTypes.AdditionalUserInfo;
export type UserCredential = FirebaseAuthTypes.UserCredential;
export type UserMetadata = FirebaseAuthTypes.UserMetadata;
export type FactorId = FirebaseAuthTypes.FactorId;
export type MultiFactorInfo = FirebaseAuthTypes.MultiFactorInfo;
export type PhoneMultiFactorInfo = FirebaseAuthTypes.PhoneMultiFactorInfo;
export type TotpMultiFactorInfo = FirebaseAuthTypes.TotpMultiFactorInfo;
export type MultiFactorInfoCommon = FirebaseAuthTypes.MultiFactorInfoCommon;
export type MultiFactorAssertion = FirebaseAuthTypes.MultiFactorAssertion;
export type PhoneMultiFactorEnrollInfoOptions = FirebaseAuthTypes.PhoneMultiFactorEnrollInfoOptions;
export type PhoneMultiFactorSignInInfoOptions = FirebaseAuthTypes.PhoneMultiFactorSignInInfoOptions;
export type MultiFactorResolver = FirebaseAuthTypes.MultiFactorResolver;
export type MultiFactorUser = FirebaseAuthTypes.MultiFactorUser;
export type MultiFactor = FirebaseAuthTypes.MultiFactor;
export type UserInfo = FirebaseAuthTypes.UserInfo;
export type IdTokenResult = FirebaseAuthTypes.IdTokenResult;
export type UpdateProfile = FirebaseAuthTypes.UpdateProfile;
export type ConfirmationResult = FirebaseAuthTypes.ConfirmationResult;
export type ActionCodeSettingsAndroid = FirebaseAuthTypes.ActionCodeSettingsAndroid;
export type ActionCodeInfoData = FirebaseAuthTypes.ActionCodeInfoData;
export type ActionCodeInfo = FirebaseAuthTypes.ActionCodeInfo;
export type ActionCodeSettingsIos = FirebaseAuthTypes.ActionCodeSettingsIos;
export type ActionCodeSettings = FirebaseAuthTypes.ActionCodeSettings;
export type AuthListenerCallback = FirebaseAuthTypes.AuthListenerCallback;
export type PhoneAuthSnapshot = FirebaseAuthTypes.PhoneAuthSnapshot;
export type PhoneAuthError = FirebaseAuthTypes.PhoneAuthError;
export type PhoneAuthListener = FirebaseAuthTypes.PhoneAuthListener;
export type User = FirebaseAuthTypes.User;
export type ActionCodeURL = FirebaseAuthTypes.ActionCodeURL;
export type getMultiFactorResolver = FirebaseAuthTypes.getMultiFactorResolver;
export type multiFactor = FirebaseAuthTypes.multiFactor;

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

export type Persistence = {
  readonly type: 'SESSION' | 'LOCAL' | 'NONE' | 'COOKIE';
};

export interface AuthSettings {
  appVerificationDisabledForTesting: boolean;
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

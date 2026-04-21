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
import type { FirebaseAuthTypes } from './namespaced';

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
export type AuthSettings = FirebaseAuthTypes.AuthSettings;
export type User = FirebaseAuthTypes.User;
export type ActionCodeURL = FirebaseAuthTypes.ActionCodeURL;
export type PasswordPolicy = FirebaseAuthTypes.PasswordPolicy;
export type getMultiFactorResolver = FirebaseAuthTypes.getMultiFactorResolver;
export type multiFactor = FirebaseAuthTypes.multiFactor;

export interface PopupRedirectResolver {}

export interface ApplicationVerifier {
  readonly type: string;
  verify(): Promise<string>;
}

export type Persistence = {
  readonly type: 'SESSION' | 'LOCAL' | 'NONE';
};

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

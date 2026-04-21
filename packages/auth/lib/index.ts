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

export type {
  ActionCodeInfo,
  ActionCodeInfoData,
  ActionCodeSettings,
  ActionCodeSettingsAndroid,
  ActionCodeSettingsIos,
  ActionCodeURL,
  AdditionalUserInfo,
  ApplicationVerifier,
  Auth,
  AuthErrorMap,
  AuthCredential,
  AuthListenerCallback,
  AuthProvider,
  AuthSettings,
  CompleteFn,
  Config,
  ConfirmationResult,
  Dependencies,
  ErrorFn,
  FactorId,
  FirebaseApp,
  IdTokenResult,
  MultiFactor,
  MultiFactorAssertion,
  MultiFactorError,
  MultiFactorInfo,
  MultiFactorInfoCommon,
  MultiFactorResolver,
  MultiFactorSession,
  MultiFactorUser,
  NativeFirebaseAuthError,
  NextFn,
  OIDCProvider,
  Observer,
  PasswordPolicy,
  PasswordValidationStatus,
  Persistence,
  PhoneAuthError,
  PhoneAuthListener,
  PhoneAuthSnapshot,
  PhoneMultiFactorEnrollInfoOptions,
  PhoneMultiFactorInfo,
  PhoneMultiFactorSignInInfoOptions,
  PopupRedirectResolver,
  TotpMultiFactorInfo,
  UpdateProfile,
  User,
  UserCredential,
  UserInfo,
  UserMetadata,
  Unsubscribe,
} from './types/auth';
export * from './types/namespaced';
export * from './modular';
export * from './namespaced';
export { default } from './namespaced';

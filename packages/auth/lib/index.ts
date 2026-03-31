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

// Export modular types from types/auth (explicit list: `export type *` needs TS 5+; website TypeDoc uses TS 4.x)
export type {
  FirebaseAuth,
  AuthSettings,
  User,
  UserInfo,
  UserMetadata,
  MultiFactor,
  MultiFactorInfo,
  IdTokenResult,
  AuthCredential,
  AuthProvider,
  UserCredential,
  AdditionalUserInfo,
  ActionCodeSettings,
  ActionCodeInfo,
  ConfirmationResult,
  MultiFactorResolver,
  MultiFactorSession,
  MultiFactorAssertion,
  MultiFactorError,
  Unsubscribe,
} from './types/auth';

// Export modular API functions
export * from './modular';

// Export password policy types (for validatePassword return type)
export type {
  PasswordPolicyValidationStatus,
  PasswordPolicyImpl,
  PasswordPolicyCustomStrengthOptions,
  PasswordPolicyApiResponse,
} from './password-policy/PasswordPolicyImpl';

// Export namespaced API (namespace export; not `export type` — invalid for namespaces in TS 4.x)
export { FirebaseAuthTypes } from './types/namespaced';
export * from './namespaced';
export { default } from './namespaced';

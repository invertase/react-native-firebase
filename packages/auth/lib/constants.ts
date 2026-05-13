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

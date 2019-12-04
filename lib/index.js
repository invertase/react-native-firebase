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

import version from './version';
import { NativeModules } from 'react-native';
import AppleAuthModule from './AppleAuthModule';
export { default as AppleButton } from './AppleButton';

export const AppleAuthError = {
  UNKNOWN: '1000',
  CANCELED: '1001',
  INVALID_RESPONSE: '1002',
  NOT_HANDLED: '1003',
  FAILED: '1004',
};

export const AppleAuthRequestOperation = {
  IMPLICIT: 0,
  LOGIN: 1,
  REFRESH: 2,
  LOGOUT: 3,
};

export const AppleAuthRequestScope = {
  EMAIL: 0,
  FULL_NAME: 1,
};

export const AppleAuthRealUserStatus = {
  UNSUPPORTED: 0,
  UNKNOWN: 1,
  LIKELY_REAL: 2,
};

export const AppleAuthCredentialState = {
  REVOKED: 0,
  AUTHORIZED: 1,
  NOT_FOUND: 2,
  TRANSFERRED: 3,
};

export default new AppleAuthModule(NativeModules.RNAppleAuthModule, version);

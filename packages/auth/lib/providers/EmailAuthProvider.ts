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

import { createEmailAuthCredential } from '../credentials';
import type { EmailAuthCredential } from '../types/auth';

const linkProviderId = 'emailLink' as const;
const passwordProviderId = 'password' as const;

export default class EmailAuthProvider {
  static readonly EMAIL_LINK_SIGN_IN_METHOD: 'emailLink' = linkProviderId;
  static readonly EMAIL_PASSWORD_SIGN_IN_METHOD: 'password' = passwordProviderId;
  static readonly PROVIDER_ID: 'password' = passwordProviderId;

  readonly providerId = passwordProviderId;

  constructor() {
    throw new Error('`new EmailAuthProvider()` is not supported on the native Firebase SDKs.');
  }

  static credential(email: string, password: string): EmailAuthCredential {
    return createEmailAuthCredential(email, password, passwordProviderId);
  }

  static credentialWithLink(email: string, emailLink: string): EmailAuthCredential {
    return createEmailAuthCredential(email, emailLink, linkProviderId);
  }
}

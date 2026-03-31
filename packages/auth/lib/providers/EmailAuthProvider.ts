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

import type { AuthCredential } from '../types/auth';

const linkProviderId = 'emailLink';
const passwordProviderId = 'password';

export default class EmailAuthProvider {
  constructor() {
    throw new Error('`new EmailAuthProvider()` is not supported on the native Firebase SDKs.');
  }

  static get EMAIL_LINK_SIGN_IN_METHOD(): string {
    return linkProviderId;
  }

  static get EMAIL_PASSWORD_SIGN_IN_METHOD(): string {
    return passwordProviderId;
  }

  static get PROVIDER_ID(): string {
    return passwordProviderId;
  }

  static credential(email: string, password: string): AuthCredential {
    return {
      token: email,
      secret: password,
      providerId: passwordProviderId,
    };
  }

  static credentialWithLink(email: string, emailLink: string): AuthCredential {
    return {
      token: email,
      secret: emailLink,
      providerId: linkProviderId,
    };
  }
}

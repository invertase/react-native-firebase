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

import { AuthCredential, parseCredentialJSON } from './AuthCredential';

type EmailCredentialJSON = {
  email?: string;
  password?: string;
  signInMethod?: string;
  tenantId?: string | null;
};

export class EmailAuthCredential extends AuthCredential {
  constructor(
    signInMethod: 'password' | 'emailLink',
    email: string,
    password: string,
  ) {
    super(signInMethod, signInMethod, email, password);
  }

  toJSON(): object {
    return {
      email: this.token,
      password: this.secret,
      signInMethod: this.signInMethod,
      tenantId: null,
    };
  }

  static fromJSON(json: object | string): EmailAuthCredential | null {
    const parsed = parseCredentialJSON(json) as EmailCredentialJSON | null;
    if (!parsed) {
      return null;
    }

    const signInMethod = parsed.signInMethod;
    if (signInMethod !== 'password' && signInMethod !== 'emailLink') {
      return null;
    }

    if (typeof parsed.email !== 'string' || typeof parsed.password !== 'string') {
      return null;
    }

    return new EmailAuthCredential(signInMethod, parsed.email, parsed.password);
  }
}

export function createEmailAuthCredential(
  email: string,
  password: string,
  signInMethod: 'password' | 'emailLink',
): EmailAuthCredential {
  return new EmailAuthCredential(signInMethod, email, password);
}

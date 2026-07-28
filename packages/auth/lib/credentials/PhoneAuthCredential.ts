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

const providerId = 'phone' as const;

type PhoneCredentialJSON = {
  providerId?: string;
  signInMethod?: string;
  verificationId?: string;
  verificationCode?: string;
  temporaryProof?: string;
  phoneNumber?: string;
};

export class PhoneAuthCredential extends AuthCredential {
  constructor(verificationId: string, verificationCode: string) {
    super(providerId, providerId, verificationId, verificationCode);
  }

  toJSON(): object {
    return {
      verificationId: this.token,
      verificationCode: this.secret,
      providerId: this.providerId,
      signInMethod: this.signInMethod,
    };
  }

  static fromJSON(json: object | string): PhoneAuthCredential | null {
    const parsed = parseCredentialJSON(json) as PhoneCredentialJSON | null;
    if (!parsed) {
      return null;
    }

    const verificationId = parsed.verificationId;
    const verificationCode = parsed.verificationCode;
    if (typeof verificationId !== 'string' || typeof verificationCode !== 'string') {
      return null;
    }

    return new PhoneAuthCredential(verificationId, verificationCode);
  }
}

export function createPhoneAuthCredential(
  verificationId: string,
  verificationCode: string,
): PhoneAuthCredential {
  return new PhoneAuthCredential(verificationId, verificationCode);
}

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
import type { AuthModuleWithApp } from '../types/internal';

const providerId = 'phone';

export interface PhoneInfoOptions {
  phoneNumber?: string;
  session?: string;
  multiFactorHint?: { uid: string };
}

export default class PhoneAuthProvider {
  _auth: AuthModuleWithApp;

  constructor(auth: AuthModuleWithApp) {
    if (auth === undefined) {
      throw new Error('`new PhoneAuthProvider()` is not supported on the native Firebase SDKs.');
    }
    this._auth = auth;
  }

  static get PROVIDER_ID(): string {
    return providerId;
  }

  static credential(verificationId: string, code: string): AuthCredential {
    return {
      token: verificationId,
      secret: code,
      providerId,
    };
  }

  verifyPhoneNumber(phoneInfoOptions: PhoneInfoOptions, _appVerifier?: unknown): Promise<unknown> {
    if (phoneInfoOptions.multiFactorHint) {
      return this._auth.app
        .auth()
        .verifyPhoneNumberWithMultiFactorInfo(
          phoneInfoOptions.multiFactorHint,
          phoneInfoOptions.session ?? '',
        );
    }
    return this._auth.app
      .auth()
      .verifyPhoneNumberForMultiFactor(
        phoneInfoOptions as { phoneNumber: string; session: string },
      );
  }
}

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

import type {
  ApplicationVerifier,
  AuthCredential,
  MultiFactorInfo,
  PhoneMultiFactorEnrollInfoOptions,
  PhoneMultiFactorSignInInfoOptions,
} from '../types/auth';

const providerId = 'phone' as const;

type PhoneAuthProviderAuth = {
  app: {
    auth(): {
      verifyPhoneNumberWithMultiFactorInfo(
        hint: Pick<MultiFactorInfo, 'uid'>,
        session: PhoneMultiFactorSignInInfoOptions['session'],
      ): Promise<string>;
      verifyPhoneNumberForMultiFactor(
        phoneInfoOptions: PhoneMultiFactorEnrollInfoOptions,
      ): Promise<string>;
    };
  };
};

type SupportedPhoneInfoOptions =
  | PhoneMultiFactorEnrollInfoOptions
  | PhoneMultiFactorSignInInfoOptions;

function isPhoneMultiFactorSignInOptions(
  phoneInfoOptions: SupportedPhoneInfoOptions,
): phoneInfoOptions is PhoneMultiFactorSignInInfoOptions & { multiFactorHint: MultiFactorInfo } {
  return 'multiFactorHint' in phoneInfoOptions && phoneInfoOptions.multiFactorHint !== undefined;
}

function isPhoneMultiFactorEnrollOptions(
  phoneInfoOptions: SupportedPhoneInfoOptions,
): phoneInfoOptions is PhoneMultiFactorEnrollInfoOptions {
  return 'phoneNumber' in phoneInfoOptions;
}

export default class PhoneAuthProvider {
  private readonly _auth: PhoneAuthProviderAuth;

  constructor(auth: PhoneAuthProviderAuth) {
    if (auth === undefined) {
      throw new Error('`new PhoneAuthProvider()` is not supported on the native Firebase SDKs.');
    }
    this._auth = auth;
  }

  static get PROVIDER_ID() {
    return providerId;
  }

  static credential(verificationId: string, code: string): AuthCredential {
    return {
      token: verificationId,
      secret: code,
      providerId,
    };
  }

  verifyPhoneNumber(
    phoneInfoOptions: SupportedPhoneInfoOptions,
    _appVerifier?: ApplicationVerifier,
  ): Promise<string> {
    if (isPhoneMultiFactorSignInOptions(phoneInfoOptions)) {
      return this._auth.app
        .auth()
        .verifyPhoneNumberWithMultiFactorInfo(
          phoneInfoOptions.multiFactorHint,
          phoneInfoOptions.session,
        );
    }

    if (isPhoneMultiFactorEnrollOptions(phoneInfoOptions)) {
      return this._auth.app.auth().verifyPhoneNumberForMultiFactor(phoneInfoOptions);
    }

    throw new Error(
      '`PhoneAuthProvider.verifyPhoneNumber()` requires either a multi-factor hint, a multi-factor uid, or enrollment phone info.',
    );
  }
}

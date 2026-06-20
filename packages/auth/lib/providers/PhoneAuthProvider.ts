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

import { createPhoneAuthCredential } from '../credentials';
import type {
  ApplicationVerifier,
  Auth,
  AuthError,
  MultiFactorInfo,
  PhoneAuthCredential,
  PhoneAuthListener,
  PhoneInfoOptions,
  PhoneMultiFactorEnrollInfoOptions,
  PhoneMultiFactorSignInInfoOptions,
  PhoneSingleFactorInfoOptions,
  UserCredential,
} from '../types/auth';

// Keep the SDK helper signature name while mapping to RNFB's native auth error type.
type FirebaseError = AuthError;

const providerId = 'phone' as const;

type PhoneAuthProviderAuth = {
  app: {
    auth(): {
      verifyPhoneNumber(phoneNumber: string): PhoneAuthListener;
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

function isPhoneMultiFactorSignInOptions(
  phoneInfoOptions: PhoneInfoOptions,
): phoneInfoOptions is PhoneMultiFactorSignInInfoOptions {
  return (
    'session' in phoneInfoOptions &&
    (('multiFactorHint' in phoneInfoOptions && phoneInfoOptions.multiFactorHint !== undefined) ||
      ('multiFactorUid' in phoneInfoOptions && phoneInfoOptions.multiFactorUid !== undefined))
  );
}

function isPhoneMultiFactorEnrollOptions(
  phoneInfoOptions: PhoneInfoOptions,
): phoneInfoOptions is PhoneMultiFactorEnrollInfoOptions {
  return 'phoneNumber' in phoneInfoOptions && 'session' in phoneInfoOptions;
}

function isPhoneSingleFactorOptions(
  phoneInfoOptions: PhoneInfoOptions,
): phoneInfoOptions is PhoneSingleFactorInfoOptions {
  return 'phoneNumber' in phoneInfoOptions;
}

function verificationIdFromListener(listener: PhoneAuthListener): Promise<string> {
  return new Promise((resolve, reject) => {
    listener.on(
      'state_changed',
      snapshot => {
        if (snapshot.error) {
          reject(snapshot.error);
          return;
        }

        if (snapshot.verificationId) {
          resolve(snapshot.verificationId);
        }
      },
      error => reject(error),
    );
  });
}

export default class PhoneAuthProvider {
  static readonly PHONE_SIGN_IN_METHOD: 'phone' = providerId;
  static readonly PROVIDER_ID: 'phone' = providerId;

  readonly providerId = providerId;

  private readonly _auth: PhoneAuthProviderAuth;

  constructor(auth: Auth) {
    if (auth === undefined) {
      throw new Error('`new PhoneAuthProvider()` is not supported on the native Firebase SDKs.');
    }
    this._auth = auth as unknown as PhoneAuthProviderAuth;
  }

  static credential(verificationId: string, code: string): PhoneAuthCredential {
    return createPhoneAuthCredential(verificationId, code);
  }

  static credentialFromResult(_userCredential: UserCredential): PhoneAuthCredential | null {
    return null;
  }

  static credentialFromError(_error: FirebaseError): PhoneAuthCredential | null {
    return null;
  }

  verifyPhoneNumber(
    phoneInfoOptions: PhoneInfoOptions | string,
    appVerifier: ApplicationVerifier,
  ): Promise<string>;
  verifyPhoneNumber(
    phoneInfoOptions: PhoneMultiFactorEnrollInfoOptions | PhoneMultiFactorSignInInfoOptions,
  ): Promise<string>;
  verifyPhoneNumber(
    phoneInfoOptions: PhoneInfoOptions | string,
    // Native SDKs own app verification, so the JS SDK verifier is accepted for type parity only.
    _appVerifier?: ApplicationVerifier,
  ): Promise<string> {
    if (typeof phoneInfoOptions === 'string') {
      return verificationIdFromListener(this._auth.app.auth().verifyPhoneNumber(phoneInfoOptions));
    }

    if (isPhoneMultiFactorSignInOptions(phoneInfoOptions)) {
      const multiFactorHint = phoneInfoOptions.multiFactorHint ?? {
        uid: phoneInfoOptions.multiFactorUid!,
      };

      return this._auth.app
        .auth()
        .verifyPhoneNumberWithMultiFactorInfo(multiFactorHint, phoneInfoOptions.session);
    }

    if (isPhoneMultiFactorEnrollOptions(phoneInfoOptions)) {
      return this._auth.app.auth().verifyPhoneNumberForMultiFactor(phoneInfoOptions);
    }

    if (isPhoneSingleFactorOptions(phoneInfoOptions)) {
      return verificationIdFromListener(
        this._auth.app.auth().verifyPhoneNumber(phoneInfoOptions.phoneNumber),
      );
    }

    throw new Error(
      '`PhoneAuthProvider.verifyPhoneNumber()` requires a phone number, phone info options, or multi-factor phone info.',
    );
  }
}

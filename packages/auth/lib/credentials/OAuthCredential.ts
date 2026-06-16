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

type OAuthCredentialJSON = {
  providerId?: string;
  signInMethod?: string;
  idToken?: string;
  accessToken?: string;
  rawNonce?: string;
  nonce?: string;
  secret?: string;
};

export class OAuthCredential extends AuthCredential {
  readonly idToken?: string;
  readonly accessToken?: string;
  readonly rawNonce?: string;

  constructor(
    providerId: string,
    params: {
      idToken?: string;
      accessToken?: string;
      rawNonce?: string;
      secret?: string;
    },
  ) {
    const token = params.idToken ?? '';
    const secret = params.rawNonce ?? params.accessToken ?? params.secret ?? '';
    super(providerId, providerId, token, secret);
    this.idToken = params.idToken;
    this.accessToken = params.accessToken;
    this.rawNonce = params.rawNonce;
  }

  toJSON(): object {
    return {
      providerId: this.providerId,
      signInMethod: this.signInMethod,
      idToken: this.idToken,
      accessToken: this.accessToken,
      rawNonce: this.rawNonce,
      nonce: this.rawNonce,
    };
  }

  static fromJSON(json: object | string): OAuthCredential | null {
    const parsed = parseCredentialJSON(json) as OAuthCredentialJSON | null;
    if (!parsed || typeof parsed.providerId !== 'string') {
      return null;
    }

    return new OAuthCredential(parsed.providerId, {
      idToken: parsed.idToken,
      accessToken: parsed.accessToken,
      rawNonce: parsed.rawNonce ?? parsed.nonce,
      secret: parsed.secret,
    });
  }
}

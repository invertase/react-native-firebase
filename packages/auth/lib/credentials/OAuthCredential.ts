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

type OAuthCredentialParams = {
  idToken?: string;
  accessToken?: string;
  rawNonce?: string;
  secret?: string;
  /** @internal RNFB native bridge token slot override */
  bridgeToken?: string;
  /** @internal RNFB native bridge secret slot override */
  bridgeSecret?: string;
};

function resolveOAuthBridgeFields(params: OAuthCredentialParams): { token: string; secret: string } {
  if (params.bridgeToken !== undefined || params.bridgeSecret !== undefined) {
    return {
      token: params.bridgeToken ?? '',
      secret: params.bridgeSecret ?? '',
    };
  }

  if (params.idToken) {
    return {
      token: params.idToken,
      secret: params.rawNonce ?? params.secret ?? params.accessToken ?? '',
    };
  }

  if (params.accessToken) {
    // OAuthProvider access-token-only credentials use the secret bridge slot.
    return {
      token: '',
      secret: params.accessToken,
    };
  }

  return {
    token: params.secret ?? '',
    secret: params.rawNonce ?? '',
  };
}

export class OAuthCredential extends AuthCredential {
  readonly idToken?: string;
  readonly accessToken?: string;
  /** @remarks Used for Sign in with Apple and Facebook limited-login flows. OAuth 1.0 token secrets (e.g. Twitter) use the inherited AuthCredential secret bridge field instead. */
  readonly rawNonce?: string;

  constructor(providerId: string, params: OAuthCredentialParams) {
    const bridge = resolveOAuthBridgeFields(params);
    super(providerId, providerId, bridge.token, bridge.secret);
    this.idToken = params.idToken;
    this.accessToken = params.accessToken;
    this.rawNonce = params.rawNonce;
  }

  toJSON(): object {
    const json: Record<string, unknown> = {
      providerId: this.providerId,
      signInMethod: this.signInMethod,
      idToken: this.idToken,
      accessToken: this.accessToken,
      rawNonce: this.rawNonce,
      nonce: this.rawNonce,
    };
    // Twitter (and similar) store the token secret in the native bridge secret slot, not rawNonce.
    if (this.secret && !this.rawNonce) {
      json.secret = this.secret;
    }
    return json;
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

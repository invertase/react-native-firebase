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

import { OAuthCredential } from '../credentials';
import type {
  AuthCredential,
  AuthError,
  CustomParameters,
  OAuthCredentialOptions,
  UserCredential,
} from '../types/auth';

type OAuthCredentialJSON = OAuthCredentialOptions & {
  providerId?: string;
  nonce?: string;
};

type ParsedOAuthCredentialJSON = OAuthCredentialOptions & {
  providerId: string;
  nonce?: string;
};

function parseOAuthCredentialJSON(json: object | string): ParsedOAuthCredentialJSON {
  let parsed: object;

  if (typeof json === 'string') {
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error(
        "firebase.auth.OAuthProvider.credentialFromJSON(*) expected 'json' to be a valid JSON string.",
      );
    }
  } else {
    if (json === null || Array.isArray(json)) {
      throw new Error(
        "firebase.auth.OAuthProvider.credentialFromJSON(*) expected 'json' to be an object or string.",
      );
    }
    parsed = json;
  }

  const credential = parsed as OAuthCredentialJSON;
  if (typeof credential.providerId !== 'string') {
    throw new Error(
      "firebase.auth.OAuthProvider.credentialFromJSON(*) expected 'providerId' to be a string value.",
    );
  }

  return credential as ParsedOAuthCredentialJSON;
}

// Keep the SDK helper signature name while mapping to RNFB's native auth error type.
type FirebaseError = AuthError;

export default class OAuthProvider {
  /** @internal */
  private providerId: string;
  /** @internal */
  private customParameters: CustomParameters = {};
  /** @internal */
  private scopes: string[] = [];

  constructor(providerId: string) {
    this.providerId = providerId;
  }

  /** @internal */
  static credential(idToken: string, accessToken?: string): AuthCredential {
    return new OAuthProvider('oauth').credential({
      idToken,
      accessToken,
    });
  }

  static credentialFromJSON(json: object | string): OAuthCredential {
    const credential = parseOAuthCredentialJSON(json);

    return new OAuthProvider(credential.providerId).credential({
      idToken: credential.idToken,
      accessToken: credential.accessToken,
      rawNonce: credential.rawNonce ?? credential.nonce,
    });
  }

  /** @remarks Always returns `null` on React Native Firebase. */
  static credentialFromResult(_userCredential: UserCredential): OAuthCredential | null {
    return null;
  }

  /** @remarks Always returns `null` on React Native Firebase. */
  static credentialFromError(_error: FirebaseError): OAuthCredential | null {
    return null;
  }

  credential(params: OAuthCredentialOptions): OAuthCredential {
    return new OAuthCredential(this.providerId, {
      idToken: params.idToken,
      accessToken: params.accessToken,
      rawNonce: params.rawNonce,
    });
  }

  get PROVIDER_ID() {
    return this.providerId;
  }

  setCustomParameters(customOAuthParameters: CustomParameters): OAuthProvider {
    this.customParameters = customOAuthParameters;
    return this;
  }

  getCustomParameters(): CustomParameters {
    return this.customParameters;
  }

  addScope(scope: string): OAuthProvider {
    if (!this.scopes.includes(scope)) {
      this.scopes.push(scope);
    }
    return this;
  }

  getScopes(): string[] {
    return [...this.scopes];
  }

  /** @internal */
  toObject(): { providerId: string; scopes: string[]; customParameters: CustomParameters } {
    return {
      providerId: this.providerId,
      scopes: this.scopes,
      customParameters: this.customParameters,
    };
  }
}

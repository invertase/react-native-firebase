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

import type { AuthError, OAuthCredential, UserCredential } from '../types/auth';

// Keep the SDK helper signature name while mapping to RNFB's native auth error type.
type FirebaseError = AuthError;

const providerId = 'google.com' as const;

export default class GoogleAuthProvider {
  static readonly GOOGLE_SIGN_IN_METHOD: 'google.com' = providerId;
  static readonly PROVIDER_ID: 'google.com' = providerId;

  constructor() {
    throw new Error('`new GoogleAuthProvider()` is not supported on the native Firebase SDKs.');
  }

  static credential(idToken?: string | null, accessToken?: string | null): OAuthCredential {
    if (idToken == null && accessToken == null) {
      throw new Error('At least one of ID token and access token must be non-null');
    }

    const token = idToken ?? '';
    const secret = accessToken ?? '';

    return {
      token,
      secret,
      providerId,
      signInMethod: providerId,
      idToken: idToken ?? undefined,
      accessToken: accessToken ?? undefined,
      toJSON() {
        return {
          providerId: this.providerId,
          signInMethod: this.signInMethod,
          idToken: this.idToken,
          accessToken: this.accessToken,
          rawNonce: this.rawNonce,
          nonce: this.rawNonce,
        };
      },
    };
  }

  static credentialFromResult(_userCredential: UserCredential): OAuthCredential | null {
    return null;
  }

  static credentialFromError(_error: FirebaseError): OAuthCredential | null {
    return null;
  }
}

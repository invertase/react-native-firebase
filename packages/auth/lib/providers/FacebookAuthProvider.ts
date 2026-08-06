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
import type { AuthError, UserCredential } from '../types/auth';

// Keep the SDK helper signature name while mapping to RNFB's native auth error type.
type FirebaseError = AuthError;

const providerId = 'facebook.com' as const;

export default class FacebookAuthProvider {
  static readonly FACEBOOK_SIGN_IN_METHOD: 'facebook.com' = providerId;
  static readonly PROVIDER_ID: 'facebook.com' = providerId;

  constructor() {
    throw new Error('`new FacebookAuthProvider()` is not supported on the native Firebase SDKs.');
  }

  /**
   * @remarks Optional `secret` for Facebook limited-login nonce behaviour (matches firebase-js-sdk).
   */
  static credential(token: string): OAuthCredential;
  static credential(token: string, secret: string): OAuthCredential;
  static credential(token: string, secret?: string): OAuthCredential {
    const nonce = secret ?? '';
    return new OAuthCredential(providerId, {
      accessToken: token,
      rawNonce: nonce || undefined,
      bridgeToken: token,
      bridgeSecret: nonce,
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
}

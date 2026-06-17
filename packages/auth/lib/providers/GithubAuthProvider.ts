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

const providerId = 'github.com' as const;

export default class GithubAuthProvider {
  static readonly GITHUB_SIGN_IN_METHOD: 'github.com' = providerId;
  static readonly PROVIDER_ID: 'github.com' = providerId;

  constructor() {
    throw new Error('`new GithubAuthProvider()` is not supported on the native Firebase SDKs.');
  }

  static credential(token: string): OAuthCredential {
    return new OAuthCredential(providerId, {
      accessToken: token,
      bridgeToken: token,
      bridgeSecret: '',
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

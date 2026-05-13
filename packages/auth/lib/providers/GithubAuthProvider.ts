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

import type { OAuthCredential } from '../types/auth';

const providerId = 'github.com' as const;

export default class GithubAuthProvider {
  static readonly GITHUB_SIGN_IN_METHOD: 'github.com' = providerId;
  static readonly PROVIDER_ID: 'github.com' = providerId;

  constructor() {
    throw new Error('`new GithubAuthProvider()` is not supported on the native Firebase SDKs.');
  }

  static credential(token: string): OAuthCredential {
    return {
      token,
      secret: '',
      providerId,
      signInMethod: providerId,
      accessToken: token,
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
}

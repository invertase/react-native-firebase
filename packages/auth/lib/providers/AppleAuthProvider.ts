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
import type { AppleFullPersonName, AuthCredential as AuthCredentialType } from '../types/auth';

const providerId = 'apple.com' as const;

/**
 * @deprecated Use {@link OAuthProvider} with provider ID `apple.com` instead.
 *
 * @example
 * ```js
 * const provider = new OAuthProvider('apple.com');
 * const credential = provider.credential({ idToken, rawNonce, fullName });
 * ```
 */
export default class AppleAuthProvider {
  constructor() {
    throw new Error('`new AppleAuthProvider()` is not supported on the native Firebase SDKs.');
  }

  static get PROVIDER_ID() {
    return providerId;
  }

  /**
   * @param token The Apple identity token.
   * @param secret The raw nonce used to obtain the identity token.
   * @param fullName The user's full name, as shared by Sign in with Apple on the user's first
   * authorization. See {@link OAuthCredentialOptions.fullName} for platform support.
   */
  static credential(
    token: string,
    secret?: string,
    fullName?: AppleFullPersonName,
  ): AuthCredentialType {
    return new OAuthCredential(providerId, {
      idToken: token,
      rawNonce: secret,
      fullName,
      bridgeToken: token,
      bridgeSecret: secret ?? '',
    });
  }
}

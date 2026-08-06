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

import { AuthCredential } from '../credentials';
import type { AuthCredential as AuthCredentialType } from '../types/auth';

const providerId = 'oidc.' as const;

/**
 * @deprecated Use {@link OAuthProvider} with provider ID `oidc.<your-provider-id>` instead.
 *
 * @example
 * ```js
 * const provider = new OAuthProvider('oidc.sample-provider');
 * const credential = provider.credential({ idToken, accessToken });
 * ```
 */
export default class OIDCAuthProvider {
  constructor() {
    throw new Error('`new OIDCAuthProvider()` is not supported on the native Firebase SDKs.');
  }

  static get PROVIDER_ID() {
    return providerId;
  }

  static credential(oidcSuffix: string, idToken: string, accessToken?: string): AuthCredentialType {
    const resolvedProviderId = providerId + oidcSuffix;
    return new AuthCredential(resolvedProviderId, resolvedProviderId, idToken, accessToken ?? '');
  }
}

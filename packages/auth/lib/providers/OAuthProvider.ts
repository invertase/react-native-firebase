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

import type { AuthCredential } from '../types/auth';

export default class OAuthProvider {
  #providerId: string | null = null;
  #customParameters: Record<string, unknown> = {};
  #scopes: string[] = [];

  constructor(providerId: string) {
    this.#providerId = providerId;
  }

  static credential(idToken: string, accessToken: string): AuthCredential {
    return {
      token: idToken,
      secret: accessToken,
      providerId: 'oauth',
    };
  }

  get PROVIDER_ID(): string | null {
    return this.#providerId;
  }

  setCustomParameters(customOAuthParameters: Record<string, unknown>): this {
    this.#customParameters = customOAuthParameters;
    return this;
  }

  getCustomParameters(): Record<string, unknown> {
    return this.#customParameters;
  }

  addScope(scope: string): this {
    if (!this.#scopes.includes(scope)) {
      this.#scopes.push(scope);
    }
    return this;
  }

  getScopes(): string[] {
    return [...this.#scopes];
  }

  /** @internal */
  toObject(): {
    providerId: string | null;
    scopes: string[];
    customParameters: Record<string, unknown>;
  } {
    return {
      providerId: this.#providerId,
      scopes: this.#scopes,
      customParameters: this.#customParameters,
    };
  }
}

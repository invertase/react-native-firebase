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

export default class OAuthProvider {
  /** @internal */
  #providerId = null;
  /** @internal */
  #customParameters = {};
  /** @internal */
  #scopes = [];

  constructor(providerId) {
    this.#providerId = providerId;
  }

  static credential(idToken, accessToken) {
    return {
      token: idToken,
      secret: accessToken,
      providerId: 'oauth',
    };
  }

  get PROVIDER_ID() {
    return this.#providerId;
  }

  setCustomParameters(customOAuthParameters) {
    this.#customParameters = customOAuthParameters;
    return this;
  }

  getCustomParameters() {
    return this.#customParameters;
  }

  addScope(scope) {
    if (!this.#scopes.includes(scope)) {
      this.#scopes.push(scope);
    }
    return this;
  }

  getScopes() {
    return [...this.#scopes];
  }

  /** @internal */
  toObject() {
    return {
      providerId: this.#providerId,
      scopes: this.#scopes,
      customParameters: this.#customParameters,
    };
  }
}

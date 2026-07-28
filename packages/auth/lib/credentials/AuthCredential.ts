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

export function parseCredentialJSON(json: object | string): object | null {
  if (typeof json === 'string') {
    try {
      return JSON.parse(json) as object;
    } catch {
      return null;
    }
  }

  if (json === null || Array.isArray(json)) {
    return null;
  }

  return json;
}

export class AuthCredential {
  readonly providerId: string;
  readonly signInMethod: string;
  /** @internal RNFB native bridge token slot. */
  readonly token: string;
  /** @internal RNFB native bridge secret slot. */
  readonly secret: string;

  constructor(providerId: string, signInMethod: string, token: string, secret: string) {
    this.providerId = providerId;
    this.signInMethod = signInMethod;
    this.token = token;
    this.secret = secret;
  }

  toJSON(): object {
    return {
      providerId: this.providerId,
      signInMethod: this.signInMethod,
    };
  }
}

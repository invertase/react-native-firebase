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

import type { AuthInternal } from './types/internal';

interface ResolverShape {
  hints: unknown[];
  session: string;
}

export default class MultiFactorResolver {
  _auth: AuthInternal;
  hints: unknown[];
  session: string;

  constructor(auth: AuthInternal, resolver: ResolverShape) {
    this._auth = auth;
    this.hints = resolver.hints;
    this.session = resolver.session;
  }

  resolveSignIn(assertion: { token?: string; secret?: string; uid?: string; verificationCode?: string }): Promise<unknown> {
    const { token, secret, uid, verificationCode } = assertion;

    if (token && secret) {
      return this._auth.resolveMultiFactorSignIn(this.session, token, secret);
    }

    return this._auth.resolveTotpSignIn(this.session, uid ?? '', verificationCode ?? '');
  }
}

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

import { reload } from './modular';
import type { AuthInternal } from './types/internal';
import type { FirebaseAuth, User } from './types/auth';
import UserClass from './User';

/** User shape with multiFactor (required for MultiFactorUser). */
interface UserWithMultiFactor {
  multiFactor: { enrolledFactors: unknown[] };
}

/**
 * Return a MultiFactorUser instance the gateway to multi-factor operations.
 */
export function multiFactor(auth: FirebaseAuth): MultiFactorUser {
  return new MultiFactorUser(auth as AuthInternal);
}

export class MultiFactorUser {
  _auth: AuthInternal;
  _user: UserWithMultiFactor;
  enrolledFactors: unknown[];

  constructor(auth: AuthInternal, user?: User) {
    this._auth = auth;
    const u = (user ?? auth.currentUser) as UserWithMultiFactor;
    this._user = u;
    this.enrolledFactors = this._user.multiFactor.enrolledFactors;
  }

  getSession(): Promise<unknown> {
    return this._auth.native.getSession();
  }

  /**
   * Finalize the enrollment process for the given multi-factor assertion.
   * Optionally set a displayName. This method will reload the current user
   * profile, which is necessary to see the multi-factor changes.
   */
  async enroll(
    multiFactorAssertion: {
      token?: string;
      secret?: string;
      totpSecret?: string;
      verificationCode?: string;
    },
    displayName?: string,
  ): Promise<void> {
    const { token, secret, totpSecret, verificationCode } = multiFactorAssertion;
    if (token && secret) {
      await this._auth.native.finalizeMultiFactorEnrollment(token, secret, displayName);
    } else if (totpSecret && verificationCode) {
      await this._auth.native.finalizeTotpEnrollment(totpSecret, verificationCode, displayName);
    } else {
      throw new Error('Invalid multi-factor assertion provided for enrollment.');
    }

    return reload(this._auth.currentUser as UserClass);
  }

  async unenroll(enrollmentId: string): Promise<void> {
    await this._auth.native.unenrollMultiFactor(enrollmentId);

    if (this._auth.currentUser) {
      return reload(this._auth.currentUser as UserClass);
    }
  }
}

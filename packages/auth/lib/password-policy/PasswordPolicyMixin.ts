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

import { fetchPasswordPolicy } from './passwordPolicyApi';
import { PasswordPolicyImpl } from './PasswordPolicyImpl';
import type {
  PasswordPolicyHostInternal,
  PasswordPolicyInternal,
  PasswordPolicyMixinInternal,
  PasswordValidationStatusInternal,
} from '../types/internal';

const EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1;

type PasswordPolicyMixinTarget = PasswordPolicyHostInternal & PasswordPolicyMixinInternal;
type PasswordPolicyMixinShape = PasswordPolicyMixinInternal & ThisType<PasswordPolicyMixinTarget>;

/**
 * Password policy mixin - provides password policy caching and validation.
 * Expects the target object to have: _tenantId, _projectPasswordPolicy,
 * _tenantPasswordPolicies, and app.options.apiKey
 */
export const PasswordPolicyMixin: PasswordPolicyMixinShape = {
  _getPasswordPolicyInternal(): PasswordPolicyInternal | null {
    if (this._tenantId === null) {
      return this._projectPasswordPolicy;
    }
    return this._tenantPasswordPolicies[this._tenantId] ?? null;
  },

  async _updatePasswordPolicy(): Promise<void> {
    const response = await fetchPasswordPolicy(this);
    const passwordPolicy = new PasswordPolicyImpl(response);
    if (this._tenantId === null) {
      this._projectPasswordPolicy = passwordPolicy;
    } else {
      this._tenantPasswordPolicies[this._tenantId] = passwordPolicy;
    }
  },

  async _recachePasswordPolicy(): Promise<void> {
    if (this._getPasswordPolicyInternal()) {
      await this._updatePasswordPolicy();
    }
  },

  async validatePassword(password: string): Promise<PasswordValidationStatusInternal> {
    let passwordPolicy = this._getPasswordPolicyInternal();

    if (!passwordPolicy) {
      await this._updatePasswordPolicy();
      passwordPolicy = this._getPasswordPolicyInternal();
    }

    if (!passwordPolicy) {
      throw new Error(
        'firebase.auth().validatePassword(*) Failed to load password policy for validation.',
      );
    }

    if (passwordPolicy.schemaVersion !== EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION) {
      throw new Error(
        'auth/unsupported-password-policy-schema-version: The password policy received from the backend uses a schema version that is not supported by this version of the SDK.',
      );
    }

    return passwordPolicy.validatePassword(password);
  },
};

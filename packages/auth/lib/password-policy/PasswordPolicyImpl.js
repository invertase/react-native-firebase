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

// Minimum min password length enforced by the backend, even if no minimum length is set.
const MINIMUM_MIN_PASSWORD_LENGTH = 6;

/**
 * Stores password policy requirements and provides password validation against the policy.
 *
 * @internal
 */
export class PasswordPolicyImpl {
  constructor(response) {
    // Only include custom strength options defined in the response.
    const responseOptions = response.customStrengthOptions;
    this.customStrengthOptions = {};
    this.customStrengthOptions.minPasswordLength =
      responseOptions.minPasswordLength ?? MINIMUM_MIN_PASSWORD_LENGTH;
    if (responseOptions.maxPasswordLength) {
      this.customStrengthOptions.maxPasswordLength = responseOptions.maxPasswordLength;
    }
    if (responseOptions.containsLowercaseCharacter !== undefined) {
      this.customStrengthOptions.containsLowercaseLetter =
        responseOptions.containsLowercaseCharacter;
    }
    if (responseOptions.containsUppercaseCharacter !== undefined) {
      this.customStrengthOptions.containsUppercaseLetter =
        responseOptions.containsUppercaseCharacter;
    }
    if (responseOptions.containsNumericCharacter !== undefined) {
      this.customStrengthOptions.containsNumericCharacter =
        responseOptions.containsNumericCharacter;
    }
    if (responseOptions.containsNonAlphanumericCharacter !== undefined) {
      this.customStrengthOptions.containsNonAlphanumericCharacter =
        responseOptions.containsNonAlphanumericCharacter;
    }

    this.enforcementState =
      response.enforcementState === 'ENFORCEMENT_STATE_UNSPECIFIED'
        ? 'OFF'
        : response.enforcementState;

    // Use an empty string if no non-alphanumeric characters are specified in the response.
    this.allowedNonAlphanumericCharacters =
      response.allowedNonAlphanumericCharacters?.join('') ?? '';

    this.forceUpgradeOnSignin = response.forceUpgradeOnSignin ?? false;
    this.schemaVersion = response.schemaVersion;
  }

  validatePassword(password) {
    const status = {
      isValid: true,
      passwordPolicy: this,
    };

    this.validatePasswordLengthOptions(password, status);
    this.validatePasswordCharacterOptions(password, status);

    status.isValid &&= status.meetsMinPasswordLength ?? true;
    status.isValid &&= status.meetsMaxPasswordLength ?? true;
    status.isValid &&= status.containsLowercaseLetter ?? true;
    status.isValid &&= status.containsUppercaseLetter ?? true;
    status.isValid &&= status.containsNumericCharacter ?? true;
    status.isValid &&= status.containsNonAlphanumericCharacter ?? true;

    return status;
  }

  validatePasswordLengthOptions(password, status) {
    const minPasswordLength = this.customStrengthOptions.minPasswordLength;
    const maxPasswordLength = this.customStrengthOptions.maxPasswordLength;
    if (minPasswordLength) {
      status.meetsMinPasswordLength = password.length >= minPasswordLength;
    }
    if (maxPasswordLength) {
      status.meetsMaxPasswordLength = password.length <= maxPasswordLength;
    }
  }

  validatePasswordCharacterOptions(password, status) {
    this.updatePasswordCharacterOptionsStatuses(status, false, false, false, false);

    for (let i = 0; i < password.length; i++) {
      const passwordChar = password.charAt(i);
      this.updatePasswordCharacterOptionsStatuses(
        status,
        passwordChar >= 'a' && passwordChar <= 'z',
        passwordChar >= 'A' && passwordChar <= 'Z',
        passwordChar >= '0' && passwordChar <= '9',
        this.allowedNonAlphanumericCharacters.includes(passwordChar),
      );
    }
  }

  updatePasswordCharacterOptionsStatuses(
    status,
    containsLowercaseCharacter,
    containsUppercaseCharacter,
    containsNumericCharacter,
    containsNonAlphanumericCharacter,
  ) {
    if (this.customStrengthOptions.containsLowercaseLetter) {
      status.containsLowercaseLetter ||= containsLowercaseCharacter;
    }
    if (this.customStrengthOptions.containsUppercaseLetter) {
      status.containsUppercaseLetter ||= containsUppercaseCharacter;
    }
    if (this.customStrengthOptions.containsNumericCharacter) {
      status.containsNumericCharacter ||= containsNumericCharacter;
    }
    if (this.customStrengthOptions.containsNonAlphanumericCharacter) {
      status.containsNonAlphanumericCharacter ||= containsNonAlphanumericCharacter;
    }
  }
}
export default PasswordPolicyImpl;

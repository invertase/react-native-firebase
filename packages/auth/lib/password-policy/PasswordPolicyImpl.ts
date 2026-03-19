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

const MINIMUM_MIN_PASSWORD_LENGTH = 6;

export interface PasswordPolicyApiResponse {
  customStrengthOptions?: {
    minPasswordLength?: number;
    maxPasswordLength?: number;
    containsLowercaseCharacter?: boolean;
    containsUppercaseCharacter?: boolean;
    containsNumericCharacter?: boolean;
    containsNonAlphanumericCharacter?: boolean;
  };
  enforcementState?: string;
  allowedNonAlphanumericCharacters?: string[];
  forceUpgradeOnSignin?: boolean;
  schemaVersion?: number;
}

export interface PasswordPolicyCustomStrengthOptions {
  minPasswordLength: number;
  maxPasswordLength?: number;
  containsLowercaseLetter?: boolean;
  containsUppercaseLetter?: boolean;
  containsNumericCharacter?: boolean;
  containsNonAlphanumericCharacter?: boolean;
}

export interface PasswordPolicyValidationStatus {
  isValid: boolean;
  passwordPolicy: PasswordPolicyImpl;
  meetsMinPasswordLength?: boolean;
  meetsMaxPasswordLength?: boolean;
  containsLowercaseLetter?: boolean;
  containsUppercaseLetter?: boolean;
  containsNumericCharacter?: boolean;
  containsNonAlphanumericCharacter?: boolean;
}

/**
 * Stores password policy requirements and provides password validation against the policy.
 *
 * @internal
 */
export class PasswordPolicyImpl {
  customStrengthOptions: PasswordPolicyCustomStrengthOptions;
  enforcementState: string;
  allowedNonAlphanumericCharacters: string;
  forceUpgradeOnSignin: boolean;
  schemaVersion: number | undefined;

  constructor(response: PasswordPolicyApiResponse) {
    const responseOptions = response.customStrengthOptions ?? {};
    this.customStrengthOptions = {
      minPasswordLength:
        responseOptions.minPasswordLength ?? MINIMUM_MIN_PASSWORD_LENGTH,
    };
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
        : (response.enforcementState ?? 'OFF');

    this.allowedNonAlphanumericCharacters =
      response.allowedNonAlphanumericCharacters?.join('') ?? '';

    this.forceUpgradeOnSignin = response.forceUpgradeOnSignin ?? false;
    this.schemaVersion = response.schemaVersion;
  }

  validatePassword(password: string): PasswordPolicyValidationStatus {
    const status: PasswordPolicyValidationStatus = {
      isValid: true,
      passwordPolicy: this,
    };

    this.validatePasswordLengthOptions(password, status);
    this.validatePasswordCharacterOptions(password, status);

    status.isValid = status.isValid && (status.meetsMinPasswordLength ?? true);
    status.isValid = status.isValid && (status.meetsMaxPasswordLength ?? true);
    status.isValid = status.isValid && (status.containsLowercaseLetter ?? true);
    status.isValid = status.isValid && (status.containsUppercaseLetter ?? true);
    status.isValid = status.isValid && (status.containsNumericCharacter ?? true);
    status.isValid = status.isValid && (status.containsNonAlphanumericCharacter ?? true);

    return status;
  }

  validatePasswordLengthOptions(
    password: string,
    status: PasswordPolicyValidationStatus,
  ): void {
    const minPasswordLength = this.customStrengthOptions.minPasswordLength;
    const maxPasswordLength = this.customStrengthOptions.maxPasswordLength;
    if (minPasswordLength) {
      status.meetsMinPasswordLength = password.length >= minPasswordLength;
    }
    if (maxPasswordLength) {
      status.meetsMaxPasswordLength = password.length <= maxPasswordLength;
    }
  }

  validatePasswordCharacterOptions(
    password: string,
    status: PasswordPolicyValidationStatus,
  ): void {
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
    status: PasswordPolicyValidationStatus,
    containsLowercaseCharacter: boolean,
    containsUppercaseCharacter: boolean,
    containsNumericCharacter: boolean,
    containsNonAlphanumericCharacter: boolean,
  ): void {
    if (this.customStrengthOptions.containsLowercaseLetter) {
      status.containsLowercaseLetter =
        (status.containsLowercaseLetter ?? false) || containsLowercaseCharacter;
    }
    if (this.customStrengthOptions.containsUppercaseLetter) {
      status.containsUppercaseLetter =
        (status.containsUppercaseLetter ?? false) || containsUppercaseCharacter;
    }
    if (this.customStrengthOptions.containsNumericCharacter) {
      status.containsNumericCharacter =
        (status.containsNumericCharacter ?? false) || containsNumericCharacter;
    }
    if (this.customStrengthOptions.containsNonAlphanumericCharacter) {
      status.containsNonAlphanumericCharacter =
        (status.containsNonAlphanumericCharacter ?? false) ||
        containsNonAlphanumericCharacter;
    }
  }
}

export default PasswordPolicyImpl;

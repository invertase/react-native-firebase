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

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockPasswordPolicy = {
  schemaVersion: 1,
  customStrengthOptions: {
    minPasswordLength: 8,
    maxPasswordLength: 100,
    containsLowercaseCharacter: true,
    containsUppercaseCharacter: true,
    containsNumericCharacter: true,
    containsNonAlphanumericCharacter: true,
  },
  allowedNonAlphanumericCharacters: ['!', '@', '#', '$', '%'],
  enforcementState: 'ENFORCE',
};

const mockFetchPasswordPolicy = jest.fn().mockResolvedValue(mockPasswordPolicy);

jest.unstable_mockModule('../lib/password-policy/passwordPolicyApi', () => ({
  fetchPasswordPolicy: mockFetchPasswordPolicy,
}));

describe('validatePassword', () => {
  let validatePassword;
  let mockAuthDefault;
  let mockAuthSecondary;

  beforeEach(async () => {
    jest.resetModules();

    mockFetchPasswordPolicy.mockClear();
    mockFetchPasswordPolicy.mockResolvedValue(mockPasswordPolicy);

    jest.unstable_mockModule('../lib/password-policy/passwordPolicyApi', () => ({
      fetchPasswordPolicy: mockFetchPasswordPolicy,
    }));

    const modular = await import('../lib/modular/index.js');
    validatePassword = modular.validatePassword;

    mockAuthDefault = {
      app: {
        name: '[DEFAULT]',
        options: { apiKey: 'test-api-key-default' },
      },
    };

    mockAuthSecondary = {
      app: {
        name: 'secondaryApp',
        options: { apiKey: 'test-api-key-secondary' },
      },
    };
  });

  describe('password policy caching', () => {
    it('should fetch password policy on first call', async () => {
      await validatePassword(mockAuthDefault, 'Password123$');

      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);
      expect(mockFetchPasswordPolicy).toHaveBeenCalledWith(mockAuthDefault);
    });

    it('should use cached policy on subsequent calls for same app', async () => {
      await validatePassword(mockAuthDefault, 'Password123$');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);

      await validatePassword(mockAuthDefault, 'AnotherPassword1!');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);

      await validatePassword(mockAuthDefault, 'YetAnother1@');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);
    });

    it('should maintain separate cache per app', async () => {
      await validatePassword(mockAuthDefault, 'Password123$');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);
      expect(mockFetchPasswordPolicy).toHaveBeenCalledWith(mockAuthDefault);

      await validatePassword(mockAuthSecondary, 'Password123$');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(2);
      expect(mockFetchPasswordPolicy).toHaveBeenCalledWith(mockAuthSecondary);

      await validatePassword(mockAuthDefault, 'AnotherPassword1!');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(2);

      await validatePassword(mockAuthSecondary, 'AnotherPassword1!');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(2);
    });

    it('should return correct validation status using cached policy', async () => {
      const status1 = await validatePassword(mockAuthDefault, 'Password123$');
      expect(status1.isValid).toBe(true);

      const status2 = await validatePassword(mockAuthDefault, 'weak');
      expect(status2.isValid).toBe(false);

      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);
    });
  });
});

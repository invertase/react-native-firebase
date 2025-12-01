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
  let mockAuth;

  beforeEach(async () => {
    jest.resetModules();

    mockFetchPasswordPolicy.mockClear();
    mockFetchPasswordPolicy.mockResolvedValue(mockPasswordPolicy);

    jest.unstable_mockModule('../lib/password-policy/passwordPolicyApi', () => ({
      fetchPasswordPolicy: mockFetchPasswordPolicy,
    }));

    const modular = await import('../lib/modular/index.js');
    validatePassword = modular.validatePassword;

    // Create a mock auth instance that mimics FirebaseAuthModule
    mockAuth = {
      app: {
        name: '[DEFAULT]',
        options: { apiKey: 'test-api-key-default' },
      },
      _tenantId: null,
      _projectPasswordPolicy: null,
      _tenantPasswordPolicies: {},
    };

    const { PasswordPolicyImpl } = await import('../lib/password-policy/PasswordPolicyImpl.js');

    mockAuth._getPasswordPolicyInternal = function () {
      if (this._tenantId === null) {
        return this._projectPasswordPolicy;
      }
      return this._tenantPasswordPolicies[this._tenantId];
    };

    mockAuth._updatePasswordPolicy = async function () {
      const response = await mockFetchPasswordPolicy(this);
      const passwordPolicy = new PasswordPolicyImpl(response);
      if (this._tenantId === null) {
        this._projectPasswordPolicy = passwordPolicy;
      } else {
        this._tenantPasswordPolicies[this._tenantId] = passwordPolicy;
      }
    };

    mockAuth._recachePasswordPolicy = async function () {
      if (this._getPasswordPolicyInternal()) {
        await this._updatePasswordPolicy();
      }
    };

    mockAuth.validatePassword = async function (password) {
      if (!this._getPasswordPolicyInternal()) {
        await this._updatePasswordPolicy();
      }
      const passwordPolicy = this._getPasswordPolicyInternal();

      if (passwordPolicy.schemaVersion !== 1) {
        throw new Error(
          'auth/unsupported-password-policy-schema-version: The password policy received from the backend uses a schema version that is not supported by this version of the SDK.',
        );
      }

      return passwordPolicy.validatePassword(password);
    };
  });

  describe('caching behavior', () => {
    it('should fetch password policy on first call', async () => {
      await validatePassword(mockAuth, 'Password123$');

      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);
      expect(mockFetchPasswordPolicy).toHaveBeenCalledWith(mockAuth);
    });

    it('should use cached policy on subsequent calls for same auth instance', async () => {
      await validatePassword(mockAuth, 'Password123$');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);

      await validatePassword(mockAuth, 'AnotherPassword1!');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);

      await validatePassword(mockAuth, 'YetAnother1@');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);
    });

    it('should cache at project level when tenantId is null', async () => {
      mockAuth._tenantId = null;

      await validatePassword(mockAuth, 'Password123$');

      expect(mockAuth._projectPasswordPolicy).not.toBeNull();
      expect(Object.keys(mockAuth._tenantPasswordPolicies).length).toBe(0);
    });

    it('should cache separately per tenant', async () => {
      // First tenant
      mockAuth._tenantId = 'tenant-1';
      await validatePassword(mockAuth, 'Password123$');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);

      // Same tenant should use cache
      await validatePassword(mockAuth, 'AnotherPassword1!');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);

      // Different tenant should fetch again
      mockAuth._tenantId = 'tenant-2';
      await validatePassword(mockAuth, 'Password123$');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(2);

      // Back to first tenant should use its cache
      mockAuth._tenantId = 'tenant-1';
      await validatePassword(mockAuth, 'Password123$');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(2);

      // Verify both tenant policies are cached
      expect(mockAuth._tenantPasswordPolicies['tenant-1']).toBeDefined();
      expect(mockAuth._tenantPasswordPolicies['tenant-2']).toBeDefined();
    });

    it('should keep project and tenant caches separate', async () => {
      // Project level (no tenant)
      mockAuth._tenantId = null;
      await validatePassword(mockAuth, 'Password123$');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);

      // Tenant level
      mockAuth._tenantId = 'tenant-1';
      await validatePassword(mockAuth, 'Password123$');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(2);

      // Back to project level should use project cache
      mockAuth._tenantId = null;
      await validatePassword(mockAuth, 'Password123$');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(2);

      // Verify both caches exist
      expect(mockAuth._projectPasswordPolicy).not.toBeNull();
      expect(mockAuth._tenantPasswordPolicies['tenant-1']).toBeDefined();
    });

    it('should return correct validation status using cached policy', async () => {
      const status1 = await validatePassword(mockAuth, 'Password123$');
      expect(status1.isValid).toBe(true);

      const status2 = await validatePassword(mockAuth, 'weak');
      expect(status2.isValid).toBe(false);

      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);
    });
  });

  describe('schema validation', () => {
    it('should throw error on unsupported schema version', async () => {
      const unsupportedPolicy = {
        ...mockPasswordPolicy,
        schemaVersion: 2,
      };
      mockFetchPasswordPolicy.mockResolvedValueOnce(unsupportedPolicy);

      await expect(validatePassword(mockAuth, 'Password123$')).rejects.toThrow(
        'auth/unsupported-password-policy-schema-version',
      );
    });

    it('should accept schema version 1', async () => {
      const validPolicy = {
        ...mockPasswordPolicy,
        schemaVersion: 1,
      };
      mockFetchPasswordPolicy.mockResolvedValueOnce(validPolicy);

      const status = await validatePassword(mockAuth, 'Password123$');
      expect(status.isValid).toBe(true);
    });
  });

  describe('cache invalidation', () => {
    it('should refresh cache when _recachePasswordPolicy is called with existing cache', async () => {
      // First call caches the policy
      await validatePassword(mockAuth, 'Password123$');
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(1);

      // Simulate cache invalidation
      await mockAuth._recachePasswordPolicy();
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(2);
    });

    it('should not fetch when _recachePasswordPolicy is called without existing cache', async () => {
      // No prior validation, so no cache exists
      await mockAuth._recachePasswordPolicy();
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(0);
    });

    it('should refresh correct tenant cache on invalidation', async () => {
      // Cache for tenant-1
      mockAuth._tenantId = 'tenant-1';
      await validatePassword(mockAuth, 'Password123$');

      // Cache for tenant-2
      mockAuth._tenantId = 'tenant-2';
      await validatePassword(mockAuth, 'Password123$');

      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(2);

      // Invalidate tenant-1 cache
      mockAuth._tenantId = 'tenant-1';
      await mockAuth._recachePasswordPolicy();

      // Should have fetched again for tenant-1
      expect(mockFetchPasswordPolicy).toHaveBeenCalledTimes(3);
    });
  });

  describe('input validation', () => {
    it('should throw error for null password', async () => {
      await expect(validatePassword(mockAuth, null)).rejects.toThrow(
        "firebase.auth().validatePassword(*) expected 'password' to be a non-null or a defined value.",
      );
    });

    it('should throw error for undefined password', async () => {
      await expect(validatePassword(mockAuth, undefined)).rejects.toThrow(
        "firebase.auth().validatePassword(*) expected 'password' to be a non-null or a defined value.",
      );
    });
  });
});

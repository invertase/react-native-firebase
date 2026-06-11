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

/**
 * Status indicating why a SIM slot does or does not support phone number verification.
 * Maps to the native `VerificationSupportStatus` IntDef constants.
 */
export type VerificationSupportStatus =
  | 'CAPABILITY_STATUS_UNSPECIFIED'
  | 'CAPABLE'
  | 'INCAPABLE_DUE_TO_CARRIER_UNSUPPORTED'
  | 'INCAPABLE_DUE_TO_ANDROID_VERSION'
  | 'INCAPABLE_DUE_TO_SIM_STATE';

/**
 * Result describing whether a specific SIM slot supports phone number verification.
 */
export interface VerificationSupportInfo {
  /** Whether this SIM slot supports phone number verification. */
  isSupported: boolean;
  /** The SIM slot index (0-based). */
  simSlot: number;
  /** The carrier identifier string for this SIM slot. */
  carrierId: string;
  /** The detailed reason for the support status. */
  reason: VerificationSupportStatus;
}

/**
 * Result of a successful phone number verification, containing the verified
 * phone number and a JWT token for server-side validation.
 */
export interface VerifiedPhoneNumberResult {
  /** The verified phone number (E.164 format). */
  phoneNumber: string;
  /** The raw JWT token string for server-side validation. */
  token: string;
  /** Token expiration time as Unix epoch seconds. */
  expirationTimestamp: number;
  /** Token issued-at time as Unix epoch seconds. */
  issuedAtTimestamp: number;
  /** The nonce from the JWT payload, or null if not present. */
  nonce: string | null;
  /** All JWT claims as a key-value map, or null if unavailable. */
  claims: Record<string, unknown> | null;
}

/**
 * Error codes returned by the Firebase Phone Number Verification SDK.
 * These map to `FirebasePnvStatusCodes` constants.
 */
export type PnvErrorCode =
  | 'carrier-not-supported'
  | 'invalid-digital-credential-response'
  | 'integrity-check-failed'
  | 'preflight-check-failed'
  | 'unsupported-operation'
  | 'credential-manager-error'
  | 'invalid-test-number-id'
  | 'test-session-already-enabled'
  | 'activity-context-required'
  | 'unknown';

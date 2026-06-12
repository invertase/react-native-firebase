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

import type { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Status indicating why a SIM slot does or does not support phone number verification.
 * Maps to the native `VerificationSupportStatus` IntDef constants.
 *
 * @remarks
 * Returned as the {@link VerificationSupportResult.reason} field. Use this to determine
 * whether to fall back to an alternative verification method (e.g. SMS).
 *
 * @see https://firebase.google.com/docs/phone-number-verification
 * @public
 */
export type VerificationSupportStatus =
  | 'CAPABILITY_STATUS_UNSPECIFIED'
  | 'CAPABLE'
  | 'INCAPABLE_DUE_TO_CARRIER_UNSUPPORTED'
  | 'INCAPABLE_DUE_TO_ANDROID_VERSION'
  | 'INCAPABLE_DUE_TO_SIM_STATE';

/**
 * Result describing whether a specific SIM slot supports phone number verification.
 *
 * @remarks
 * Mirrors the native `com.google.firebase.pnv.VerificationSupportResult` class.
 * One instance is returned per SIM slot when calling `getVerificationSupportInfo()`.
 *
 * @see https://firebase.google.com/docs/phone-number-verification
 * @public
 */
export interface VerificationSupportResult {
  /** Whether this SIM slot supports phone number verification. */
  readonly isSupported: boolean;
  /** The SIM slot index (0-based). */
  readonly simSlot: number;
  /** The carrier identifier string for this SIM slot. */
  readonly carrierId: string;
  /** The detailed reason for the support status. */
  readonly reason: VerificationSupportStatus;
}

/**
 * Result of a successful phone number verification, containing the verified
 * phone number and a JWT token for server-side validation.
 *
 * @remarks
 * Mirrors the native `com.google.firebase.pnv.VerifiedPhoneNumberTokenResult` class.
 * Returned by `getVerifiedPhoneNumber()` and `exchangeCredentialResponseForPhoneNumber()`.
 *
 * @see https://firebase.google.com/docs/phone-number-verification
 * @public
 */
export interface VerifiedPhoneNumberTokenResult {
  /** The verified phone number in E.164 format. */
  readonly phoneNumber: string;
  /** The raw JWT token string for server-side validation. */
  readonly token: string;
  /** Token expiration time as Unix epoch seconds. */
  readonly expirationTimestamp: number;
  /** Token issued-at time as Unix epoch seconds. */
  readonly issuedAtTimestamp: number;
  /** The nonce from the JWT payload, or `null` if not present. */
  readonly nonce: string | null;
  /** All JWT claims as a key-value map, or `null` if unavailable. */
  readonly claims: Record<string, unknown> | null;
}

/**
 * Error codes returned by the Firebase Phone Number Verification SDK.
 * These map to `FirebasePnvStatusCodes` constants from the native SDK.
 *
 * @see https://firebase.google.com/docs/phone-number-verification
 * @public
 */
export const PnvErrorCode = {
  CARRIER_NOT_SUPPORTED: 'pnv/carrier-not-supported',
  INVALID_DIGITAL_CREDENTIAL_RESPONSE: 'pnv/invalid-digital-credential-response',
  INTEGRITY_CHECK_FAILED: 'pnv/integrity-check-failed',
  PREFLIGHT_CHECK_FAILED: 'pnv/preflight-check-failed',
  UNSUPPORTED_OPERATION: 'pnv/unsupported-operation',
  CREDENTIAL_MANAGER_ERROR: 'pnv/credential-manager-error',
  INVALID_TEST_NUMBER_ID: 'pnv/invalid-test-number-id',
  TEST_SESSION_ALREADY_ENABLED: 'pnv/test-session-already-enabled',
  ACTIVITY_CONTEXT_REQUIRED: 'pnv/activity-context-required',
  UNKNOWN: 'pnv/unknown',
} as const;

/**
 * Union of all {@link PnvErrorCode} string values.
 *
 * @public
 */
export type PnvErrorCode = (typeof PnvErrorCode)[keyof typeof PnvErrorCode];

/**
 * Error thrown when a Phone Number Verification operation fails.
 *
 * @remarks
 * Native rejections from the Android bridge surface as {@link ReactNativeFirebase.NativeFirebaseError}
 * with a narrowed {@link PnvErrorCode} on the `code` property.
 *
 * @see https://firebase.google.com/docs/phone-number-verification
 * @public
 */
export interface PnvError extends ReactNativeFirebase.NativeFirebaseError {
  readonly code: PnvErrorCode;
}

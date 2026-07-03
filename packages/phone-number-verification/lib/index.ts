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

import { Platform } from 'react-native';
import { getReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';

import type { VerificationSupportResult, VerifiedPhoneNumberTokenResult } from './types/pnv';

export { PnvErrorCode } from './types/pnv';
export type * from './types/pnv';

const UNSUPPORTED_MSG = 'Firebase Phone Number Verification is only supported on Android.';

// NewArch-AD-18 E10: package bypasses createModuleNamespace by design.
const NATIVE_MODULE_NAME = 'NativeRNFBTurboPnv';

interface NativePnvModule {
  enableTestSession(token: string): Promise<void>;
  getVerificationSupportInfo(): Promise<VerificationSupportResult[]>;
  getVerificationSupportInfoForSimSlot(simSlot: number): Promise<VerificationSupportResult[]>;
  getVerifiedPhoneNumber(): Promise<VerifiedPhoneNumberTokenResult>;
  getDigitalCredentialPayload(nonce: string): Promise<string>;
  exchangeCredentialResponseForPhoneNumber(
    dcApiResponse: string,
  ): Promise<VerifiedPhoneNumberTokenResult>;
}

let memoizedNativeModule: NativePnvModule | null = null;

function getNativeModule(): NativePnvModule {
  if (Platform.OS !== 'android') {
    throw new Error(UNSUPPORTED_MSG);
  }
  if (memoizedNativeModule) {
    return memoizedNativeModule;
  }
  const mod = getReactNativeModule(NATIVE_MODULE_NAME);
  if (!mod) {
    throw new Error(
      `Could not find native module '${NATIVE_MODULE_NAME}'. Ensure @react-native-firebase/phone-number-verification is linked.`,
    );
  }
  memoizedNativeModule = mod as unknown as NativePnvModule;
  return memoizedNativeModule;
}

/**
 * Enables a test session for SIM-less testing.
 * Must be called only once per app instance; subsequent calls will reject with
 * error code `pnv/test-session-already-enabled`.
 *
 * @remarks
 * In test mode, phone numbers follow the format: valid country code followed by all zeros.
 * Requires a test token generated from the Firebase Console (7-day TTL).
 *
 * @param token - The test token generated from the Firebase Console.
 * @throws `pnv/test-session-already-enabled` if called more than once.
 * @throws `pnv/invalid-test-number-id` if the token is empty, expired, or duplicated.
 * @see https://firebase.google.com/docs/phone-number-verification
 */
export function enableTestSession(token: string): Promise<void> {
  return getNativeModule().enableTestSession(token);
}

/**
 * Checks if the device's SIM card(s) support phone number verification.
 *
 * @remarks
 * This method does not require user consent and can be called freely.
 * Returns one `VerificationSupportResult` per SIM slot (or one entry if `simSlot` is specified).
 *
 * @param simSlot - Optional 0-based SIM slot index to query a specific slot instead of all slots.
 * @returns Array of support results, one per SIM slot.
 * @see https://firebase.google.com/docs/phone-number-verification
 */
export function getVerificationSupportInfo(simSlot?: number): Promise<VerificationSupportResult[]> {
  if (simSlot !== undefined) {
    return getNativeModule().getVerificationSupportInfoForSimSlot(simSlot);
  }
  return getNativeModule().getVerificationSupportInfo();
}

/**
 * Initiates the phone number verification flow, including user consent and token generation.
 * A consent dialog will be presented to the user.
 *
 * @remarks
 * The app should prepare the user for the consent screen before calling this method.
 *
 * @returns The verified phone number and a JWT token with full claims for server-side validation.
 * @throws `pnv/carrier-not-supported` if the carrier does not support PNV.
 * @throws `pnv/activity-context-required` if no foreground Activity is available.
 * @see https://firebase.google.com/docs/phone-number-verification/android/get-started
 */
export function getVerifiedPhoneNumber(): Promise<VerifiedPhoneNumberTokenResult> {
  return getNativeModule().getVerifiedPhoneNumber();
}

/**
 * Generates a digital credential payload for use with Android Credential Manager.
 * Part of the custom verification flow.
 *
 * @param nonce - A unique value to prevent replay attacks.
 * @returns The digital credential payload string.
 * @see https://firebase.google.com/docs/phone-number-verification
 */
export function getDigitalCredentialPayload(nonce: string): Promise<string> {
  return getNativeModule().getDigitalCredentialPayload(nonce);
}

/**
 * Exchanges a Credential Manager response for a verified phone number.
 * Part of the custom verification flow.
 *
 * @param dcApiResponse - The JWT from the Credential Manager response.
 * @returns The verified phone number and a JWT token with full claims for server-side validation.
 * @throws `pnv/invalid-digital-credential-response` if the response is invalid.
 * @see https://firebase.google.com/docs/phone-number-verification
 */
export function exchangeCredentialResponseForPhoneNumber(
  dcApiResponse: string,
): Promise<VerifiedPhoneNumberTokenResult> {
  return getNativeModule().exchangeCredentialResponseForPhoneNumber(dcApiResponse);
}

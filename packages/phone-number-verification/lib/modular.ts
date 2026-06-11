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

import type { VerificationSupportInfo, VerifiedPhoneNumberResult } from './types/pnv';

const UNSUPPORTED_MSG = 'Firebase Phone Number Verification is only supported on Android.';

const NATIVE_MODULE_NAME = 'RNFBPnvModule';

interface NativePnvModule {
  enableTestSession(token: string): Promise<void>;
  getVerificationSupportInfo(): Promise<VerificationSupportInfo[]>;
  getVerifiedPhoneNumber(): Promise<VerifiedPhoneNumberResult>;
  getDigitalCredentialPayload(nonce: string): Promise<string>;
  exchangeCredentialResponseForPhoneNumber(dcApiResponse: string): Promise<VerifiedPhoneNumberResult>;
}

function getNativeModule(): NativePnvModule {
  if (Platform.OS !== 'android') {
    throw new Error(UNSUPPORTED_MSG);
  }
  const mod = getReactNativeModule(NATIVE_MODULE_NAME);
  if (!mod) {
    throw new Error(
      `Could not find native module '${NATIVE_MODULE_NAME}'. Ensure @react-native-firebase/phone-number-verification is linked.`,
    );
  }
  return mod as unknown as NativePnvModule;
}

/**
 * Enables a test session for SIM-less testing.
 * Must be called only once per instance; subsequent calls will throw.
 *
 * In test mode, phone numbers follow the format: valid country code followed by all zeros.
 *
 * @param token - The test token generated from the Firebase Console.
 */
export function enableTestSession(token: string): Promise<void> {
  return getNativeModule().enableTestSession(token);
}

/**
 * Checks if the device's SIM card(s) support phone number verification.
 * @returns Array of support info results, one per SIM slot.
 */
export function getVerificationSupportInfo(): Promise<VerificationSupportInfo[]> {
  return getNativeModule().getVerificationSupportInfo();
}

/**
 * Initiates the phone number verification flow, including user consent and token generation.
 * @returns The verified phone number and a token for server-side validation.
 */
export function getVerifiedPhoneNumber(): Promise<VerifiedPhoneNumberResult> {
  return getNativeModule().getVerifiedPhoneNumber();
}

/**
 * Generates a digital credential payload for use with Android Credential Manager.
 * Part of the custom verification flow.
 * @param nonce - A unique value to prevent replay attacks.
 * @returns The digital credential payload string.
 */
export function getDigitalCredentialPayload(nonce: string): Promise<string> {
  return getNativeModule().getDigitalCredentialPayload(nonce);
}

/**
 * Exchanges a Credential Manager response for a verified phone number.
 * Part of the custom verification flow.
 * @param dcApiResponse - The JWT from the Credential Manager response.
 * @returns The verified phone number and a token for server-side validation.
 */
export function exchangeCredentialResponseForPhoneNumber(
  dcApiResponse: string,
): Promise<VerifiedPhoneNumberResult> {
  return getNativeModule().exchangeCredentialResponseForPhoneNumber(dcApiResponse);
}

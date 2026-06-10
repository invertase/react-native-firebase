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

import { getApp, type FirebaseApp } from '@react-native-firebase/app';

import type {
  PhoneNumberVerification,
  VerificationSupportInfo,
  VerifiedPhoneNumberResult,
} from './types/pnv';

/**
 * Returns the Phone Number Verification instance for the given app.
 * @param app - The Firebase app instance. Optional, defaults to the default app.
 * @returns PhoneNumberVerification instance
 */
export function getPhoneNumberVerification(
  app?: FirebaseApp,
): PhoneNumberVerification {
  const appInstance = app ? (getApp(app.name) as FirebaseApp) : (getApp() as FirebaseApp);
  return (appInstance as any).phoneNumberVerification() as PhoneNumberVerification;
}

/**
 * Enables a test session for SIM-less testing.
 * Must be called only once per instance; subsequent calls will throw.
 * @param pnv - The PhoneNumberVerification instance.
 * @param token - The test token generated from the Firebase Console.
 */
export function enableTestSession(
  pnv: PhoneNumberVerification,
  token: string,
): Promise<void> {
  return pnv.enableTestSession(token);
}

/**
 * Checks if the device's SIM card(s) support phone number verification.
 * @param pnv - The PhoneNumberVerification instance.
 * @returns Array of support info results, one per SIM slot.
 */
export function getVerificationSupportInfo(
  pnv: PhoneNumberVerification,
): Promise<VerificationSupportInfo[]> {
  return pnv.getVerificationSupportInfo();
}

/**
 * Initiates the phone number verification flow, including user consent and token generation.
 * @param pnv - The PhoneNumberVerification instance.
 * @returns The verified phone number and a token for server-side validation.
 */
export function getVerifiedPhoneNumber(
  pnv: PhoneNumberVerification,
): Promise<VerifiedPhoneNumberResult> {
  return pnv.getVerifiedPhoneNumber();
}

/**
 * Generates a digital credential payload for use with Android Credential Manager.
 * Part of the custom verification flow.
 * @param pnv - The PhoneNumberVerification instance.
 * @param nonce - A unique value to prevent replay attacks.
 * @returns The digital credential payload string.
 */
export function getDigitalCredentialPayload(
  pnv: PhoneNumberVerification,
  nonce: string,
): Promise<string> {
  return pnv.getDigitalCredentialPayload(nonce);
}

/**
 * Exchanges a Credential Manager response for a verified phone number.
 * Part of the custom verification flow.
 * @param pnv - The PhoneNumberVerification instance.
 * @param dcApiResponse - The JWT from the Credential Manager response.
 * @returns The verified phone number and a token for server-side validation.
 */
export function exchangeCredentialResponseForPhoneNumber(
  pnv: PhoneNumberVerification,
  dcApiResponse: string,
): Promise<VerifiedPhoneNumberResult> {
  return pnv.exchangeCredentialResponseForPhoneNumber(dcApiResponse);
}

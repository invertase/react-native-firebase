/**
 * Known differences between the firebase-js-sdk public API and
 * the @react-native-firebase/phone-number-verification modular API.
 *
 * Each entry must have a `name` and a `reason`. Undocumented drift fails CI.
 */

import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  nameMapping: {},

  missingInRN: [
  ],

  extraInRN: [
    { name: 'enableTestSession', reason: 'RN Firebase export for the native phone-number-verification module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'getVerificationSupportInfo', reason: 'RN Firebase export for the native phone-number-verification module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'getVerifiedPhoneNumber', reason: 'RN Firebase export for the native phone-number-verification module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'getDigitalCredentialPayload', reason: 'RN Firebase export for the native phone-number-verification module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'exchangeCredentialResponseForPhoneNumber', reason: 'RN Firebase export for the native phone-number-verification module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'PnvErrorCode', reason: 'RN Firebase export for the native phone-number-verification module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'VerificationSupportStatus', reason: 'RN Firebase export for the native phone-number-verification module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'VerificationSupportResult', reason: 'RN Firebase export for the native phone-number-verification module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'VerifiedPhoneNumberTokenResult', reason: 'RN Firebase export for the native phone-number-verification module. The firebase-js-sdk does not ship a modular public API for this product.' },
    { name: 'PnvError', reason: 'RN Firebase export for the native phone-number-verification module. The firebase-js-sdk does not ship a modular public API for this product.' },
  ],

  differentShape: [
  ],
};

export default config;

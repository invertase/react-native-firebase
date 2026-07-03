/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type VerificationSupportStatus =
  | 'CAPABILITY_STATUS_UNSPECIFIED'
  | 'CAPABLE'
  | 'INCAPABLE_DUE_TO_CARRIER_UNSUPPORTED'
  | 'INCAPABLE_DUE_TO_ANDROID_VERSION'
  | 'INCAPABLE_DUE_TO_SIM_STATE';

export interface VerificationSupportResult {
  isSupported: boolean;
  simSlot: number;
  carrierId: string;
  reason: VerificationSupportStatus;
}

export interface VerifiedPhoneNumberTokenResult {
  phoneNumber: string;
  token: string;
  expirationTimestamp: number;
  issuedAtTimestamp: number;
  nonce: string | null;
  claims: Object | null;
}

export interface Spec extends TurboModule {
  enableTestSession(token: string): Promise<void>;
  getVerificationSupportInfo(): Promise<Array<VerificationSupportResult>>;
  getVerificationSupportInfoForSimSlot(simSlot: number): Promise<Array<VerificationSupportResult>>;
  getVerifiedPhoneNumber(): Promise<VerifiedPhoneNumberTokenResult>;
  getDigitalCredentialPayload(nonce: string): Promise<string>;
  exchangeCredentialResponseForPhoneNumber(
    dcApiResponse: string,
  ): Promise<VerifiedPhoneNumberTokenResult>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboPnv');

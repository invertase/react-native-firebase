/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  logEvent(name: string, params?: Object | null): Promise<void>;
  setAnalyticsCollectionEnabled(enabled: boolean): Promise<void>;
  setSessionTimeoutDuration(milliseconds: number): Promise<void>;
  getAppInstanceId(): Promise<string | null>;
  getSessionId(): Promise<number | null>;
  setUserId(id: string | null): Promise<void>;
  setUserProperty(name: string, value: string | null): Promise<void>;
  setUserProperties(properties: Object): Promise<void>;
  resetAnalyticsData(): Promise<void>;
  setDefaultEventParameters(params?: Object | null): Promise<void>;
  setConsent(consentSettings: Object): Promise<void>;
  /** iOS only (StoreKit 2). Android rejects at runtime. */
  logTransaction(transactionId: string): Promise<void>;
  /** iOS only. Android rejects at runtime. */
  initiateOnDeviceConversionMeasurementWithEmailAddress(emailAddress: string): Promise<void>;
  /** iOS only. Android rejects at runtime. */
  initiateOnDeviceConversionMeasurementWithHashedEmailAddress(
    hashedEmailAddress: string,
  ): Promise<void>;
  /** iOS only. Android rejects at runtime. */
  initiateOnDeviceConversionMeasurementWithPhoneNumber(phoneNumber: string): Promise<void>;
  /** iOS only. Android rejects at runtime. */
  initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
    hashedPhoneNumber: string,
  ): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboAnalytics');

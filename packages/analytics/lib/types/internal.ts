/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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

import type { Analytics } from './analytics';

/**
 * Native Analytics module interface (RNFBAnalyticsModule).
 * Matches the methods exposed by the native iOS/Android bridge.
 * logTransaction and initiateOnDeviceConversionMeasurement* are iOS-only.
 */
export interface RNFBAnalyticsModule {
  logEvent(name: string, params?: Record<string, unknown>): Promise<void>;
  setUserId(userId: string | null): Promise<void>;
  setUserProperty(key: string, value: string | null): Promise<void>;
  setUserProperties(properties: Record<string, string | number | boolean | null>): Promise<void>;
  setDefaultEventParameters(params?: Record<string, unknown> | null): Promise<void>;
  setConsent(consent: Record<string, unknown>): Promise<void>;
  setAnalyticsCollectionEnabled(enabled: boolean): Promise<void>;
  resetAnalyticsData(): Promise<void>;
  setSessionTimeoutDuration(milliseconds?: number): Promise<void>;
  getAppInstanceId(): Promise<string | null>;
  getSessionId(): Promise<number | null>;
  /** iOS only (StoreKit 2). Not present on Android native. */
  logTransaction?(transactionId: string): Promise<void>;
  /** iOS only. */
  initiateOnDeviceConversionMeasurementWithEmailAddress?(emailAddress: string): Promise<void>;
  /** iOS only. */
  initiateOnDeviceConversionMeasurementWithHashedEmailAddress?(
    hashedEmailAddress: string,
  ): Promise<void>;
  /** iOS only. */
  initiateOnDeviceConversionMeasurementWithPhoneNumber?(phoneNumber: string): Promise<void>;
  /** iOS only. */
  initiateOnDeviceConversionMeasurementWithHashedPhoneNumber?(
    hashedPhoneNumber: string,
  ): Promise<void>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBAnalyticsModule: RNFBAnalyticsModule;
  }
}

/** Analytics instance with native module typed for modular API (e.g. logTransaction). */
export interface AnalyticsInternal extends Analytics {
  readonly native: RNFBAnalyticsModule;
}

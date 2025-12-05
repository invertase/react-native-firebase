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
 * Internal type definitions for the Analytics native module.
 * This file augments the base ReactNativeFirebaseNativeModules interface
 * to add analytics-specific native methods.
 *
 * @internal - This file is not exposed to package consumers
 */

import type { ConsentSettings } from './types/analytics';

/**
 * Interface for the Analytics native module methods
 */
export interface RNFBAnalyticsModuleInterface {
  logEvent(name: string, params: { [key: string]: any }): Promise<void>;
  setAnalyticsCollectionEnabled(enabled: boolean): Promise<void>;
  setSessionTimeoutDuration(milliseconds: number): Promise<void>;
  getAppInstanceId(): Promise<string | null>;
  getSessionId(): Promise<number | null>;
  setUserId(id: string | null): Promise<void>;
  setUserProperty(name: string, value: string | null): Promise<void>;
  setUserProperties(properties: { [key: string]: string | null }): Promise<void>;
  resetAnalyticsData(): Promise<void>;
  setConsent(consentSettings: ConsentSettings): Promise<void>;
  setDefaultEventParameters(params: { [key: string]: any } | null | undefined): Promise<void>;
  initiateOnDeviceConversionMeasurementWithEmailAddress(emailAddress: string): Promise<void>;
  initiateOnDeviceConversionMeasurementWithHashedEmailAddress(
    hashedEmailAddress: string,
  ): Promise<void>;
  initiateOnDeviceConversionMeasurementWithPhoneNumber(phoneNumber: string): Promise<void>;
  initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
    hashedPhoneNumber: string,
  ): Promise<void>;
}

/**
 * Augment the base ReactNativeFirebaseNativeModules interface
 * from the app package to include our analytics module
 */
declare module '@react-native-firebase/app/lib/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBAnalyticsModule: RNFBAnalyticsModuleInterface;
  }
}

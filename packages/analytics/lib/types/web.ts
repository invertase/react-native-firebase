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

export interface AnalyticsEventParameters {
  [key: string]: string | number | boolean | undefined | null;
}

export interface AnalyticsUserProperties {
  [key: string]: string | number | boolean | undefined | null;
}

export interface AnalyticsConsent {
  ad_personalization?: boolean;
  [key: string]: boolean | undefined;
}

export interface AnalyticsApi {
  logEvent(name: string, params?: AnalyticsEventParameters): void;
  setUserId(userId: string | null): void;
  setUserProperty(key: string, value: string | null): void;
  setUserProperties(properties: AnalyticsUserProperties): void;
  setDefaultEventParameters(params: AnalyticsEventParameters | null): void;
  setConsent(consent: AnalyticsConsent): void;
  setAnalyticsCollectionEnabled(enabled: boolean): void;
  setDebug(enabled: boolean): void;
  setCurrentScreen(screenName: string | null): void;
  _getCid(): Promise<string>;
}

export interface RNFBAnalyticsModule {
  logEvent(name: string, params?: AnalyticsEventParameters): Promise<null>;
  setUserId(userId: string | null): Promise<null>;
  setUserProperty(key: string, value: string | null): Promise<null>;
  setUserProperties(properties: AnalyticsUserProperties): Promise<null>;
  setDefaultEventParameters(params: AnalyticsEventParameters | null): Promise<null>;
  setConsent(consent: AnalyticsConsent): Promise<null>;
  setAnalyticsCollectionEnabled(enabled: boolean): Promise<null>;
  resetAnalyticsData(): Promise<null>;
  setSessionTimeoutDuration(): Promise<null>;
  getAppInstanceId(): Promise<string | null>;
  getSessionId(): Promise<null>;
}

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

import type { AnalyticsApi as IAnalyticsApi } from '../../types';

export declare class AnalyticsApi implements IAnalyticsApi {
  constructor(appName: string, measurementId: string);
  logEvent(name: string, params?: any): void;
  setUserId(userId: string | null): void;
  setUserProperty(key: string, value: string | null): void;
  setUserProperties(properties: any): void;
  setDefaultEventParameters(params: any): void;
  setConsent(consent: any): void;
  setAnalyticsCollectionEnabled(enabled: boolean): void;
  setDebug(enabled: boolean): void;
  setCurrentScreen(screenName: string | null): void;
  _getCid(): Promise<string>;
}

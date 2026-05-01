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

import type { HttpMethod } from './perf';

export interface RNFBPerfTraceData {
  metrics: Record<string, number>;
  attributes: Record<string, string>;
}

export interface RNFBPerfHttpMetricData {
  attributes: Record<string, string>;
  httpResponseCode?: number;
  requestPayloadSize?: number;
  responsePayloadSize?: number;
  responseContentType?: string;
}

export interface RNFBPerfNativeModule {
  isPerformanceCollectionEnabled: boolean;
  isInstrumentationEnabled: boolean;
  setPerformanceCollectionEnabled(enabled: boolean): Promise<null>;
  instrumentationEnabled(enabled: boolean): Promise<null>;
  startTrace(id: number, identifier: string): Promise<null>;
  stopTrace(id: number, traceData: RNFBPerfTraceData): Promise<null>;
  startHttpMetric(id: number, url: string, httpMethod: HttpMethod): Promise<null>;
  stopHttpMetric(id: number, metricData: RNFBPerfHttpMetricData): Promise<null>;
  startScreenTrace(id: number, identifier: string): Promise<null>;
  stopScreenTrace(id: number): Promise<null>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBPerfModule: RNFBPerfNativeModule;
  }
}

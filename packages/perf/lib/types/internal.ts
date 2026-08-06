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

import type {
  FirebasePerformance,
  HttpMetric,
  HttpMethod,
  PerformanceTrace,
  ScreenTrace,
} from './perf';

export interface PerfInternal extends FirebasePerformance {
  /**
   * @deprecated Prefer assigning {@link FirebasePerformance.dataCollectionEnabled}.
   */
  setPerformanceCollectionEnabled(enabled: boolean): Promise<null>;
  newTrace(name: string): PerformanceTrace;
  startTrace(name: string): PerformanceTrace;
  newScreenTrace(screenName: string): ScreenTrace;
  startScreenTrace(screenName: string): ScreenTrace;
  newHttpMetric(url: string, httpMethod: HttpMethod): HttpMetric;
}

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
  startTrace(id: number, identifier: string): void;
  stopTrace(id: number, traceData: RNFBPerfTraceData): void;
  startHttpMetric(id: number, url: string, httpMethod: HttpMethod): void;
  stopHttpMetric(id: number, metricData: RNFBPerfHttpMetricData): void;
  startScreenTrace(id: number, identifier: string): void;
  stopScreenTrace(id: number): void;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    NativeRNFBTurboPerf: RNFBPerfNativeModule;
  }
}

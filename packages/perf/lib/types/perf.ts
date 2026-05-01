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

import type { FirebaseApp } from '@react-native-firebase/app';

/**
 * Valid HTTP methods for HTTP metrics.
 */
export type HttpMethod =
  | 'GET'
  | 'HEAD'
  | 'PUT'
  | 'POST'
  | 'PATCH'
  | 'TRACE'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS';

/**
 * Trace allows you to time the beginning to end of a certain action in your app with additional metric values and attributes.
 */
export interface Trace {
  getAttribute(attribute: string): string | null;
  putAttribute(attribute: string, value: string): void;
  getMetric(metricName: string): number;
  getMetrics(): { [key: string]: number };
  putMetric(metricName: string, value: number): void;
  incrementMetric(metricName: string, incrementBy: number): void;
  removeMetric(metricName: string): void;
  start(): Promise<null>;
  stop(): Promise<null>;
}

/**
 * ScreenTrace allows you to record a custom screen rendering trace of slow and frozen frames.
 */
export interface ScreenTrace {
  start(): Promise<null>;
  stop(): Promise<null>;
}

/**
 * Metric used to collect data for network requests/responses. A new instance must be used for every request/response.
 */
export interface HttpMetric {
  getAttribute(attribute: string): string | null;
  getAttributes(): { [key: string]: string };
  putAttribute(attribute: string, value: string): void;
  removeAttribute(attribute: string): void;
  setHttpResponseCode(code: number | null): void;
  setRequestPayloadSize(bytes: number | null): void;
  setResponsePayloadSize(bytes: number | null): void;
  setResponseContentType(contentType: string | null): void;
  start(): Promise<null>;
  stop(): Promise<null>;
}

/**
 * The Firebase Performance Monitoring service interface (modular API).
 *
 * > This module is available for the default app only.
 */
export interface Performance {
  /** The FirebaseApp this Performance instance is associated with */
  app: FirebaseApp;
  isPerformanceCollectionEnabled: boolean;
  instrumentationEnabled: boolean;
  dataCollectionEnabled: boolean;
  /**
   * @deprecated prefer setting `dataCollectionEnabled = boolean`.
   */
  setPerformanceCollectionEnabled(enabled: boolean): Promise<null>;
  newTrace(identifier: string): Trace;
  startTrace(identifier: string): Promise<Trace>;
  newScreenTrace(identifier: string): ScreenTrace;
  startScreenTrace(identifier: string): Promise<ScreenTrace>;
  newHttpMetric(url: string, httpMethod: HttpMethod): HttpMetric;
}

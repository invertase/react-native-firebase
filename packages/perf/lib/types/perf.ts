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
 * Configuration options for Performance Monitoring (aligned with {@link https://firebase.google.com/docs/reference/js/performance.performancesettings | PerformanceSettings} in the Firebase JS SDK).
 */
export interface PerformanceSettings {
  /** Whether to collect custom events. */
  dataCollectionEnabled?: boolean;
  /** Whether to collect out-of-the-box events. */
  instrumentationEnabled?: boolean;
}

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
 * A performance trace (aligned with {@link https://firebase.google.com/docs/reference/js/performance.performancetrace | PerformanceTrace} in the Firebase JS SDK).
 *
 * @remarks React Native uses async `start`/`stop` (native bridge). The web SDK uses synchronous `start`/`stop`. React Native also exposes `getMetrics` and `removeMetric`, which are not on the web `PerformanceTrace` type.
 */
export interface PerformanceTrace {
  getAttribute(attr: string): string | undefined;
  putAttribute(attr: string, value: string): void;
  getMetric(metricName: string): number;
  getMetrics(): { [key: string]: number };
  putMetric(metricName: string, num: number): void;
  incrementMetric(metricName: string, num?: number): void;
  removeMetric(metricName: string): void;
  start(): Promise<null>;
  stop(): Promise<null>;
}

/**
 * Screen trace for slow/frozen frames (React Native).
 */
export interface ScreenTrace {
  start(): Promise<null>;
  stop(): Promise<null>;
}

/**
 * Network request metric (React Native; not part of the web Performance modular surface).
 */
export interface HttpMetric {
  getAttribute(attr: string): string | undefined;
  getAttributes(): { [key: string]: string };
  putAttribute(attr: string, value: string): void;
  removeAttribute(attr: string): void;
  setHttpResponseCode(code: number | null): void;
  setRequestPayloadSize(bytes: number | null): void;
  setResponsePayloadSize(bytes: number | null): void;
  setResponseContentType(contentType: string | null): void;
  start(): Promise<null>;
  stop(): Promise<null>;
}

/**
 * Firebase Performance Monitoring service (aligned with {@link https://firebase.google.com/docs/reference/js/performance.firebaseperformance | FirebasePerformance} in the Firebase JS SDK).
 *
 * @remarks React Native adds collection/read APIs backed by native (`isPerformanceCollectionEnabled`, custom traces, HTTP metrics, screen traces).
 */
export interface FirebasePerformance {
  /** The FirebaseApp this Performance instance is associated with. */
  app: FirebaseApp;
  /** Controls logging of automatic traces and HTTP/S network monitoring. */
  instrumentationEnabled: boolean;
  /** Controls logging of custom traces. */
  dataCollectionEnabled: boolean;
  /** Whether performance data collection is enabled for this app instance (native). */
  isPerformanceCollectionEnabled: boolean;
}

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

import type { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Firebase Performance Monitoring package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `perf` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/perf';
 *
 * // firebase.perf().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `perf` package:
 *
 * ```js
 * import perf from '@react-native-firebase/perf';
 *
 * // perf().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/perf';
 *
 * // firebase.perf().X
 * ```
 *
 * @firebase perf
 */
/**
 * @deprecated Use the modular type exports from `@react-native-firebase/perf` instead.
 * `FirebasePerformanceTypes` is kept for backwards compatibility with the namespaced API.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebasePerformanceTypes {
  type FirebaseModule = ReactNativeFirebase.FirebaseModule;

  /**
   * @deprecated Use the `HttpMethod` type from the modular package exports instead.
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
   * @deprecated Use the `PerformanceTrace` type from the modular package exports instead.
   */
  export interface Trace {
    getAttribute(attribute: string): string | undefined;
    putAttribute(attribute: string, value: string): void;
    getMetric(metricName: string): number;
    getMetrics(): { [key: string]: number };
    putMetric(metricName: string, value: number): void;
    incrementMetric(metricName: string, incrementBy?: number): void;
    removeMetric(metricName: string): void;
    start(): Promise<null>;
    stop(): Promise<null>;
  }

  /**
   * @deprecated Use the `ScreenTrace` type from the modular package exports instead.
   */
  export interface ScreenTrace {
    start(): Promise<null>;
    stop(): Promise<null>;
  }

  /**
   * @deprecated Use the `HttpMetric` type from the modular package exports instead.
   */
  export interface HttpMetric {
    getAttribute(attribute: string): string | undefined;
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
   * @deprecated Use static exports from the package root instead.
   */
  export interface Statics {
    SDK_VERSION: string;
  }

  /**
   * @deprecated Use the `FirebasePerformance` type from the modular package exports instead.
   */
  export interface Module extends FirebaseModule {
    app: ReactNativeFirebase.FirebaseApp;
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
}
/* eslint-enable @typescript-eslint/no-namespace */

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;
    interface Module {
      perf: FirebaseModuleWithStatics<
        FirebasePerformanceTypes.Module,
        FirebasePerformanceTypes.Statics
      >;
    }
    interface FirebaseApp {
      perf(): FirebasePerformanceTypes.Module;
    }
  }
}

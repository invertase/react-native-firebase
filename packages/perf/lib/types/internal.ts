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
import type { FirebasePerformanceTypes } from './namespaced';

/**
 * @internal
 * Type extending Performance (Module) with internal-only method signatures that accept MODULAR_DEPRECATION_ARG.
 * Used by modular.ts when calling namespaced methods so the extra arg type-checks.
 */
export type PerformanceModuleWithModularArg = FirebasePerformanceTypes.Module & {
  newTrace(identifier: string, _modularArg?: string): FirebasePerformanceTypes.Trace;
  newHttpMetric(
    url: string,
    httpMethod: FirebasePerformanceTypes.HttpMethod,
    _modularArg?: string,
  ): FirebasePerformanceTypes.HttpMetric;
  newScreenTrace(identifier: string, _modularArg?: string): FirebasePerformanceTypes.ScreenTrace;
  startScreenTrace(
    identifier: string,
    _modularArg?: string,
  ): Promise<FirebasePerformanceTypes.ScreenTrace>;
};

/**
 * @internal
 * Type for the default perf() namespace export. Used only to type the default export in namespaced.ts.
 */
export type PerfNamespace = ReactNativeFirebase.FirebaseModuleWithStatics<
  FirebasePerformanceTypes.Module,
  FirebasePerformanceTypes.Statics
> & {
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

/**
 * @internal
 * Type for the firebase export (perf namespace attached to @react-native-firebase/app Module).
 */
export type FirebaseWithPerf = ReactNativeFirebase.Module & {
  perf: PerfNamespace;
  app(name?: string): ReactNativeFirebase.FirebaseApp & { perf(): FirebasePerformanceTypes.Module };
};

/**
 * @internal
 * Native bridge methods used by HttpMetric.
 */
export interface RNFBPerfNativeModule {
  startHttpMetric(id: number, url: string, httpMethod: string): Promise<null>;
  stopHttpMetric(
    id: number,
    metricData: {
      attributes: Record<string, string>;
      httpResponseCode?: number;
      requestPayloadSize?: number;
      responsePayloadSize?: number;
      responseContentType?: string;
    },
  ): Promise<null>;
}

/**
 * @internal
 * Native bridge methods used by ScreenTrace.
 */
export interface RNFBPerfScreenTraceNativeModule {
  startScreenTrace(id: number, identifier: string): Promise<null>;
  stopScreenTrace(id: number): Promise<null>;
}

/**
 * @internal
 * Native bridge methods used by Trace.
 */
export interface RNFBPerfTraceNativeModule {
  startTrace(id: number, identifier: string): Promise<null>;
  stopTrace(
    id: number,
    traceData: {
      metrics: Record<string, number>;
      attributes: Record<string, string>;
    },
  ): Promise<null>;
}

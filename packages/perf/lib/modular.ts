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

import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';

import type {
  FirebaseApp,
  FirebasePerformance,
  HttpMethod,
  HttpMetric,
  PerformanceSettings,
  PerformanceTrace,
  ScreenTrace,
} from './types/modular';
import type { PerformanceModuleWithModularArg } from './types/internal';

// Re-export types for consumers who import from the modular entry
export type {
  FirebaseApp,
  FirebasePerformance,
  HttpMethod,
  HttpMetric,
  PerformanceSettings,
  PerformanceTrace,
  ScreenTrace,
} from './types/modular';

/**
 * Returns a Performance instance for the given app.
 *
 * @param app - FirebaseApp. Optional.
 * @returns FirebasePerformance
 */
export function getPerformance(app?: FirebaseApp): FirebasePerformance {
  if (app) {
    return getApp(app.name).perf();
  }
  return getApp().perf();
}

/**
 * Returns a Performance instance for the given app.
 *
 * @param app - FirebaseApp. Required.
 * @param settings - Optional PerformanceSettings. Set "dataCollectionEnabled" which will enable/disable Performance collection.
 * @returns Promise resolving to FirebasePerformance
 */
export async function initializePerformance(
  app: FirebaseApp,
  settings?: PerformanceSettings,
): Promise<FirebasePerformance> {
  const perf = getApp(app.name).perf();

  if (settings?.dataCollectionEnabled !== undefined) {
    perf.dataCollectionEnabled = settings.dataCollectionEnabled;
  }
  if (settings?.instrumentationEnabled !== undefined) {
    perf.instrumentationEnabled = settings.instrumentationEnabled;
  }

  return perf;
}

/**
 * Returns a Trace instance.
 *
 * @param perf - FirebasePerformance instance.
 * @param identifier - A string to identify the Trace instance.
 * @returns PerformanceTrace
 */
export function trace(perf: FirebasePerformance, identifier: string): PerformanceTrace {
  return (perf as PerformanceModuleWithModularArg).newTrace.call(
    perf,
    identifier,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Returns an HttpMetric instance.
 *
 * @param perf - FirebasePerformance instance.
 * @param identifier - A string to identify the HttpMetric instance (URL).
 * @param httpMethod - The HTTP method for the HttpMetric instance.
 * @returns HttpMetric
 */
export function httpMetric(
  perf: FirebasePerformance,
  identifier: string,
  httpMethod: HttpMethod,
): HttpMetric {
  return (perf as PerformanceModuleWithModularArg).newHttpMetric.call(
    perf,
    identifier,
    httpMethod,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Creates a ScreenTrace instance with the given identifier.
 * Throws if hardware acceleration is disabled or if Android is 9.0 or 9.1.
 *
 * @platform android Android !== 9.0.0 && Android !== 9.1.0
 * @param perf - FirebasePerformance instance.
 * @param identifier - Name of the trace, no leading or trailing whitespace allowed, no leading underscore '_' character allowed, max length is 100.
 * @returns ScreenTrace
 */
export function newScreenTrace(perf: FirebasePerformance, identifier: string): ScreenTrace {
  return (perf as PerformanceModuleWithModularArg).newScreenTrace.call(
    perf,
    identifier,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Creates a ScreenTrace instance with the given identifier and immediately starts it.
 * Throws if hardware acceleration is disabled or if Android is 9.0 or 9.1.
 *
 * @platform android Android !== 9.0.0 && Android !== 9.1.0
 * @param perf - FirebasePerformance instance.
 * @param identifier - Name of the screen.
 * @returns Promise resolving to ScreenTrace
 */
export function startScreenTrace(
  perf: FirebasePerformance,
  identifier: string,
): Promise<ScreenTrace> {
  return (perf as PerformanceModuleWithModularArg).startScreenTrace.call(
    perf,
    identifier,
    MODULAR_DEPRECATION_ARG,
  );
}

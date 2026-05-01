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

import type { FirebaseApp } from '@react-native-firebase/app';
import type { FirebasePerformanceTypes } from '..';

type Performance = FirebasePerformanceTypes.Module;
type Trace = FirebasePerformanceTypes.Trace;
type HttpMethod = FirebasePerformanceTypes.HttpMethod;
type HttpMetric = FirebasePerformanceTypes.HttpMetric;
type ScreenTrace = FirebasePerformanceTypes.ScreenTrace;

type PerformanceSettings = {
  dataCollectionEnabled: boolean;
};

type PerformanceSettingsInternal = Partial<
  PerformanceSettings & {
    instrumentationEnabled: boolean;
  }
>;

type WithModularDeprecationArg<F> = F extends (...args: infer P) => infer R
  ? (...args: [...P, typeof MODULAR_DEPRECATION_ARG]) => R
  : never;

/**
 * Returns a Performance instance for the given app.
 * @param app - FirebaseApp. Optional.
 * @returns {Performance}
 */
export function getPerformance(app?: FirebaseApp): Performance {
  if (app) {
    return getApp(app.name).perf();
  }

  return getApp().perf();
}

/**
 * Returns a Performance instance for the given app.
 * @param app - FirebaseApp. Required.
 * @param settings - Optional PerformanceSettings. Set "dataCollectionEnabled" which will enable/disable Performance collection.
 * @returns {Performance}
 */
export async function initializePerformance(
  app: FirebaseApp,
  settings?: PerformanceSettings,
): Promise<Performance> {
  const perf = getApp(app.name).perf();
  const resolvedSettings = settings as PerformanceSettingsInternal | undefined;

  if (resolvedSettings && resolvedSettings.dataCollectionEnabled !== undefined) {
    perf.dataCollectionEnabled = resolvedSettings.dataCollectionEnabled;
  }
  if (resolvedSettings && resolvedSettings.instrumentationEnabled !== undefined) {
    perf.instrumentationEnabled = resolvedSettings.instrumentationEnabled;
  }

  return perf;
}

/**
 * Returns a Trace instance.
 * @param perf - Performance instance
 * @param identifier - A String to identify the Trace instance
 * @returns {Trace}
 */
export function trace(perf: Performance, identifier: string): Trace {
  return (perf.newTrace as WithModularDeprecationArg<Performance['newTrace']>).call(
    perf,
    identifier,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Returns a HttpMetric instance.
 * @param perf - Performance instance
 * @param identifier - A String to identify the HttpMetric instance
 * @returns {HttpMetric}
 */
export function httpMetric(
  perf: Performance,
  identifier: string,
  httpMethod: HttpMethod,
): HttpMetric {
  return (perf.newHttpMetric as WithModularDeprecationArg<Performance['newHttpMetric']>).call(
    perf,
    identifier,
    httpMethod,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Creates a ScreenTrace instance with the given identifier.
 * Throws if hardware acceleration is disabled or if Android is 9.0 or 9.1.
 * @platform android Android !== 9.0.0 && Android !== 9.1.0
 * @param perf - Performance instance
 * @param identifier Name of the trace, no leading or trailing whitespace allowed, no leading underscore '_' character allowed, max length is 100.
 * @returns {ScreenTrace}
 */
export function newScreenTrace(perf: Performance, identifier: string): ScreenTrace {
  return (perf.newScreenTrace as WithModularDeprecationArg<Performance['newScreenTrace']>).call(
    perf,
    identifier,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Creates a ScreenTrace instance with the given identifier and immediately starts it.
 * Throws if hardware acceleration is disabled or if Android is 9.0 or 9.1.
 * @platform android Android !== 9.0.0 && Android !== 9.1.0
 * @param perf - Performance instance
 * @param identifier Name of the screen
 * @returns {Promise<ScreenTrace>}
 */
export function startScreenTrace(perf: Performance, identifier: string): Promise<ScreenTrace> {
  return (perf.startScreenTrace as WithModularDeprecationArg<Performance['startScreenTrace']>).call(
    perf,
    identifier,
    MODULAR_DEPRECATION_ARG,
  );
}

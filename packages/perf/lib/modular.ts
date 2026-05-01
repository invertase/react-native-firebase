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
import type {
  FirebasePerformance,
  HttpMetric,
  HttpMethod,
  PerformanceSettings,
  PerformanceTrace,
  ScreenTrace,
} from './types/perf';

import type { PerfInternal } from './types/internal';

function perfInternal(performance: FirebasePerformance): PerfInternal {
  return performance as PerfInternal;
}

/**
 * Returns a {@link FirebasePerformance} instance for the given app.
 * @param app - The FirebaseApp to use. Optional; defaults to the default app.
 */
export function getPerformance(app?: FirebaseApp): FirebasePerformance {
  if (app) {
    return getApp(app.name).perf() as FirebasePerformance;
  }

  return getApp().perf() as FirebasePerformance;
}

/**
 * Returns a {@link FirebasePerformance} instance for the given app (aligned with the Firebase JS SDK).
 * Can only be called once per app during initialization in typical usage.
 *
 * @param app - The FirebaseApp to use.
 * @param settings - Optional {@link PerformanceSettings}.
 */
export function initializePerformance(
  app: FirebaseApp,
  settings?: PerformanceSettings,
): FirebasePerformance {
  const perf = getPerformance(app);

  if (settings?.dataCollectionEnabled !== undefined) {
    perf.dataCollectionEnabled = settings.dataCollectionEnabled;
  }
  if (settings?.instrumentationEnabled !== undefined) {
    perf.instrumentationEnabled = settings.instrumentationEnabled;
  }

  return perf;
}

/**
 * Returns a new {@link PerformanceTrace} instance.
 * @param performance - The {@link FirebasePerformance} instance to use.
 * @param name - The name of the trace.
 */
export function trace(performance: FirebasePerformance, name: string): PerformanceTrace {
  return perfInternal(performance).newTrace(name, MODULAR_DEPRECATION_ARG);
}

/**
 * Creates an {@link HttpMetric} for a URL and HTTP method (React Native).
 * @param performance - The {@link FirebasePerformance} instance to use.
 * @param url - Request URL.
 * @param httpMethod - HTTP method.
 */
export function httpMetric(
  performance: FirebasePerformance,
  url: string,
  httpMethod: HttpMethod,
): HttpMetric {
  return perfInternal(performance).newHttpMetric(url, httpMethod, MODULAR_DEPRECATION_ARG);
}

/**
 * Creates a {@link ScreenTrace} with the given screen name.
 * Throws if hardware acceleration is disabled or if Android is 9.0 or 9.1.
 * @platform android Android !== 9.0.0 && Android !== 9.1.0
 * @param performance - The {@link FirebasePerformance} instance to use.
 * @param screenName - Screen name; no leading/trailing whitespace, no leading `_`, max length 100.
 */
export function newScreenTrace(performance: FirebasePerformance, screenName: string): ScreenTrace {
  return perfInternal(performance).newScreenTrace(screenName, MODULAR_DEPRECATION_ARG);
}

/**
 * Creates a {@link ScreenTrace} and starts it immediately.
 * @platform android Android !== 9.0.0 && Android !== 9.1.0
 * @param performance - The {@link FirebasePerformance} instance to use.
 * @param screenName - Name of the screen.
 */
export function startScreenTrace(
  performance: FirebasePerformance,
  screenName: string,
): Promise<ScreenTrace> {
  return perfInternal(performance).startScreenTrace(screenName, MODULAR_DEPRECATION_ARG);
}

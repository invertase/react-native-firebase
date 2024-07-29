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
import { FirebaseApp } from '@firebase/app-types';
import { FirebasePerformanceTypes } from '..';

import Performance = FirebasePerformanceTypes.Module;

import Trace = FirebasePerformanceTypes.Module.Trace;
import HttpMethod = FirebasePerformanceTypes.HttpMethod;
import HttpMetric = FirebasePerformanceTypes.HttpMetric;
import ScreenTrace = FirebasePerformanceTypes.ScreenTrace;

/**
 * Returns a Performance instance for the given app.
 * @param app - FirebaseApp. Optional.
 * @returns {Performance}
 */
export function getPerformance(app?: FirebaseApp): Performance;

type PerformanceSettings = {
  dataCollectionEnabled: boolean;
};

/**
 * Returns a Performance instance for the given app.
 * @param app - FirebaseApp. Required.
 * @param settings - PerformanceSettings. Set "dataCollectionEnabled" which will enable/disable Performance collection.
 * @returns {Promise<Performance>}
 */
export function initializePerformance(
  app: FirebaseApp,
  settings: PerformanceSettings,
): Promise<Performance>;

/**
 * Returns a Trace instance.
 * @param perf - Performance instance.
 * @param identifier - A String to identify the Trace instance.
 * @returns {Trace}
 */
export function trace(perf: Performance, identifier: string): Trace;

/**
 * Returns a HttpMetric instance.
 * @param perf - Performance instance.
 * @param identifier - A String to identify the HttpMetric instance.
 * @param httpMethod - The HTTP method for the HttpMetric instance.
 * @returns {HttpMetric}
 */
export function httpMetric(
  perf: Performance,
  identifier: string,
  httpMethod: HttpMethod,
): HttpMetric;

/**
 * Creates a ScreenTrace instance with the given identifier.
 * Throws if hardware acceleration is disabled or if Android is 9.0 or 9.1.
 * @platform android Android !== 9.0.0 && Android !== 9.1.0
 * @param perf - Performance instance.
 * @param identifier - Name of the trace, no leading or trailing whitespace allowed, no leading underscore '_' character allowed, max length is 100.
 * @returns {ScreenTrace}
 */
export function newScreenTrace(perf: Performance, identifier: string): ScreenTrace;

/**
 * Creates a ScreenTrace instance with the given identifier and immediately starts it.
 * Throws if hardware acceleration is disabled or if Android is 9.0 or 9.1.
 * @platform android Android !== 9.0.0 && Android !== 9.1.0
 * @param perf - Performance instance.
 * @param identifier - Name of the screen.
 * @returns {Promise<ScreenTrace>}
 */
export function startScreenTrace(perf: Performance, identifier: string): Promise<ScreenTrace>;

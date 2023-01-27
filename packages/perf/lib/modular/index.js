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

import { isBoolean } from '@react-native-firebase/app/lib/common';
import { firebase } from '..';

/**
 * Returns a Performance instance for the given app.
 * @param app - FirebaseApp. Optional.
 * @returns {Performance}
 */
export function getPerformance(app) {
  if (app) {
    return firebase.app(app.name).perf();
  }

  return firebase.app().perf();
}

/**
 * Returns a Performance instance for the given app.
 * @param app - FirebaseApp. Required.
 * @param settings - PerformanceSettings. Set "dataCollectionEnabled" which will enable/disable Performance collection.
 * @returns {Performance}
 */
export async function initializePerformance(app, settings) {
  const perf = firebase.app(app.name).perf();

  if (settings && isBoolean(settings.dataCollectionEnabled)) {
    await perf.setPerformanceCollectionEnabled(settings.dataCollectionEnabled);
  }

  return perf;
}

/**
 * Returns a Trace instance.
 * @param perf - Performance instance
 * @param identifier - A String to identify the Trace instance
 * @returns {Trace}
 */
export function trace(perf, identifier) {
  return perf.newTrace(identifier);
}

/**
 * Returns a HttpMetric instance.
 * @param perf - Performance instance
 * @param identifier - A String to identify the HttpMetric instance
 * @returns {HttpMetric}
 */
export function httpMetric(perf, identifier, httpMethod) {
  return perf.newHttpMetric(identifier, httpMethod);
}
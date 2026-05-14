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

import { hasOwnProperty, isNumber, isString } from '@react-native-firebase/app/dist/module/common';

import MetricWithAttributes from './MetricWithAttributes';

import type { RNFBPerfNativeModule } from './types/internal';

export default class Trace extends MetricWithAttributes {
  private readonly _identifier: string;
  private readonly _metrics: Record<string, number>;
  private _started: boolean;
  private _stopped: boolean;

  constructor(native: RNFBPerfNativeModule, identifier: string) {
    super(native);
    this._identifier = identifier;

    this._metrics = {};

    this._started = false;
    this._stopped = false;
  }

  getMetric(metricName: string): number {
    if (!isString(metricName)) {
      throw new Error("firebase.perf.Trace.getMetric(*) 'metricName' must be a string.");
    }

    return hasOwnProperty(this._metrics, metricName) ? this._metrics[metricName]! : 0;
  }

  getMetrics(): Record<string, number> {
    return Object.assign({}, this._metrics);
  }

  putMetric(metricName: string, value: number): void {
    // TODO(VALIDATION): metricName: no leading or trailing whitespace, no leading underscore '_' character, max length is 32 characters
    // TODO(VALIDATION): value: >= 0
    if (!isString(metricName)) {
      throw new Error("firebase.perf.Trace.putMetric(*, _) 'metricName' must be a string.");
    }

    if (!isNumber(value)) {
      throw new Error("firebase.perf.Trace.putMetric(_, *) 'value' must be a number.");
    }

    this._metrics[metricName] = value;
  }

  incrementMetric(metricName: string, num?: number): void {
    // TODO(VALIDATION): metricName: no leading or trailing whitespace, no leading underscore '_' character, max length is 32 characters
    // TODO(VALIDATION): value: >= 0
    if (!isString(metricName)) {
      throw new Error("firebase.perf.Trace.incrementMetric(*, _) 'metricName' must be a string.");
    }

    const incrementBy = num ?? 1;

    if (!isNumber(incrementBy)) {
      throw new Error("firebase.perf.Trace.incrementMetric(_, *) 'num' must be a number.");
    }

    this._metrics[metricName] = this.getMetric(metricName) + incrementBy;
  }

  removeMetric(metric: string): void {
    if (!isString(metric)) {
      throw new Error("firebase.perf.Trace.removeMetric(*) 'metric' must be a string.");
    }

    delete this._metrics[metric];
  }

  start(): Promise<null> {
    if (this._started) {
      return Promise.resolve(null);
    }
    this._started = true;

    return this.native.startTrace(this._id, this._identifier);
  }

  stop(): Promise<null> {
    if (this._stopped) {
      return Promise.resolve(null);
    }
    this._stopped = true;

    const traceData = {
      metrics: Object.assign({}, this._metrics),
      attributes: Object.assign({}, this._attributes),
    };

    return this.native.stopTrace(this._id, traceData);
  }
}

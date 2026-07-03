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

import { isBoolean, isOneOf, isString } from '@react-native-firebase/app/dist/module/common';
import type { FirebaseApp } from '@react-native-firebase/app';
import {
  FirebaseModule,
  getOrCreateModularInstance,
} from '@react-native-firebase/app/dist/module/internal';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import './types/internal';
import { Platform } from 'react-native';

import HttpMetricImpl from './HttpMetric';
import ScreenTraceImpl from './ScreenTrace';
import TraceImpl from './Trace';
import { version } from './version';

import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type {
  FirebasePerformance,
  HttpMetric,
  HttpMethod,
  PerformanceSettings,
  PerformanceTrace,
  ScreenTrace,
} from './types/perf';
import type { PerfInternal } from './types/internal';

const nativeModuleName = 'NativeRNFBTurboPerf' as const;

const VALID_HTTP_METHODS: HttpMethod[] = [
  'CONNECT',
  'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT',
  'TRACE',
];

class FirebasePerfModule extends FirebaseModule<typeof nativeModuleName> {
  private _isPerformanceCollectionEnabled: boolean;
  private _instrumentationEnabled: boolean;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    customUrlOrRegion?: string | null,
  ) {
    super(app, config, customUrlOrRegion);
    this._isPerformanceCollectionEnabled = this.native.isPerformanceCollectionEnabled;
    this._instrumentationEnabled = this.native.isInstrumentationEnabled;
  }

  get isPerformanceCollectionEnabled(): boolean {
    return this._isPerformanceCollectionEnabled;
  }

  get instrumentationEnabled(): boolean {
    return this._instrumentationEnabled;
  }

  set instrumentationEnabled(enabled: boolean) {
    if (!isBoolean(enabled)) {
      throw new Error("firebase.perf().instrumentationEnabled = 'enabled' must be a boolean.");
    }
    if (Platform.OS === 'ios') {
      // We don't change for android as it cannot be set from code, it is set at gradle build time.
      this._instrumentationEnabled = enabled;
      // No need to await, as it only takes effect on the next app run.
      this.native.instrumentationEnabled(enabled);
    }
  }

  get dataCollectionEnabled(): boolean {
    return this._isPerformanceCollectionEnabled;
  }

  set dataCollectionEnabled(enabled: boolean) {
    if (!isBoolean(enabled)) {
      throw new Error("firebase.perf().dataCollectionEnabled = 'enabled' must be a boolean.");
    }
    this._isPerformanceCollectionEnabled = enabled;
    // Keep setter behavior fire-and-forget; callers that need completion should use setPerformanceCollectionEnabled().
    void this.native.setPerformanceCollectionEnabled(enabled);
  }

  async setPerformanceCollectionEnabled(enabled: boolean): Promise<null> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.perf().setPerformanceCollectionEnabled(*) 'enabled' must be a boolean.",
      );
    }

    if (Platform.OS === 'ios') {
      // '_instrumentationEnabled' is updated here as well to maintain backward compatibility. See:
      // https://github.com/invertase/react-native-firebase/commit/b705622e64d6ebf4ee026d50841e2404cf692f85
      this._instrumentationEnabled = enabled;
      await this.native.instrumentationEnabled(enabled);
    }

    this._isPerformanceCollectionEnabled = enabled;
    return this.native.setPerformanceCollectionEnabled(enabled);
  }

  newTrace(identifier: string): TraceImpl {
    // TODO(VALIDATION): identifier: no leading or trailing whitespace, no leading underscore '_'
    if (!isString(identifier) || identifier.length > 100) {
      throw new Error(
        "firebase.perf().newTrace(*) 'identifier' must be a string with a maximum length of 100 characters.",
      );
    }

    return new TraceImpl(this.native, identifier);
  }

  startTrace(identifier: string): Promise<TraceImpl> {
    const traceInstance = this.newTrace(identifier);
    return traceInstance.start().then(() => traceInstance);
  }

  newScreenTrace(identifier: string): ScreenTraceImpl {
    if (!isString(identifier) || identifier.length > 100) {
      throw new Error(
        "firebase.perf().newScreenTrace(*) 'identifier' must be a string with a maximum length of 100 characters.",
      );
    }

    return new ScreenTraceImpl(this.native, identifier);
  }

  startScreenTrace(identifier: string): Promise<ScreenTraceImpl> {
    const screenTrace = this.newScreenTrace(identifier);
    return screenTrace.start().then(() => screenTrace);
  }

  newHttpMetric(url: string, httpMethod: HttpMethod): HttpMetricImpl {
    if (!isString(url)) {
      throw new Error("firebase.perf().newHttpMetric(*, _) 'url' must be a string.");
    }

    if (!isOneOf(httpMethod, VALID_HTTP_METHODS)) {
      throw new Error(
        `firebase.perf().newHttpMetric(_, *) 'httpMethod' must be one of ${VALID_HTTP_METHODS.join(
          ', ',
        )}.`,
      );
    }

    return new HttpMetricImpl(this.native, url, httpMethod);
  }
}

const config: ModuleConfig = {
  namespace: 'perf',
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  turboModule: true,
};

export const SDK_VERSION = version;

function perfInternal(performance: FirebasePerformance): PerfInternal {
  return performance as PerfInternal;
}

export function getPerformance(app?: FirebaseApp): FirebasePerformance {
  return getOrCreateModularInstance(
    FirebasePerfModule,
    config,
    app,
  ) as unknown as FirebasePerformance;
}

/**
 * Creates a Performance Monitoring instance and applies optional settings.
 *
 * @remarks Returns **synchronously** on React Native Firebase (unlike some async firebase-js-sdk
 * initialization paths). Settings are applied to the native Performance SDK instance.
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
 * Creates a custom performance trace.
 *
 * @remarks On React Native Firebase, {@link PerformanceTrace.start} and
 * {@link PerformanceTrace.stop} are **async** (native bridge). The firebase-js-sdk web
 * `PerformanceTrace` uses synchronous `start`/`stop`.
 */
export function trace(performance: FirebasePerformance, name: string): PerformanceTrace {
  return perfInternal(performance).newTrace(name) as unknown as PerformanceTrace;
}

export function httpMetric(
  performance: FirebasePerformance,
  url: string,
  httpMethod: HttpMethod,
): HttpMetric {
  return perfInternal(performance).newHttpMetric(url, httpMethod) as unknown as HttpMetric;
}

export function newScreenTrace(performance: FirebasePerformance, screenName: string): ScreenTrace {
  return perfInternal(performance).newScreenTrace(screenName) as unknown as ScreenTrace;
}

export function startScreenTrace(
  performance: FirebasePerformance,
  screenName: string,
): Promise<ScreenTrace> {
  return perfInternal(performance).startScreenTrace(screenName) as unknown as Promise<ScreenTrace>;
}

export type * from './types/perf';

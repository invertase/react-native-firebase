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
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/dist/module/internal';
import { Platform } from 'react-native';

import HttpMetric from './HttpMetric';
import ScreenTrace from './ScreenTrace';
import Trace from './Trace';
import { version } from './version';

import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/types/internal';

export interface RNFBPerfTraceData {
  metrics: Record<string, number>;
  attributes: Record<string, string>;
}

export interface RNFBPerfHttpMetricData {
  attributes: Record<string, string>;
  httpResponseCode?: number;
  requestPayloadSize?: number;
  responsePayloadSize?: number;
  responseContentType?: string;
}

export interface RNFBPerfNativeModule {
  isPerformanceCollectionEnabled: boolean;
  isInstrumentationEnabled: boolean;
  setPerformanceCollectionEnabled(enabled: boolean): Promise<null>;
  instrumentationEnabled(enabled: boolean): Promise<null>;
  startTrace(id: number, identifier: string): Promise<null>;
  stopTrace(id: number, traceData: RNFBPerfTraceData): Promise<null>;
  startHttpMetric(
    id: number,
    url: string,
    httpMethod: FirebasePerformanceTypes.HttpMethod,
  ): Promise<null>;
  stopHttpMetric(id: number, metricData: RNFBPerfHttpMetricData): Promise<null>;
  startScreenTrace(id: number, identifier: string): Promise<null>;
  stopScreenTrace(id: number): Promise<null>;
}

/**
 * Firebase Performance Monitoring package for React Native.
 *
 * @firebase perf
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace FirebasePerformanceTypes {
  /**
   * Valid HTTP methods.
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
   * Trace allows you to time the beginning to end of a certain action in your app with additional metric values and attributes.
   */
  export class Trace {
    getAttribute(attribute: string): string | null;
    putAttribute(attribute: string, value: string): void;
    getMetric(metricName: string): number;
    getMetrics(): { [key: string]: number };
    putMetric(metricName: string, value: number): void;
    incrementMetric(metricName: string, incrementBy: number): void;
    removeMetric(metricName: string): void;
    start(): Promise<null>;
    stop(): Promise<null>;
  }

  /**
   * ScreenTrace allows you to record a custom screen rendering trace of slow and frozen frames.
   */
  export class ScreenTrace {
    start(): Promise<null>;
    stop(): Promise<null>;
  }

  /**
   * Metric used to collect data for network requests/responses. A new instance must be used for every request/response.
   */
  export class HttpMetric {
    getAttribute(attribute: string): string | null;
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

  export interface Statics {
    SDK_VERSION: string;
  }

  /**
   * The Firebase Performance Monitoring service interface.
   *
   * > This module is available for the default app only.
   */
  export class Module extends ReactNativeFirebase.FirebaseModule {
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

const statics: FirebasePerformanceTypes.Statics = {
  SDK_VERSION: version,
};

const namespace = 'perf';

const nativeModuleName = 'RNFBPerfModule';

const VALID_HTTP_METHODS: FirebasePerformanceTypes.HttpMethod[] = [
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

class FirebasePerfModule extends FirebaseModule {
  private _isPerformanceCollectionEnabled: boolean;
  private _instrumentationEnabled: boolean;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    customUrlOrRegion?: string | null,
  ) {
    super(app, config, customUrlOrRegion);
    this._isPerformanceCollectionEnabled = this.perfNative.isPerformanceCollectionEnabled;
    this._instrumentationEnabled = this.perfNative.isInstrumentationEnabled;
  }

  private get perfNative(): RNFBPerfNativeModule {
    return this.native as RNFBPerfNativeModule;
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
      this.perfNative.instrumentationEnabled(enabled);
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
    void this.perfNative.setPerformanceCollectionEnabled(enabled);
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
      await this.perfNative.instrumentationEnabled(enabled);
    }

    this._isPerformanceCollectionEnabled = enabled;
    return this.perfNative.setPerformanceCollectionEnabled(enabled);
  }

  newTrace(identifier: string): Trace {
    // TODO(VALIDATION): identifier: no leading or trailing whitespace, no leading underscore '_'
    if (!isString(identifier) || identifier.length > 100) {
      throw new Error(
        "firebase.perf().newTrace(*) 'identifier' must be a string with a maximum length of 100 characters.",
      );
    }

    return new Trace(this.perfNative, identifier);
  }

  startTrace(identifier: string): Promise<Trace> {
    const trace = this.newTrace(identifier);
    return trace.start().then(() => trace);
  }

  newScreenTrace(identifier: string): ScreenTrace {
    if (!isString(identifier) || identifier.length > 100) {
      throw new Error(
        "firebase.perf().newScreenTrace(*) 'identifier' must be a string with a maximum length of 100 characters.",
      );
    }

    return new ScreenTrace(this.perfNative, identifier);
  }

  startScreenTrace(identifier: string): Promise<ScreenTrace> {
    const screenTrace = this.newScreenTrace(identifier);
    return screenTrace.start().then(() => screenTrace);
  }

  newHttpMetric(url: string, httpMethod: FirebasePerformanceTypes.HttpMethod): HttpMetric {
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

    return new HttpMetric(this.perfNative, url, httpMethod);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/perf';
export const SDK_VERSION = version;

export type PerfNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebasePerformanceTypes.Module,
  FirebasePerformanceTypes.Statics
> & {
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

const defaultExport = createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebasePerfModule,
}) as unknown as PerfNamespace;

export default defaultExport;

export * from './modular';

// import perf, { firebase } from '@react-native-firebase/perf';
// perf().X(...);
// firebase.perf().X(...);
export const firebase =
  getFirebaseRoot() as unknown as ReactNativeFirebase.FirebaseNamespacedExport<
    'perf',
    FirebasePerformanceTypes.Module,
    FirebasePerformanceTypes.Statics
  >;

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

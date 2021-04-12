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

import { ReactNativeFirebase } from '@react-native-firebase/app';

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
export namespace FirebasePerformanceTypes {
  /**
   * Type alias describing the valid HTTP methods accepted when creating a new {@link perf.HttpMetric} instance.
   *
   * #### Example
   *
   * ```js
   * const metric = perf().newHttpMetric('https://api.com/user', 'PATCH');
   * ```
   */
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

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
    /**
     * Returns the value of an attribute. Returns null if it does not exist.
     *
     * #### Example
     *
     * ```js
     * const attribute = trace.getAttribute('userId');
     * ```
     *
     * @param attribute Name of the attribute to fetch the value of.
     */
    getAttribute(attribute: string): string | null;

    /**
     * Sets a String value for the specified attribute. Updates the value of the attribute if it already exists.
     * The maximum number of attributes that can be added is 5.
     *
     * #### Example
     *
     * ```js
     * trace.putAttribute('userId', '123456789');
     * ```
     *
     * @param attribute Name of the attribute. Max length is 40 chars.
     * @param value Value of the attribute. Max length is 100 chars.
     */
    putAttribute(attribute: string, value: string): void;

    /**
     * Gets the value of the metric with the given name in the current trace. If the metric
     * doesn't exist, it will not be created and a 0 is returned.
     *
     * #### Example
     *
     * ```js
     * const metric = trace.getMetric('hits');
     * ```
     *
     * @param metricName Name of the metric to get.
     */
    getMetric(metricName: string): number;

    /**
     * Returns an object of all the currently added metrics and their number values.
     *
     * #### Example
     *
     * ```js
     * const metrics = trace.getMetrics();
     *
     * metrics.forEach(($) => {
     *   console.log($);
     * });
     * ```
     */
    getMetrics(): { [key: string]: number };

    /**
     * Sets the value of the named metric with the provided number.
     *
     * If a metric with the given name exists it will be overwritten.
     * If a metric with the given name doesn't exist, a new one will be created.
     *
     * #### Example
     *
     * ```js
     * trace.putMetric('hits', 1);
     * ```
     *
     * @param metricName Name of the metric to set. Must not have a leading or trailing whitespace, no leading underscore '_' character and have a max length of 32 characters.
     * @param value The value the metric should be set to.
     */
    putMetric(metricName: string, value: number): void;

    /**
     * Increments the named metric by the `incrementBy` value.
     *
     * If a metric with the given name doesn't exist, a new one will be created starting with the value of `incrementBy`.
     *
     * ```js
     * trace.incrementMetric('hits', 1);
     * ```
     *
     * @param metricName Name of the metric to increment. Must not have a leading or trailing whitespace, no leading underscore '_' character and have a max length of 32 characters.
     * @param incrementBy The value the metric should be incremented by.
     */
    incrementMetric(metricName: string, incrementBy: number): void;

    /**
     * Removes a metric by name if it exists.
     *
     * #### Example
     *
     * ```js
     * trace.removeMetric('hits');
     * ```
     *
     * @param metricName Name of the metric to remove.
     */
    removeMetric(metricName: string): void;

    /**
     * Marks the start time of the trace. Does nothing if already started.
     *
     * #### Example
     *
     * ```js
     * const trace = firebase.perf().newTrace('example');
     * await trace.start();
     * ```
     */
    start(): Promise<null>;

    /**
     * Marks the end time of the trace and queues the metric on the device for transmission. Does nothing if already stopped.
     *
     * * #### Example
     *
     * ```js
     * const trace = firebase.perf().newTrace('example');
     * await trace.start();
     * trace.putMetric('hits', 1);
     * await trace.stop();
     * ```
     */
    stop(): Promise<null>;
  }

  /**
   * Metric used to collect data for network requests/responses. A new instance must be used for every request/response.
   */
  export class HttpMetric {
    /**
     * Returns the value of an attribute. Returns null if it does not exist.
     *
     * #### Example
     *
     * ```js
     * const attribute = metric.getAttribute('user_role');
     * ```
     *
     * @param attribute Name of the attribute to fetch the value of
     */
    getAttribute(attribute: string): string | null;

    /**
     * Returns an object of all the currently added attributes.
     *
     * #### Example
     *
     * ```js
     * const attributes = metric.getAttributes();
     *
     * attributes.forEach(($) => {
     *   console.log($);
     * });
     * ```
     */
    getAttributes(): { [key: string]: string };

    /**
     * Sets a String value for the specified attribute. Updates the value of the attribute if it already exists.
     * The maximum number of attributes that can be added is 5.
     *
     * #### Example
     *
     * ```js
     * metric.putAttribute('user_role', 'admin');
     * ```
     *
     * @param attribute Name of the attribute. Max length is 40 chars.
     * @param value Value of the attribute. Max length is 100 chars.
     */
    putAttribute(attribute: string, value: string): void;

    /**
     * Removes an already added attribute. Does nothing if attribute does not exist.
     *
     * #### Example
     *
     * ```js
     * metric.removeAttribute('user_role');
     * ```
     *
     * @param attribute Name of the attribute to be removed.
     */
    removeAttribute(attribute: string): void;

    /**
     * Sets the httpResponse code of the request.
     *
     * #### Example
     *
     * ```js
     * const response = await fetch(url);
     * metric.setHttpResponseCode(response.status);
     * ```
     * > This is required for every request, if you do not provide this your metric will not be captured.
     *
     *
     * @param code Value must be greater than 0. Set to null to remove. Invalid usage will be logged natively.
     */
    setHttpResponseCode(code: number | null): void;

    /**
     * Sets the size of the request payload.
     *
     * #### Example
     *
     * ```js
     * const response = await fetch(url);
     * metric.setRequestPayloadSize(response.headers.get('Content-Type'));
     * ```
     *
     * @param bytes Value must be greater than 0. Set to null to remove. Invalid usage will be logged natively.
     */
    setRequestPayloadSize(bytes: number | null): void;

    /**
     * Sets the size of the response payload.
     *
     * #### Example
     *
     * ```js
     * const response = await fetch(url);
     * metric.setResponsePayloadSize(response.headers.get('Content-Length'));
     * ```
     *
     * @param bytes Value must be greater than 0. Set to null to remove. Invalid usage will be logged natively.
     */
    setResponsePayloadSize(bytes: number | null): void;

    /**
     * Content type of the response e.g. `text/html` or `application/json`.
     *
     * #### Example
     *
     * ```js
     * const response = await fetch(url);
     * metric.setResponsePayloadSize(response.headers.get('Content-Type'));
     * ```
     *
     * @param contentType Valid string of MIME type. Set to null to remove. Invalid usage will be logged natively.
     */
    setResponseContentType(contentType: string | null): void;

    /**
     * Marks the start time of the request. Does nothing if already started.
     *
     * #### Example
     *
     * ```js
     * const metric = firebase.perf().newHttpMetric('https://api.com/login', 'POST');
     * await metric.start();
     * ```
     */
    start(): Promise<null>;

    /**
     * Marks the end time of the response and queues the network request metric on the device for transmission. Does nothing if already stopped.
     *
     * #### Example
     *
     * ```js
     * const metric = firebase.perf().newHttpMetric('https://api.com/login', 'POST');
     * await metric.start();
     * metric.putAttribute('user_role', 'admin');
     * await metric.stop();
     * ```
     */
    stop(): Promise<null>;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Statics {}

  /**
   * The Firebase Performance Monitoring service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Performance Monitoring service for the default app:
   *
   * ```js
   * const defaultAppPerf = firebase.perf();
   * ```
   */
  export class Module extends FirebaseModule {
    /**
     * Determines whether performance monitoring is enabled or disabled.
     *
     * #### Example
     *
     * ```js
     * const isEnabled = firebase.perf().isPerformanceCollectionEnabled;
     * console.log('Performance collection enabled: ', isEnabled);
     * ```
     */
    isPerformanceCollectionEnabled: boolean;

    /**
     * Enables or disables performance monitoring.
     *
     * #### Example
     *
     * ```js
     * // Disable performance monitoring collection
     * await firebase.perf().setPerformanceCollectionEnabled(false);
     * ```
     *
     * @param enabled Should performance monitoring be enabled
     */
    setPerformanceCollectionEnabled(enabled: boolean): Promise<null>;

    /**
     * Creates a Trace instance with the given identifier.
     *
     * #### Example
     *
     * ```js
     * const trace = firebase.perf().newTrace('user_profile');
     * await trace.start();
     * ```
     *
     * @param identifier Name of the trace, no leading or trailing whitespace allowed, no leading underscore '_' character allowed, max length is 100.
     */
    newTrace(identifier: string): Trace;

    /**
     * Creates a Trace instance with the given identifier and immediately starts it.
     *
     * #### Example
     *
     * ```js
     * const trace = await firebase.perf().startTrace('user_profile');
     * ```
     *
     * @param identifier Name of the trace, no leading or trailing whitespace allowed, no leading underscore '_' character allowed, max length is 100.
     */
    startTrace(identifier: string): Promise<Trace>;

    /**
     * Creates a HttpMetric instance for collecting network performance data for a single request/response
     *
     * #### Example
     *
     * ```js
     * const metric = firebase.perf().newHttpMetric('https://api.com/user/1', 'GET');
     * await metric.start();
     * ```
     *
     * @param url A valid url String, cannot be empty
     * @param httpMethod One of the values GET, PUT, POST, DELETE, HEAD, PATCH, OPTIONS, TRACE, or CONNECT
     */
    newHttpMetric(url: string, httpMethod: HttpMethod): HttpMetric;
  }
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStatics<
  FirebasePerformanceTypes.Module,
  FirebasePerformanceTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  perf: typeof defaultExport;
  app(name?: string): ReactNativeFirebase.FirebaseApp & { perf(): FirebasePerformanceTypes.Module };
};

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

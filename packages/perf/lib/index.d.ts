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

import {
  ReactNativeFirebaseModule,
  ReactNativeFirebaseNamespace,
  ReactNativeFirebaseModuleAndStatics,
} from '@react-native-firebase/app-types';

/**
 * Get insights into how your app performs from your users’ point of view, with automatic and customized performance tracing.
 *
 * @firebase perf
 */
export namespace Perf {
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
  export interface Trace {
    /**
     * Returns the value of an attribute. Returns null if it does not exist.
     *
     * @param attribute Name of the attribute to fetch the value of
     */
    getAttribute(attribute: string): string | null;

    /**
     * Returns an object of all the currently added attributes and their string values.
     */
    getAttributes(): { [key: string]: string };

    /**
     * Sets a String value for the specified attribute. Updates the value of the attribute if it already exists.
     * The maximum number of attributes that can be added is 5.
     *
     * @param attribute Name of the attribute. Max length is 40 chars.
     * @param value Value of the attribute. Max length is 100 chars.
     */
    putAttribute(attribute: string, value: string);

    /**
     * Removes an already added attribute. Does nothing if attribute does not exist.
     *
     * @param attribute Name of the attribute to be removed.
     */
    removeAttribute(attribute: string);

    /**
     * Gets the value of the metric with the given name in the current trace. If the metric doesn't exist, it will not be created and a 0 is returned.
     *
     * @param metricName Name of the metric to get.
     */
    getMetric(metricName: string): number;

    /**
     * Returns an object of all the currently added metrics and their number values.
     */
    getMetrics(): { [key: string]: number };

    /**
     * Sets the value of the named metric with the provided number.
     *
     * If a metric with the given name exists it will be overwritten.
     * If a metric with the given name doesn't exist, a new one will be created.
     *
     * @param metricName Name of the metric to set. Must not have a leading or trailing whitespace, no leading underscore '_' character and have a max length of 32 characters.
     * @param value The value the metric should be set to.
     */
    putMetric(metricName: string, value: number);

    /**
     * Increments the named metric by the `incrementBy` value.
     *
     * If a metric with the given name doesn't exist, a new one will be created starting with the value of `incrementBy`.
     *
     * @param metricName Name of the metric to increment. Must not have a leading or trailing whitespace, no leading underscore '_' character and have a max length of 32 characters.
     * @param incrementBy The value the metric should be incremented by.
     */
    incrementMetric(metricName: string, incrementBy: number);

    /**
     * Removes a metric by name if it exists.
     *
     * @param metricName Name of the metric to remove.
     */
    removeMetric(metricName: string);

    /**
     * Marks the start time of the trace. Does nothing if already started.
     */
    start(): Promise<null>;

    /**
     * Marks the end time of the trace and queues the metric on the device for transmission. Does nothing if already stopped.
     */
    stop(): Promise<null>;
  }

  /**
   * Metric used to collect data for network requests/responses. A new instance must be used for every request/response.
   */
  export interface HttpMetric {
    /**
     * Returns the value of an attribute. Returns null if it does not exist.
     *
     * @param attribute Name of the attribute to fetch the value of
     */
    getAttribute(attribute: string): string | null;

    /**
     * Returns an object of all the currently added attributes.
     */
    getAttributes(): { [key: string]: string };

    /**
     * Sets a String value for the specified attribute. Updates the value of the attribute if it already exists.
     * The maximum number of attributes that can be added is 5.
     *
     * @param attribute Name of the attribute. Max length is 40 chars.
     * @param value Value of the attribute. Max length is 100 chars.
     */
    putAttribute(attribute: string, value: string);

    /**
     * Removes an already added attribute. Does nothing if attribute does not exist.
     *
     * @param attribute Name of the attribute to be removed.
     */
    removeAttribute(attribute: string);

    /**
     * Sets the httpResponse code of the request.
     *
     * @warning This is required for every request, if you do not provide this your metric will not be captured.
     *
     * @param code Value must be greater than 0. Set to null to remove. Invalid usage will be logged natively.
     */
    setHttpResponseCode(code: number | null);

    /**
     * Sets the size of the request payload
     *
     * @param bytes Value must be greater than 0. Set to null to remove. Invalid usage will be logged natively.
     */
    setRequestPayloadSize(bytes: number | null);

    /**
     * Sets the size of the response payload
     *
     * @param bytes Value must be greater than 0. Set to null to remove. Invalid usage will be logged natively.
     */
    setResponsePayloadSize(bytes: number | null);

    /**
     * Content type of the response e.g. `text/html` or `application/json`.
     *
     * @param contentType Valid string of MIME type. Set to null to remove. Invalid usage will be logged natively.
     */
    setResponseContentType(contentType: string | null);

    /**
     * Marks the start time of the request. Does nothing if already started.
     */
    start(): Promise<null>;

    /**
     * Marks the end time of the response and queues the network request metric on the device for transmission. Does nothing if already stopped.
     */
    stop(): Promise<null>;
  }

  export interface Statics {}

  export interface Module extends ReactNativeFirebaseModule {
    /**
     * Determines whether performance monitoring is enabled or disabled.
     */
    isPerformanceCollectionEnabled: boolean;

    /**
     * Enables or disables performance monitoring.
     *
     * @param enabled Should performance monitoring be enabled
     */
    setPerformanceCollectionEnabled(enabled: boolean): void;

    /**
     * Creates a Trace instance with given identifier.
     *
     * @param identifier Name of the trace, no leading or trailing whitespace allowed, no leading underscore '_' character allowed, max length is 100.
     */
    newTrace(identifier: string): Trace;

    /**
     * Creates a HttpMetric instance for collecting network performance data for a single request/response
     *
     * @param url A valid url String, cannot be empty
     * @param httpMethod One of the values GET, PUT, POST, DELETE, HEAD, PATCH, OPTIONS, TRACE, or CONNECT
     */
    newHttpMetric(url: string, httpMethod: HttpMethod): HttpMetric;
  }
}

declare module '@react-native-firebase/perf' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/perf';
   * firebase.perf().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const PerfDefaultExport: ReactNativeFirebaseModuleAndStatics<Perf.Module, Perf.Statics>;
  /**
   * @example
   * ```js
   * import perf from '@react-native-firebase/perf';
   * perf().X(...);
   * ```
   */
  export default PerfDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Get insights into how your app performs from your users’ point of view, with automatic and customized performance tracing.
     */
    perf: ReactNativeFirebaseModuleAndStatics<Perf.Module, Perf.Statics>;
  }

  interface FirebaseApp {
    /**
     * Perf
     */
    perf(): Perf.Module;
  }
}

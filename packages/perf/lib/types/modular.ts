/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type { FirebasePerformanceTypes } from './namespaced';

/** Firebase App type for React Native Firebase. */
export type FirebaseApp = ReactNativeFirebase.FirebaseApp;

/**
 * Defines configuration options for the Performance Monitoring SDK.
 *
 * @public
 */
export interface PerformanceSettings {
  /** Whether to collect custom events. */
  dataCollectionEnabled?: boolean;

  /** Whether to collect out of the box events. */
  instrumentationEnabled?: boolean;
}

/**
 * The Firebase Performance Monitoring service interface.
 *
 * @public
 */
export interface FirebasePerformance {
  /**
   * The FirebaseApp this `FirebasePerformance` instance is associated with.
   */
  app: FirebaseApp;

  /**
   * Controls the logging of automatic traces and HTTP/S network monitoring.
   */
  instrumentationEnabled: boolean;

  /**
   * Controls the logging of custom traces.
   */
  dataCollectionEnabled: boolean;
}

/**
 * The interface representing a `Trace`.
 *
 * @public
 */
export interface PerformanceTrace {
  /**
   * Starts the timing for the trace instance.
   */
  start(): Promise<null>;
  /**
   * Stops the timing of the trace instance and logs the data of the instance.
   */
  stop(): Promise<null>;
  /**
   * Records a trace from given parameters. This provides a direct way to use trace without a need to
   * start/stop. This is useful for use cases in which the trace cannot directly be used
   * (e.g. if the duration was captured before the Performance SDK was loaded).
   *
   * @param startTime - trace start time since epoch in millisec.
   * @param duration - The duration of the trace in millisec.
   * @param options - An object which can optionally hold maps of custom metrics and
   * custom attributes.
   */
  record?(
    startTime: number,
    duration: number,
    options?: {
      metrics?: { [key: string]: number };
      attributes?: { [key: string]: string };
    },
  ): void;
  /**
   * Adds to the value of a custom metric. If a custom metric with the provided name does not
   * exist, it creates one with that name and the value equal to the given number.
   *
   * @param metricName - The name of the custom metric.
   * @param num - The number to be added to the value of the custom metric. If not provided, it
   * uses a default value of one.
   */
  incrementMetric(metricName: string, num?: number): void;
  /**
   * Sets the value of the specified custom metric to the given number.
   *
   * @param metricName - Name of the custom metric.
   * @param num - Value of the custom metric.
   */
  putMetric(metricName: string, num: number): void;
  /**
   * Returns the value of the custom metric by that name. If a custom metric with that name does
   * not exist will return zero.
   *
   * @param metricName - Name of the custom metric.
   */
  getMetric(metricName: string): number;
  /**
   * Set a custom attribute of a trace to a certain value.
   *
   * @param attr - Name of the custom attribute.
   * @param value - Value of the custom attribute.
   */
  putAttribute(attr: string, value: string): void;
  /**
   * Retrieves the value which a custom attribute is set to.
   *
   * @param attr - Name of the custom attribute.
   */
  getAttribute(attr: string): string | null | undefined;
  /**
   * Removes the specified custom attribute from a trace instance.
   *
   * @param attr - Name of the custom attribute.
   */
  removeAttribute?(attr: string): void;
  /**
   * Returns a map of all custom attributes of a trace instance.
   */
  getAttributes?(): { [key: string]: string };
}

/**
 * HTTP method type for HttpMetric.
 *
 * @public
 */
export type HttpMethod = FirebasePerformanceTypes.HttpMethod;

/**
 * The interface representing an HTTP metric.
 *
 * @public
 */
export type HttpMetric = FirebasePerformanceTypes.HttpMetric;

/**
 * The interface representing a screen trace.
 *
 * @public
 */
export type ScreenTrace = FirebasePerformanceTypes.ScreenTrace;

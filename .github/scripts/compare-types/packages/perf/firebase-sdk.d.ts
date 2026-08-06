/**
 * Public types snapshot from the Firebase JS SDK (@firebase/performance).
 *
 * Source: firebase-js-sdk `node_modules/@firebase/performance/dist/src/index.d.ts`
 *         and `node_modules/@firebase/performance/dist/src/public_types.d.ts`
 * Modality: modular (tree-shakeable) API only
 *
 * This file is the reference snapshot used to detect API drift between the
 * firebase-js-sdk and the @react-native-firebase/perf modular API.
 *
 * When a new version of the firebase-js-sdk ships with type changes, update
 * this file with the new public modular types from @firebase/performance.
 */

import { FirebaseApp } from '@firebase/app';

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
   * The {@link @firebase/app#FirebaseApp} this `FirebasePerformance` instance is associated with.
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
  start(): void;
  /**
   * Stops the timing of the trace instance and logs the data of the instance.
   */
  stop(): void;
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
  record(
    startTime: number,
    duration: number,
    options?: {
      metrics?: {
        [key: string]: number;
      };
      attributes?: {
        [key: string]: string;
      };
    },
  ): void;
  /**
   * Adds to the value of a custom metric. If a custom metric with the provided name does not
   * exist, it creates one with that name and the value equal to the given number. The value will be floored down to an
   * integer.
   *
   * @param metricName - The name of the custom metric.
   * @param num - The number to be added to the value of the custom metric. If not provided, it
   * uses a default value of one.
   */
  incrementMetric(metricName: string, num?: number): void;
  /**
   * Sets the value of the specified custom metric to the given number regardless of whether
   * a metric with that name already exists on the trace instance or not. The value will be floored down to an
   * integer.
   *
   * @param metricName - Name of the custom metric.
   * @param num - Value to of the custom metric.
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
  getAttribute(attr: string): string | undefined;
  /**
   * Removes the specified custom attribute from a trace instance.
   *
   * @param attr - Name of the custom attribute.
   */
  removeAttribute(attr: string): void;
  /**
   * Returns a map of all custom attributes of a trace instance.
   */
  getAttributes(): {
    [key: string]: string;
  };
}

/**
 * Returns a {@link FirebasePerformance} instance for the given app.
 * @param app - The {@link @firebase/app#FirebaseApp} to use.
 * @public
 */
export declare function getPerformance(app?: FirebaseApp): FirebasePerformance;

/**
 * Returns a {@link FirebasePerformance} instance for the given app. Can only be called once.
 * @param app - The {@link @firebase/app#FirebaseApp} to use.
 * @param settings - Optional settings for the {@link FirebasePerformance} instance.
 * @public
 */
export declare function initializePerformance(
  app: FirebaseApp,
  settings?: PerformanceSettings,
): FirebasePerformance;

/**
 * Returns a new `PerformanceTrace` instance.
 * @param performance - The {@link FirebasePerformance} instance to use.
 * @param name - The name of the trace.
 * @public
 */
export declare function trace(performance: FirebasePerformance, name: string): PerformanceTrace;

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
    await perf.setDataCollection(settings.dataCollectionEnabled);
  }
  // Once web is implemented, we can also implement `perf.setInstrumentationEnabled(settings.instrumentationEnabled)`

  return perf;
}

/**
 * Determines whether performance monitoring is enabled or disabled.
 * @param perf - Performance instance
 * @returns {Boolean}
 */
export function isPerformanceCollectionEnabled(perf) {
  return perf.isPerformanceCollectionEnabled;
}

/**
 * Returns nothing.
 * @param perf - Performance instance
 * @param enabled - A Boolean for setting Performance collection
 * @returns {void}
 */
export function setPerformanceCollectionEnabled(perf, enabled) {
  return perf.setPerformanceCollectionEnabled(enabled);
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

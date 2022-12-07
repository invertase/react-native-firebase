import { firebase } from '..';

/**
 * Returns a Functions instance for the given app.
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
 * Returns a Functions instance for the given app.
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

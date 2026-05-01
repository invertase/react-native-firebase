/**
 * Known differences between the firebase-js-sdk @firebase/performance modular
 * API and the @react-native-firebase/perf modular API.
 */

import type { PackageConfig } from '../../src/types';

const config: PackageConfig = {
  missingInRN: [],
  extraInRN: [
    {
      name: 'HttpMethod',
      reason:
        'String union of HTTP verbs used by React Native HTTP metrics. The web Performance ' +
        'modular API does not expose HTTP metrics in the public tree-shakeable surface.',
    },
    {
      name: 'Trace',
      reason:
        'Deprecated type alias for `PerformanceTrace` kept for older modular imports. The ' +
        'firebase-js-sdk only exports `PerformanceTrace`.',
    },
    {
      name: 'ScreenTrace',
      reason:
        'React Native screen trace type for slow/frozen frame reporting. No equivalent exists ' +
        'in the firebase-js-sdk modular Performance API.',
    },
    {
      name: 'HttpMetric',
      reason:
        'React Native HTTP request metric type backed by native instrumentation. The web SDK ' +
        'does not expose this type on the modular public surface.',
    },
    {
      name: 'Performance',
      reason:
        'Deprecated type alias for `FirebasePerformance` kept for older modular imports. The ' +
        'firebase-js-sdk only exports `FirebasePerformance`.',
    },
    {
      name: 'httpMetric',
      reason:
        'React Native modular helper that constructs an `HttpMetric`. No equivalent exists in ' +
        'the firebase-js-sdk modular Performance API.',
    },
    {
      name: 'newScreenTrace',
      reason:
        'React Native modular helper that constructs a `ScreenTrace`. No equivalent exists in ' +
        'the firebase-js-sdk modular Performance API.',
    },
    {
      name: 'startScreenTrace',
      reason:
        'React Native modular helper that creates and starts a `ScreenTrace`. No equivalent ' +
        'exists in the firebase-js-sdk modular Performance API.',
    },
  ],
  differentShape: [
    {
      name: 'FirebasePerformance',
      reason:
        'React Native extends the service interface with native collection state (`isPerformanceCollectionEnabled`), ' +
        'a deprecated `setPerformanceCollectionEnabled` bridge helper, and factory methods for traces, ' +
        'screen traces, and HTTP metrics. The firebase-js-sdk web type only exposes `app`, ' +
        '`instrumentationEnabled`, and `dataCollectionEnabled`.',
    },
    {
      name: 'PerformanceTrace',
      reason:
        'React Native uses async `start`/`stop` (`Promise<null>`) because work crosses the native bridge. ' +
        'The web SDK uses synchronous `start`/`stop` and exposes `record()`. RN Firebase exposes ' +
        '`getMetrics` and `removeMetric` for native-backed custom metrics instead of the web shape.',
    },
  ],
};

export default config;

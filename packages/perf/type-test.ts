import { getApp } from '@react-native-firebase/app';
import {
  getPerformance,
  initializePerformance,
  trace,
  httpMetric,
  newScreenTrace,
  startScreenTrace,
  SDK_VERSION,
  type FirebasePerformance,
  type HttpMetric,
  type HttpMethod,
  type PerformanceTrace,
  type ScreenTrace,
} from '.';

const perf = getPerformance();
console.log(perf.app.name);

const perfWithApp = getPerformance(getApp());
console.log(perfWithApp.app.name);

initializePerformance(getApp(), { dataCollectionEnabled: true });
trace(perf, 'test-trace');
httpMetric(perf, 'https://example.com', 'GET' as HttpMethod);
newScreenTrace(perf, 'HomeScreen');
const startedScreenTrace: ScreenTrace = startScreenTrace(perf, 'HomeScreen');

const typedPerf: FirebasePerformance = perf;
console.log(typedPerf.app.name);

const perfTrace: PerformanceTrace = trace(perf, 'typed');
console.log(perfTrace);

// Trace/HttpMetric/ScreenTrace start()/stop() are synchronous (void), matching firebase-js-sdk.
const traceStartResult: void = perfTrace.start();
const traceStopResult: void = perfTrace.stop();
const perfHttpMetric: HttpMetric = httpMetric(perf, 'https://example.com', 'POST' as HttpMethod);
const httpStartResult: void = perfHttpMetric.start();
const httpStopResult: void = perfHttpMetric.stop();
const screenStartResult: void = startedScreenTrace.start();
const screenStopResult: void = startedScreenTrace.stop();
console.log(
  traceStartResult,
  traceStopResult,
  httpStartResult,
  httpStopResult,
  screenStartResult,
  screenStopResult,
);

console.log(SDK_VERSION);

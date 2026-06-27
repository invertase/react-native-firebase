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
  type HttpMethod,
  type PerformanceTrace,
} from '.';

const perf = getPerformance();
console.log(perf.app.name);

const perfWithApp = getPerformance(getApp());
console.log(perfWithApp.app.name);

initializePerformance(getApp(), { dataCollectionEnabled: true });
trace(perf, 'test-trace');
httpMetric(perf, 'https://example.com', 'GET' as HttpMethod);
newScreenTrace(perf, 'HomeScreen');
startScreenTrace(perf, 'HomeScreen');

const typedPerf: FirebasePerformance = perf;
console.log(typedPerf.app.name);

const perfTrace: PerformanceTrace = trace(perf, 'typed');
console.log(perfTrace);

console.log(SDK_VERSION);

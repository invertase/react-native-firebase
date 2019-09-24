import firebase from '@react-native-firebase/app';
import * as perf from '@react-native-firebase/perf';

// checks module exists at root
console.log(firebase.perf().app.name);

// checks module exists at app level
console.log(firebase.app().perf().app.name);

// checks statics exist
console.log(firebase.perf.SDK_VERSION);

// checks statics exist on defaultExport
console.log(firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(perf.firebase.SDK_VERSION);

// checks multi-app support exists
// console.log(firebase.perf(firebase.app()).app.name);

// checks default export supports app arg
// console.log(defaultExport(firebase.app()).app.name);

console.log(firebase.perf().setPerformanceCollectionEnabled);
firebase
  .perf()
  .setPerformanceCollectionEnabled(false)
  .then();

const trace = firebase.perf().newTrace('foo');
trace.putAttribute('foo', 'bar');
trace.putMetric('foo', 123);
console.log(trace.getAttribute('foo'));
console.log(trace.getMetric('foo'));
trace.incrementMetric('foo', 2);
trace.removeMetric('foo');
trace.start().then();
trace.stop().then();

const metric = firebase.perf().newHttpMetric('foo', 'GET');
metric.putAttribute('foo', 'bar');
metric.setHttpResponseCode(123);
metric.setResponseContentType('foo');
metric.start().then();
metric.stop().then();

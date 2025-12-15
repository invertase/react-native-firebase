import perf, {
  firebase,
  FirebasePerformanceTypes,
  getPerformance,
  initializePerformance,
  trace,
  httpMetric,
  newScreenTrace,
  startScreenTrace,
} from '.';

console.log(perf().app);

// checks module exists at root
console.log(firebase.perf().app.name);
console.log(firebase.perf().isPerformanceCollectionEnabled);
console.log(firebase.perf().instrumentationEnabled);
console.log(firebase.perf().dataCollectionEnabled);

// checks module exists at app level
console.log(firebase.app().perf().app.name);
console.log(firebase.app().perf().isPerformanceCollectionEnabled);

// checks statics exist
console.log(firebase.perf.SDK_VERSION);

// checks statics exist on defaultExport
console.log(perf.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks default export supports app arg
console.log(perf().app.name);

// checks Module instance APIs
const perfInstance = firebase.perf();
console.log(perfInstance.app.name);
console.log(perfInstance.isPerformanceCollectionEnabled);
console.log(perfInstance.instrumentationEnabled);
console.log(perfInstance.dataCollectionEnabled);

perfInstance.setPerformanceCollectionEnabled(false).then(() => {
  console.log('Performance collection disabled');
});

perfInstance.dataCollectionEnabled = false;
console.log(perfInstance.dataCollectionEnabled);

perfInstance.instrumentationEnabled = true;
console.log(perfInstance.instrumentationEnabled);

const traceInstance = perfInstance.newTrace('test-trace');
console.log(traceInstance.getAttribute('test'));
traceInstance.putAttribute('key', 'value');
console.log(traceInstance.getAttribute('key'));
traceInstance.putMetric('metric', 10);
console.log(traceInstance.getMetric('metric'));
const metrics = traceInstance.getMetrics();
console.log(metrics);
traceInstance.incrementMetric('metric', 5);
traceInstance.removeMetric('metric');
traceInstance.start().then(() => {
  console.log('Trace started');
});
traceInstance.stop().then(() => {
  console.log('Trace stopped');
});

perfInstance.startTrace('async-trace').then((startedTrace: FirebasePerformanceTypes.Trace) => {
  console.log(startedTrace);
  startedTrace.stop();
});

const screenTrace = perfInstance.newScreenTrace('test-screen');
screenTrace.start().then(() => {
  console.log('Screen trace started');
});
screenTrace.stop().then(() => {
  console.log('Screen trace stopped');
});

perfInstance
  .startScreenTrace('async-screen')
  .then((startedScreenTrace: FirebasePerformanceTypes.ScreenTrace) => {
    console.log(startedScreenTrace);
    startedScreenTrace.stop();
  });

const httpMetricInstance = perfInstance.newHttpMetric('https://example.com', 'GET');
console.log(httpMetricInstance.getAttribute('test'));
httpMetricInstance.putAttribute('key', 'value');
const attributes = httpMetricInstance.getAttributes();
console.log(attributes);
httpMetricInstance.removeAttribute('key');
httpMetricInstance.setHttpResponseCode(200);
httpMetricInstance.setRequestPayloadSize(1024);
httpMetricInstance.setResponsePayloadSize(2048);
httpMetricInstance.setResponseContentType('application/json');
httpMetricInstance.start().then(() => {
  console.log('HTTP metric started');
});
httpMetricInstance.stop().then(() => {
  console.log('HTTP metric stopped');
});

// checks modular API functions
const modularPerf1 = getPerformance();
console.log(modularPerf1.app.name);

const modularPerf2 = getPerformance(firebase.app());
console.log(modularPerf2.app.name);

initializePerformance(firebase.app(), { dataCollectionEnabled: true }).then(initializedPerf => {
  console.log(initializedPerf.app.name);
});

const modularTrace = trace(modularPerf1, 'modular-trace');
modularTrace.putAttribute('modular-key', 'modular-value');
modularTrace.putMetric('modular-metric', 20);
modularTrace.start().then(() => {
  console.log('Modular trace started');
});
modularTrace.stop().then(() => {
  console.log('Modular trace stopped');
});

const modularHttpMetric = httpMetric(modularPerf1, 'https://modular.example.com', 'POST');
modularHttpMetric.putAttribute('modular-key', 'modular-value');
modularHttpMetric.setHttpResponseCode(201);
modularHttpMetric.start().then(() => {
  console.log('Modular HTTP metric started');
});
modularHttpMetric.stop().then(() => {
  console.log('Modular HTTP metric stopped');
});

const modularScreenTrace = newScreenTrace(modularPerf1, 'modular-screen');
modularScreenTrace.start().then(() => {
  console.log('Modular screen trace started');
});
modularScreenTrace.stop().then(() => {
  console.log('Modular screen trace stopped');
});

startScreenTrace(modularPerf1, 'modular-async-screen').then(startedModularScreenTrace => {
  console.log(startedModularScreenTrace);
  startedModularScreenTrace.stop();
});

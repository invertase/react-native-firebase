---
title: Quick Start
description: Getting started with Performance Monitoring in React Native Firebase
---

# Performance Monitoring Quick Start

## Installation

This module depends on the `@react-native-firebase/app` module. To get started and install `app`,
visit the projects <Anchor version={false} group={false} href="/quick-start">quick start</Anchor> guide. 

Install this module with Yarn:

```bash
yarn add @react-native-firebase/perf
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

Once installed, the Performance Monitoring package automatically traces events and metrics which
are sent to Firebase. For more information on the automatic traces, please see the
[Firebase documentation](https://firebase.google.com/docs/perf-mon/automatic?utm_source=invertase&utm_medium=react-native-firebase&utm_campaign=quick-start).

The Performance Monitoring package also allows for custom tracing of events via the JavaScript API.

Import the Performance Monitoring package into your project:

```js
import perf from '@react-native-firebase/perf';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/perf';
```

### Custom Tracing

Defining a custom trace provides greater insight into actions a user may carry out with your application.

```js
import perf from '@react-native-firebase/perf';

async function customTrace() {
  // Define & start a trace
  const trace = await perf().startTrace('custom_trace');

  // Define trace meta details
  trace.putAttribute('user', 'abcd');
  trace.putMetric('credits', 30);

  // Stop the trace
  await trace.stop();
}
```

### HTTP Request Tracing

Performance Monitoring provides an API to trace HTTP network requests.

```js
import perf from '@react-native-firebase/perf';

async function getRequest(url) {
  // Define the network metric
  const metric = await perf().newHttpMetric(url, 'GET');

  // Define meta details
  metric.putAttribute('user', 'abcd');

  // Perform a HTTP request and provide response information
  const response = await fetch(url);
  metric.setHttpResponseCode(response.status);
  metric.setResponseContentType(response.headers.get('Content-Type'));
  metric.setResponsePayloadSize(response.headers.get('Content-Length'));

  // Stop the trace
  await metric.stop();

  return response.json();
}

// Call API
getRequest('https://api.com').then(json => {
  console.log(json);
});
```

---
title: Performance Monitoring
description: Installation and getting started with Performance Monitoring.
icon: //static.invertase.io/assets/firebase/performance-monitoring.svg
next: /perf/axios-integration
previous: /remote-config/usage
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the performance monitoring module
yarn add @react-native-firebase/perf

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/perf/usage/installation/ios) and [Android](/perf/usage/installation/android).

## Add the Performance Monitoring Plugin

> If you're using Expo, make sure to add the `@react-native-firebase/perf` config plugin to your `app.json` or `app.config.js`. It handles the below installation steps for you. For instructions on how to do that, view the [Expo](/#expo) installation section.

On Android, you need to install the Google Performance Monitoring Plugin which enables automatic
HTTPS network request monitoring.

Add the plugin to your `/android/build.gradle` file as a dependency:

```groovy
buildscript {
    dependencies {
        // ...
        classpath 'com.google.firebase:perf-plugin:1.4.2'
    }
```

Apply the plugin via the `/android/app/build.gradle` file (at the top):

```groovy
apply plugin: 'com.android.application'
apply plugin: 'com.google.firebase.firebase-perf'
```

# What does it do

Performance Monitoring allows you to gain insight into key performance characteristics within your React Native application.
It provides a simple API to track custom trace and HTTP request metrics.

<Youtube id="0EHSPFvH7vk" />

Review and analyze that data in the Firebase console. Performance Monitoring helps you to understand where and when the
performance of your app can be improved so that you can use that information to fix performance issues.

Performance Monitoring package automatically traces events and metrics which are sent to Firebase. For more information
on the automatic traces, please see the Firebase Performance Monitoring [documentation](https://firebase.google.com/docs/perf-mon/auto_duration-traces-metrics_ios-android).
The package also allows you to performance monitor custom aspects to your application like network requests & task specific
app code. All performance metrics are available on your Firebase [console](https://console.firebase.google.com/u/0/) performance tab.

# Usage

## Custom tracing

Below is how you would measure the amount of time it would take to complete a specific task in your app code.

```jsx
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

## HTTP Request Tracing

Below illustrates you would measure the latency of a HTTP request.

```jsx
import perf from '@react-native-firebase/perf';

async function getRequest(url) {
  // Define the network metric
  const metric = await perf().newHttpMetric(url, 'GET');

  // Define meta details
  metric.putAttribute('user', 'abcd');

  // Start the metric
  await metric.start();

  // Perform a HTTP request and provide response information
  const response = await fetch(url);
  metric.setHttpResponseCode(response.status);
  metric.setResponseContentType(response.headers.get('Content-Type'));
  metric.setResponsePayloadSize(response.headers.get('Content-Length'));

  // Stop the metric
  await metric.stop();

  return response.json();
}

// Call API
getRequest('https://api.com').then(json => {
  console.log(json);
});
```

# firebase.json

## Disable Auto-Initialization

The Performance Monitoring module will automatically start collecting data once it is installed. To disable this behavior,
set the `perf_auto_collection_enabled` flag to `false`:

```json
// <project-root>/firebase.json
{
  "react-native": {
    "perf_auto_collection_enabled": false
  }
}
```

To re-enable collection (e.g. once you have the users consent), call the `setPerformanceCollectionEnabled` method:

```js
import { firebase } from '@react-native-firebase/perf';
// ...
await firebase.perf().setPerformanceCollectionEnabled(true);
```

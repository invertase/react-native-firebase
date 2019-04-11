---
title: Firebase Performance Monitoring and Axios
description: Automatically add Firebase Performance Monitoring HttpMetric's to every Axios request.
author: salakar
date: 2019-01-22
tags:
  - perf
---

# Monitor HTTP request performance with Firebase Performance Monitoring and Axios

## Axios Interceptors

[Axios](https://github.com/axios/axios) allows you to intercept requests or responses before they are handled by `then` or `catch`.

We can use a `request` interceptor to start a `HttpMetric` and a `response` interceptor to stop the `HttpMetric` and report on the success or failure of the request.

The examples below are dependent on the following imports;

```js
import axios from 'axios';
import { firebase } from '@react-native-firebase/perf';
```

### Request Interceptor

```js
axios.interceptors.request.use(async function(config) {
  const httpMetric = firebase.perf().newHttpMetric(config.url, config.method);
  config.metadata = { httpMetric };

  // add any extra metric attributes if needed
  // httpMetric.putAttribute('userId', '12345678');

  await httpMetric.start();
  return config;
});
```

### Response Interceptor

```js
axios.interceptors.response.use(
  async function(response) {
    // Request was successful, e.g. HTTP code 200

    const { httpMetric } = response.config.metadata;

    // add any extra metric attributes if needed
    // httpMetric.putAttribute('userId', '12345678');

    httpMetric.setHttpResponseCode(response.status);
    httpMetric.setResponseContentType(response.headers['content-type']);
    await httpMetric.stop();

    return response;
  },
  async function(error) {
    // Request failed, e.g. HTTP code 500

    const { httpMetric } = error.config.metadata;

    // add any extra metric attributes if needed
    // httpMetric.putAttribute('userId', '12345678');

    httpMetric.setHttpResponseCode(error.response.status);
    httpMetric.setResponseContentType(error.response.headers['content-type']);
    await httpMetric.stop();

    return Promise.reject(error);
  },
);
```

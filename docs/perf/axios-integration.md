---
title: Performance Monitoring with Axios
description: Monitor HTTP request performance with Firebase Performance Monitoring and Axios.
next: /perf/ky-integration
previous: /perf/usage
---

# Axios

The [Axios library](https://github.com/axios/axios) allows you to easily send HTTP requests via your
React Native application. Axios provides functionality allowing all requests & responses to be intercepted, exposing
metadata which can be hooked into the Performance Monitoring library.

## Request Interceptor

Before HTTP requests are sent out of the React Native environment, a callback can be attached to the `request`
property on the axios instance. At this point, a new HTTP metric can be defined on the Performance Monitoring library:

```js
import axios from 'axios';
import perf from '@react-native-firebase/perf';

axios.interceptors.request.use(async function (config) {
  try {
    const httpMetric = perf().newHttpMetric(config.url, config.method);
    config.metadata = { httpMetric };

    // add any extra metric attributes, if required
    // httpMetric.putAttribute('userId', '12345678');

    await httpMetric.start();
  } finally {
    return config;
  }
});
```

This callback attaches the HTTP metric returned onto the request metadata, which can later be used on an
incoming response.

## Response Interceptor

Similar to the request interceptor, we can also hook into all responses from the HTTP calls. The response
interceptor can accept two callbacks, one for successful responses and one requests which failed:

```js
import axios from 'axios';

axios.interceptors.response.use(
  async function (response) {
    try {
      // Request was successful, e.g. HTTP code 200

      const { httpMetric } = response.config.metadata;

      // add any extra metric attributes if needed
      // httpMetric.putAttribute('userId', '12345678');

      httpMetric.setHttpResponseCode(response.status);
      httpMetric.setResponseContentType(response.headers['content-type']);
      await httpMetric.stop();
    } finally {
      return response;
    }
  },
  async function (error) {
    try {
      // Request failed, e.g. HTTP code 500

      const { httpMetric } = error.config.metadata;

      // add any extra metric attributes if needed
      // httpMetric.putAttribute('userId', '12345678');

      httpMetric.setHttpResponseCode(error.response.status);
      httpMetric.setResponseContentType(error.response.headers['content-type']);
      await httpMetric.stop();
    } finally {
      // Ensure failed requests throw after interception
      return Promise.reject(error);
    }
  },
);
```

All outbound requests sent from Axios will appear in your Firebase console, detailing information such as
how long the request took, response codes & more. Such data can give you greater insight into the performance
of your application via any external APIs you may be using.

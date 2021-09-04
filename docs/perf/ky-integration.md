---
title: Performance Monitoring with KY
description: Monitor HTTP request performance with Firebase Performance Monitoring and KY.
previous: /perf/axios-integration
---

# KY

The [KY library](https://github.com/sindresorhus/ky) is a tiny wrapper over fetch providing a simpler API and some useful shortcuts.
KY provides functionality allowing all requests & responses to be intercepted, exposing
metadata which can be passed onto the Performance Monitoring library.

## Before Request Hook

Before HTTP requests are sent out of the React Native environment, a number of functions can be called to modify or do things based on the current request.
We can use this `beforeRequest` hook to create our HTTP metric.

```js
import perf from '@react-native-firebase/perf';
import ky from 'ky';

const getContentLength = headers => {
  const length = getHeader('Content-Length', headers);
  return length ? Number(length) : null;
};

const getHeader = (header, headers) => headers.get(header) || headers.get(header.toLowerCase());

const api = ky.create({
  hooks: {
    beforeRequest: [
      async (request, options) => {
        const { url, method } = request;
        options.metric = await perf().newHttpMetric(url, method);

        // add any extra metric attributes, if required
        // options.metric.putAttribute('userId', '12345678');
        // options.metric.setRequestPayloadSize(1234)

        await options.metric.start();
      },
    ],
  },
});

export default api;
```

This callback attaches the HTTP metric returned onto the request metadata, which can later be used on an
incoming response.

## After Request Hook

Similar to the before request hook, we can also hook into all responses from HTTP calls.

```js
import ky from 'ky';

const getContentLength = headers => {
  const length = getHeader('Content-Length', headers);
  return length ? Number(length) : null;
};

const getHeader = (header, headers) => headers.get(header) || headers.get(header.toLowerCase());

const api = ky.create({
  hooks: {
    afterResponse: [
      async (request, options, response) => {
        const { status, headers } = response;
        const { metric } = options;
        metric.setHttpResponseCode(status);
        metric.setResponseContentType(getHeader('Content-Type', headers));
        metric.setResponsePayloadSize(getContentLength(headers));
        await metric.stop();
      },
    ],
  },
});

export default api;
```

All outbound requests sent from KY will appear in your Firebase console, detailing information such as
how long the request took, response codes & more. Such data can give you greater insight into the performance of your application via any external APIs you may be using.

## Full Example

A working example is provided below. Please adjust and extend according to your use case.

```js
import perf from '@react-native-firebase/perf';
import ky from 'ky';

const getContentLength = headers => {
  const length = getHeader('Content-Length', headers);
  return length ? Number(length) : null;
};

const getHeader = (header, headers) => headers.get(header) || headers.get(header.toLowerCase());

const api = ky.create({
  // prevent circular dependency warning
  fetch: fetch,
  hooks: {
    beforeRequest: [
      async (request, options) => {
        const { url, method } = request;
        options.metric = await perf().newHttpMetric(url, method);

        // add any extra metric attributes, if required
        // options.metric.putAttribute('userId', '12345678');
        // options.metric.setRequestPayloadSize(1234)

        await options.metric.start();
      },
    ],

    afterResponse: [
      async (request, options, response) => {
        const { status, headers } = response;
        const { metric } = options;
        metric.setHttpResponseCode(status);
        metric.setResponseContentType(getHeader('Content-Type', headers));
        metric.setResponsePayloadSize(getContentLength(headers));
        await metric.stop();
      },
    ],
  },
});

export default api;
```

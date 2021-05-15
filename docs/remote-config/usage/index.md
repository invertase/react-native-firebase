---
title: Remote Config
description: Installation and getting started with Remote Config.
icon: //static.invertase.io/assets/firebase/remote-config.svg
next: /perf/usage
previous: /ml/usage
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

This module also requires that the `@react-native-firebase/analytics` module is already setup and installed. To install the "analytics" module, view it's [Getting Started](/analytics/usage) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the remote-config module
yarn add @react-native-firebase/remote-config

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/remote-config/usage/installation/ios) and [Android](/remote-config/usage/installation/android).

# What does it do

Remote Config allows you to change the appearance and/or functionality of your app without requiring an app update.
Remote Config values are input into the Firebase console and accessible via a JavaScript API. This gives you full control
over when and how these Remote Config values are applied and affect your application.

<Youtube id="_CXXVFPO6f0" />

# Usage

To get started, you need to define some parameters over on the [Firebase Console](https://console.firebase.google.com/project/_/config).

![Firebase Console - Remote Config](https://images.prismic.io/invertase/87dc40bd-0da7-4d83-a87c-b12698b9818f_remote-config-console.png?auto=compress,format)

Each parameter is assigned a unique "key" and values. The values can be broken down to target specific conditions (such as Android or iOS). In the above example,
only Android devices would receive `enabled` for the `awesome_new_feature` parameter.

## Default values

Before fetching the parameters from Firebase, it is first important to set some default values. Default values
help ensure that your application code runs as expected in scenarios where the device has not yet retrieved the values.

An example of this is having no network or you have not yet fetched them within your own code.

Setting default values helps to ensure that both the local device & Firebase servers are both in sync. Call the
`setDefaults` method early on in your application:

```js
import React, { useEffect } from 'react';
import remoteConfig from '@react-native-firebase/remote-config';

function App() {
  useEffect(() => {
    remoteConfig()
      .setDefaults({
        awesome_new_feature: 'disabled',
      })
      .then(() => {
        console.log('Default values set.');
      });
  }, []);
}
```

## Fetch & Activate

Before reading the values from Firebase, we first need to pull them from Firebase (fetching) & then enable them on
the device (activating). The `fetchAndActivate` API combines both tasks into a single flow:

```js
import remoteConfig from '@react-native-firebase/remote-config';

remoteConfig()
  .setDefaults({
    awesome_new_feature: 'disabled',
  })
  .then(() => remoteConfig().fetchAndActivate())
  .then(fetchedRemotely => {
    if (fetchedRemotely) {
      console.log('Configs were retrieved from the backend and activated.');
    } else {
      console.log(
        'No configs were fetched from the backend, and the local configs were already activated',
      );
    }
  });
```

## Reading values

With the defaults set and the remote values fetched from Firebase, we can now use the `getValue` method to get the
value and use a number of methods to retrieve the value (same API as Firebase Remote Config web SDK)

```js
const awesomeNewFeature = remoteConfig().getValue('awesome_new_feature');

// resolves value to string
if (awesomeNewFeature.asString() === 'enabled') {
  enableAwesomeNewFeature();
}
// resolves value to number
// if it is not a number or source is 'static', the value will be 0
if (awesomeNewFeature.asNumber() === 5) {
  enableAwesomeNewFeature();
}
// resolves value to boolean
// if value is any of the following: '1', 'true', 't', 'yes', 'y', 'on', it will resolve to true
// if source is 'static', value will be false
if (awesomeNewFeature.asBoolean() === true) {
  enableAwesomeNewFeature();
}
```

The API also provides a `getAll` method to read all parameters at once rather than by key:

```js
const parameters = remoteConfig().getAll();

Object.entries(parameters).forEach($ => {
  const [key, entry] = $;
  console.log('Key: ', key);
  console.log('Source: ', entry.getSource());
  console.log('Value: ', entry.asString());
});
```

### Value source

When a value is read, it contains source data about the parameter. As explained above, if a value is read before it has
been fetched & activated then the value will fallback to the default value set. If you need to validate whether the value
returned from the module was local or remote, the `getSource()` method can be conditionally checked:

```js
const awesomeNewFeature = remoteConfig().getValue('awesome_new_feature');

if (awesomeNewFeature.getSource() === 'remote') {
  console.log('Parameter value was from the Firebase servers.');
} else if (awesomeNewFeature.getSource() === 'default') {
  console.log('Parameter value was from a default value.');
} else {
  console.log('Parameter value was from a locally cached value.');
}
```

## Caching

Although Remote Config is a data-store, it is not designed for frequent reads - Firebase heavily caches the parameters
(default is 12 hours). By design, this prevents the values being able to change frequently and potentially cause users
confusion.

You can however specify your own cache length by specifically calling the `fetch` method with the number of seconds to
cache the values for:

```js
// Fetch and cache for 5 minutes
await remoteConfig().fetch(300);
```

To bypass caching fully, you can pass a value of `0`. Be warned Firebase may start to reject your requests
if values are requested too frequently.

You can also apply a global cache frequency by calling the `setConfigSettings` method with the `minimumFetchIntervalMillis` property:

```js
await remoteConfig().setConfigSettings({
  minimumFetchIntervalMillis: 30000,
});
```

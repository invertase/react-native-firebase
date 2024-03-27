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
(default is 12 hours).

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

## Real-time updates

Remote Config has the ability to trigger [real-time Remote Config updates](https://firebase.google.com/docs/remote-config/real-time)
in applications that attach one or more listeners for them.

### Key points to know about real-time updates

1. **No activation by default:** If there is a config template update and you have a listener subscribed for real time updates, the native SDK will automatically fetch the new remote config template _but will not activate it for you_. Your callback code is responsible for activating the new template, and your application code is responsible for getting and reacting to the new config template values
1. **Keys considered updated until activated:** Config template keys are considered updated _if they have been changed since you last **activated** the remote config template_. If you never activate the new template, previously changed keys will continue to show up in the set of updated keys sent to your registered listener callback
1. **Real-time updates has a cost:** If you attach a listener, the native SDK opens a persistent web socket to the firebase servers. If all listeners are unsubscribed, this web socket is closed. Consider the battery usage and network data usage implications for your users
1. **_Unactivated changes result in immediate callback_** If there has been a template change since you last activated, and you attach a listener, that listener will be called _immediately_ to update you on the pending changes

### Known Issues

1. **_Handle errors / retry in callback_** During testing here in react-native-firebase, we frequently received the "config_update_not_fetched" error when performing updates and fetching them rapidly. This may not occur in normal usage but be sure to include error handling code in your callback. If this error is raised, you should be able to fetch and activate the new config template with retries after a timeout. Tracked as https://github.com/firebase/firebase-ios-sdk/issues/11462 and a fix is anticipated in firebase-ios-sdk 10.12.0
1. **_iOS web socket will never close_** During testing here in react-native-firebase, we identified a problem in firebase-ios-sdk where native listeners are not removed when you attempt to unsubscribe them, resulting in more update events than expected. As a temporary workaround to avoid the issue, we create a native listener on iOS the first time you subscribe to realtime update events, and we never remove the listener, even if you unsubscribe it. That means the web socket will never close once opened. This is tracked as https://github.com/firebase/firebase-ios-sdk/issues/11458 and a fix is anticipated in firebase-ios-sdk 10.12.0

Here is an example of how to use the feature, with comments emphasizing the key points to know:

```js
// Add a config update listener where appropriate, perhaps in app startup, or a specific app area.
// Multiple listeners are supported, so listeners may be screen-specific and only handle certain keys
// depending on application requirements
let remoteConfigListenerUnsubscriber = remoteConfig().onConfigUpdated((event, error) => {
  if (error !== undefined) {
    console.log('remote-config listener subscription error: ' + JSON.stringify(error));
  } else {
    // Updated keys are keys that are added, removed, or changed value, metadata, or source
    // Note: A key is considered updated if it is different then the activated config.
    //       If the new config is never activated, the same keys will remain in the set of
    //       of updated keys passed to the callback on every config update
    console.log('remote-config updated keys: ' + JSON.stringify(event));

    // If you use realtime updates, the SDK fetches the new config for you.
    // However, you must activate the new config so it is in effect
    remoteConfig().activate();
  }
});

// unsubscribe the listener when no longer needed - remote config will close the network socket if there
// are no active listeners, potentially minimizing application user data and battery usage.
remoteConfigListenerUnsubscriber();
```

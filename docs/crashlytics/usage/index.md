---
title: Crashlytics
description: Installation and getting started with Crashlytics.
icon: //static.invertase.io/assets/firebase/crashlytics.svg
next: /crashlytics/crash-reports
previous: /app/utils
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the Crashlytics module
yarn add @react-native-firebase/crashlytics

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

Once installed, you must complete the following additional setup steps for Android:

- [Android Additional Setup](/crashlytics/android-setup).

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/crashlytics/usage/installation/ios) and [Android](/crashlytics/usage/installation/android).

# What does it do

Crashlytics helps you to collect analytics and details about crashes and errors that occur in your app. It does this through three aspects:

- **Logs**: Log events in your app to be sent with the crash report for context if your app crashes.
- **Crash reports**: Every crash is automatically turned into a crash report and sent.
- **Stack traces**: Even when an error is caught and your app recovers, the JavaScript stack trace can still be sent.

<Youtube id="k_mdNRZzd30" />

To learn more, view the [Firebase Crashlytics documentation](https://firebase.google.com/docs/crashlytics?utm_source=invertase&utm_medium=react-native-firebase&utm_campaign=crashlytics).

# Usage

Use the `log` method throughout your app to accumulate extra context for possible crashes that can happen. For additional context, Crashlytics also offers [various methods](#crash-attributes) to set attributes for the crash report. You can also test Crashlytics by forcing a crash through the `crash` method.

Crashlytics also supports sending JavaScript stack traces to the Firebase console. This can be used in any situation where an error occurs but is caught by your own code to recover gracefully. To send a stack trace, pass a JavaScript Error to the `recordError` method.

> Crash reporting is disabled by default whilst developing. To enable this, view the [enable debug crash logs](#enable-debug-crash-logs) documentation.

## Crash Attributes

There are various methods to set attributes for the crash report, in order to provide analytics for crashes and help you review them. You can use set methods to set predefined attributes, but you can also set your own custom attributes.

```js
import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';

async function onSignIn(user) {
  crashlytics().log('User signed in.');
  await Promise.all([
    crashlytics().setUserId(user.uid),
    crashlytics().setAttribute('credits', String(user.credits)),
    crashlytics().setAttributes({
      role: 'admin',
      followers: '13',
      email: user.email,
      username: user.username
    }),
  ]);
}

export default function App() {
  useEffect(() => {
    crashlytics().log('App mounted.');
  }, []);

  return (
    <View>
      <Button
        title="Sign In"
        onPress={() =>
          onSignIn({
            uid: 'Aa0Bb1Cc2Dd3Ee4Ff5Gg6Hh7Ii8Jj9',
            username: 'Joaquin Phoenix',
            email: 'phoenix@example.com',
            credits: 42,
          })
        }
      />
      <Button title="Test Crash" onPress={() => crashlytics().crash()} />
    </View>
  );
}
```

## Error Reports

Even if you catch unexpected errors, in order for your app to recover and behave smoothly you can still report them through
Crashlytics using the `recordError` method. This will also provide you with the associated stack trace.

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';

const users = [];

export default function App() {
  const [userCounts, setUserCounts] = useState(null);

  function updateUserCounts() {
    crashlytics().log('Updating user count.');
    try {
      if (users) {
        // An empty array is truthy, but not actually true.
        // Therefore the array was never initialised.
        setUserCounts(userCounts.push(users.length));
      }
    } catch (error) {
      crashlytics().recordError(error);
      console.log(error);
    }
  }

  useEffect(() => {
    crashlytics().log('App mounted.');
    if (users == true) setUserCounts([]);
    updateUserCounts();
  }, []);

  if (userCounts) {
    return (
      <View>
        <Text>There are currently {userCounts[userCounts.length - 1]} users.</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Unable to display user information.</Text>
    </View>
  );
}
```

## Opt-out

As Crashlytics will be sending certain information regarding the user, users may want to opt-out of the crash reporting.
This can be done throughout the app with a simple method call to `setCrashlyticsCollectionEnabled`:

```jsx
import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';

export default function App() {
  const [enabled, setEnabled] = useState(crashlytics().isCrashlyticsCollectionEnabled);

  async function toggleCrashlytics() {
    await crashlytics()
      .setCrashlyticsCollectionEnabled(!enabled)
      .then(() => setEnabled(crashlytics().isCrashlyticsCollectionEnabled));
  }

  return (
    <View>
      <Button title="Toggle Crashlytics" onPress={toggleCrashlytics} />
      <Button title="Crash" onPress={() => crashlytics().crash()} />
      <Text>Crashlytics is currently {enabled ? 'enabled' : 'disabled'}</Text>
    </View>
  );
}
```

# firebase.json

## Disable Auto Collection

Additionally, you can configure whether Crashlytics sends out any reports through the `auto_collection_enabled` option in
your `firebase.json` config. If you want users to opt-in, it is recommended that you disable this here and enable it later
through the method once they opt-in.

```json
// <project-root>/firebase.json
{
  "react-native": {
    "crashlytics_auto_collection_enabled": false
  }
}
```

## Enable debug crash logs

Because you have stack traces readily available while you're debugging your app, Crashlytics is disabled by default in debug mode. You can set Crashlytics to be enabled regardless of debug mode through the `debug_enabled` option in your `firebase.json`.

```json
// <project-root>/firebase.json
{
  "react-native": {
    "crashlytics_debug_enabled": true
  }
}
```

## Crashlytics NDK

React Native Firebase supports [Crashlytics NDK](https://docs.fabric.io/android/crashlytics/ndk.html#using-gradle) reporting
which is enabled by default. This allows Crashlytics to capture crashes originating from the Yoga layout engine used by
React Native. You can disable Crashlytics NDK in your `firebase.json` config.

```json
// <project-root>/firebase.json
{
  "react-native": {
    "crashlytics_ndk_enabled": false
  }
}
```

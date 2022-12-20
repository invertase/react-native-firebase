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

> If you're using Expo, make sure to add the `@react-native-firebase/crashlytics` config plugin to your `app.json` or `app.config.js`. It handles the Android installation steps for you. For instructions on how to do that, view the [Expo](/#expo) installation section.

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/crashlytics/usage/installation/ios) and [Android](/crashlytics/usage/installation/android).

> You may like reading a short article we wrote that explains how to configure and _most importantly_ verify your crashlytics installation so you are sure it is working. https://invertase.io/blog/react-native-firebase-crashlytics-configuration

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
      username: user.username,
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

React Native Firebase supports [Crashlytics NDK](https://firebase.google.com/docs/crashlytics/ndk-reports) reporting
which is enabled by default but will require a change as described in that link to enable symbol upload.

This allows Crashlytics to capture crashes originating from the Yoga layout engine used by React Native.

You can disable Crashlytics NDK in your `firebase.json` config.

```json
// <project-root>/firebase.json
{
  "react-native": {
    "crashlytics_ndk_enabled": false
  }
}
```

## Crashlytics Javascript stacktrace issue generation

React Native Crashlytics module by default installs a global javascript exception handler, and it records a crash with a javascript stack trace any time an unhandled javascript exception is thrown. Sometimes it is not desirable behavior since it might duplicate issues in combination with the default mode of javascript global exception handler chaining. We recommend leaving JS crashes enabled and turning off exception handler chaining. However, if you have special crash handling requirements, you may disable this behavior by setting the appropriate option to false:

```json
// <project-root>/firebase.json
{
  "react-native": {
    "crashlytics_is_error_generation_on_js_crash_enabled": false
  }
}
```

## Crashlytics Javascript exception handler chaining

React Native Crashlytics module's global javascript exception handler by default chains to any previously installed global javascript exception handler after logging the crash with the javascript stack trace. In default react-native setups, this means in development you will then see a "red box" and in release mode you will see a second native crash in the Crashlytics console with no javascript stack trace. These duplicate crash reports are probably not desirable, and the one from the chained handler will not have the javascript stack trace. We recommend disabling this once Crashlytics is integrated in testing. It is enabled by default for easier initial integration testing and to be sure introducing the option was not a breaking change. You may disable exception handler chaining by setting the appropriate option to false:

```json
// <project-root>/firebase.json
{
  "react-native": {
    "crashlytics_javascript_exception_handler_chaining_enabled": false
  }
}
```

## Crashlytics non-fatal exceptions native handling

In case you need to log non-fatal (handled) exceptions on the native side (e.g from `try catch` block), you may use the following static methods:

### Android

```java
import io.invertase.firebase.crashlytics.ReactNativeFirebaseCrashlyticsNativeHelper;
//...

try {
  //...
} catch (Exception e) {
  ReactNativeFirebaseCrashlyticsNativeHelper.recordNativeException(e);
  return null;
}
```

### iOS

```objectivec
#import <RNFBCrashlytics/RNFBCrashlyticsNativeHelper.h>
//...

@try {
  //...
} @catch (NSException *exception) {
  NSMutableDictionary * info = [NSMutableDictionary dictionary];
  [info setValue:exception.name forKey:@"ExceptionName"];
  [info setValue:exception.reason forKey:@"ExceptionReason"];
  [info setValue:exception.callStackReturnAddresses forKey:@"ExceptionCallStackReturnAddresses"];
  [info setValue:exception.callStackSymbols forKey:@"ExceptionCallStackSymbols"];
  [info setValue:exception.userInfo forKey:@"ExceptionUserInfo"];

  NSError *error = [[NSError alloc] initWithDomain:yourdomain code:errorcode userInfo:info];
  [RNFBCrashlyticsNativeHelper recordNativeError:error];
}

```

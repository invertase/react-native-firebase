---
title: Quick Start
description: Getting started with the App package in React Native Firebase
---

# App Quick Start

## Installation

Install this module with Yarn:

```bash
yarn add @react-native-firebase/app
```

### Initializing Firebase

React Native Firebase provides two methods for initializing your with Firebase.

- Native initialization
- Client initialization

#### Native initialization

Native initialization is the preferred way of setting up React Native Firebase. This process involves adding the
`google-services.json` and `GoogleService-Info.plist` file generated via the Firebase console. The native method
is compatible with all other packages.

For further platform installation guides, view the <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor> documentation.

#### Client initialization

Similar to the [Firebase Web SDK](https://www.npmjs.com/package/firebase), React Native Firebase allows app
initialization via the client using `initializeApp`.

> Due to limitation with some Firebase SDKs, the Remote Config, Crashlytics & Performance Monitoring modules will not work with this method of initialization.

For further information, view the <Anchor version group href="/client-initialization">client initialization</Anchor>
documentation.

## Module Usage

Import the default firebase instance into your project:

```js
import firebase from '@react-native-firebase/app';
```

The instance is also accessible from other installed packages, for example:

```js
import auth, { firebase } from '@react-native-firebase/auth';
```

### Create and initialize an additional app instance

It is possible to create multiple app instances, allowing full control over which Firebase project is used
for certain packages. To create an additional app instance, call the `initialize` method:

## Additional Utilities

The package also provides access to a utility Firebase module:

```js
import { utils } from '@react-native-firebase/app';
```

### Detect whether the app is running within TestL Lab

Firebase [TestLab](https://firebase.google.com/docs/test-lab/?utm_source=invertase&utm_medium=react-native-firebase&utm_campaign=utils)
is a cloud-based app-testing infrastructure. With one operation, you can test your Android or iOS app across
a wide variety of devices and device configurations, and see the results—including logs, videos,
and screenshots—in the Firebase console.

It is useful to change the apps configuration if it is being run in Test Lab, for example disabling Analytics
data collection. Such functionality can be carried out by taking advantage of the `isRunningInTestLab` property:

```js
import { utils } from '@react-native-firebase/app';
import analytics from '@react-native-firebase/analytics';

async function bootstrap() {
  if (utils().isRunningInTestLab) {
    await analytics().setAnalyticsCollectionEnabled(false);
  }
}
```

TODO

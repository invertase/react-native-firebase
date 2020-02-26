---
title: Quick Start
description: Getting started with the Utils package in React Native Firebase
---

# Utils Quick Start

> This module automatically comes with the `@react-native-firebase/app` package, there are no additional steps required to install it.

## Module usage

Import the Utils package into your project:

```js
import { utils } from '@react-native-firebase/app';

// utils().X

import firebase from '@react-native-firebase/app';

// firebase.utils().X
```

## Utilities

### Detect whether your app is running within Firebase Test Lab

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

### Access device file paths

Some modules require access to your local device filesystem (such as Storage & ML Kit Vision). The utils module provides paths to common device directory locations.

```js
import firebase from '@react-native-firebase/app';
// Access the device pictures directory
const picturesDir = firebase.utils.FilePath.PICTURES_DIRECTORY;
```

## Check if Play Services are available on Android devices

It is useful to know if the Android device has play services available, and what to do in response to certain use cases:

```js
import firebase from '@react-native-firebase/app';

async function checkPlayServicesExample() {
  const utils = firebase.utils();

  const {
    status,
    isAvailable,
    hasResolution,
    isUserResolvableError,
  } = utils.playServicesAvailability;

  // all good and valid \o/
  if (isAvailable) return Promise.resolve();

  // if the user can resolve the issue i.e by updating play services
  // then call Google Play's own/default prompting functionality
  if (isUserResolvableError || hasResolution) {
    switch (status) {
      case 1:
        // SERVICE_MISSING - Google Play services is missing on this device.
        // show something to user
        // and then attempt to install if necessary
        return utils.makePlayServicesAvailable();
      case 2:
        // SERVICE_VERSION_UPDATE_REQUIRED - The installed version of Google Play services is out of date.
        // show something to user
        // and then attempt to update if necessary
        return utils.resolutionForPlayServices();
 
      default:
        // some default dialog / component?
        // use the link below to tailor response to status codes to suit your use case
        // https://developers.google.com/android/reference/com/google/android/gms/// common/ConnectionResult#SERVICE_VERSION_UPDATE_REQUIRED
        if (isUserResolvableError) return utils.promptForPlayServices();
        if (hasResolution) return utils.resolutionForPlayServices();
    }
  }

  // There's no way to resolve play services on this device
  // probably best to show a dialog / force crash the app
  return Promise.reject(
    new Error('Unable to find a valid play services version.')
  );
}
```
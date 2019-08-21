---
title: Quick Start
description: Getting started with the Utils package in React Native Firebase
---

# Utils Quick Start

The utils module comes installed with the `app` module.

## Module usage

Import the Utils package into your project:

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

### Access device file paths

Some modules require access to your local device filesystem (such as Storage & ML Kit Vision). The utils
module access to the device directory locations, working cross platform on Android & iOS.

```js
import { utils } from '@react-native-firebase/app';

// Access the device pictures directory
const picturesDir = utils.FilePath.PICTURES_DIRECTORY;
```

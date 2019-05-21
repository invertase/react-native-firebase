---
title: Quick Start
description: Get to grips with the basics of the Utils package in React Native Firebase
---

# Utils Quick Start

## Installation

Install this module with Yarn:

```bash
yarn add @react-native-firebase/utils@alpha
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

Import the Performance Monitoring package into your project:

```js
import utils from '@react-native-firebase/utils';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/utils';
```

### Detect whether the app is running within TestL Lab

Firebase [TestLab](https://firebase.google.com/docs/test-lab/?utm_source=invertase&utm_medium=react-native-firebase&utm_campaign=utils)
is a cloud-based app-testing infrastructure. With one operation, you can test your Android or iOS app across 
a wide variety of devices and device configurations, and see the results—including logs, videos, 
and screenshots—in the Firebase console. 

It is useful to change the apps configuration if it is being run in Test Lab, for example disabling Analytics 
data collection. Such functionality can be carried out by taking advantage of the `isRunningInTestLab` property:

```js
import utils from '@react-native-firebase/utils';
import analytics from '@react-native-firebase/analytics';

async function bootstrap() {
  if (utils().isRunningInTestLab) {
    await analytics().setAnalyticsCollectionEnabled(false);
  }  
}
```
 
 

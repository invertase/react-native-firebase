---
title: Quick Start
description: Getting started with Cloud Functions in React Native Firebase
---

# Cloud Functions Quick Start

## Installation

This module depends on the `@react-native-firebase/app` module. To get started and install `app`,
visit the projects [quick start](/quick-start) guide. 

Install this module with Yarn:

```bash
yarn add @react-native-firebase/functions
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

Once installed, import the Cloud Functions package into your project:

```js
import functions from '@react-native-firebase/functions';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/functions';
```

### Requesting a functions HTTPs endpoint

To access a named functions HTTPs endpoint, use the `httpsCallable` method:

```js
import functions from '@react-native-firebase/functions';

async function order() {
  try {
    const success = await functions().httpsCallable('orderPizza')({
      id: '12345678',
      size: 'large',
    });

    if (success) {
      console.log('Pizza is on the way!');
    } else {
      console.warn('Woops, looks like something went wrong!');
    }
  } catch (e) {
    console.error(e);
  }
}
```

Looking for a more in-depth explanations? Our [Cloud Functions](/guides?tags=functions) guides have you covered.

### Local emulator

Cloud Functions can be emulated to run locally, or using your own custom domain. To switch the
emulator location, use the `useFunctionsEmulator` method:

```js
import functions from '@react-native-firebase/functions';

if (__DEV__) {
  functions().useFunctionsEmulator('http://localhost:5000');
}
```

### Cloud Functions Region

Cloud functions can be deployed to multiple regions across the globe. To change the region,
initialize the functions instance with the region (note the default region is us-central1):

```js
import functions from '@react-native-firebase/functions';

functions('europe-west1').httpsCallable(...);
```

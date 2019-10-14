---
title: Quick Start
description: Getting started with Remote Config in React Native Firebase
---

# Remote Config Quick Start

## Installation

This module depends on the `@react-native-firebase/app` module. To get started and install `app`,
visit the project's <Anchor version={false} group={false} href="/quick-start">quick start</Anchor> guide.

Install this module with Yarn:

```bash
yarn add @react-native-firebase/remote-config
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

Import the Performance Monitoring package into your project:

```js
import remoteConfig from '@react-native-firebase/remote-config';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/remote-config';
```

### Fetching, activating and getting values

Before the values from the Firebase console can be used, they need to be fetched and activated. This can be done using
the `fetchAndActivate` method:

```js
import remoteConfig from '@react-native-firebase/remote-config';

async function getValues() {
  try {
    const activated = await remoteConfig().fetchAndActivate();

    if (activated) {
      const experimentalFeatureEnabled = await remoteConfig().getValue('experiment');
      console.log('Experimental source: ', experimentalFeatureEnabled.source);
      console.log('Experimental value: ', experimentalFeatureEnabled.value);
    }
  } catch (e) {
    console.error(e);
  }
}
```

### Setting default values

In some cases you may want to fetch values from the console in the background without the process visibly impacting
your application. To prevent any race conditions where values are being requested (i.e. via `getValue`) before they
have been fetched and activated, it is recommended you set default values using `setDefaults`:

```js
import remoteConfig from '@react-native-firebase/remote-config';

async function bootstrap() {
  await remoteConfig().setDefaults({
    experiment: false,
  });
}
```

### Developer mode

Whilst developing, setting the developer mode to `true` allows config to bypass internal checks such as caching
which are applied in a production application. This can be done with the `setConfigSettings` method:

```js
import remoteConfig from '@react-native-firebase/remote-config';

async function bootstrap() {
  await remoteConfig().setConfigSettings({
    isDeveloperModeEnabled: __DEV__,
  });
}
```

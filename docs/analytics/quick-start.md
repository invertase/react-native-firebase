---
title: Quick Start
description: Getting started with Analytics in React Native Firebase
---

# Analytics Quick Start

## Installation

This module depends on the `@react-native-firebase/app` module. To get started and install `app`,
visit the project's <Anchor version={false} group={false} href="/quick-start">quick start</Anchor> guide.

Install this module with Yarn:

```bash
yarn add @react-native-firebase/analytics

# Using iOS
cd ios/ && pod install
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

The Analytics package will automatically start tracking events such as when users clear app data, dismiss notifications and more.
To view the full list of automatic events, see [this page](https://support.google.com/firebase/answer/6317485) of the official Firebase documentation.

The package also provides a JavaScript API to allow for logging custom events and metrics throughout your application.

Import the Analytics package into your project:

```js
import analytics from '@react-native-firebase/analytics';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/analytics';
```

### Custom events

To log a custom event, use the `logEvent` method:

```js
import analytics from '@react-native-firebase/analytics';

async function onProductView() {
  await analytics().logEvent('product_view', {
    id: '123456789',
    color: 'red',
    via: 'ProductCatalog',
  });
}
```

### Attaching user data

User data can be attached to analytical events via the [`setUserId`](reference/module#setUserId), [`setUserProperties`](reference/module#setUserProperties) and [`setUserProperty`](reference/module#setUserProperty) methods. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.

```js
import analytics from '@react-native-firebase/analytics';

async function onSignIn(user) {
  await Promise.all([
    analytics().setUserId(user.uid),
    analytics().setUserProperty('account_balance', user.balance),
  ]);
}
```

> When you set user properties, be sure to never include personally identifiable information such as names, social security numbers, or email addresses, even in hashed form.

### Tracking screen names

Similar to Analytics on the web, it's important to understand the user's journey within your application, for example
tracking drop off points during a e-commerce transaction flow. The Analytics package provides a method called
`setCurrentScreen` to help track this.

```js
import React, { useEffect } from 'react';
import { View } from 'react-native';
import analytics from '@react-native-firebase/analytics';

function BasketScreen() {
  async function trackScreenView(screen) {
    // Set & override the MainActivity screen name
    await analytics().setCurrentScreen(screen, screen);
  }

  // Track a screen view once the component has mounted
  useEffect(() => {
    trackScreenView('BasketScreen');
  }, []);

  return <View />;
}
```

### Resetting analytics data

In some cases, resetting all analytics data is required on certain events such as signing out of the application.
To achieve this call the `resetAnalyticsData` method.

```js
import analytics from '@react-native-firebase/analytics';

async function onSignOut() {
  await analytics().resetAnalyticsData();
}
```

### Ignore analytics events when running in TestLab (Pre-launch report)

When submitting to the Google Play Store, analytics events are triggered while the app is being tested in TestLab in order to generate pre-launch reports. Typically you want to ignore those events, which you can achieve via the following utility functions:

```js
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/analytics';

if (firebase.app().utils().isRunningInTestLab) {
	firebase.analytics().setAnalyticsCollectionEnabled(false);
}
```


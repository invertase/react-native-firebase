---
title: Instance Id
description: Installation and getting started with Instance Id.
icon: //static.invertase.io/assets/social/firebase-logo.png
next: /in-app-messaging/usage
previous: /dynamic-links/usage
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the iid module
yarn add @react-native-firebase/iid

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/iid/usage/installation/ios) and [Android](/iid/usage/installation/android).

# What does it do

Instance ID provides a simple API to generate security tokens that authorize third parties to access your apps server side
managed resources.

An example of this is sending messages via Firebase Cloud Messaging.

# Usage

## Retrieving the instance ID

To retrieve the current instance ID, call the `get` method:

```js
import iid from '@react-native-firebase/iid';

async function getInstanceId() {
  const id = await iid().get();
  console.log('Current Instance ID: ', id);
}
```

## Retrieving a token

Returns the token that authorizes performing actions on behalf of this application instance.

For example, the token could be used to send messages via Firebase Cloud Messaging.

```js
import iid from '@react-native-firebase/iid';

const token = await firebase.iid().getToken();
```

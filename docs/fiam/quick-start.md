---
title: Firebase In-App Messaging Quick Start
description: Get to grips with the basics of Firebase In-App Messaging in React Native Firebase
---

# Firebase In-App Messaging Quick Start

## Installation

Install this module with Yarn:

```bash
yarn add @react-native-firebase/fiam@alpha
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

Once installed, any published campaigns from the [Firebase console](https://console.firebase.google.com/?utm_source=invertase&utm_medium=fiam&utm_campaign=quick_start) 
are automatically handled and displayed on your users device. The module provides a JavaScript API to allow greater
control of the displaying of these messages. 

Once installed, import the FIAM package into your project:

```js
import fiam from '@react-native-firebase/fiam';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/fiam';
```

### Suppressing messages

The Firebase console campaign manager provides a few events to handle when messages are displayed to users. In some 
situations you may want to handle this manually to only display messages at a chosen time, for example once a user
has completed an on-boarding process within your app. The `setMessagesDisplaySuppressed` method can be used to 
achieve this. 

> The suppressed state is not persisted between restarts, so ensure it is called as early as possible.

```js
import fiam from '@react-native-firebase/fiam';

async function bootstrap() {
  await fiam().setMessagesDisplaySuppressed(true);
}

async function onSetup(user) {
  await setupUser(user);
  // Allow user to receive messages now setup is complete 
  fiam().setMessagesDisplaySuppressed(false);
}
```

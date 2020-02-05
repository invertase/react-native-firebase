---
title: Quick Start
description: Getting started with Messaging in React Native Firebase
---

# Messaging Quick Start

## Installation

This module depends on the `@react-native-firebase/app` module. To get started and install `app`,
visit the project's <Anchor version={false} group={false} href="/quick-start">quick start</Anchor> guide.

Install this module with Yarn:

```bash
yarn add @react-native-firebase/messaging

# Using iOS
cd ios/ && pod install
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

Import the Messaging package into your project:

```js
import messaging from '@react-native-firebase/messaging';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/messaging';
```

### Registering devices with FCM

Apps using iOS must first register the app with FCM before being able to receive messages. The module exposes a
`registerForRemoteNotifications` API allowing you to do this:

```js
import messaging from '@react-native-firebase/messaging';

async function registerAppWithFCM() {
  await messaging().registerForRemoteNotifications();
}
```

Calling this method allows FCM to send messages to your device, however if you wish to display a visible notification further steps
are required.

On Android, no registration is required and this method successfully resolves instantly.

### Requesting permissions

On iOS, once the application has registered itself with FCM we must request permission from the user before messages can be
received/sent by the device & also display notifications (see below). The module exposes a `requestPermission` which handles
this flow automatically.

It is recommended this method is called when it makes sense for your users, rather than on app startup. For example, request
permission when the user expects to receive messages (e.g. opening a chat flow for the first time). This will improve the chances
of the user accepting permission rather than declining.

If permissions have already been granted, the method resolves without a dialog.

```js
import messaging from '@react-native-firebase/messaging';

async function requestPermission() {
  const granted = messaging().requestPermission();

  if (granted) {
    console.log('User granted messaging permissions!');
  } else {
    console.log('User declined messaging permissions :(');
  }
}
```

On Android, no permissions are required and this method resolves with the value of `true`.

### Receiving messages

FCM messages can be sent to devices via a number of methods (see below). A message is simply a payload of data which can be used
however you see fit inside of your application. Common use-cases for handling messages could be:

- Displaying a notification.
- Updating a chat conversation inside your app.
- Triggering an in-app notification count dot (next to a bell icon for example).
- Silently updating local app storage.

Messages can be handled when the app is in the foreground or background:

- "Foreground": When the app is currently in view and active on the users device.
- "Background": When the app is fully quit, active but not visible or the device is locked.

The module exposes two methods for handling messages in both of these states, `onMessage` &
`setBackgroundMessageHandler` (Android only).

#### Foreground messages

To listen to messages in the foreground, call the `onMessage` method inside of your application code. For example, we could
update local storage silently using the `AsyncStorage` API:

```jsx
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';

function App() {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('FCM Message Data:', remoteMessage.data);

      // Update a users messages list using AsyncStorage
      const currentMessages = await AsyncStorage.getItem('messages');
      const messageArray = JSON.parse(currentMessages);
      messageArray.push(remoteMessage.data);
      await AsyncStorage.setItem('messages', JSON.stringify(messageArray));
    });
  }, []);
}
```

Using the message data, you can perform any task you'd expect inside of your react code (updating state, network requests etc),
only whilst the app is in the foreground.

### Background messages

When the app is not in the foreground, it is possible to handle logic via Headless Tasks in the background. Executing
code in the background only works for Android at the moment, however iOS support is being investigated (due to iOS restrictions).

To setup a background handler, call the `setBackgroundMessageHandler` outside of your application logic as early as possible:

```js
// index.js
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});
```

This handler must return a promise when execution is complete. Inside of the handler, you can only run JavaScript code in a
headless context - meaning no UI updates or anything related to "views". You can however handle tasks such as network requests
or updating local storage however you see fit.

### Local notifications

A notification is a visible dialog which is presented to users. Users often mistake the messaging module for being
responsible for displaying a notification, when in fact a message is simply a data payload sent to a device via FCM.

Notifications can be displayed without any integration with FCM (known as local notifications) and there are a few external
packages available for React Native which allow you to display local notifications:

- [Notifee](https://notifee.app/) - See [integrating with FCM](https://notifee.app/react-native/docs/integrations/fcm).
- [wix/react-native-notifications](https://github.com/wix/react-native-notifications)
- [zo0r/react-native-push-notification](https://github.com/zo0r/react-native-push-notification)

These packages allow you to programmatically display local notifications when a messaging payload has been received by using
the FCM payload data and the package APIs separately.

### Firebase Console notifications

The Firebase console provides the ability to send "Notifications" via the "Cloud Messaging" dashboard. On the console, you
can create a basic notification and target the devices you wish to send it too. React Native Firebase does not have control
over these notifications, as the Firebase Messaging SDK automatically detects & displays notifications sent from the console.

As these notifications are handled by the internal Firebase SDKs, it is not possible to hook into events (e.g. notification
pressed), nor handle the notifications when your app is in the background. If this is a requirement, you must display and
handle local notifications.

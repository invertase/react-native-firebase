---
title: In App Messaging
description: Installation and getting started with In App Messaging.
icon: //static.invertase.io/assets/firebase/in-app-messaging.svg
next: /ml-natural-language/usage
previous: /iid/usage
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the in-app-messaging module
yarn add @react-native-firebase/in-app-messaging

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/in-app-messaging/usage/installation/ios) and [Android](/in-app-messaging/usage/installation/android).

# What does it do

Firebase In-App Messaging helps you to engage your apps active users by sending them targeted, contextual messages that encourage
them to use key app features. For example, you could send an in-app message to get users to subscribe, watch a video,
complete a level, or buy an item. You can customize messages as cards, banners, modals, or images, and set up triggers
so that they appear exactly when they'd benefit your users most.

<Youtube id="5MRKpvKV2pg" />

React Native Firebase provides support for both native Android & iOS integration with a simple JavaScript API.

# Usage

Most of the set up occurs on [Firebase Console](https://console.firebase.google.com/u/0/project/_/inappmessaging) in the
`In-App Messaging` tab. You can create campaigns and customize elements such as Image, Banner, Modal & Cards to appear on
predefined events (e.g. purchase). This involves no code for the developer to implement. Any published campaigns from the
Firebase Console are automatically handled and displayed on your user's device.

This module provides a JavaScript API to allow greater control of the displaying of these messages.

## Displaying Messages

The `setMessagesDisplaySuppressed` method allows you to control when messages can/cannot be displayed. Below illustrates
a use case for controlling the flow of messages:

> The suppressed state is not persisted between restarts, so ensure it is called as early as possible.

```jsx
import inAppMessaging from '@react-native-firebase/in-app-messaging';

async function bootstrap() {
  await inAppMessaging().setMessagesDisplaySuppressed(true);
}

async function onSetup(user) {
  await setupUser(user);
  // Allow user to receive messages now setup is complete
  inAppMessaging().setMessagesDisplaySuppressed(false);
}
```

# firebase.json

## Disable collection of data

In App Messaging can be further configured to enable or disable automatic data collection for Firebase In-App Messaging.

This is useful for opt-in-first data flows, for example when dealing with GDPR compliance. This can be overridden in JavaScript.
This is possible by setting the below noted property on the `firebase.json` file at the root of your project directory.

```json
// <project-root>/firebase.json
{
  "react-native": {
    "in_app_messaging_auto_collection_enabled": false
  }
}
```

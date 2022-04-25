---
title: Cloud Messaging
description: Installation and getting started with Cloud Messaging.
icon: //static.invertase.io/assets/firebase/cloud-messaging.svg
next: /messaging/usage/ios-setup
previous: /functions/writing-deploying-functions
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the messaging module
yarn add @react-native-firebase/messaging

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

> iOS requires further configuration before you can start receiving and sending
> messages through Firebase. Read the documentation on how to [setup iOS with Firebase Cloud Messaging](/messaging/usage/ios-setup).

> Use of the `sendMessage()` API and it's associated listeners requires a custom `XMPP` server. Read the documentation on how to [Messaging with XMPP](/messaging/usage/messaging-with-xmpp).

If you're using an older version of React Native without auto-linking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/messaging/usage/installation/ios) and [Android](/messaging/usage/installation/android).

# What does it do

React Native Firebase provides native integration of Firebase Cloud Messaging (FCM) for both Android & iOS. FCM is a cost
free service, allowing for server-device and device-device communication. The React Native Firebase Messaging module provides
a simple JavaScript API to interact with FCM.

<Youtube id="sioEY4tWmLI" />

The module also provides basic support for displaying local notifications, to learn more view the [Notifications](/messaging/notifications) documentation.

# Usage

## iOS - Requesting permissions

iOS prevents messages containing notification (or 'alert') payloads from being displayed unless you have received explicit permission from the user.

> To learn more about local notifications, view the [Notifications](/messaging/notifications) documentation.

This module provides a `requestPermission` method which triggers a native permission dialog requesting the user's permission:

```js
import messaging from '@react-native-firebase/messaging';

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}
```

The permissions API for iOS provides much more fine-grain control over permissions and how they're handled within your
application. To learn more, view the advanced [iOS Permissions](/messaging/ios-permissions) documentation.

On Android, you do not need to request user permission. This method can still be called on Android devices; however, and will always resolve successfully.

## Receiving messages

FCM messages can be sent to _real_ Android/iOS devices and Android emulators (iOS simulators however do _not_ handle cloud messages) via a number of methods (see below).
A message is simply a payload of data which can be used however you see fit within your application.

Common use-cases for handling messages could be:

- Displaying a notification (see [Notifications](/messaging/notifications)).
- Syncing message data silently on the device (e.g. via `AsyncStorage`).
- Updating the application's UI.

> To learn about how to send messages to devices from your own server setup, view the
> [Server Integration](/messaging/server-integration) documentation.

Depending on the devices state, incoming messages are handled differently by the device and module. To understand these
scenarios, it is first important to establish the various states a device can be in:

| State          | Description                                                                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Foreground** | When the application is open and in view.                                                                                                                                                                 |
| **Background** | When the application is open, however in the background (minimised). This typically occurs when the user has pressed the "home" button on the device or has switched to another app via the app switcher. |
| **Quit**       | When the device is locked or application is not active or running. The user can quit an app by "swiping it away" via the app switcher UI on the device.                                                   |

The user must have opened the app before messages can be received. If the user force quits the app from the device settings, it must be re-opened again before receiving messages.

Depending on the contents of the message, it's important to understand both how the device will handle the message (e.g. display a notification, or even ignore it) and also how the library sends events to your own listeners.

### Message handlers

The device state and message contents determines which handler will be called:

|                         | Foreground  | Background                                      | Quit                                            |
| ----------------------- | ----------- | ----------------------------------------------- | ----------------------------------------------- |
| **Notification**        | `onMessage` | `setBackgroundMessageHandler`                   | `setBackgroundMessageHandler`                   |
| **Notification + Data** | `onMessage` | `setBackgroundMessageHandler`                   | `setBackgroundMessageHandler`                   |
| **Data**                | `onMessage` | `setBackgroundMessageHandler` (**_see below_**) | `setBackgroundMessageHandler` (**_see below_**) |

- In cases where the message is data-only and the device is in the background or quit, both Android & iOS treat the message
  as low priority and will ignore it (i.e. no event will be sent). You can however increase the priority by setting the `priority` to `high` (Android) and
  `content-available` to `true` (iOS) properties on the payload.

- On iOS in cases where the message is data-only and the device is in the background or quit, the message will be delayed
  until the background message handler is registered via setBackgroundMessageHandler, signaling the application's javascript
  is loaded and ready to run.

To learn more about how to send these options in your message payload, view the Firebase documentation for your [FCM API implementation](https://firebase.google.com/docs/cloud-messaging/concept-options).

### Notifications

The device state and message contents can also determine whether a [Notification](/messaging/notifications) will be displayed:

|                         | Foreground             | Background             | Quit                   |
| ----------------------- | ---------------------- | ---------------------- | ---------------------- |
| **Notification**        | Notification: &#10060; | Notification: &#9989;  | Notification: &#9989;  |
| **Notification + Data** | Notification: &#10060; | Notification: &#9989;  | Notification: &#9989;  |
| **Data**                | Notification: &#10060; | Notification: &#10060; | Notification: &#10060; |

### Foreground state messages

To listen to messages in the foreground, call the `onMessage` method inside of your application code. Code
executed via this handler has access to React context and is able to interact with your application (e.g. updating the state or UI).

For example, the React Native [`Alert`](https://reactnative.dev/docs/alert) API could be used to display a new Alert
each time a message is delivered'

```js
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';

function App() {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);
}
```

The `remoteMessage` property contains all of the information about the message sent to the device from FCM, including
any custom data (via the `data` property) and notification data. To learn more, view the [`RemoteMessage`](/reference/messaging/remotemessage)
API reference.

If the `RemoteMessage` payload contains a `notification` property when sent to the `onMessage` handler, the device
will not show any notification to the user. Instead, you could trigger a [local notification](/messaging/notifications#notifee---advanced-notifications)
or update the in-app UI to signal a new notification.

### Background & Quit state messages

When the application is in a background or quit state, the `onMessage` handler will not be called when receiving messages.
Instead, you need to setup a background callback handler via the `setBackgroundMessageHandler` method.

To setup a background handler, call the `setBackgroundMessageHandler` outside of your application logic as early as possible:

```jsx
// index.js
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent('app', () => App);
```

The handler must return a promise once your logic has completed to free up device resources. It must not attempt to update
any UI (e.g. via state) - you can however perform network requests, update local storage etc.

The `remoteMessage` property contains all of the information about the message sent to the device from FCM, including
any custom data via the `data` property. To learn more, view the [`RemoteMessage`](/reference/messaging/remotemessage)
API reference.

If the `RemoteMessage` payload contains a `notification` property when sent to the `setBackgroundMessageHandler` handler, the device
will have displayed a [notification](/messaging/notifications) to the user.

#### Data-only messages

When an incoming message is "data-only" (contains no `notification` option), both Android & iOS regard it as low priority
and will prevent the application from waking (ignoring the message). To allow data-only messages to trigger the background
handler, you must set the "priority" to "high" on Android, and enable the `content-available` flag on iOS. For example,
if using the Node.js [`firebase-admin`](https://www.npmjs.com/package/firebase-admin) package to send a message:

```js
admin.messaging().sendToDevice(
  [], // device fcm tokens...
  {
    data: {
      owner: JSON.stringify(owner),
      user: JSON.stringify(user),
      picture: JSON.stringify(picture),
    },
  },
  {
    // Required for background/quit data-only messages on iOS
    contentAvailable: true,
    // Required for background/quit data-only messages on Android
    priority: 'high',
  },
);
```

For iOS specific "data-only" messages, the message must include the appropriate APNs headers as well as the `content-available` flag in order to trigger the background handler. For example, if using the Node.js [`firebase-admin`](https://www.npmjs.com/package/firebase-admin) package to send a "data-only" message to an iOS device:

```js
admin.messaging().send({
  data: {
    //some data
  },
  apns: {
    payload: {
      aps: {
        contentAvailable: true,
      },
    },
    headers: {
      'apns-push-type': 'background',
      'apns-priority': '5',
      'apns-topic': '', // your app bundle identifier
    },
  },
  //must include token, topic, or condition
  //token: //device token
  //topic: //notification topic
  //condition: //notification condition
});
```

View the [Sending Notification Requests to APNs](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns/) documentation to learn more about APNs headers.

These options can be applied to all FCM messages. View the [Server Integration](/messaging/server-integration) documentation
to learn more about other available SDKs.

#### Background Application State

Although the library supports handling messages in background/quit states, the underlying implementation on how this works is different on Android & iOS.

On Android, a [Headless JS](https://reactnative.dev/docs/headless-js-android) task (an Android only feature) is created that runs separately to your main React component; allowing your background handler code to run without mounting your root component.

On iOS however, when a message is received the device silently starts your application in a background state. At this point, your background handler (via `setBackgroundMessageHandler`) is triggered, but your root React component also gets mounted. This can be problematic for some users since any side-effects will be called inside of your app (e.g. `useEffects`, analytics events/triggers etc). To get around this problem,
you can configure your `AppDelegate.m` file (see instructions below) to inject a `isHeadless` prop into your root component. Use this property to conditionally render `null` ("nothing") if your app is launched in the background:

```jsx
// index.js
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

function HeadlessCheck({ isHeadless }) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

function App() {
  // Your application
}

AppRegistry.registerComponent('app', () => HeadlessCheck);
```

To inject a `isHeadless` prop into your app, please update your `AppDelegate.m` file as instructed below:

```objectivec
// add this import statement at the top of your `AppDelegate.m` file
#import "RNFBMessagingModule.h"

// in "(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions" method
// Use `addCustomPropsToUserProps` to pass in props for initialization of your app
// Or pass in `nil` if you have none as per below example
// For `withLaunchOptions` please pass in `launchOptions` object
NSDictionary *appProperties = [RNFBMessagingModule addCustomPropsToUserProps:nil withLaunchOptions:launchOptions];

// Find the `RCTRootView` instance and update the `initialProperties` with your `appProperties` instance
RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                             moduleName:@"nameOfYourApp"
                                             initialProperties:appProperties];
```

- For projects that use react-native-navigation (or if you just don't want to mess with your launchProperties) you can use the `getIsHeadless` method (iOS only) from messaging like so:

```jsx
messaging()
  .getIsHeadless()
  .then(isHeadless => {
    // do sth with isHeadless
  });
```

On Android, the `isHeadless` prop will not exist.

### Topics

Topics are a mechanism which allow a device to subscribe and unsubscribe from named PubSub channels, all managed via FCM.
Rather than sending a message to a specific device by FCM token, you can instead send a message to a topic and any
devices subscribed to that topic will receive the message.

Topics allow you to simplify FCM [server integration](/messaging/server-integration) as you do not need to keep a store of
device tokens. There are however some things to keep in mind about topics:

- Messages sent to topics should not contain sensitive or private information. Do not create a topic for a specific user
  to subscribe to.
- Topic messaging supports unlimited subscriptions for each topic.
- One app instance can be subscribed to no more than 2000 topics.
- The frequency of new subscriptions is rate-limited per project. If you send too many subscription requests in a short
  period of time, FCM servers will respond with a 429 RESOURCE_EXHAUSTED ("quota exceeded") response. Retry with exponential backoff.
- A server integration can send a single message to multiple topics at once. This however is limited to 5 topics.

To learn more about how to send messages to devices subscribed to topics, view the [Send messages to topics](/messaging/server-integration#send-messages-to-topics)
documentation.

#### Subscribing to topics

To subscribe a device, call the `subscribeToTopic` method with the topic name (must not include "/"):

```js
messaging()
  .subscribeToTopic('weather')
  .then(() => console.log('Subscribed to topic!'));
```

#### Unsubscribing to topics

To unsubscribe from a topic, call the `unsubscribeFromTopic` method with the topic name:

```js
messaging()
  .unsubscribeFromTopic('weather')
  .then(() => console.log('Unsubscribed fom the topic!'));
```

# firebase.json

Messaging can be further configured to provide more control over how FCM is handled internally within your application.

## Auto Registration (iOS)

React Native Firebase Messaging automatically registers the device with APNs to receive remote messages. If you need
to manually control registration you can disable this via the `firebase.json` file:

```json
// <projectRoot>/firebase.json
{
  "react-native": {
    "messaging_ios_auto_register_for_remote_messages": false
  }
}
```

Once auto-registration is disabled you must manually call `registerDeviceForRemoteMessages` in your JavaScript code as
early as possible in your application startup;

```js
import messaging from '@react-native-firebase/messaging';

async function registerAppWithFCM() {
  await messaging().registerDeviceForRemoteMessages();
}
```

## Auto initialization

Firebase generates an Instance ID, which FCM uses to generate a registration token and which Analytics uses for data collection.
When an Instance ID is generated, the library will upload the identifier and configuration data to Firebase. In most cases,
you do not need to change this behavior.

If you prefer to prevent Instance ID auto-generation, disable auto initialization for FCM and Analytics:

```json
// <projectRoot>/firebase.json
{
  "react-native": {
    "analytics_auto_collection_enabled": false,
    "messaging_auto_init_enabled": false
  }
}
```

To re-enable initialization (e.g. once requested permission) call the `messaging().setAutoInitEnabled(true)` method.

## Background handler timeout (Android)

On Android, a background event sent to `setBackgroundMessageHandler` has 60 seconds to resolve before it is automatically
canceled to free up device resources. If you wish to override this value, set the number of milliseconds in your config:

```json
// <projectRoot>/firebase.json
{
  "react-native": {
    "messaging_android_headless_task_timeout": 30000
  }
}
```

## Notification Channel ID

On Android, any message which displays a [Notification](/messaging/notifications) use a default Notification Channel
(created by FCM called "Miscellaneous"). This channel contains basic notification settings which may not be appropriate for
your application. You can change what Channel is used by updating the `messaging_android_notification_channel_id` property:

```json
// <projectRoot>/firebase.json
{
  "react-native": {
    "messaging_android_notification_channel_id": "high-priority"
  }
}
```

Creating and managing Channels is outside of the scope of the React Native Firebase library, however external libraries
such as [Notifee](https://notifee.app/react-native/docs/android/channels) can provide such functionality.

## Notification Color

On Android, any messages which display a [Notification](/messaging/notifications) do not use a color to tint the content
(such as the small icon, title etc). To provide a custom tint color, update the `messaging_android_notification_color` property
with a Android color resource name.

The library provides a set of [predefined colors](https://github.com/invertase/react-native-firebase/blob/main/packages/messaging/android/src/main/res/values/colors.xml) corresponding to the [HTML colors](https://www.w3schools.com/colors/colors_names.asp) for convenience, for example:

```json
// <projectRoot>/firebase.json
{
  "react-native": {
    "messaging_android_notification_color": "@color/hotpink"
  }
}
```

Note that only predefined colors can be used in `firebase.json`. If you want to use a custom color defined in your application resources, then you should set it in the `AndroidManifest.xml` instead.

```xml
<!-- <projectRoot>/android/app/src/main/res/values/colors.xml -->
<resources>
  <color name="my-custom-color">#123456</color>
</resources>

<!-- <projectRoot>/android/app/src/main/AndroidManifest.xml -->

<!--  add "tools" to manifest tag  -->
<manifest xmlns:tools="http://schemas.android.com/tools">
  <application>
      <!-- ... -->

      <meta-data
            android:name="com.google.firebase.messaging.default_notification_color"
            android:resource="@color/my-custom-color"
            tools:replace="android:resource" />
  </application>
</manifest>
```

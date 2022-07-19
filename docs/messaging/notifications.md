---
title: Notifications
description: Displaying & handling notifications from FCM.
next: /messaging/ios-notification-images
previous: /messaging/ios-permissions
---

Notifications are an important tool used on the majority of Android & iOS applications, used to improve user
experience, used to engage users with your application and much more. The Cloud Messaging module provides basic support for
displaying and handling notifications.

> Looking for an advanced local notifications library which integrates with FCM? [Check out Notifee!](https://notifee.app)

# Displaying a Notification

The Firebase Cloud Messaging SDKs for Android and iOS allow for notifications to be displayed on devices when the application
is either quit or in the background. The Firebase Console, Firebase Admin SDKs and REST API all allow a `notification`
property to be attached to a message.

If an incoming message with this property exists, and the app is not currently visible (quit or in the background),
a notification is displayed on the device. However, if the application is in the foreground, an event will be delivered
containing the notification data and no visible notification will be displayed. See the [Usage](/messaging/usage) documentation
to learn more about handling events.

## Via Firebase Console

The [Firebase Console provides a simple UI](https://console.firebase.google.com/project/_/notification) to allow devices
to display a notification. Using the console, you can:

- Send a basic notification with custom text and images.
- Target applications which have been added to your project.
- Schedule notifications to display at a later date.
- Send recurring notifications.
- Assign conversion events for your analytical tracking.
- A/B test user interaction (called "experiments").
- Test notifications on your development devices.

The Firebase Console automatically sends a message to your devices containing a `notification` property which is handled
by the React Native Firebase Cloud Messaging module. See [Handling Interaction](#handling-interaction) to learn about how
to support user interaction.

## Via Admin SDKs

The various Firebase Admin SDKs allow you to send messages to your users. If these messages also contain notification
options, the React Native Firebase Cloud Messaging module will automatically display these notifications.

For example, when using the [`firebase-admin`](https://www.npmjs.com/package/firebase-admin) package in a Node.js environment
to send [messages from a server](/messaging/server-integration), a `notification` property can be added to the message payload:

```js
await admin.messaging().sendMulticast({
  tokens: [
    /* ... */
  ], // ['token_1', 'token_2', ...]
  notification: {
    title: 'Basic Notification',
    body: 'This is a basic notification sent from the server!',
    imageUrl: 'https://my-cdn.com/app-logo.png',
  },
});
```

The Cloud Messaging module will intercept these messages and if the `notification` property is available, it will display
a notification on the device (if the app is not in the foreground). Messages sent with both a `notification` and `data` property
will display a notification and also trigger the `onMessage` handlers (see [Usage](/messaging/usage)).

The different Admin SDKs available have similar implementation details on how to add a custom `notification` property to
the FCM payload, however the Cloud Messaging module will handle all requests. To learn more, view the
[Firebase Admin SDK documentation](https://firebase.google.com/docs/reference/admin) for your chosen admin SDK. For those using the
HTTP implementation, view the [REST Cloud Messaging](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)
reference.

## Via REST

If you are unable to use a [Firebase Admin SDK](https://firebase.google.com/docs/reference/admin), Firebase also provides
support for sending messages to devices via a POST request:

```HTTP
POST https://fcm.googleapis.com/v1/projects/myproject-b5ae1/messages:send HTTP/1.1

Content-Type: application/json
Authorization: Bearer ya29.ElqKBGN2Ri_Uz...HnS_uNreA

{
   "message":{
      "token":"bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1...",
      "data":{},
      "notification":{
        "body":"This is an FCM notification message!",
        "title":"FCM Message"
      }
   }
}
```

To learn more about the REST API, view the [Firebase documentation](https://firebase.google.com/docs/cloud-messaging/send-message),
and select the "REST" tab under the code examples.

# Handling Interaction

When a user interacts with your notification by pressing on it, the default behavior is to open the application (since
notifications via FCM only display when the application is in the background, the application will always open).

In many cases, it is useful to detect whether the application was opened by pressing on a notification (so you
could open a specific screen for example). The API provides two APIs for handling interaction:

- `getInitialNotification`: When the application is opened from a quit state.
- `onNotificationOpenedApp`: When the application is running, but in the background.

To handle both scenarios, the code can be executed during setup. For example, using [React Navigation](https://reactnavigation.org/)
we can set an initial route when the app is opened from a quit state, and push to a new screen when the app is in a background state:

```jsx
import React, { useState, useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function App() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Home');

  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      navigation.navigate(remoteMessage.data.type);
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
          setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

The call to `getInitialNotification` should happen within a React lifecycle method after mounting (e.g. `componentDidMount` or `useEffect`).
If it's called too soon (e.g. within a class constructor or global scope), the notification data may not be available.

**Quick Tip:** On `Android` you can test receiving remote notifications on the emulator but on `iOS` you will need to use a real device as the iOS simulator does not support receiving remote notifications.

# Getting a Device Token

To send messages to a device, you would need the FCM token for it, which you can get using the `messaging().getToken()` method. An example is available on '[Notifee pages](https://notifee.app/react-native/docs/integrations/fcm)'.

```jsx
await messaging().registerDeviceForRemoteMessages();
const token = await messaging().getToken();
// save the token to the db
```

# Advanced Local Notifications

FCM provides support for displaying basic notifications to users with minimal integration required. If however you require
more advanced notifications we recommend using our separate local notifications package '[Notifee](https://notifee.app)'.

> Notifee is free to use and fully open source.

## Notifee - Android Features

- [Advanced channel and group management](https://notifee.app/react-native/docs/android/channels).
- Custom appearance with [HTML text styling](https://notifee.app/react-native/docs/android/appearance#text-styling), [custom icons](https://notifee.app/react-native/docs/android/appearance#icons), [badge support](https://notifee.app/react-native/docs/android/appearance#badges), [colors](https://notifee.app/react-native/docs/android/appearance#color) and more.
- Behavior management such as [custom sounds](https://notifee.app/react-native/docs/android/behaviour#sound), [vibration patterns](https://notifee.app/react-native/docs/android/behaviour#vibration), device [notification light management](https://notifee.app/react-native/docs/android/behaviour#lights) and more.
- Displaying on-going [Foreground Service Notifications](https://notifee.app/react-native/docs/android/foreground-service) for dealing with long-running background tasks.
- Advanced [interaction handling](https://notifee.app/react-native/docs/android/interaction) with action buttons, quick reply features and more.
- Support for built in styling; [Big Picture Style](https://notifee.app/react-native/docs/android/styles#big-picture), [Big Text Style](https://notifee.app/react-native/docs/android/styles#big-text), [Inbox Style](https://notifee.app/react-native/docs/android/styles#inbox) & [Messaging Style](https://notifee.app/react-native/docs/android/styles#messaging) notifications.
- Adding [Progress Indicators](https://notifee.app/react-native/docs/android/progress-indicators) & [Timers](https://notifee.app/react-native/docs/android/timers) to your notification.

## Notifee - iOS Features

- Advanced [Permission](https://notifee.app/react-native/docs/ios/permissions) management.
- Behavior management such as [custom sounds](https://notifee.app/react-native/docs/ios/behaviour#sound) and [critical notifications](https://notifee.app/react-native/docs/ios/behaviour#critical-notifications).
- Creating [actions & categories](https://notifee.app/react-native/docs/ios/categories).

To learn more about integrating FCM with Notifee, view the [integration](https://notifee.app/react-native/docs/integrations/fcm) documentation.

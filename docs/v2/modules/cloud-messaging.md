# Cloud Messaging

Firebase Cloud Messaging ([FCM](https://firebase.google.com/docs/cloud-messaging/)) allows you to send push messages at no
cost to both Android & iOS platforms. Assuming the installation instructions have been followed, FCM is ready to go.

As the Firebase Web SDK has limited messaging functionality, the following methods within `react-native-firebase` have been
created to handle FCM in the React Native environment.

Badge notification is well known on the iOS platform, but also supported by different Android devices / launchers.
This library uses the [ShortcutBadger](https://github.com/leolin310148/ShortcutBadger) library to set the badge number
also on Android. A list of supported launcher can be found there.

!> [iOS] Please note: In order for iOS devices to receive Cloud Messages, ensure you [request permissions](http://invertase.io/react-native-firebase/#/modules/cloud-messaging?id=ios-requestpermissions).

## API

### subscribeToTopic(topic: string)

Subscribes the device to a topic.

```javascript
firebase.messaging().subscribeToTopic('foobar');
```

### unsubscribeFromTopic(topic: string)

Unsubscribes the device from a topic.

```javascript
firebase.messaging().unsubscribeFromTopic('foobar');
```

### getInitialNotification(): `Promise<Object>`

When the application has been opened from a notification `getInitialNotification` is called and the notification payload
is returned. Use `onMessage` for notifications when the app is running.

```javascript
firebase.messaging().getInitialNotification()
  .then((notification) => {
    console.log('Notification which opened the app: ', notification);
  });
```

### getToken(): `Promise<string>`

Returns the devices FCM token. This token can be used in the Firebase console to send messages to directly.

```javascript
firebase.messaging().getToken()
  .then((token) => {
    console.log('Device FCM Token: ', token);
  });
```

### onTokenRefresh(listener: `Function<string>`)

On the event a devices FCM token is refreshed by Google, the new token is returned in a callback listener.

```javascript
firebase.messaging().onTokenRefresh((token) => {
  console.log('Refreshed FCM token: ', token);
});
```

### onMessage(listener: `Function<Object>`)

On a new message, the payload object is passed to the listener callback. This method is only triggered when the app is
running. Use `getInitialNotification` for notifications which cause the app to open.

```javascript
firebase.messaging().onMessage((message) => {
  // TODO
});
```

### createLocalNotification(notification: Object)

Create a local notification from the device itself.

// TODO

### scheduleLocalNotification(notification: Object)

Schedule a local notification to be shown on the device.

### getScheduledLocalNotifications(): `Promise<Array>`

Returns an array of all currently scheduled notifications.

```javascript
firebase.messaging().getScheduledLocalNotifications()
  .then((notifications) => {
    console.log('Current scheduled notifications: ', notifications);
  });
```

### cancelLocalNotification(id: string)

Cancels a location notification by ID, or all notifications by `*`.

```javascript
// Cancel all local notifications
firebase.messaging().cancelLocalNotification('*');
// Cancel a single local notification
firebase.messaging().cancelLocalNotification('123');
```

### removeDeliveredNotification(id: string)

Removes all delivered notifications from device by ID, or all notifications by `*`.

```javascript
// Remove all notifications
firebase.messaging().removeDeliveredNotification('*');
// Removes a single local notification
firebase.messaging().removeDeliveredNotification('123');
```

### [iOS] requestPermissions()

Requests app notification permissions in an Alert dialog.

```javascript
firebase.messaging().requestPermissions();
```

### setBadgeNumber(value: number)

Sets the badge number on the iOS app icon.

```javascript
firebase.messaging().setBadgeNumber(2);
```

### getBadgeNumber(): `Promise<number>`

Returns the current badge number on the app icon.

```javascript
firebase.messaging().getBadgeNumber()
  .then((badgeNumber) => {
    console.log('Current badge number: ', badgeNumber);
  });
```

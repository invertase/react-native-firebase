---
title: iOS Permissions
description: Request permissions from your users to allow notifications to be displayed.
next: /messaging/notifications
previous: /messaging/usage/ios-setup
---

## Understanding permissions

Before diving into requesting notification permissions from your users, it is important to understand how iOS handles permissions.

Notifications cannot be shown to users if the user has not "granted" your application permission. The overall notification permission of a single application can be either be "not determined", "granted" or "declined". Upon installing a new application, the default status is "not determined".

In order to receive a "granted" status, you must request permission from your user (see below). The user can either accept or decline your request to grant permissions. If granted, notifications will be displayed based on the permission settings which were requested.

If the user declines the request, you cannot re-request permission, trying to request permission again will immediately return a "denied" status without any user interaction - instead the user must manually enable notification permissions from the iOS Settings UI.

## Requesting permissions

As explained in the [Usage](/messaging/usage#ios---requesting-permissions) documentation, permission
must be requested from your users in order to display remote notifications from FCM, via the
`requestPermission` API:

```js
import messaging from '@react-native-firebase/messaging';

async function requestUserPermission() {
  const authorizationStatus = await messaging().requestPermission();

  if (authorizationStatus) {
    console.log('Permission status:', authorizationStatus);
  }
}
```

Once a user has selected a permission status, iOS prevents the permission dialog from being displayed again. This allows the users of your application full control of how notifications are handled:

- If the user declines permission, they must manually allow notifications via the Settings UI for your application.
- If the user has accepted permission, notifications will be shown using the settings requested (e.g. with or without sound).

### Permission settings

Although overall notification permission can be granted, the permissions can be further broken down into settings.

Settings are used by the device to control notifications behavior, for example alerting the user with sound. When requesting permission, you can provide a custom object of settings if you wish to override the defaults. This is demonstrated in the following example:

```js
await messaging().requestPermission({
  sound: false,
  announcement: true,
  // ... other permission settings
});
```

The full list of permission settings can be seen in the table below along with their default values:

| Permission                        | Default | Description                                                                                                                   |
| --------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `alert`                           | `true`  | Sets whether notifications can be displayed to the user on the device.                                                        |
| `announcement`                    | `false` | If enabled, Siri will read the notification content out when devices are connected to AirPods.                                |
| `badge`                           | `true`  | Sets whether a notification dot will appear next to the app icon on the device when there are unread notifications.           |
| `carPlay`                         | `true`  | Sets whether notifications will appear when the device is connected to [CarPlay](https://www.apple.com/ios/carplay/).         |
| `provisional`                     | `false` | Sets whether provisional permissions are granted. See [Provisional permission](#provisional-permission) for more information. |
| `sound`                           | `true`  | Sets whether a sound will be played when a notification is displayed on the device.                                           |
| `providesAppNotificationSettings` | `false` | Indicates the system to display a button for in-app notification settings.                                                    |

The settings provided will be stored by the device and will be visible in the iOS Settings UI for your application.

If the permission dialog has already been presented to the user and you wish to update the existing permission settings
(e.g. enabling sound), the setting will be silently updated and the `requestPermission` call will instantly resolve without showing a dialog.

#### Reading current status

In some cases, you may wish to read the current permission status. The `requestPermission`
API used above resolves an enum that returns the current status.

For example:

```js
import messaging from '@react-native-firebase/messaging';

async function checkApplicationPermission() {
  const authorizationStatus = await messaging().requestPermission();

  if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
    console.log('User has notification permissions enabled.');
  } else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
    console.log('User has provisional notification permissions.');
  } else {
    console.log('User has notification permissions disabled');
  }
}
```

The value returned is a number value, which can be mapped to one of the following values from `messaging.AuthorizationStatus`:

- `-1` = `messaging.AuthorizationStatus.NOT_DETERMINED`: Permission has not yet been requested for your application.
- `0` = `messaging.AuthorizationStatus.DENIED`: The user has denied notification permissions.
- `1` = `messaging.AuthorizationStatus.AUTHORIZED`: The user has accept the permission & it is enabled.
- `2` = `messaging.AuthorizationStatus.PROVISIONAL`: [Provisional authorization](#provisional-authorization) has been granted.

To help improve the chances of the user granting your app permission, it is recommended that permission is requested at a time which makes
sense during the flow of your application (e.g. starting a new chat), where the user would expect to receive such notifications.

It is also possible to fetch the current permission status without requesting permission, by calling the `hasPermission` API instead.

### Provisional authorization

Devices on iOS 12+ can use provisional authorization. This type of permission system allows for notification
permission to be instantly granted without displaying a dialog to your user. The permission allows notifications to be displayed quietly;

- meaning they're only visible within the device notification center.

To enable provisional notifications, pass an object to the `requestPermission` method, with the `provisional` key set to `true`:

```js
await messaging().requestPermission({
  provisional: true,
});
```

Users can then choose a permission option via the notification itself, and select whether they can continue to display quietly, display prominently or not at all.

### Handle button for in-app notifications settings

Devices on iOS 12+ can provide a button in iOS Notifications Settings _(at OS level: `Settings -> [App name] -> Notifications`)_ to redirect users to in-app notifications settings.

1. Request `providesAppNotificationSettings` permissions:

```typescript
await messaging().requestPermission({ providesAppNotificationSettings: true });
```

2. Handle interaction when app is in background state:

```typescript
// index.js
import { AppRegistry } from 'react-native'
import messaging from '@react-native-firebase/messaging'

...

messaging().setOpenSettingsForNotificationsHandler(async () => {
    // Set persistent value, using the MMKV package just as an example of how you might do it
    MMKV.setBool(openSettingsForNotifications, true)
})

...

AppRegistry.registerComponent(appName, () => App)
```

```typescript
// App.tsx

const App = () => {
  const [openSettingsForNotifications] = useMMKVStorage('openSettingsForNotifications', MMKV, false)

  useEffect(() => {
    if (openSettingsForNotifications) {
      navigate('NotificationsSettingsScreen')
    }
  }, [openSettingsForNotifications])

  ...
}
```

3. Handle interaction when app is in quit state:

```typescript
// App.tsx

const App = () => {
  useEffect(() => {
        messaging()
            .getDidOpenSettingsForNotification()
            .then(async didOpenSettingsForNotification => {
                if (didOpenSettingsForNotification) {
                    navigate('NotificationsSettingsScreen')
                }
            })
  }, [])

    ...
}
```

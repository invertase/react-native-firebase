---
title: iOS Permissions
description: Request permissions from your users to allow messages to be received.
next: /messaging/notifications
previous: /messaging/usage
---

# Understanding permissions

Before diving into requesting notification permissions from your users, it is important to understand how iOS handles permissions.

Notifications cannot be shown to users if the user has not granted your application permission. The overall notification permission of a single application can be either "granted" or "declined". Upon installing a new application, the default status is "declined".

In order to receive a "granted" status, you must request permission from your user (see below). The user can either accept or decline request to grant permissions. If granted, notifications will be delivered based on the permission settings which were requested. If the user declines the request, you cannot re-request permission. Instead they must manually enable notification permissions from the iOS Settings UI.

# Requesting permissions

As explained in the [Usage](/messaging#ios---requesting-permissions) documentation, permission
must be requested from your users in order to receive remote messages from FCM using the
`requestPermission` API:

```js
import messaging from '@react-native-firebase/messaging';

async function requestUserPermission() {
  const settings = await messaging().requestPermission();

  if (settings) {
    console.log('Permission settings:', settings);
  }
}
```

Once a user has selected a permission status, iOS prevents the permission dialog from being displayed again. This allows the users of your application full control of how notifications are handled:

- If the user declines permission, they must manually allow notifications via the Settings UI for your application.
- If the user has accepted permission, notifications will be shown using the settings requested (e.g. with or without sound).

## Permission settings

Although overall notification permission can be granted, the permissions can be further broken down into settings.
Settings are used by the device to control notifications, for example by alerting the user via sound. When requesting permission,
you can provide a custom object of settings if you wish to override the defaults. This is demonstrated in the following example:

```js
await messaging().requestPermission({
  sound: false,
  announcement: true,
  inAppNotificationSettings: false,
  // ... other permission settings
});
```

The full list of permission settings can be seen in the table below along with their default values:

| Permission                  | Default | Description                                                                                                                                                                                             |
| --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `alert`                     | `true`  | Sets whether notifications can be displayed to the user on the device.                                                                                                                                  |
| `announcement`              | `false` | If enabled, Siri will read the notification content out when devices are connected to AirPods.                                                                                                          |
| `badge`                     | `true`  | Sets whether a notification dot will appear next to the app icon on the device when there are unread notifications.                                                                                      |
| `carPlay`                   | `true`  | Sets whether notifications will appear when the device is connected to [CarPlay](https://www.apple.com/ios/carplay/).                                                                                   |
| `provisional`               | `false` | Sets whether provisional permissions are granted. See [Provisional permission](#provisional-permission) for more information.                                                                           |
| `sound`                     | `true`  | Sets whether a sound will be played when a notification is displayed on the device.                                                                                                                     |

The settings provided will be stored by the device and will be visible in the iOS Settings UI for your application.

If the permission dialog has already been presented to the user and you wish to update the existing permission settings
(e.g. enabling sound), the setting will be silently updated and the `requestPermission` call will instantly resolve without showing a dialog.

### Observing settings

In some cases, you may wish to observe what permission/settings have been granted on the device. The `requestPermission`
API used above resolves with an object value containing the current settings. The settings contain information such as
whether the user has specific settings enabled or disabled, and whether notification permission is enabled or disabled for the entire application.

For example, to view whether the user has overall notification permission enabled or disabled:

```js
import messaging from '@react-native-firebase/messaging';

async function checkApplicationPermission() {
  const settings = await messaging.requestPermission();

  // settings only available on iOS
  if (settings) {
    console.log('User has notification permissions enabled');
  } else {
    console.log('User has notification permissions disabled');
  }
}
```

The value of each setting returns a number value, which can be mapped to one of the following:

- `-1` = `NOT_SUPPORTED`: The device either does not support the type of permission (the iOS API may be too low), or the permission has not been requested.
- `0` = `DISABLED`: The setting has manually been disabled by the user in the iOS Settings UI.
- `1` = `ENABLED`: The user has accept the permission & it is enabled.

To help improve the chances of the user granting your app permission, it is recommended that permission is requested at a time which makes
sense during the flow of your application (e.g. starting a new chat), where the user would expect to receive such notifications.

It is also possible to fetch the current permission settings without requesting permission, by calling the `hasPermission` API instead:

```js
async function getExistingSettings() {
  const settings = await messaging().hasPermission();

  if (settings) {
    console.log('Current permission settings: ', settings);
  }
}
```

### Provisional permission

Devices on iOS 12+ can take advantage of provisional permissions. This type of permission system allows for notification
permission to be instantly granted without displaying a dialog. The permission allows notifications to be displayed quietly
- meaning they're only visible within the device notification center.

To enable provisional notifications, pass an object to the `requestPermission` method, with the `provisional` key set to `true`:


```js
await messaging().requestPermission({
  provisional: true,
});
```

Users can then choose a permission option via the notification itself, and select whether they can continue to display quietly, display prominently or not at all.

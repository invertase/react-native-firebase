---
title: Android Notifications
description: Display rich customised notifications to your users.
---

# Android Notifications

This page covers all of the available options for displaying rich customised notifications to your users.
For full information on each of the options available, see the [`AndroidNotification`](#) API reference.

To customize a notification, pass any additional options to the `android` parameter whilst building a notification:

```js
const notification = {
  body: 'Hello world', // required
  android: {
    color: '#3f51b5',
    // ... other options
  },
};

await firebase.notifications().displayNotification(notification);
```

## Feature List

Below is a list of currently supported features. Any API specific features are gracefully handled by the
library. See the [`AndroidNotification`](#) API reference for full descriptions and examples.

| Parameter            | Description                                                                                                                                                     | API    |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `actions`            | Displays action buttons with the notification (e.g. 'Reply', 'Mark as read').                                                                                   | 4.1+   |
| `autoCancel`         | Sets whether the notification is automatically dismissed when the user interacts with it.                                                                       |        |
| `badgeIconType`      | For devices supporting notification badges, this sets the type of icon which displays when showing the notification in badge format.                            | 8.0+   |
| `category`           | Assigns the notification a predefined category which is used by the device for internal ranking and filtering.                                                  |        |
| `channelId`          | Sets which notification channel the notification belongs to. This is required on Android API 8.0+. See [Android Channels](#) for more information.              | 8.0+   |
| `clickAction`        | When a notification causes your app to open, the click action helps to identify what to do with that event (e.g. 'open_settings').                              |        |
| `color`              | Sets a custom accent color on the notification.                                                                                                                 | 8.0+   |
| `colorized`          | When set, the `color` will be used as the background color of the notification.                                                                                 |        |
| `contentInfo`        | TODO                                                                                                                                                            |        |
| `defaults`           | TODO                                                                                                                                                            |        |
| `group`              | Displays related notification in a group/bundle. Grouped notifications are collapsed and expanded together to provide a better user experience.                 | 7.0+   |
| `groupAlertBehavior` | Use this method to mute this notification if alerts for this notification's group should be handled by a different notification.                                | 7.0+   |
| `groupSummary`       | If displaying in a `group`, sets whether this notification is the overall summary of the group.                                                                 | 7.0+   |
| `largeIcon`          | Sets a large icon on the notification. Can be a local or remote image.                                                                                          |        |
| `lights`             | Set the color value that you would like the LED on the device to blink (if supported), as well as the rate.                                                     |        |
| `localOnly`          | Set whether or not this notification is only relevant to the current device.                                                                                    |        |
| `number`             | Sets/overrides the notification number used by the device (e.g. for unread messages).                                                                           |        |
| `ongoing`            | If set, prevents the notification being dismissed by the user. Useful for notifications such as phone calls, media etc.                                         |        |
| `onlyAlertOnce`      | If set the device will only ever alert the user once if the notification is not already showing.                                                                |        |
| `priority`           | Determines the priority of the notification. Lower priority will not interrupt the user and will be lower ranked by the device.                                 |        |
| `progress`           | Displays a progress bar inside of the notification. Progress value can be fixed or indeterminate.                                                               |        |
| `remoteInputHistory` | TODO                                                                                                                                                            |        |
| `shortcutId`         | If this notification is duplicative of a Launcher shortcut, sets the id of the shortcut, in case the Launcher wants to hide the shortcut.                       | 8.0+   |
| `showWhenTimestamp`  | If a `when` timestamp has been set, this option sets whether the timestamp will be visible to the users.                                                        |        |
| `smallIcon`          | Sets the small icon to be used by the notification. Also supports multiple icon levels (e.g. battery levels).                                                   |        |
| `sortKey`            | Set a sort key that orders the notification among other notifications from the same package.                                                                    |        |
| `style`              | Display the notification with extra styles. Supports `BigText` and `BigPicture` styles.                                                                         |        |
| `ticker`             | A ticker is used for accessibility purposes for devices with accessibility services enabled. Text passed to `ticker` will be audibly announced.                 | ticker |
| `timeoutAfter`       | If provided, the notification will be automatically cancelled if not interacted with after this time.                                                           |        |
| `usesChronometer`    | If a `when` timestamp is provided, this option allows the notification to display a timer (counting up or down) to the set `when` timestamp.                    |        |
| `vibrationPattern`   | Sets a custom vibration pattern used by the device to alert the user.                                                                                           |        |
| `visibility`         | Used by the device to decide what information to show in the notification (e.g. hiding all information on the lockscreen if it contains sensitive information). |        |
| `when`               | Sets a timestamp on the notification, used for ordering and use with other features such as `usesChronometer`.                                                  |        |

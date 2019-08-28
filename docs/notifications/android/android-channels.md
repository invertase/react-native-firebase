---
title: Android Channels
description: Take advantage of notification channels to provide a better experience for your users. 
---

# Android Channels

Starting in Android 8.0 (API level 26), all notifications must be assigned to a channel. If a notification
is not assigned to a channel, it will not display.
 
For each channel, you can set the visual and auditory behavior that is applied to all notifications in that channel. Then, users can change
these settings and decide which notification channels from your app should be intrusive or visible at all.

Channel settings override any notification specific settings, allowing the user to keep full control of their preferences.
Channels can then be further organized in groups, called channel grouping.

## Creating a channel

To create a new channel, call the `createChannel` method with the channel options:

```js
await firebase.notifications().createChannel({
  channelId: 'reminders',
  name: 'Reminders & Alerts',
  description: 'Channel containing all application reminder and alert events (e.g. upcoming meeting).'
});
```

A channel is created with a number of default options enabled (see `AndroidChannel`). Users can override channel
settings via `App Info -> Notifications` on their device. A channel overrides any notification specific options (where applicable).

Once a channel has been created, only basic options can be updated (such as the name and description).
Other options such as `enableVibration` cannot be updated once created, as the user may have already overridden the
options manually. Updating a channel with the same information has no effect, so it is safe to call this method
on every app boot.

On devices which do not support channels, it is safe to create a channel. This method will successfully resolve.

## Assigning a notification to a channel

On Android 8.0+ all notification must be assigned to a channel. To assign a notification to a channel, 
set the `channelId` on the `android` options payload:

```js
await firebase.notifications().displayNotification({
  body: 'Reminder notification',
  android: {
    channelId: 'reminders',
  },
})
```

On devices which do not support a channel, this option will be ignored. It is however highly recommended to always
set a `channelId` to ensure notifications work seamlessly across devices.

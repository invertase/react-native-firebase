---
title: Analytics
description: Installation and getting started with Analytics.
icon: //static.invertase.io/assets/firebase/analytics.svg
next: /analytics/screen-tracking
previous: /admob/european-user-consent
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the analytics module
yarn add @react-native-firebase/analytics

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/analytics/usage/installation/ios) and [Android](/analytics/usage/installation/android).

# What does it do

Analytics collects usage and behavior data for your app. Its two primary concerns are:

- **Events**: What is happening in your app, such as user actions, system events, or errors.
- **User properties**: Attributes you define to describe segments of your user base, such as language preference or geographic location.

<Youtube id="8iZpH7O6zXo" />

Analytics automatically logs some [events](https://support.google.com/analytics/answer/9234069) and [user properties](https://support.google.com/analytics/answer/9268042); you don't need to add any code to enable them. However, Analytics also allows you to log [custom](#Custom-Events) or [predefined](#Predefined-Events) events within your app. How you can do this will be explained below.

# Usage

Analytics offers a wealth of [Predefined Events](#Predefined-Events) to track user behavior. Analytics also offers folks the ability to log [Custom Events](#Custom-Events) . If you're already familiar with Google Analytics, this method is equivalent to using the event command in [gtag.js](https://developers.google.com/gtagjs/).

## Custom Events

Below is an example showing how a custom event can be logged. Please be aware that primitive data types or arrays of primitive data types are logged in your Firebase Analytics console.

```jsx
import react, { useEffect } from 'react';
import { View, Button } from 'react-native';
import analytics from '@react-native-firebase/analytics';

function App() {
  return (
    <View>
      <Button
        title="Add To Basket"
        onPress={() =>
          analytics().logEvent('basket', {
            id: 3745092,
            item: 'mens grey t-shirt',
            description: ['round neck', 'long sleeved'],
            size: 'L',
          })
        }
      />
    </View>
  );
}
```

## Predefined Events

To help you get started, Analytics provides a number of [event methods](/reference/analytics) that are common among
different types of apps, including retail and e-commerce, travel, and gaming apps. To learn more about these events and
when to use them, browse the [Events and properties](https://support.google.com/analytics/answer/9322688?hl=en&ref_topic=9267641)
articles in the Firebase Help Center.

Below is a sample of how to use one of the predefined methods the Analytics module provides for you:

```jsx
import react, { useEffect } from 'react';
import { View, Button } from 'react-native';
import analytics from '@react-native-firebase/analytics';

function App() {
  return (
    <View>
      <Button
        title="Press me"
        // Logs in the firebase analytics console as "select_content" event
        // only accepts the two object properties which accept strings.
        onPress={() =>
          analytics().logSelectContent({
            content_type: 'clothing',
            item_id: 'abcd',
          })
        }
      />
    </View>
  );
}
```

For a full reference to predefined events and expected parameters, please check out the [reference API](/reference/analytics).

## Reserved Events

The Analytics package works out of the box, however a number of events are automatically reported to Firebase.
These event names are called as 'Reserved Events'. Attempting to send any custom event using the `logEvent` method
with any of the following event names will throw an error.

| Reserved Events Names  |                           |                     |
| ---------------------- | ------------------------- | ------------------- |
| `app_clear_data`       | `app_uninstall`           | `app_update`        |
| `error`                | `first_open`              | `first_visit`       |
| `first_open_time`      | `first_visit_time`        | `in_app_purchase`   |
| `notification_dismiss` | `notification_foreground` | `notification_open` |
| `notification_receive` | `os_update`               | `session_start`     |
| `screen_view`          | `user_engagement`         | `ad_impression`     |
| `ad_click`             | `ad_query`                | `ad_exposure`       |
| `adunit_exposure`      | `ad_activeiew`            |

# firebase.json

## Disable Auto-Initialization

Analytics can be further configured to disable auto collection of Analytics data. This is useful for opt-in-first
data flows, for example when dealing with GDPR compliance. This is possible by setting the below noted property
on the `firebase.json` file at the root of your project directory.

```json
// <project-root>/firebase.json
{
  "react-native": {
    "analytics_auto_collection_enabled": false
  }
}
```

To re-enable analytics (e.g. once you have the users consent), call the `setAnalyticsCollectionEnabled` method:

```js
await firebase.analytics().setAnalyticsCollectionEnabled(true);
```

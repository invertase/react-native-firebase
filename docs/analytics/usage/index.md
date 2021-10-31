---
title: Analytics
description: Installation and getting started with Analytics.
icon: //static.invertase.io/assets/firebase/analytics.svg
next: /analytics/screen-tracking
previous: /contributing
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

Analytics automatically logs some [events](https://support.google.com/analytics/answer/9234069) and [user properties](https://support.google.com/analytics/answer/9268042); you don't need to add any code to enable them. However, Analytics also allows you to log [custom](#custom-events) or [predefined](#predefined-events) events within your app. How you can do this will be explained below.

# Usage

Analytics offers a wealth of [Predefined Events](#predefined-events) to track user behavior. Analytics also offers folks the ability to log [Custom Events](#custom-events) . If you're already familiar with Google Analytics, this method is equivalent to using the event command in [gtag.js](https://developers.google.com/gtagjs/).

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
        onPress={async () =>
          await analytics().logEvent('basket', {
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
        onPress={async () =>
          await analytics().logSelectContent({
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

| Reserved Events Names            |                                |                                 |
| -------------------------------- | ------------------------------ | ------------------------------- |
| `ad_activeview`                  | `ad_click`                     | `ad_exposure`                   |
| `ad_impression`                  | `ad_query`                     | `ad_reward`                     |
| `adunit_exposure`                | `app_background`               | `app_clear_data`                |
| `app_remove`                     | `app_store_refund`             | `app_store_subscription_cancel` |
| `app_store_subscription_convert` | `app_store_subscription_renew` | `app_update`                    |
| `app_upgrade`                    | `dynamic_link_app_open`        | `dynamic_link_app_update`       |
| `dynamic_link_first_open`        | `error`                        | `first_open`                    |
| `first_visit`                    | `in_app_purchase`              | `notification_dismiss`          |
| `notification_foreground`        | `notification_open`            | `notification_receive`          |
| `os_update`                      | `session_start`                | `session_start_with_rollout`    |
| `user_engagement`                |

## App instance id

Below is an example showing how to retrieve the app instance id of the application. This will return null on android
if FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE has been set to FirebaseAnalytics.ConsentStatus.DENIED and null on
iOS if ConsentType.analyticsStorage has been set to ConsentStatus.denied.

```jsx
import analytics from '@react-native-firebase/analytics';
// ...
const appInstanceId = await analytics().getAppInstanceId();
```

# Disable Ad Id usage on iOS

Apple has a strict ban on the usage of Ad Ids ("IDFA") in Kids Category apps. They will not accept any app
in the Kids category if the app accesses the IDFA iOS symbols.

Additionally, apps must implement Apples "App Tracking Transparency" (or "ATT") requirements if they access IDFA symbols.
However, if an app does not use IDFA and otherwise handles data in an ATT-compatible way, it eliminates this ATT requirement.

If you need to avoid IDFA usage while still using analytics, then you need `firebase-ios-sdk` v7.11.0 or greater and to define the following variable in your Podfile:

```ruby
$RNFirebaseAnalyticsWithoutAdIdSupport = true
```

During `pod install`, using that variable installs a new
["Analytics With No Ad Ids"](https://firebase.google.com/support/release-notes/ios#version_7110_-_april_20_2021)
pod the firebase-ios-sdk team has created, and allows both the use of Firebase Analytics in Kids Category apps,
and use of Firebase Analytics without needing the App Tracking Transparency handling (assuming no other parts
of your app handle data in a way that requires ATT)

Note that for obvious reasons, configuring Firebase Analytics for use without IDFA is incompatible with AdMob

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
import { firebase } from '@react-native-firebase/analytics';
// ...
await firebase.analytics().setAnalyticsCollectionEnabled(true);
```

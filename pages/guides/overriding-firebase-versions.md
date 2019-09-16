---
title: Overriding Firebase Versions
description: Manually override the Firebase versions used by React Native Firebase.
author: ehesp
date: 2019-09-16
tags:
  - app
---

# Overriding Firebase Versions

React Native Firebase internally sets the versions of the native Firebase SDKs which each module uses. Each NPM release is tested against a fixed
set of Firebase SDK versions, allowing us to be confident that every feature the library is both available on the application
and works as expected.

If required, you can manually override the native Firebase SDK versions.

> Using your own Firebase versions is not recommended and can lead to breaking changes in your application! Proceed at your own risk.

## Android

Within your projects `/android/app/build.gradle` file, provide your own external Bill of Materials (BoM) under the Firebase
versions namespace:

```groovy
project.ext {
  set('react-native', [
    versions: [
      firebase: [
        bom: "21.1.0", // overriding version
      ],
    ],
  ])
}
```

Once changed, rebuild your application with `npx react-native run-android`.

## iOS

Open your projects `/ios/Podfile` and provide a global `FirebaseSDKVersion` at the top of the file:

```ruby{1}
$FirebaseSDKVersion = '6.7.1'

target 'AwesomeApp' do
  ...
```

Once changed, reinstall your projects pods via `pod install` and rebuild your project with `npx react-native run-ios`.

---
title: Overriding Native SDK Versions
description: Manually override the native SDK versions used internally by React Native Firebase.
author: ehesp
date: 2019-09-16
tags:
  - app
---

# Overriding Native SDK Versions

React Native Firebase internally sets the versions of the native SDKs which each module uses. Each release of the library is tested against a fixed set of SDK versions (e.g. Firebase SDKs), allowing us to be confident that every feature the library supports is working as expected.

Sometimes it's required to change these versions to play nicely with other React Native libraries; therefore we allow manually overriding these native SDK versions.

> Using your own SDK versions is generally not recommended as it can lead to breaking changes in your application. Proceed with caution.

## Android

Within your projects `/android/app/build.gradle` file, provide your own versions by specifying any of the following options shown below:

```groovy
project.ext {
  set('react-native', [
    versions: [
      // Overriding Build/Android SDK Versions
      android : [
        minSdk    : 16,
        targetSdk : 28,
        compileSdk: 28,
        buildTools: "28.0.3"
      ],

      // Overriding Library SDK Versions
      firebase: [
        // Override Firebase SDK Version
        bom           : "21.1.0",

        // Override Crashlytics SDK Version
        crashlytics   : "2.10.0",

        // Override Crashlytics SDK Version
        crashlyticsNdk: "2.1.0"
      ],
    ],
  ])
}
```

Once changed, rebuild your application with `npx react-native run-android`.

## iOS

Open your projects `/ios/Podfile` and add any of the globals shown below to the top of the file:

```ruby

# Override Firebase SDK Version
$FirebaseSDKVersion = '6.8.1'

# Override Fabric SDK Version
$FabricSDKVersion = '1.6.0'

# Override Crashlytics SDK Version
$CrashlyticsSDKVersion = '3.1.0'

```

Once changed, reinstall your projects pods via `pod install` and rebuild your project with `npx react-native run-ios`.

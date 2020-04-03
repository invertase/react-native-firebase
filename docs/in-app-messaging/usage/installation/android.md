---
title: Android Installation
description: Manually integrate Firebase In-App Messaging into your Android application.
next: /in-app-messaging/usage/installation/ios
previous: /in-app-messaging/usage
---

# Android Manual Installation

The following steps are only required if your environment does not have access to React Native
auto-linking.

## 1. Update Gradle Settings

Add the following to your projects `/android/settings.gradle` file:

```groovy
include ':@react-native-firebase_in-app-messaging'
project(':@react-native-firebase_in-app-messaging').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/in-app-messaging/android')
```

## 2. Update Gradle Dependencies

Add the React Native Functions module dependency to your `/android/app/build.gradle` file:

```groovy
dependencies {
  // ...
  implementation project(path: ":@react-native-firebase_inAppMessaging")
}
```

## 3. Add package to the Android Application

Import and apply the React Native Firebase module package to your `/android/app/src/main/java/**/MainApplication.java` file:

Import the package:

```java
import io.invertase.firebase.fiam.ReactNativeFirebaseFiamPackage;
```

Add the package to the registry:

```java
protected List<ReactPackage> getPackages() {
  return Arrays.asList(
    new MainReactPackage(),
    new ReactNativeFirebaseFiamPackage(),
```

## 4. Rebuild the project

Once the above steps have been completed, rebuild your Android project:

```bash
npx react-native run-android
```

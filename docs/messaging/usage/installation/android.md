---
title: Android Setup
description: Manually integrate Messaging into your Android application.
next: /messaging/usage/installation/ios
previous: /messaging/usage
---

# Android Manual Linking

The following steps are only required if your environment does not have access to React Native auto-linking.

## 1. Update Gradle Settings

Add the following to your project's `/android/settings.gradle` file:

```groovy
include ':@react-native-firebase_messaging'
project(':@react-native-firebase_messaging').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/messaging/android')
```

## 2. Update Gradle Dependencies

Add the React Native Functions module dependency to your `/android/app/build.gradle` file:

```groovy
dependencies {
  // ...
  implementation project(path: ":@react-native-firebase_messaging")
}
```

## 3. Add package to the Android Application

Import and apply the React Native Firebase module package to your `/android/app/src/main/java/**/MainApplication.java` file:

### 3.1 Import the package

Add the following underneath
`import com.facebook.react.ReactActivity;`:

```java
import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingPackage;
```

### 3.2 Add the package to the registry

Add the following within the `MainActivity` class:

```java
protected List<ReactPackage> getPackages() {
  return Arrays.asList(
    new MainReactPackage(),
    new ReactNativeFirebaseMessagingPackage(),
  );
}
```

> If the method `getPackages()` already exists on the class in your project, then instead only add `new ReactNativeFirebaseMessagingPackage(),` to the returned list.

## 4. Rebuild the project

Once the above steps have been completed, rebuild your Android project:

```bash
npx react-native run-android
```

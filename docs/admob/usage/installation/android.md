---
title: Android Installation
description: Manually integrate AdMob into your Android application.
next: /admob/usage/installation/ios
previous: /admob/usage
---

# Android Manual Installation

The following steps are only required if you are using React Native <= 0.59 or need to manually integrate the library.

## 1. Update Gradle Settings

Add the following to your projects `/android/settings.gradle` file:

```groovy
include ':@react-native-firebase_admob'
project(':@react-native-firebase_admob').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/admob/android')
```

## 2. Update Gradle Dependencies

Add the React Native Firebase module dependency to your `/android/app/build.gradle` file:

```groovy
dependencies {
  // ...
  implementation project(path: ":@react-native-firebase_admob")
}
```

## 3. Add package to the Android Application

Import and apply the React Native Firebase module package to your `/android/app/src/main/java/**/MainApplication.java` file:

Import the package:

```java
import io.invertase.firebase.admob.ReactNativeFirebaseAdmobPackage;
```

Add the package to the registry:

```java
protected List<ReactPackage> getPackages() {
  return Arrays.asList(
    new MainReactPackage(),
    new ReactNativeFirebaseAdmobPackage(),
```

## 4. Rebuild the project

Once the above steps have been completed, rebuild your Android project:

```bash
npx react-native run-android
```

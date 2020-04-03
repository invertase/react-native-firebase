---
title: Android Installation
description: Manually integrate Dynamic Links into your Android application.
next: /dynamic-links/usage/installation/ios
previous: /dynamic-links/usage
---

# Android Manual Installation

The following steps are only required if your environment does not have access to React Native
auto-linking.

## 1. Update Gradle Settings

Add the following to your projects `/android/settings.gradle` file:

```groovy
include ':@react-native-firebase_dynamic-links'
project(':@react-native-firebase_dynamic-links').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/dynamic-links/android')
```

## 2. Update Gradle Dependencies

Add the React Native Dynamic Links module dependency to your `/android/app/build.gradle` file:

```groovy
dependencies {
  // ...
  implementation project(path: ":@react-native-firebase_dynamic-links")
}
```

## 3. Add package to the Android Application

Import and apply the React Native Firebase module package to your `/android/app/src/main/java/**/MainApplication.java` file:

Import the package:

```java
import io.invertase.firebase.dynamiclinks.ReactNativeFirebaseDynamicLinksPackage;
```

Add the package to the registry:

```java
protected List<ReactPackage> getPackages() {
  return Arrays.asList(
    new MainReactPackage(),
    new ReactNativeFirebaseDynamicLinksPackage(),
```

## 4. Rebuild the project

Once the above steps have been completed, rebuild your Android project:

```bash
npx react-native run-android
```

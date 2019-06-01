---
title: Android Initialization
description: Initialization Firebase with Android. 
---

# Android Setup

## Manual Android Integration

> The following steps are only required if your environment does not have access to React Native
auto-linking.

#### Add App to Gradle Settings

**`android/settings.gradle`**:
```groovy
include ':@react-native-firebase_app'
project(':@react-native-firebase_app').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/app/android')
```

#### Add App to App Gradle Dependencies

**`android/app/build.gradle`**:
```groovy{4}
// ..
dependencies {
  // ..
  implementation project(path: ":@react-native-firebase_app")
}
```

#### Add App to Main Android Application:

**`android/app/src/main/java/**/MainApplication.java`**:
```java{2,8}
// ..
import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;

  // ..
  protected List<ReactPackage> getPackages() {
    return Arrays.asList(
      new MainReactPackage(),
      new ReactNativeFirebaseAppPackage(),
      // ..
```

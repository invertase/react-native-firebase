---
title: Android Setup
description: Manually integrate Realtime Database into your Android application.
---

# Android Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

#### Add Realtime Database to Gradle Settings

**`android/settings.gradle`**:

```groovy
include ':@react-native-firebase_database'
project(':@react-native-firebase_database').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/database/android')
```

#### Add Realtime Database to App Gradle Dependencies

**`android/app/build.gradle`**:

```groovy{4}
// ..
dependencies {
  // ..
  implementation project(path: ":@react-native-firebase_database")
}
```

#### Add Realtime Database to Main Android Application:

**`android/app/src/main/java/**/MainApplication.java`\*\*:

```java{2,8}
// ..
import io.invertase.firebase.database.ReactNativeFirebaseDatabasePackage;

  // ..
  protected List<ReactPackage> getPackages() {
    return Arrays.asList(
      new MainReactPackage(),
      new ReactNativeFirebaseDatabasePackage(),
      // ..
```

---
title: Android Setup
description: Manually integrate Remote Config into your Android application.
---

# Android Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

#### Add Remote Config to Gradle Settings

**`android/settings.gradle`**:

```groovy
include ':@react-native-firebase_config'
project(':@react-native-firebase_config').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/remote-config/android')
```

#### Add Remote Config to App Gradle Dependencies

**`android/app/build.gradle`**:

```groovy{4}
// ..
dependencies {
  // ..
  implementation project(path: ":@react-native-firebase_config")
}
```

#### Add Remote Config to Main Android Application:

**`android/app/src/main/java/**/MainApplication.java`**:

```java{2,8}
// ..
import io.invertase.firebase.config.ReactNativeFirebaseConfigPackage;

  // ..
  protected List<ReactPackage> getPackages() {
    return Arrays.asList(
      new MainReactPackage(),
      new ReactNativeFirebaseConfigPackage(),
      // ..
```

---
title: Android Setup
description: Manually integrate ML Kit Vision into your Android application.
---

# Android Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

#### Add ML Kit Vision to Gradle Settings

**`android/settings.gradle`**:

```groovy
include ':@react-native-firebase_ml-vision'
project(':@react-native-firebase_ml-vision').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/ml-vision/android')
```

#### Add ML Kit Vision to App Gradle Dependencies

**`android/app/build.gradle`**:

```groovy{4}
// ..
dependencies {
  // ..
  implementation project(path: ":@react-native-firebase_ml-vision")
}
```

#### Add ML Kit Vision to Main Android Application:

**`android/app/src/main/java/**/MainApplication.java`\*\*:

```java{2,8}
// ..
import io.invertase.firebase.ml.vision.ReactNativeFirebaseMLVisionPackage;

  // ..
  protected List<ReactPackage> getPackages() {
    return Arrays.asList(
      new MainReactPackage(),
      new ReactNativeFirebaseMLVisionPackage(),
      // ..
```

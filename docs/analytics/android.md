---
title: Android Setup
description: Manually integrate Analytics into your Android application.
---

# Android Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

#### Add Analytics to Gradle Settings

**`android/settings.gradle`**:

```groovy
include ':@react-native-firebase_analytics'
project(':@react-native-firebase_analytics').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/analytics/android')
```

#### Add Analytics to App Gradle Dependencies

**`android/app/build.gradle`**:

```groovy{4}
// ..
dependencies {
  // ..
  implementation project(path: ":@react-native-firebase_analytics")
}
```

#### Add Analytics to Main Android Application:

**`android/app/src/main/java/**/MainApplication.java`**:

```java{2,8}
// ..
import io.invertase.firebase.analytics.ReactNativeFirebaseAnalyticsPackage;

  // ..
  protected List<ReactPackage> getPackages() {
    return Arrays.asList(
      new MainReactPackage(),
      new ReactNativeFirebaseAnalyticsPackage(),
      // ..
```

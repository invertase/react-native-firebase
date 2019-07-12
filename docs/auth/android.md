---
title: Android Setup
description: Manually integrate Authentication into your Android application. 
---

# Android Manual Linking

> The following steps are only required if your environment does not have access to React Native
auto-linking. 

#### Add Authentication to Gradle Settings

**`android/settings.gradle`**:
```groovy
include ':@react-native-firebase_auth'
project(':@react-native-firebase_auth').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/auth/android')
```

#### Add Authentication to App Gradle Dependencies

**`android/app/build.gradle`**:
```groovy{4}
// ..
dependencies {
  // ..
  implementation project(path: ":@react-native-firebase_auth")
}
```

#### Add Authentication to Main Android Application:

**`android/app/src/main/java/**/MainApplication.java`**:
```java{2,8}
// ..
import io.invertase.firebase.auth.ReactNativeFirebaseAuthPackage;

  // ..
  protected List<ReactPackage> getPackages() {
    return Arrays.asList(
      new MainReactPackage(),
      new ReactNativeFirebaseAuthPackage(),
      // ..
```

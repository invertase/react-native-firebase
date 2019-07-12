---
title: Android Setup
description: Manually integrate Cloud Storage into your Android application. 
---

# Android Manual Linking

> The following steps are only required if your environment does not have access to React Native
auto-linking.

#### Add Cloud Storage to Gradle Settings

**`android/settings.gradle`**:
```groovy
include ':@react-native-firebase_storage'
project(':@react-native-firebase_storage').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/storage/android')
```

#### Add Cloud Storage to App Gradle Dependencies

**`android/app/build.gradle`**:
```groovy{4}
// ..
dependencies {
  // ..
  implementation project(path: ":@react-native-firebase_storage")
}
```

#### Add Cloud Storage to Main Android Application:

**android/app/src/main/java/\*\*/MainApplication.java**:
```java{2,8}
// ..
import io.invertase.firebase.storage.ReactNativeFirebaseStoragePackage;

  // ..
  protected List<ReactPackage> getPackages() {
    return Arrays.asList(
      new MainReactPackage(),
      new ReactNativeFirebaseStoragePackage(),
      // ..
```

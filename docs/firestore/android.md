---
title: Firestore Android Initialization
description: Firestore initialization with Android.
---

# Android Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

#### Add Firestore to Gradle Settings

**`android/settings.gradle`**:

```groovy
include ':@react-native-firebase_firestore'
project(':@react-native-firebase_firestore').projectDir = new File(rootProject.projectDir, '../node_modules/@react-native-firebase/firestore/android')
```

#### Add Firestore to App Gradle Dependencies

**`android/app/build.gradle`**:

```groovy
// ..
dependencies {
  // ..
  implementation project(':@react-native-firebase_firestore')
}
```

#### Add Firestore to Main Android Application:

**`android/app/src/main/java/{yourApp}/MainApplication.java`**:

```java
// ..
import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;

  // ..
  protected List<ReactPackage> getPackages() {
    return Arrays.asList(
      new MainReactPackage(),
      new ReactNativeFirebaseFirestorePackage(),
      // ..
```

#### Enable multidex

Adding Firestore to your Android app requires [`multiDexEnabled` to be set to `true`](https://developer.android.com/studio/build/multidex) in `android/app/build.gradle`:

```groovy
//..
android {
  //..
  
  defaultConfig {
    //..
    multiDexEnabled true  // needed for firestore
  }
  //..
}
```

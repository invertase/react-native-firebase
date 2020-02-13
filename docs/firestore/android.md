---
title: Cloud Firestore Android Integration
description: Manually integrate Cloud Firestore into your Android application.
---

# Android Manual Linking

> The following steps are only required if you are using React Native without auto-linking (<= 0.59) or you need to manually integrate the library.

### Add Firestore to Gradle Settings

**`android/settings.gradle`**:

```groovy
include ':@react-native-firebase_firestore'
project(':@react-native-firebase_firestore').projectDir = new File(rootProject.projectDir, '../node_modules/@react-native-firebase/firestore/android')
```

### Add Firestore to App Gradle Dependencies

**`android/app/build.gradle`**:

```groovy
// ..
dependencies {
  // ..
  implementation project(':@react-native-firebase_firestore')
}
```

### Add Firestore to Main Android Application:

**`android/app/src/main/java/{yourApp}/MainApplication.java`**:

```java
// ..
import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;
import io.invertase.firebase.firestore.ReactNativeFirebaseFirestorePackage;

  // ..
  protected List<ReactPackage> getPackages() {
    return Arrays.asList(
      new MainReactPackage(),
      new ReactNativeFirebaseFirestorePackage(),
      // ..
```

### Enable multidex

Adding Firestore to your Android app requires [`multidex enabled`](https://developer.android.com/studio/build/multidex).

In **`android/app/build.gradle`** enable multidex and add the multidex library as a dependency:

```groovy
//..
android {
  //..
  
  defaultConfig {
    //..
    multiDexEnabled true
  }
  //..
  dependencies {
    // ..
    implementation 'com.android.support:multidex:1.0.3' 
    //use androidx.multidex:multidex:2.0.1 for AndroidX!
  }
}
```

In **`android/app/src/main/java/{yourApp}/MainApplication.java`** change your **MainApplication** to extend **MultidexApplication**:


```java
// ..
import android.support.multidex.MultiDexApplication;
//import androidx.multidex.MultiDexApplication; for AndroidX!

  // ..
  public class MainApplication extends MultiDexApplication implements ReactApplication {
      // ..
  }
```

### Rebuild your project

Once the above steps have been completed, rebuild your Android project:

```bash
npx react-native run-android
```

---
title: Android Manual Installation
description: Manually integrate Crashlytics into your Android application.
---

# Android Manual Installation

# Android Manual Linking

The following steps are only required if your environment does not have access to React Native auto-linking.

#### Update Gradle Settings

Add the following to your projects `/android/settings.gradle` file:

```groovy
include ':@react-native-firebase_crashlytics'
project(':@react-native-firebase_crashlytics').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/crashlytics/android')
```

#### Update Gradle Dependencies

Add the React Native Crashlytics module dependency to your `/android/app/build.gradle` file:

```groovy{3}
dependencies {
  ...
  implementation project(path: ":@react-native-firebase_crashlytics")
}
```

#### Add package to the Android Application

Import and apply the React Native Firebase module package to your `/android/app/src/main/java/**/MainApplication.java` file:

Import the package:

```java
import io.invertase.firebase.crashlytics.ReactNativeFirebaseCrashlyticsPackage;
```

Add the package to the registry:

```java{4}
protected List<ReactPackage> getPackages() {
  return Arrays.asList(
    new MainReactPackage(),
    new ReactNativeFirebaseCrashlyticsPackage(),
```

#### Rebuild the project

Once the above steps have been completed, rebuild your Android project:

```bash
npx react-native run-android
```


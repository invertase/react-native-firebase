---
title: Android Setup
description: Manually integrate Cloud Functions into your Android application.
---

# Android Manual Installation

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

#### Update Gradle Settings

Add the following to your projects `/android/settings.gradle` file:

```groovy
include ':@react-native-firebase_functions'
project(':@react-native-firebase_functions').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/functions/android')
```

#### Update Gradle Dependencies

Add the React Native Functions module dependency to your `/android/app/build.gradle` file:

```groovy{3}
dependencies {
  ...
  implementation project(path: ":@react-native-firebase_functions")
}
```

#### Add package to the Android Application

Import and apply the React Native Firebase module package to your `/android/app/src/main/java/**/MainApplication.java` file:

Import the package:

```java
import io.invertase.firebase.analytics.ReactNativeFirebaseFunctionsPackage;
```

Add the package to the registry:

```java{4}
protected List<ReactPackage> getPackages() {
  return Arrays.asList(
    new MainReactPackage(),
    new ReactNativeFirebaseFunctionsPackage(),
```

#### Rebuild the project

Once the above steps have been completed, rebuild your Android project:

```bash
react-native run-android
```


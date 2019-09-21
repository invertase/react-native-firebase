---
title: Android Setup
description: Manually integrate Performance Monitoring into your Android application.
---

# Android Setup

The Performance Monitoring library requires the *Performance Monitoring plugin* to be installed in your project.
This plugin supplements the library by adding extra functionality and enabled [automatic HTTP/S network request monitoring.](https://firebase.google.com/docs/perf-mon#network-requests)

### Add the Performance Monitoring plugin

Add the plugin to your projects dependencies in your `/android/build.gradle` file:

```groovy
buildscript {
...
    dependencies {
        ...
        classpath 'com.google.firebase:perf-plugin:1.3.1'
    }
``` 

### Apply the Performance Monitoring plugin

Apply the plugin in your `/android/app/build.gradle` file (at the top):

```groovy
apply plugin: 'com.android.application'
apply plugin: "com.google.firebase.firebase-perf"
```

## Android Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

#### Update Gradle Settings

Add the following to your projects `/android/settings.gradle` file:

```groovy
include ':@react-native-firebase_perf'
project(':@react-native-firebase_perf').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/perf/android')
```

#### Update Gradle Dependencies

Add the React Native Functions module dependency to your `/android/app/build.gradle` file:

```groovy{3}
dependencies {
  ...
  implementation project(path: ":@react-native-firebase_perf")
}
```

#### Add package to the Android Application

Import and apply the React Native Firebase module package to your `/android/app/src/main/java/**/MainApplication.java` file:

Import the package:

```java
import io.invertase.firebase.perf.ReactNativeFirebasePerfPackage;
```

Add the package to the registry:

```java{4}
protected List<ReactPackage> getPackages() {
  return Arrays.asList(
    new MainReactPackage(),
    new ReactNativeFirebasePerfPackage(),
```

#### Rebuild the project

Once the above steps have been completed, rebuild your Android project:

```bash
react-native run-android
```



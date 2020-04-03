---
title: Crashlytics - Android Setup
description: Additional Android steps for Crashlytics integration
---

> If you're migrating from Fabric, make sure you remove the `fabric.properties` file from your Android project. If you do not do this you will not receive crash reports on the Firebase console.

# Adding Fabric Gradle Tools

These steps are required, if you do not add these your app will most likely crash at startup with the following Error:
 
"The Crashlytics build ID is missing. This occurs when Crashlytics tooling is absent from your app's build configuration.
Please review Crashlytics onboarding instructions and ensure you have a valid Crashlytics account."_

## 1. Add the Fabric Maven repository

Add the following line to the `android/build.gradle` file:

```groovy
// ..
buildscript {
  // ..
  repositories {
    // ..
    maven {
      url 'https://maven.fabric.io/public'
    }
  }
  // ..
}
```

## 2. Add the Fabric Tools Plugin dependency

Add the following dependency to the `android/build.gradle` file:

```groovy
// ..
buildscript {
  // ..
  dependencies {
    // ..
    classpath 'io.fabric.tools:gradle:1.28.1'
  }
  // ..
}
```

## 3. Apply the Fabric Tools Plugin to your app

Apply the `io.fabric` plugin by adding the following to the top of your `android/app/build.gradle` file:

```
apply plugin: 'com.android.application' // apply after this line
apply plugin: 'io.fabric'
// ..
```

## 4. (Optional) Enable Crashlytics NDK reporting 

Crashlytics NDK reporting allows you to capture Native Development Kit crashes, e.g. in React Native this will capture 
crashes originating from the Yoga layout engine.

Add the `crashlytics` block line to the `android/app/build.gradle` file:

```groovy
crashlytics {
  enableNdk true
}
```

## 5. Rebuild the project

Once the above steps have been completed, rebuild your Android project:

```bash
npx react-native run-android
```

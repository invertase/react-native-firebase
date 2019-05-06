---
title: Android Setup
description: Manually integrate Crashlytics into your Android application. 
---

# Android Setup

> If you're migrating from Fabric ensure you remove the `fabric.properties` file from your android project - if you do not do this you will not receive crash reports on the Firebase console.

## Additional Installation Steps

### Add Fabric Gradle Tools

These steps are required, if you do not add these your app will most likely crash at startup with the following Error: *"The Crashlytics build ID is missing. This occurs when Crashlytics tooling is absent from your app's build configuration. Please review Crashlytics onboarding instructions and ensure you have a valid Crashlytics account."*

#### Add the Fabric Maven repository 

**`android/build.gradle`**: 
```groovy{6-8}
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

#### Add the Fabric Tools Plugin dependency

**`android/build.gradle`**: 
```groovy{6}
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

#### Apply the Fabric Tools Plugin to your app


**`android/app/build.gradle`**: 
```groovy{2}
apply plugin: 'com.android.application' // apply after this line
apply plugin: 'io.fabric'
// ..
```

#### Enable Crashlytics NDK reporting

> OPTIONAL

Crashlytics NDK reporting allows you to capture Native Development Kit crashes, e.g. in React Native this will capture crashes originating from the Yoga layout engine. 

**`android/app/build.gradle`**: 
```groovy{4-6}
// ..
apply plugin: 'io.fabric'
// ..
crashlytics {
  enableNdk true
}
```

## Manual Linking

> The following steps are only required if your environment does not have access to React Native
auto-linking. 


TODO

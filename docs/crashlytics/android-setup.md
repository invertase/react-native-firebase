---
title: Crashlytics - Android Setup
description: Additional Android steps for Crashlytics integration
---

> If you're migrating from Fabric, make sure you remove the `fabric.properties` file from your Android project. If you do not do this you will not receive crash reports on the Firebase console.

> If you're using Expo, make sure to add the `@react-native-firebase/crashlytics` config plugin to your `app.json` or `app.config.js`. It handles the below installation steps for you. For instructions on how to do that, view the [Expo](/#expo) installation section.

# Adding Firebase Crashlytics Gradle Tools

These steps are required, if you do not add these your app will most likely crash at startup with the following Error:

"The Crashlytics build ID is missing. This occurs when Crashlytics tooling is absent from your app's build configuration.
Please review Crashlytics onboarding instructions and ensure you have a valid Crashlytics account."\_

## 1. Add the Google repository (if it's not there already)

Add the following line to the `android/build.gradle` file :

```groovy
// ..
buildscript {
  // ..
  repositories {
    // ..
    google()
  }
  // ..
}
```

## 2. Add the Firebase Crashlytics Plugin dependency

Add the following dependency to the `android/build.gradle` file:

```groovy
// ..
buildscript {
  // ..
  dependencies {
    // ..
    classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.0'
  }
  // ..
}
```

## 3. Apply the Firebase Crashlytics Plugin to your app

Apply the `com.google.firebase.crashlytics` plugin by adding the following to the top of your `android/app/build.gradle` file:

```
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services' // apply after this line
apply plugin: 'com.google.firebase.crashlytics'
// ..
```

## 4. (Optional) Enable Crashlytics NDK reporting

Crashlytics NDK reporting allows you to capture Native Development Kit crashes, e.g. in React Native this will capture
crashes originating from the Yoga layout engine.

Add the `firebaseCrashlytics` block line to the `android/app/build.gradle` file:

```groovy
android {
    // ...

    buildTypes {
        release {
            /* Add the firebaseCrashlytics extension (by default,
            * it's disabled to improve build speeds) and set
            * nativeSymbolUploadEnabled to true along with a pointer to native libs. */

            firebaseCrashlytics {
                nativeSymbolUploadEnabled true
                unstrippedNativeLibsDir 'build/intermediates/merged_native_libs/release/out/lib'
            }
            // ...
        }
    }
}
```

## 5. Rebuild the project

Once the above steps have been completed, rebuild your Android project:

```bash
npx react-native run-android
```

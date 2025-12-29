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
    classpath 'com.google.firebase:firebase-crashlytics-gradle:3.0.6'
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

## 4. (Optional) Configure Crashlytics NDK and GWP-ASan support

### Enable NDK Crash Reporting

Crashlytics NDK reporting allows you to capture Native Development Kit crashes, e.g. in React Native this will capture
crashes originating from the Yoga layout engine.

To enable NDK crash reporting, add the following to your `firebase.json` file:

```json
{
  "react-native": {
    "crashlytics_ndk_enabled": true
  }
}
```

When `crashlytics_ndk_enabled` is set to `true`, React Native Firebase will automatically:
- Enable NDK crash reporting in the manifest
- Configure automatic native symbol upload for all release build variants

> **Note**: The automatic symbol upload configuration works with standard release builds and custom build flavors (e.g., `playRelease`, `premiumRelease`). Any build variant with "release" in its name will have symbol upload enabled.

If you need to manually configure symbol upload or override the automatic configuration, you can add the `firebaseCrashlytics` block to your `android/app/build.gradle` file:

```groovy
android {
    // ...

    buildTypes {
        release {
            firebaseCrashlytics {
                nativeSymbolUploadEnabled true
                unstrippedNativeLibsDir 'build/intermediates/merged_native_libs/release/out/lib'
            }
            // ...
        }
    }
}
```

### Configure GWP-ASan Mode

[GWP-ASan](https://developer.android.com/ndk/guides/gwp-asan) (GWP-AddressSanitizer) is a native memory allocator feature that helps detect heap memory errors. You can configure its behavior using `firebase.json`:

```json
{
  "react-native": {
    "crashlytics_gwp_asan_mode": "default"
  }
}
```

Available values:
- `"default"` - The default behavior (system-determined, typically enabled for a small percentage of devices)
- `"never"` - Disable GWP-ASan completely
- `"always"` - Enable GWP-ASan on all devices (useful for testing, but not recommended for production due to performance impact)

> **Recommended**: Use `"default"` for production builds to get memory error detection with minimal performance impact.

## 5. Rebuild the project

Once the above steps have been completed, rebuild your Android project:

```bash
npx react-native run-android
```

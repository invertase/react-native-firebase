---
title: Multiple Dex Files Error
description: The 'Multiple dex files' error is common when dealing with multiple libraries which use Google Play Services when building for Android.
tags:
    - build
    - android
---

# Multiple Dex Files error (build time error)

The Multiple Dex Files error is a common error which occurs in Android projects which use
libaries which require Google Play Services. When libaries require different versions of
Google Play Services, the following error is thrown when building the Android APK:

```
Failed on android with com.android.dex.DexException: Multiple dex files...
```

The process for fixing the error requires manual checking of your installed native libaries,
then updating your `android/app/build.gradle` file to force those libaries to use a specific version
of Google Play Services.

> Check out [this blog post](https://medium.com/@suchydan/how-to-solve-google-play-services-version-collision-in-gradle-dependencies-ef086ae5c75f) for a full explanation of the issue.

To identify libaries which use Google Play Services, search your projects `node_modules` directory
for any native React Native module you have installed. Within those projects, open the `android/build.gradle`
file, and within the `dependencies` block, identify any which start with:

- `com.google.android.gms`
- `com.google.firebase`

Once identified, open your own `android/app/build.gradle` file, and within the `dependencies` block exclude
the service using the following syntax:

```groovy:title=react-native-device-info example
dependencies {
    ...
    compile (project(':react-native-device-info')){
        exclude group: "com.google.android.gms"
    }
}
```

The next step is to then lock a specific version fo the Google Play Service package which the module uses:

```groovy:title=react-native-device-info example
dependencies {
    ...
    compile (project(':react-native-device-info')){
        exclude group: "com.google.android.gms"
    }

    ...
    compile ("com.google.android.gms:play-services-base:10.0.1") {
        force = true;
    }
}
```

Repeat this process for each conflicting Google Play Services module.

Once complete, run `./gradlew clean` within the `android` directory of your project and rebuild
your android project.

---
title: Android Setup
description: Manually integrate ML Kit Natural Language into your Android application.
---

# Android Manual Linking

> The following steps are only required if your environment does not have access to React Native
> auto-linking.

#### Add ML Kit Natural Language to Gradle Settings

**`android/settings.gradle`**:

```groovy
include ':@react-native-firebase_ml-natural-language'
project(':@react-native-firebase_ml-natural-language').projectDir = new File(rootProject.projectDir, './../node_modules/@react-native-firebase/ml-natural-language/android')
```

#### Add ML Kit Natural Language to App Gradle Dependencies

**`android/app/build.gradle`**:

```groovy{4}
// ..
dependencies {
  // ..
  implementation project(path: ":@react-native-firebase_ml-natural-language")
}
```

#### Add ML Kit Natural Language to Main Android Application:

**`android/app/src/main/java/**/MainApplication.java`\*\*:

```java{2,8}
// ..
import io.invertase.firebase.ml.naturallanguage.ReactNativeFirebaseMLNaturalLanguagePackage;

  // ..
  protected List<ReactPackage> getPackages() {
    return Arrays.asList(
      new MainReactPackage(),
      new ReactNativeFirebaseMLNaturalLanguagePackage(),
      // ..
```

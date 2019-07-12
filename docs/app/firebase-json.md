---
title: Configure via firebase.json
description: Configure your Firebase services via a `firebase.json` file.
---

# React Native Firebase JSON Configuration

As part of the many steps we've taken to simplify using Firebase with React Native; React Native Firebase now allows you to configure various options across all its supported Firebase services via a single `firebase.json` file in your project root.

These options are here to replace steps where you'd normally have to make native code changes to your project.

**Supported Platforms:** Android, iOS (via CocoaPods only)

## Structure

All options for React Native Firebase must be placed inside a wrapping `react-native` object.

**Supported Values**: `boolean`, `string`, `number`

> Nested items inside `"react-native"` are not supported.

### Example

```json
{
  "react-native": {
    "crashlytics_ndk_enabled": true,
    "crashlytics_debug_enabled": true,
    "crashlytics_auto_collection_enabled": false,

    "ml_natural_language_language_id_model": true,
    "ml_natural_language_smart_reply_model": false,

    "ml_vision_face_model": true,
    "ml_vision_image_label_model": false,
    "ml_vision_object_detection_model": true,

    "messaging_auto_init_enabled": false
  }
}
```

## Non Firebase Usage

You may find it useful to use it for non-Firebase things in your project, e.g:

- toggling a feature
- injecting values into your Android manifest
- switching Android source sets
- controlling optional dependencies
- controlling native dependency versions
- customising build time logic
- customising runtime logic
- switching which podspec to use based

All config items in a `firebase.json` file can be read at every stage of your app's build/run cycle:

- Android
  - Inside Gradle build
  - Inside native code (e.g. Java)
- iOS
  - Inside Script Phases
  - Inside Pod install (e.g. can be read inside pod specs)
  - Inside native code (e.g. Objective-C)
- JS
- Inside your app bundle
- RN CLI - Project Config (`react-native.config.js`)
- RN CLI - Dependency Config (`react-native.config.js`)

To help you with this we've documented the internal APIs that are accessible at every location:

#### Android - Runtime (Java)

TODO

#### Android - Build time (Groovy)

TODO

#### iOS - CocoaPods (Ruby)

TODO

#### iOS - Script Phases (Bash)

TODO

#### iOS - Runtime (Objective-C)

TODO

#### RN CLI - Project Config (`react-native.config.js`)

TODO

#### RN CLI - Dependency Config (`react-native.config.js`)

TODO

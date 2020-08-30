---
title: ML Kit Vision
description: Installation and getting started with ML Kit Vision.
icon: //static.invertase.io/assets/firebase/ml-kit.svg
next: /ml-vision/text-recognition
previous: /ml-natural-language/usage
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the ml-vision module
yarn add @react-native-firebase/ml-vision

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/ml-vision/usage/installation/ios) and [Android](/ml-vision/usage/installation/android).

# What does it do

ML Kit Vision makes use of Firebase's Machine Learning Kit's [Text Recognition](https://firebase.google.com/docs/ml-kit/recognize-text),
[Face Detection](https://firebase.google.com/docs/ml-kit/detect-faces), [Barcode Scanning](https://firebase.google.com/docs/ml-kit/read-barcodes),
[Image Labeling](https://firebase.google.com/docs/ml-kit/label-images) & [Landmark Recognition](https://firebase.google.com/docs/ml-kit/recognize-landmarks) features.

Depending on the service, it is possible to perform Machine Learning on both the local device or cloud.

<Youtube id="ejrn_JHksws" />

## Support table

The table below outlines the current module support for each available service, and whether they are available on local device,
cloud or both.

| API                                                                                   | Cloud Model | On Device |
| ------------------------------------------------------------------------------------- | ----------- | --------- |
| [Text Recognition](https://firebase.google.com/docs/ml-kit/recognize-text)            | ✅          | ✅        |
| [Document Text Recognition](https://firebase.google.com/docs/ml-kit/recognize-text))  | ✅          |           |
| [Face Detection](https://firebase.google.com/docs/ml-kit/detect-faces)                |             | ✅        |
| [Barcode Scanning](https://firebase.google.com/docs/ml-kit/read-barcodes)             |             | ✅        |
| [Image Labeling](https://firebase.google.com/docs/ml-kit/label-images)                | ✅          | ✅        |
| [Landmark Recognition](https://firebase.google.com/docs/ml-kit/recognize-landmarks)   |             | ✅        |
| [AutoML Vision Edge](https://firebase.google.com/docs/ml-kit/automl-image-labeling)   | ❌          | ❌        |
| [Object Detection/Tracking](https://firebase.google.com/docs/ml-kit/object-detection) | ❌          | ❌        |

# Usage

To get started, you can find the documentation for the individual ML Kit Vision services below:

- [Text Recognition](/ml-vision/text-recognition).
- [Landmark Recognition](/ml-vision/landmark-recognition).
- [Barcode Scanning](/ml-vision/barcode-scanning).
- [Image ](/ml-vision/image-labeling).
- [Face Detection](/ml-vision/face-detection).

# firebase.json

## Enabling models

To be able to use the on-device Machine Learning models you'll need to enable them. This is possible by setting the below noted properties
on the `firebase.json` file at the root of your project directory.

```json
// <project-root>/firebase.json
{
  "react-native": {
    // on device face detection
    "ml_vision_face_model": true,
    // on device text recognition
    "ml_vision_ocr_model": true,
    // on device barcode detection
    "ml_vision_barcode_model": true,

    // on device image labeling
    "ml_vision_label_model": true,
    "ml_vision_image_label_model": true
  }
}
```

The models are disabled by default to help control app size.

Since only models enabled here will be compiled into the application, any changes to this file require a rebuild.

```bash
# For Android
npx react-native run-android

# For iOS
cd ios/ && pod install --repo-update
npx react-native run-ios
```

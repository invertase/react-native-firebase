---
title: ML
description: Installation and getting started with ML.
icon: //static.invertase.io/assets/firebase/ml-kit.svg
next: /ml/text-recognition
previous: /in-app-messaging/usage
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the ml module
yarn add @react-native-firebase/ml

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/ml/usage/installation/ios) and [Android](/ml/usage/installation/android).

# What does it do

ML makes use of Firebase Machine Learning's [Text Recognition](https://firebase.google.com/docs/ml/recognize-text),
[Image Labeling](https://firebase.google.com/docs/ml/label-images) & [Landmark Recognition](https://firebase.google.com/docs/ml/recognize-landmarks) features.

All Firebase ML services are cloud-based, with on-device APIs handled by the new, separate [Google MLKit](https://developers.google.com/ml-kit/) (Usable in react-native
as a set of [react-native-mlkit modules](https://www.npmjs.com/org/react-native-mlkit))

<Youtube id="ejrn_JHksws" />

## Support table

The table below outlines the current module support for each available service, and their support status here

| API                                                                               | Cloud Model |
| --------------------------------------------------------------------------------- | ----------- |
| [Text Recognition](https://firebase.google.com/docs/ml/recognize-text)            | ✅          |
| [Document Text Recognition](https://firebase.google.com/docs/ml/recognize-text))  | ✅          |
| [Image Labeling](https://firebase.google.com/docs/ml/label-images)                | ✅          |
| [AutoML Vision Edge](https://firebase.google.com/docs/ml/automl-image-labeling)   | ❌          |
| [Object Detection/Tracking](https://firebase.google.com/docs/ml/object-detection) | ❌          |

# Usage

To get started, you can find the documentation for the individual ML Kit services below:

- [Text Recognition](/ml/text-recognition)
- [Landmark Recognition](/ml/landmark-recognition)
- [Image](/ml/image-labeling)

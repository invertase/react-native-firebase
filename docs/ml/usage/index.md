---
title: ML
description: Installation and getting started with ML.
icon: //static.invertase.io/assets/firebase/ml-kit.svg
next: /remote-config/usage
previous: /installations/usage
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

> **This package is mostly discontinued** since these APIs are no longer available in the latest Firebase SDKs.
> To call the Cloud Vision API from your app the recommended approach is using Firebase
> Authentication and Functions, which gives you a managed, serverless gateway to Google Cloud Vision APIs. For an example
> Functions project see the [vision-annotate-images](https://github.com/firebase/functions-samples/tree/main/vision-annotate-images) sample project.

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/ml/usage/installation/ios) and [Android](/ml/usage/installation/android).

# What does it do

All Firebase ML services are cloud-based, with on-device APIs handled by the new, separate [Google MLKit](https://developers.google.com/ml-kit/) (Usable in react-native
as a set of [react-native-mlkit modules](https://www.npmjs.com/org/react-native-mlkit))

Firebase has introduced a custom model downloading API, but the module does not have support for it yet. PRs always welcome!

## Support table

The table below outlines the current module support for each available service, and their support status here

| API                      | Status |
| ------------------------ | ------ |
| Custom Model Downloading | ❌     |

# Usage

Current no public APIs

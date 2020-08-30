---
title: iOS Installation
description: Manually integrate Crashlytics into your iOS application.
next: /crashlytics/usage/installation/android
previous: /crashlytics/usage
---

# iOS Manual Installation

The following steps are only required if you are using React Native <= 0.59 or need to manually integrate the library.

## 1. Add the Pod

Add the `RNFBCrashlytics` Pod to your projects `/ios/Podfile`:

```ruby
target 'app' do
  # Add the RNFBCrashlytics podspec to your app target:
  pod 'RNFBCrashlytics', :path => '../node_modules/@react-native-firebase/crashlytics'
end
```

## 2. Update Pods & rebuild the project

You may need to update your local Pods repository in order for the Pods to be installed in your project:

```bash
$ cd ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```

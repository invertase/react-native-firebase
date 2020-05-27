---
title: iOS Installation
description: Manually integrate Analytics into your iOS application.
next: /analytics/usage/installation/android
previous: /analytics/usage
---

# iOS Manual Installation

The following steps are only required if you are using React Native <= 0.59 or need to manually integrate the library.

## 1. Add the Pod

Add the `RNFBAnalytics` Pod to your projects `/ios/Podfile`:

```ruby
target 'app' do
  # ...
  pod 'RNFBAnalytics', :path => '../node_modules/@react-native-firebase/analytics'
end
```

## 2. Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBAnalytics` Pod to be installed in your project:

```bash
$ cd ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```

# Device Identification

If you would like to enable Firebase Analytics to generate automatic audience metrics for iOS (as it does by default in Android), you must link additional iOS libraries, [as documented by the Google Firebase team](https://support.google.com/firebase/answer/6318039). Specifically you need `libAdIdAccess.a` and `AdSupport.framework`.

The way to do this using CocoaPods is to add this to your `Podfile` (though please use [the most current Pod version](https://cocoapods.org/pods/GoogleIDFASupport) supported by React Native Firebase):

```ruby
# ...
target 'app' do
  # ...
  pod 'RNFBAnalytics', :path => '../node_modules/@react-native-firebase/analytics'
  pod 'GoogleIDFASupport', '~> 3.14.0'
end
```

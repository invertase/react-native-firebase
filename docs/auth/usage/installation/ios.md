---
title: iOS Installation
description: Manually integrate Authentication into your iOS application.
next: /auth/usage/installation/android
previous: /auth/usage
---

# iOS Manual Installation

The following steps are only required if you are using React Native <= 0.59 or need to manually integrate the library.

## 1. Add the Pod

Add the `RNFBAuth` Pod to your projects `/ios/Podfile`:

```ruby
target 'app' do
  #  ...
  pod 'RNFBAuth', :path => '../node_modules/@react-native-firebase/auth'
end
```

## 2. Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBAuth` Pod to be installed in your project:

```bash
$ cd ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```

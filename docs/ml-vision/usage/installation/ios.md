---
title: iOS Installation
description: Manually integrate ML Kit Vision APIs into your iOS application.
next: /ml-vision/usage/installation/android
previous: /ml-vision/usage
---

# iOS Manual Installation

The following steps are only required if your environment does not have access to React Native
auto-linking.

## 1. Add the Pod

Add the `RNFBMLVision` Pod to your projects `/ios/Podfile`:

```ruby
target 'app' do
  # ...
  pod 'RNFBMLVision', :path => '../node_modules/@react-native-firebase/ml-vision'
end
```

## 2. Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBMLVision` Pod to be installed in your project:

```bash
$ cd /ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```

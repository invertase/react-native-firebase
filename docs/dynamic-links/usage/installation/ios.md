---
title: iOS Installation
description: Manually integrate Dynamic Links into your iOS application.
next: /dynamic-links/usage/installation/android
previous: /dynamic-links/usage
---

# iOS Manual Installation

The following steps are only required if your environment does not have access to React Native
auto-linking.

## 1. Add the Pod

Add the `RNFBDynamicLinks` Pod to your projects `/ios/Podfile`:

```ruby
target 'app' do
  # ...
  pod 'RNFBDynamicLinks', :path => '../node_modules/@react-native-firebase/dynamic-links'
end
```

## 2. Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBDynamicLinks` Pod to be installed in your project:

```bash
$ cd ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```

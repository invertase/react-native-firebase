---
title: iOS Setup
description: Manually integrate Instance ID into your iOS application.
next: /iid/usage/installation/android
previous: /iid/usage
---

# iOS Manual Installation

The following steps are only required if your environment does not have access to React Native
auto-linking.

## 1. Add the Pod

Add the `RNFBIid` Pod to your projects `/ios/Podfile`:

```ruby
target 'app' do
  # ...
  pod 'RNFBIid', :path => '../node_modules/@react-native-firebase/iid'
end
```

## 2. Update Pods & rebuild the project

You may need to update your local Pods in order for the `RNFBIid` Pod to be installed in your project:

```bash
$ cd ios/
$ pod install --repo-update
```

Once the Pods have installed locally, rebuild your iOS project:

```bash
npx react-native run-ios
```
